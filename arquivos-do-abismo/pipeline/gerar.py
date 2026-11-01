"""Pipeline do Arquivos do Abismo: TTS Gemini -> rubberband -> Whisper -> Flux (Replicate) -> legendas ASS -> ffmpeg.
Uso: python gerar.py <pasta-do-video> [--audio] [--imagens] [--legendas] [--montar] [--tudo]
Chaves: GEMINI_API_KEY e REPLICATE_API_TOKEN no ambiente (nunca em arquivo)."""
import asyncio, base64, json, os, re, shutil, subprocess, sys, urllib.request, wave
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ARQ = "A heavily damaged 19th-century black and white archival photograph. {c}. Daguerreotype style, water damage, creepy stillness, heavy vignetting, highly realistic."
VHS = "A grainy, distorted VHS still frame from a 1990s camcorder. {c}. Liminal space atmosphere, harsh fluorescent lighting, static noise, analog artifacts, unsettling."
FLUX = dict(aspect_ratio="9:16", output_format="png", output_quality=100, num_inference_steps=28, guidance=3.5)
GEMINI_TTS = os.environ.get("GEMINI_TTS_MODELO", "gemini-3.8-flash-tts")
VOZ = os.environ.get("GEMINI_VOZ", "Charon")   # voz masculina grave; troque após ouvir

def carregar(pasta):
    return json.loads((Path(pasta) / "roteiro.json").read_text())

def saida(r):
    d = RAIZ / "output" / "arquivos-do-abismo" / r["slug"]; d.mkdir(parents=True, exist_ok=True); return d

def tts_texto(r, fala):
    """Texto falado: (...) vira <long pause> (marcação do Gemini 3.8) e palavras mal lidas ganham grafia fonética (só aqui)."""
    for a, b in r.get("pronuncia", {}).items(): fala = fala.replace(a, b)
    return fala.replace("(...)", "<long pause>")

def audio(r, d):
    """1 requisição ao Gemini TTS (API Interactions: o estilo vai em speech_metadata e NÃO é lido), depois pitch/velocidade."""
    import requests
    texto = " ".join(tts_texto(r, c["fala"]) for c in r["cenas"])
    corpo = {"model": GEMINI_TTS, "response_format": {"type": "audio"},
             "input": [{"type": "text", "text": texto, "annotations": [{"type": "speech_metadata", "style": r["audio"]["estilo"]}]}],
             "generation_config": {"speech_config": [{"voice": r["audio"].get("voz", VOZ)}]}}
    cab = {"Content-Type": "application/json"}
    if os.environ.get("GEMINI_API_KEY"): cab["x-goog-api-key"] = os.environ["GEMINI_API_KEY"]   # sem a variável, o proxy do ambiente injeta
    resp = requests.post("https://generativelanguage.googleapis.com/v1beta/interactions", headers=cab, json=corpo, timeout=300)
    resp.raise_for_status()
    bruto = next(base64.b64decode(c["data"]) for p in resp.json()["steps"] for c in p.get("content", []) if c.get("type") == "audio")
    tmp = d / "voz-bruta.bin"; tmp.write_bytes(bruto); cru = d / "voz-bruta.wav"
    ent = ["-i", str(tmp)] if bruto[:4] == b"RIFF" else ["-f", "s16le", "-ar", "24000", "-ac", "1", "-i", str(tmp)]
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ent, "-ar", "48000", "-ac", "1", str(cru)], check=True); tmp.unlink()
    # sem esticar nem mudar o tom (rubberband deixava a voz artificial): só limpeza, corpo nos graves, compressão, eco leve e volume
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(cru), "-af", r["audio"]["masterizacao"], "-ar", "48000", str(d / "voz.wav")], check=True)

def compilar_prompt(p):
    """Prompt em JSON -> texto do Flux-dev (que não tem campo negativo nem JSON nativo: o que não pode aparecer é dito de forma positiva)."""
    cena = f"{p['sujeito']}. Setting: {p['ambiente']}"
    base = (ARQ if p.get("estilo") == "arquivo" else VHS).format(c=cena)
    return (f"{base} Composition: {p['composicao']}. Lighting: {p['iluminacao']}. Camera: {p['camera']}. "
            "Muted desaturated palette, deep blacks, no people visible, no text, no letters, no numbers, no logos, no watermark.")

def carregar_planos(pasta):
    ps = json.loads((Path(pasta) / "planos.json").read_text())
    for p in ps: p["prompt"]["estilo"] = p["estilo"]
    return ps

def imagens(r, d, pasta):
    """Fila sequencial (conta com pouco crédito = 6 pedidos/min); pula plano cujo prompt não mudou. Qualidade máxima: bf16 (go_fast=False)."""
    import hashlib, time, replicate   # pip install replicate
    for i, pl in enumerate(carregar_planos(pasta)):
        txt = compilar_prompt(pl["prompt"]); arq = d / f"plano-{i:02d}.png"; marca = d / f"plano-{i:02d}.hash"
        h = hashlib.sha1((txt + json.dumps(FLUX, sort_keys=True)).encode()).hexdigest()
        if arq.exists() and marca.exists() and marca.read_text() == h: continue
        for tentativa in range(8):
            try:
                saida = replicate.run("black-forest-labs/flux-dev", input={"prompt": txt, "seed": 4000 + i, "go_fast": False, "megapixels": "1", **FLUX}); break
            except replicate.exceptions.ReplicateError as e:
                if "429" not in str(e) or tentativa == 7: raise
                time.sleep(12)
        arq.write_bytes((saida[0] if isinstance(saida, list) else saida).read()); marca.write_text(h); print("  plano", i, "ok"); time.sleep(11)

def tempos(r, d, pasta):
    """Tempo real de cada palavra no áudio final (faster-whisper + alinhamento do motor) e início de cada plano."""
    sys.path.insert(0, str(RAIZ / "aprendendo" / "motor")); import voz
    texto = " ".join(re.sub(r"\(\.\.\.\)", "", c["fala"]) for c in r["cenas"])
    ws = voz.alinhar_whisper(texto, d / "voz.wav")
    norm = lambda w: re.sub(r"\W", "", w.lower())
    nw, cur, ini = [norm(w) for w, _, _ in ws], 0, []
    for pl in carregar_planos(pasta):
        alvo = [norm(x) for x in pl["ancora"].split()]
        k = next(k for k in range(cur, len(nw)) if nw[k:k + len(alvo)] == alvo)
        ini.append(max(0.0, float(ws[k][1]) - 0.04)); cur = k
    ini[0] = 0.0
    dados = {"palavras": [[w, float(a), float(b)] for w, a, b in ws], "planos": ini}
    (d / "tempos.json").write_text(json.dumps(dados, ensure_ascii=False)); return dados

def _sfx(d):
    """Efeitos sintetizados: boom grave e glitch curto."""
    run = lambda *a: subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)
    run("-f", "lavfi", "-i", "aevalsrc=sin(2*PI*46*t)*exp(-4.5*t)+0.5*sin(2*PI*92*t)*exp(-8*t):d=1.4:s=48000", str(d / "boom.wav"))
    run("-f", "lavfi", "-i", "anoisesrc=d=0.16:c=white:a=0.6:r=48000", "-af", "highpass=f=2200,afade=t=out:st=0.06:d=0.1", str(d / "glitch.wav"))
    run("-f", "lavfi", "-i", "color=black:s=1080x1920,format=rgba,geq=r=0:g=0:b=0:a='105*exp(-pow((Y-H/2)/280,2))'", "-frames:v", "1", str(d / "faixa.png"))

def montar(r, d, pasta):
    """Base do vídeo: planos com câmera, faixa escura no centro (legenda), grão/vinheta/linhas VHS, HUD REC, drone e efeitos."""
    pls = carregar_planos(pasta); T = json.loads((d / "tempos.json").read_text())
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(d / "voz.wav")], capture_output=True, text=True).stdout)
    _sfx(d); ini = T["planos"] + [dur]; fps = 30; ent, f, vhs = [], [], []
    X = 0.30   # sobreposição entre planos (dissolve): é isso que liga um plano ao outro em vez de "colar" vídeos
    N = len(pls); Ls = []
    for i, pl in enumerate(pls):
        L = ini[1] + X / 2 if i == 0 else (dur - ini[i] + X / 2 if i == N - 1 else ini[i + 1] - ini[i] + X)
        Ls.append(L); n = max(2, round(L * fps)); ent += ["-i", str(d / f"plano-{i:02d}.png")]
        z = {"in": f"1+0.14*on/{n}", "out": f"1.14-0.14*on/{n}"}.get(pl["movimento"], "1.12")
        x = {"left": f"(iw-iw/zoom)*(1-on/{n})", "right": f"(iw-iw/zoom)*on/{n}"}.get(pl["movimento"], "iw/2-iw/zoom/2")
        f.append(f"[{i}:v]scale=2160:3840:flags=lanczos,zoompan=z='{z}':x='{x}':y='ih/2-ih/zoom/2':d={n}:s=1080x1920:fps={fps},setsar=1[v{i}]")
        if pl["estilo"] == "vhs": vhs.append(f"between(t,{ini[i]:.2f},{ini[i + 1]:.2f})")
    hud = "+".join(vhs) or "0"
    ent += ["-i", str(d / "faixa.png")]
    cur, off = "[v0]", 0.0
    for i in range(1, N):
        off += Ls[i - 1] - X
        f.append(f"{cur}[v{i}]xfade=transition={'fadewhite' if pls[i].get('boom') else 'fade'}:duration={X if not pls[i].get('boom') else 0.14}:offset={off:.3f}[x{i}]"); cur = f"[x{i}]"
    f.append(f"{cur}null[c]")
    f.append(f"[c][{N}:v]overlay[o1]")
    fonte = "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"
    f.append("[o1]eq=contrast=1.12:saturation=0.8,noise=alls=7:allf=t,vignette=PI/4,drawgrid=w=0:h=4:t=1:c=black@0.16,"
             f"drawtext=fontfile={fonte}:text='{r.get("hud", "● REC  05.11.1983")}':fontcolor=0xFF3030:fontsize=52:x=80:y=h*0.13:enable='{hud}',"
             f"fade=t=out:st={dur - 0.25:.2f}:d=0.25[v]")
    # áudio: voz + drone + boom/glitch nos cortes
    ent += ["-i", str(d / "voz.wav"), "-i", str(d / "boom.wav"), "-i", str(d / "glitch.wav"), "-f", "lavfi", "-i", f"sine=f=44:d={dur}", "-f", "lavfi", "-i", f"sine=f=47:d={dur}"]
    iv, ib, ig, id1, id2 = N + 1, N + 2, N + 3, N + 4, N + 5
    booms = [k for k, p in enumerate(pls) if p.get("boom")]; glit = [k for k in range(1, N) if k not in booms]
    af = [f"[{ib}:a]asplit={max(1, len(booms))}" + "".join(f"[b{j}]" for j in range(max(1, len(booms)))),
          f"[{ig}:a]asplit={max(1, len(glit))}" + "".join(f"[g{j}]" for j in range(max(1, len(glit))))]
    mix = [f"[{iv}:a]", f"[{id1}:a]volume=0.05[d1]", f"[{id2}:a]volume=0.04[d2]"]; ms = [f"[{iv}:a]", "[d1]", "[d2]"]
    for j, k in enumerate(booms): af.append(f"[b{j}]adelay={int(ini[k] * 1000)}|{int(ini[k] * 1000)},volume=0.55[bb{j}]"); ms.append(f"[bb{j}]")
    for j, k in enumerate(glit): af.append(f"[g{j}]adelay={int(ini[k] * 1000)}|{int(ini[k] * 1000)},volume=0.16[gg{j}]"); ms.append(f"[gg{j}]")
    af += [mix[1], mix[2], "".join(ms) + f"amix=inputs={len(ms)}:normalize=0:duration=first,alimiter=limit=0.95[a]"]
    base = d / "base.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ent, "-filter_complex", ";".join(f + af), "-map", "[v]", "-map", "[a]", "-t", f"{dur:.2f}",
                    "-c:v", "libx264", "-crf", "25", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", str(base)], check=True)

def legendas(r, d, pasta):
    """Legendas com o pycaps (CSS + Playwright), palavra a palavra, usando os tempos já medidos (sem transcrever de novo)."""
    T = json.loads((d / "tempos.json").read_text())
    P = T["palavras"]   # uma legenda nunca termina no mesmo instante em que outra começa: o fim de cada palavra recua antes da próxima
    ws = [{"word": w, "start": a, "end": max(a + 0.08, min(b, P[k + 1][1] - 0.04)) if k + 1 < len(P) else b} for k, (w, a, b) in enumerate(P)]
    (d / "transcricao.json").write_text(json.dumps({"segments": [{"start": ws[0]["start"], "end": ws[-1]["end"], "text": " ".join(x["word"] for x in ws), "words": ws}]}, ensure_ascii=False))
    tpl = d / "pycaps"; shutil.rmtree(tpl, ignore_errors=True); shutil.copytree(Path(pasta).resolve().parents[1] / "identidade" / "pycaps", tpl)
    if r.get("destaques"):   # palavras em vermelho (morte/perigo) e amarelo (dados) deste vídeo
        cfg = json.loads((tpl / "pycaps.template.json").read_text())
        for reg in cfg["tagger_rules"]:
            if reg["tag"] in r["destaques"]: reg["regex"] = "(?i)\\b(" + "|".join(r["destaques"][reg["tag"]]) + ")\\b"
        (tpl / "pycaps.template.json").write_text(json.dumps(cfg, indent=4, ensure_ascii=False))
    (d / f"{r['slug']}.mp4").unlink(missing_ok=True)   # o pycaps recusa sobrescrever
    subprocess.run(["env", "PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers", "pycaps", "render", "--input", str(d / "base.mp4"), "--output", str(d / f"{r['slug']}.mp4"),
                    "--template", str(tpl),
                    "--transcript", str(d / "transcricao.json"), "--transcript-format", "whisper_json", "--video-quality", "high"], check=True)

if __name__ == "__main__":
    pasta = sys.argv[1]; fl = set(sys.argv[2:]); r = carregar(pasta); d = saida(r)
    etapas = [("--audio", lambda: audio(r, d)), ("--imagens", lambda: imagens(r, d, pasta)), ("--tempos", lambda: tempos(r, d, pasta)),
              ("--montar", lambda: montar(r, d, pasta)), ("--legendas", lambda: legendas(r, d, pasta))]
    for nome, f in etapas:
        if "--tudo" in fl or nome in fl:
            print(nome); f()
