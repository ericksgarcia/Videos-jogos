"""Pipeline do Arquivos do Abismo: TTS Gemini -> rubberband -> Whisper -> Flux (Replicate) -> legendas ASS -> ffmpeg.
Uso: python gerar.py <pasta-do-video> [--audio] [--imagens] [--legendas] [--montar] [--tudo]
Chaves: GEMINI_API_KEY e REPLICATE_API_TOKEN no ambiente (nunca em arquivo)."""
import asyncio, base64, json, os, re, subprocess, sys, urllib.request, wave
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
    texto = "\n\n".join(tts_texto(r, c["fala"]) for c in r["cenas"])
    corpo = {"model": GEMINI_TTS, "response_format": {"type": "audio"},
             "input": [{"type": "text", "text": texto, "annotations": [{"type": "speech_metadata", "style": r["estilo_voz"]}]}],
             "generation_config": {"speech_config": [{"voice": VOZ}]}}
    cab = {"Content-Type": "application/json"}
    if os.environ.get("GEMINI_API_KEY"): cab["x-goog-api-key"] = os.environ["GEMINI_API_KEY"]   # sem a variável, o proxy do ambiente injeta
    resp = requests.post("https://generativelanguage.googleapis.com/v1beta/interactions", headers=cab, json=corpo, timeout=300)
    resp.raise_for_status()
    bruto = next(base64.b64decode(c["data"]) for p in resp.json()["steps"] for c in p.get("content", []) if c.get("type") == "audio")
    tmp = d / "voz-bruta.bin"; tmp.write_bytes(bruto); cru = d / "voz-bruta.wav"
    ent = ["-i", str(tmp)] if bruto[:4] == b"RIFF" else ["-f", "s16le", "-ar", "24000", "-ac", "1", "-i", str(tmp)]
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ent, "-ar", "48000", "-ac", "1", str(cru)], check=True); tmp.unlink()
    a = r["audio"]; fator = 2 ** (a["pitch_semitons"] / 12)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(cru), "-af",
                    f"rubberband=pitch={fator:.4f}:tempo={a['velocidade']}", "-ar", "48000", str(d / "voz.wav")], check=True)

def imagens(r, d):
    """Fila sequencial (conta com pouco crédito = 6 pedidos/min): repete em 429, pula arquivos prontos e reaproveita prompts iguais."""
    import time, replicate   # pip install replicate
    feitos = {}
    for c in r["cenas"]:
        p = (ARQ if c["estilo"] == "arquivo" else VHS).format(c=c["cena"]); arq = d / f"cena-{c['id']:02d}.png"
        if arq.exists(): feitos[p] = arq; continue
        if p in feitos: arq.write_bytes(feitos[p].read_bytes()); continue
        for tentativa in range(6):
            try:
                saida = replicate.run("black-forest-labs/flux-dev", input={"prompt": p, **FLUX}); break
            except replicate.exceptions.ReplicateError as e:
                if "429" not in str(e) or tentativa == 5: raise
                time.sleep(12)
        arq.write_bytes((saida[0] if isinstance(saida, list) else saida).read()); feitos[p] = arq; print("  imagem", arq.name); time.sleep(11)

def legendas(r, d):
    """Tempos por palavra com faster-whisper; ASS centrado em Y=50%, até 3 palavras, cores por palavra."""
    from faster_whisper import WhisperModel
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(d / "voz.wav"), "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    import numpy as np
    segs, _ = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8").transcribe(np.frombuffer(pcm, np.float32), language="pt", word_timestamps=True)
    ws = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    vm = {re.sub(r"\W", "", x).lower() for c in r["cenas"] for x in c["vermelho"]}
    am = {re.sub(r"\W", "", x).lower() for c in r["cenas"] for x in c["amarelo"]}
    am |= {"cinco", "mil", "novecentos", "oitenta", "três"} if "5" in am else set()   # data falada por extenso
    t = lambda s: f"{int(s//3600)}:{int(s%3600//60):02d}:{s%60:05.2f}"
    cab = ("[Script Info]\nPlayResX: 1080\nPlayResY: 1920\n[V4+ Styles]\n"
           "Format: Name,Fontname,Fontsize,PrimaryColour,OutlineColour,BackColour,Bold,Italic,Outline,Shadow,Alignment,MarginL,MarginR,MarginV\n"
           "Style: D,Montserrat Black,92,&H00FFFFFF,&H00000000,&H80000000,1,1,10,0,5,108,216,0\n"  # centro; margens: 10% esq, 20% dir (>=15%)
           "[Events]\nFormat: Layer,Start,End,Style,Text\n")
    linhas = []
    for i in range(0, len(ws), 3):
        g = ws[i:i + 3]
        txt = " ".join((f"{{\\c&H1818E8&}}{w.upper()}{{\\c&HFFFFFF&}}" if re.sub(r"\W", "", w).lower() in vm else
                        f"{{\\c&H00FFFF&}}{w.upper()}{{\\c&HFFFFFF&}}" if re.sub(r"\W", "", w).lower() in am else w.upper()) for w, _, _ in g)
        linhas.append(f"Dialogue: 0,{t(g[0][1])},{t(g[-1][2] + 0.15)},D,{{\\an5\\fscx80\\fscy80\\t(0,120,\\fscx100\\fscy100)}}{txt}")
    (d / "legendas.ass").write_text(cab + "\n".join(linhas) + "\n")

def montar(r, d):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(d / "voz.wav")], capture_output=True, text=True).stdout)
    ent, filtro, ini = [], [], 0.0
    for k, c in enumerate(r["cenas"]):
        fim = dur if k == len(r["cenas"]) - 1 else r["cenas"][k + 1]["t"][0] * dur / r["cenas"][-1]["t"][1]
        ent += ["-framerate", "30", "-loop", "1", "-t", f"{fim - ini + 0.05:.2f}", "-i", str(d / f"cena-{c['id']:02d}.png")]
        filtro.append(f"[{k}:v]scale=1080:1920,zoompan=z='min(zoom+0.0006,1.15)':d=1:s=1080x1920:fps=30,setsar=1[v{k}]"); ini = fim
    cat = "".join(f"[v{k}]" for k in range(len(r["cenas"]))) + f"concat=n={len(r['cenas'])}:v=1[v];[v]ass={d / 'legendas.ass'}[o]"
    ent += ["-i", str(d / "voz.wav"), "-f", "lavfi", "-i", f"sine=f=48:d={dur}"]
    n = len(r["cenas"])
    filtro.append(cat)
    filtro.append(f"[{n}:a][{n+1}:a]amix=inputs=2:weights=1 0.18:duration=first[a]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ent, "-filter_complex", ";".join(filtro), "-map", "[o]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "22", "-pix_fmt", "yuv420p", "-c:a", "aac", str(d / f"{r['slug']}.mp4")], check=True)

if __name__ == "__main__":
    pasta = sys.argv[1]; fl = set(sys.argv[2:]); r = carregar(pasta); d = saida(r)
    for nome, f in [("--audio", audio), ("--imagens", imagens), ("--legendas", legendas), ("--montar", montar)]:
        if "--tudo" in fl or nome in fl:
            print(nome); f(r, d)
