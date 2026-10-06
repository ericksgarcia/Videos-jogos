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
        _soma(efx, sons.som("whoosh"), max(0, c["ini"] - 0.3), 0.5)
        for ev, t in c["batidas"].items():
            nome, g = (sons_roteiro or {}).get(ev, SOM_PADRAO)
            _soma(efx, sons.som(nome), t, g)
    musica = sons.trilha(ag["total"])[:n]
    # ducking: música e efeitos abaixam sob a voz
    nivel = np.convolve(np.abs(voz_buf[:, 0]), np.ones(4000) / 4000, mode="same")
    nivel = np.clip(nivel / 0.04, 0, 1)
    musica *= (0.55 - 0.3 * nivel)[:, None]
    efx *= (1 - 0.35 * nivel)[:, None]
    buf = voz_buf + efx + musica
    buf = np.tanh(buf * 1.1) / np.tanh(1.1)
    buf *= 0.89 / (np.max(np.abs(buf)) + 1e-9)
    wavfile.write(saida, SR, (buf * 32767).astype(np.int16))


def montar(roteiro, ag, pasta, pasta_video):
    pasta = Path(pasta)
    if pasta.exists():
        shutil.rmtree(pasta)
    (pasta / "assets").mkdir(parents=True)
    for arq in ("gsap.min.js", "MotionPathPlugin.min.js", "DrawSVGPlugin.min.js", "MorphSVGPlugin.min.js"):
        shutil.copy(NODE / "gsap" / "dist" / arq, pasta / "assets" / arq)
    for arq in (IDENTIDADE / "fontes").glob("*.woff2"):
        shutil.copy(arq, pasta / "assets" / arq.name)
    for arq in (IDENTIDADE / "marca.css", IDENTIDADE / "identidade.js", AQUI / "nucleo.js", AQUI / "biblioteca.js", AQUI / "montagem.js"):
        shutil.copy(arq, pasta / "assets" / arq.name)
    shutil.copy(Path(pasta_video) / "cenas.js", pasta / "assets" / "cenas.js")
    dados = {"titulo": roteiro["titulo"], "gancho": roteiro["gancho"], "gancho_destaque": roteiro.get("gancho_destaque", ""), "agenda": ag}
    html = (AQUI / "template.html").read_text()
    html = html.replace("/*__DADOS__*/null", json.dumps(dados, ensure_ascii=False)).replace("__TOTAL__", str(ag["total"]))
    html = html.replace("/*__MARCA__*/null", json.dumps(MARCA, ensure_ascii=False))
    (pasta / "index.html").write_text(html)
    (pasta / "hyperframes.json").write_text(json.dumps({"paths": {"assets": "assets"}}))
    (pasta / "meta.json").write_text(json.dumps({"id": roteiro["slug"], "name": roteiro["titulo"]}))


def renderizar(pasta, saida, qualidade="high"):
    env = dict(os.environ, HYPERFRAMES_SKIP_SKILLS="1", HYPERFRAMES_NO_TELEMETRY="1", DO_NOT_TRACK="1")
    if not env.get("PRODUCER_HEADLESS_SHELL_PATH"):
        achados = sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell"))
        if achados:
            env["PRODUCER_HEADLESS_SHELL_PATH"] = achados[-1]
    cmd = [str(NODE / ".bin" / "hyperframes"), "render", "-o", str(Path(saida).resolve()), "-q", qualidade, "-f", "30"]
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


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video", help="pasta do vídeo (aprendendo/videos/<tema>) ou o roteiro.json dela")
    ap.add_argument("--qualidade", default="high", choices=["draft", "standard", "high"])
    ap.add_argument("--so-montar", action="store_true", help="monta o projeto sem renderizar")
    ap.add_argument("--previa", action="store_true", help="só tira fotos de cada cena (output/<tema>/previa)")
    a = ap.parse_args()
    pasta_video = Path(a.video)
    if pasta_video.is_file():
        pasta_video = pasta_video.parent
    roteiro = json.loads((pasta_video / "roteiro.json").read_text())
    falas = narrar(roteiro)
    print("narração:", {f["provedor"] for f in falas}, "| duração das falas:", round(sum(f["dur"] for f in falas), 1), "s")
    ag = agenda(roteiro, falas)
    print("vídeo:", ag["total"], "s")
    saida = RAIZ / "output" / pasta_video.name
    saida.mkdir(parents=True, exist_ok=True)
    pasta = saida / "build"
    montar(roteiro, ag, pasta, pasta_video)
    if a.previa:
        previa(ag, pasta, saida / "previa")
        return
    if a.so_montar:
        return
    mudo = pasta / "video_mudo.mp4"
    renderizar(pasta, mudo, qualidade=a.qualidade)
    mixar(ag, falas, pasta / "trilha.wav", roteiro.get("sons"))
    mp4 = saida / f"{roteiro['slug']}.mp4"
    # ilustração chapada comprime bem: CRF 24 fica com ~20 MB e sem perda visível
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), "-i", str(pasta / "trilha.wav"), "-map", "0:v", "-map", "1:a",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-c:a", "aac", "-b:a", "160k", "-shortest", str(mp4)], check=True)
    print("pronto:", mp4)


if __name__ == "__main__":
    main()
