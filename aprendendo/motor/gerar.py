"""Gera um vídeo do canal Aprendendo Fácil a partir de um roteiro.

Uso (cada vídeo é uma pasta em aprendendo/videos/<tema>/ com roteiro.json e cenas.js):
  python aprendendo/motor/gerar.py aprendendo/videos/eletricidade
  python aprendendo/motor/gerar.py aprendendo/videos/eletricidade --previa   # fotos para revisar
  python aprendendo/motor/gerar.py aprendendo/videos/eletricidade --qualidade draft

Saída em output/<tema>/: <slug>.mp4, previa/ e build/.

Cada cena do roteiro tem uma fala e "batidas": palavras da fala que disparam
uma animação (e um som). A narração é gerada por cena; o tempo de cada
palavra vem do alinhamento em voz.py, então ilustração, legenda e som
acontecem no instante em que a palavra é dita.
"""
import argparse
import glob
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

AQUI = Path(__file__).resolve().parent          # aprendendo/motor
CANAL = AQUI.parent                              # aprendendo
IDENTIDADE = CANAL / "identidade"
RAIZ = CANAL.parent
sys.path.insert(0, str(AQUI))
import sons  # noqa: E402
import voz  # noqa: E402

NODE = RAIZ / "node_modules"
SR = 48000

MARCA = json.loads((IDENTIDADE / "marca.json").read_text())
DIRECAO = MARCA["voz"]["direcao"]  # narrador adulto de divulgação científica

INICIO_VOZ = 0.55     # a voz entra um pouco depois da cena abrir
FOLGA_FIM = 0.55      # respiro depois da fala antes da próxima cena

# som padrão de uma batida sem som definido no roteiro ("sons": {"evento": ["efeito", ganho]})
SOM_PADRAO = ("pop", 0.4)


def _r(x):
    return round(float(x), 3)


def narrar(roteiro):
    out = []
    for c in roteiro["cenas"]:
        tts = c.get("tts") or c["fala"]
        out.append(voz.narrar(c["fala"], tts, direcao=DIRECAO, voz_nome=roteiro.get("voz", MARCA["voz"]["nome"])))
    return out


def agenda(roteiro, falas):
    cenas, t = [], 0.0
    for i, (c, f) in enumerate(zip(roteiro["cenas"], falas)):
        ini = t
        voz_ini = ini + (0.3 if i == 0 else INICIO_VOZ)
        fim = voz_ini + f["dur"] + FOLGA_FIM
        batidas, ultimo = {}, 0.0
        for k, (palavra, evento) in enumerate(c.get("batidas", {}).items()):
            achou = voz.instante_de(f, [palavra], depois=ultimo)
            if achou is None:
                achou = voz.instante_de(f, [palavra])
            if achou is None:  # palavra não encontrada: espalha pela fala
                achou = f["dur"] * (k + 1) / (len(c["batidas"]) + 1)
            ultimo = achou
            batidas[evento] = _r(voz_ini + achou)
        chaves = {voz._norm(p) for p in c.get("batidas", {})}
        legendas = voz.legendas(f, voz_ini)
        for b in legendas:
            b["destaque"] = [voz._norm(w) in chaves for w, _, _ in b["palavras"]]
        cenas.append({"id": c["id"], "tipo": c["tipo"], "titulo": c["titulo"], "ini": _r(ini), "voz": _r(voz_ini),
                      "fim": _r(fim), "batidas": batidas, "legendas": legendas})
        t = fim
    return {"cenas": cenas, "total": _r(t + 1.2)}


def _soma(buf, x, t, g):
    i = int(round(t * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i] * g


def _ler_voz(arq):
    sr, x = wavfile.read(arq)
    x = x.astype(np.float64) / (np.iinfo(x.dtype).max if x.dtype.kind in "iu" else 1)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    # leve compressão e corte de graves para a voz ficar "na cara"
    x = signal.sosfilt(signal.butter(2, 90, btype="high", fs=SR, output="sos"), x)
    x = np.tanh(x * 2.2) / np.tanh(2.2)
    return np.stack([x, x], axis=1)


def mixar(ag, falas, saida, sons_roteiro=None):
    n = int(ag["total"] * SR)
    voz_buf, efx = np.zeros((n, 2)), np.zeros((n, 2))
    for c, f in zip(ag["cenas"], falas):
        if f.get("wav"):
            _soma(voz_buf, _ler_voz(f["wav"]), c["voz"], 1.0)
        if c["ini"] > 0:
            _soma(efx, sons.som("transicao"), max(0, c["ini"] - 0.45), 0.55)
        for ev, t in c["batidas"].items():
            nome, g = (sons_roteiro or {}).get(ev, SOM_PADRAO)
            _soma(efx, sons.som(nome), t, g)
    musica = sons.trilha(ag["total"], marcos=[c["ini"] for c in ag["cenas"][1:]])[:n]
    # ducking suave: música e efeitos abaixam sob a voz (envelope com ataque/soltura)
    nivel = np.convolve(np.abs(voz_buf[:, 0]), np.ones(2400) / 2400, mode="same")
    nivel = np.clip(nivel / 0.035, 0, 1)
    nivel = signal.sosfiltfilt(signal.butter(1, 3, fs=SR, output="sos"), nivel)
    # nas pausas e trocas de cena a música sobe (dá ritmo aos cortes); sob a voz, abaixa
    sobe = np.zeros(n)
    for c in ag["cenas"][1:]:
        i0, i1 = int(max(0, c["ini"] - 0.8) * SR), int(min(ag["total"], c["voz"] + 0.2) * SR)
        sobe[i0:i1] = 1
    sobe = signal.sosfiltfilt(signal.butter(1, 1.5, fs=SR, output="sos"), sobe)
    musica *= (0.62 - 0.42 * nivel + 0.18 * sobe)[:, None]
    efx *= (1.5 - 0.35 * nivel)[:, None]
    # voz com leve "presença" (realce em 3 kHz) e um toque de ambiente
    pres = signal.sosfilt(signal.butter(2, [2500, 5000], btype="band", fs=SR, output="sos"), voz_buf, axis=0)
    corpo = signal.sosfilt(signal.butter(2, [140, 420], btype="band", fs=SR, output="sos"), voz_buf, axis=0)
    voz_buf = voz_buf + pres * 0.25 + corpo * 0.3
    voz_buf = np.tanh(voz_buf * 1.6) / np.tanh(1.6)  # saturação suave: voz mais encorpada no celular
    amb = sons.reverb(voz_buf[:, 0], 0.9, 4000)[:n] * 0.06
    buf = voz_buf + amb + efx + musica
    # master: compressor simples + limitador suave + normalização
    env = np.sqrt(signal.sosfiltfilt(signal.butter(1, 8, fs=SR, output="sos"), (buf ** 2).mean(axis=1)).clip(1e-9))
    lim = 0.25
    ganho = np.where(env > lim, (lim / env) ** 0.4, 1.0)
    buf *= ganho[:, None]
    buf = np.tanh(buf * 1.2) / np.tanh(1.2)
    rms = np.sqrt((buf ** 2).mean())
    buf *= min(0.95 / (np.max(np.abs(buf)) + 1e-9), 0.16 / (rms + 1e-9))
    wavfile.write(saida, SR, (buf * 32767).astype(np.int16))


def montar(roteiro, ag, pasta, pasta_video):
    pasta = Path(pasta)
    if pasta.exists():
        shutil.rmtree(pasta)
    (pasta / "assets").mkdir(parents=True)
    for arq in ("gsap.min.js", "MotionPathPlugin.min.js", "DrawSVGPlugin.min.js", "MorphSVGPlugin.min.js"):
        shutil.copy(NODE / "gsap" / "dist" / arq, pasta / "assets" / arq)
    shutil.copy(NODE / "three" / "build" / "three.min.js", pasta / "assets" / "three.min.js")
    shutil.copy(NODE / "lottie-web" / "build" / "player" / "lottie_svg.min.js", pasta / "assets" / "lottie.min.js")
    # animações Lottie do vídeo (videos/<tema>/lottie/*.json) embutidas na página
    lot = {f.stem: json.loads(f.read_text()) for f in sorted((Path(pasta_video) / "lottie").glob("*.json")) if f.name != "creditos.json"}
    (pasta / "assets" / "lottie_dados.js").write_text("window.LOTTIE = " + json.dumps(lot, separators=(",", ":")) + ";\n")
    for arq in [*(IDENTIDADE / "fontes").glob("*.woff2"), *(AQUI / "fontes").glob("*.woff2")]:
        shutil.copy(arq, pasta / "assets" / arq.name)
    for arq in (IDENTIDADE / "marca.css", IDENTIDADE / "identidade.js", AQUI / "nucleo.js", AQUI / "biblioteca.js", AQUI / "efeitos.js", AQUI / "tres.js", AQUI / "lottie.js", AQUI / "montagem.js"):
        shutil.copy(arq, pasta / "assets" / arq.name)
    shutil.copy(Path(pasta_video) / "cenas.js", pasta / "assets" / "cenas.js")
    dados = {"titulo": roteiro["titulo"], "gancho": roteiro["gancho"], "gancho_destaque": roteiro.get("gancho_destaque", ""), "agenda": ag}
    html = (AQUI / "template.html").read_text()
    html = html.replace("/*__DADOS__*/null", json.dumps(dados, ensure_ascii=False)).replace("__TOTAL__", str(ag["total"]))
    html = html.replace("/*__MARCA__*/null", json.dumps(MARCA, ensure_ascii=False))
    (pasta / "index.html").write_text(html)
    (pasta / "hyperframes.json").write_text(json.dumps({"paths": {"assets": "assets"}}))
    (pasta / "meta.json").write_text(json.dumps({"id": roteiro["slug"], "name": roteiro["titulo"]}))


def verificar(pasta):
    """Abre a página do vídeo e percorre a timeline inteira (a cada 0,25 s) procurando erros
    de JavaScript. Um erro no meio do vídeo trava o quadro (cena vazia, legendas encavaladas)."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("   [verificar] playwright ausente; pulando a verificação")
        return
    shell = os.environ.get("PRODUCER_HEADLESS_SHELL_PATH") or (sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell")) or [None])[-1]
    erros = []
    with sync_playwright() as p:
        nav = p.chromium.launch(**({"executable_path": shell} if shell else {}))
        pg = nav.new_page(viewport={"width": 1080, "height": 1920})
        pg.on("pageerror", lambda e: erros.append(f"carregando: {e}"))
        pg.goto((Path(pasta) / "index.html").resolve().as_uri())
        pg.wait_for_timeout(1500)
        erros += pg.evaluate("""() => { const tl = window.__timelines.main, T = tl.duration(), e = [];
          for (let t = 0; t < T; t += 0.25) { try { tl.seek(t); } catch (x) { e.push(t.toFixed(2) + " s: " + x.message); } }
          tl.seek(0); return e.slice(0, 10); }""")
        nav.close()
    if erros:
        raise SystemExit("erros de JavaScript no vídeo:\n  " + "\n  ".join(erros))
    print("   [verificar] timeline sem erros")


def renderizar(pasta, saida, qualidade="high"):
    env = dict(os.environ, HYPERFRAMES_SKIP_SKILLS="1", HYPERFRAMES_NO_TELEMETRY="1", DO_NOT_TRACK="1")
    if not env.get("PRODUCER_HEADLESS_SHELL_PATH"):
        achados = sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell"))
        if achados:
            env["PRODUCER_HEADLESS_SHELL_PATH"] = achados[-1]
    fps = "60" if MARCA["video"].get("desfoque_movimento") else "30"  # 60 fps viram 30 com desfoque de movimento
    cmd = [str(NODE / ".bin" / "hyperframes"), "render", "-o", str(Path(saida).resolve()), "-q", qualidade, "-f", fps]
    # 3D/filtros deixam cada quadro mais lento: usa vários navegadores em paralelo
    # (VIDEO_WORKERS=1 para máquinas com pouca memória)
    workers = os.environ.get("VIDEO_WORKERS", "4")
    if workers != "1":
        cmd += ["-w", workers, "--no-low-memory-mode"]
    subprocess.run(cmd, cwd=pasta, env=env, check=True)


def previa(ag, pasta, destino):
    """Fotos de 3 momentos de cada cena + folha de contato, para revisar sem renderizar."""
    ts = []
    for c in ag["cenas"]:
        ts += [c["voz"] + (c["fim"] - c["voz"]) * f for f in (0.2, 0.55, 0.9)]
    env = dict(os.environ, HYPERFRAMES_SKIP_SKILLS="1", HYPERFRAMES_NO_TELEMETRY="1", DO_NOT_TRACK="1")
    if not env.get("PRODUCER_HEADLESS_SHELL_PATH"):
        achados = sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell"))
        if achados:
            env["PRODUCER_HEADLESS_SHELL_PATH"] = achados[-1]
    if Path(destino).exists():
        shutil.rmtree(destino)
    subprocess.run([str(NODE / ".bin" / "hyperframes"), "snapshot", str(pasta), "-o", str(destino), "--at", ",".join(f"{t:.2f}" for t in ts),
                    "--no-end", "--describe", "false"], env=env, check=True)


# acabamento "cinema" (opcional: --cinema ou "cinema": true no roteiro):
# bloom (as luzes vazam brilho), LUT de cor (motor/cinema.cube, gerada por motor/lut.py)
# e luz vazando (light leak) quente passeando devagar pelo quadro.
# Bloom e luz são calculados em 1/4 da resolução (rápido) e ampliados.
CINEMA = {"bloom_limiar": 0.55, "bloom_raio": 9, "bloom_forca": 0.75, "luz_forca": 0.2, "luz_cores": ["0xff8a3d", "0xffd23f"], "lut": AQUI / "cinema.cube"}


def _acabamento(dur=None, cinema=False):
    k = dict(CINEMA, **cinema) if isinstance(cinema, dict) else CINEMA
    """Filtros do ffmpeg que dão a "cara de cinema" (definidos na identidade):
    desfoque de movimento (média de 2 quadros a 60 fps = obturador de 180°), cor,
    vinheta, leve aberração cromática e granulação de filme. Com `cinema`, soma
    bloom, LUT e luz vazando (ver CINEMA)."""
    v = MARCA["video"]
    f = ["tmix=frames=2:weights=1 1", "fps=30"] if v.get("desfoque_movimento") else []
    w, h = v["largura"], v["altura"]
    if cinema:
        f.append(f"format=gbrp,split[_a][_b];[_b]scale={w // 4}:{h // 4},curves=all='0/0 {k['bloom_limiar']}/0 1/1',gblur=sigma={k['bloom_raio']},"
                 f"scale={w}:{h}[_g];[_a][_g]blend=all_mode=screen:all_opacity={k['bloom_forca']}")
        f.append(f"lut3d=file={k['lut']}")
    tc = v.get("tratamento_cor")
    if tc:
        f += [f"eq=contrast={tc['contraste']}:saturation={tc['saturacao']}", f"vignette=angle={tc['vinheta']}*PI"]
        if tc.get("aberracao_px"):
            f.append(f"rgbashift=rh=-{tc['aberracao_px']}:bh={tc['aberracao_px']}")
    if cinema:
        f[-1] += (f"[_c];gradients=s={w // 4}x{h // 4}:d={(dur or 600) + 1:.2f}:r=30:n=4:type=radial:speed=0.004:seed=7:"
                  f"c0={k['luz_cores'][0]}:c1=0x000000:c2=0x000000:c3={k['luz_cores'][1]},scale={w}:{h},format=gbrp[_l];[_c]format=gbrp[_c2];[_c2][_l]blend=all_mode=screen:all_opacity={k['luz_forca']},format=yuv420p")
    if tc and tc.get("grao"):
        f.append(f"noise=alls={tc['grao']}:allf=t")
    return ",".join(f) or "null"


def codificar(mudo, wav, mp4, dur, cinema=False):
    """MP4 final: CRF 24; se passar do limite de envio (marca.json), refaz em 2 passadas
    com a taxa de bits calculada para caber (~92% do limite)."""
    limite = MARCA["video"]["tamanho_maximo_mb"] * 1024 * 1024
    vf = ["-vf", _acabamento(dur, cinema)]
    comum = ["-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "160k", "-shortest"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), "-i", str(wav), "-map", "0:v", "-map", "1:a", *vf,
                    "-c:v", "libx264", "-preset", "slow", "-crf", "24", *comum, str(mp4)], check=True)
    if Path(mp4).stat().st_size <= limite * 0.95:
        return
    kbps = int(limite * 0.92 * 8 / 1024 / dur - 170)
    print(f"   arquivo acima do limite; recodificando a {kbps} kb/s")
    log = Path(mudo).with_suffix(".2pass")
    base = ["ffmpeg", "-v", "error", "-y", "-i", str(mudo), *vf, "-c:v", "libx264", "-preset", "slow", "-b:v", f"{kbps}k", "-passlogfile", str(log)]
    subprocess.run(base + ["-pass", "1", "-an", "-f", "mp4", "/dev/null"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), "-i", str(wav), "-map", "0:v", "-map", "1:a", *vf, "-c:v", "libx264", "-preset", "slow",
                    "-b:v", f"{kbps}k", "-passlogfile", str(log), "-pass", "2", *comum, str(mp4)], check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video", help="pasta do vídeo (aprendendo/videos/<tema>) ou o roteiro.json dela")
    ap.add_argument("--qualidade", default="high", choices=["draft", "standard", "high"])
    ap.add_argument("--so-montar", action="store_true", help="monta o projeto sem renderizar")
    ap.add_argument("--previa", action="store_true", help="só tira fotos de cada cena (output/<tema>/previa)")
    ap.add_argument("--cena", type=int, help="gera só a cena N (1 = primeira); saída <slug>-cenaN.mp4")
    ap.add_argument("--cinema", action="store_true", help="acabamento extra: bloom, LUT de cor e luz vazando")
    a = ap.parse_args()
    pasta_video = Path(a.video)
    if pasta_video.is_file():
        pasta_video = pasta_video.parent
    roteiro = json.loads((pasta_video / "roteiro.json").read_text())
    if a.cena:  # teste rápido de uma cena só
        roteiro["cenas"] = [roteiro["cenas"][a.cena - 1]]
        roteiro["slug"] += f"-cena{a.cena}"
    falas = narrar(roteiro)
    print("narração:", {f["provedor"] for f in falas}, "| duração das falas:", round(sum(f["dur"] for f in falas), 1), "s")
    ag = agenda(roteiro, falas)
    print("vídeo:", ag["total"], "s")
    saida = RAIZ / "output" / pasta_video.name
    saida.mkdir(parents=True, exist_ok=True)
    pasta = saida / "build"
    montar(roteiro, ag, pasta, pasta_video)
    if not a.so_montar:
        verificar(pasta)
    if a.previa:
        previa(ag, pasta, saida / "previa")
        return
    if a.so_montar:
        return
    mudo = pasta / "video_mudo.mp4"
    renderizar(pasta, mudo, qualidade=a.qualidade)
    mixar(ag, falas, pasta / "trilha.wav", roteiro.get("sons"))
    mp4 = saida / f"{roteiro['slug']}.mp4"
    codificar(mudo, pasta / "trilha.wav", mp4, ag["total"], roteiro.get("cinema") or a.cinema)
    print("pronto:", mp4)


if __name__ == "__main__":
    main()
