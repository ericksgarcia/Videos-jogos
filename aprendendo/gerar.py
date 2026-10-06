"""Gera um vídeo do canal Aprendendo Fácil a partir de um roteiro.

Uso:
  python aprendendo/gerar.py aprendendo/roteiros/eletricidade.json
  python aprendendo/gerar.py aprendendo/roteiros/eletricidade.json --previa   # fotos para revisar
  python aprendendo/gerar.py aprendendo/roteiros/eletricidade.json --qualidade draft

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

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
sys.path.insert(0, str(AQUI))
import sons  # noqa: E402
import voz  # noqa: E402

NODE = RAIZ / "node_modules"
SAIDA = RAIZ / "output" / "aprendendo"
SR = 48000

DIRECAO = voz.DIRECAO  # narrador adulto de divulgação científica (ver voz.py)

INICIO_VOZ = 0.55     # a voz entra um pouco depois da cena abrir
FOLGA_FIM = 0.55      # respiro depois da fala antes da próxima cena

# som de cada batida (nome do evento -> (efeito, ganho))
SOM = {
    "clique": ("clique", 0.9), "luz": ("plim", 0.8), "afasta": ("whoosh", 0.6), "gira": ("whoosh_curto", 0.55),
    "titulo": ("pop", 0.5), "zoom": ("whoosh", 0.7), "eletrons": ("pop", 0.5), "andam": ("zap", 0.35),
    "fila": ("pop", 0.5), "empurrao": ("thud", 0.6), "faraday": ("brilho", 0.6), "ima": ("whoosh_curto", 0.6),
    "bobina": ("pop", 0.45), "corrente": ("zap", 0.5), "equacao": ("plim", 0.6), "sai": ("zap", 0.45),
    "nome": ("pop", 0.55), "usina": ("whoosh", 0.6), "agua": ("agua", 0.55), "desce": ("agua", 0.4),
    "turbina": ("whoosh_curto", 0.6), "brasil": ("plim", 0.55), "vento": ("vento", 0.6), "fogo": ("whoosh_curto", 0.45),
    "vapor": ("vapor", 0.6), "empurra": ("whoosh_curto", 0.55), "panela": ("tampa", 0.7), "excecao": ("pop", 0.55),
    "raios": ("brilho", 0.6), "solta": ("zap", 0.45), "pronto": ("plim", 0.6), "cabos": ("zap", 0.4),
    "distancia": ("whoosh_curto", 0.5), "transformador": ("clique", 0.7), "tomada": ("clique", 0.7),
    "lampada": ("plim", 0.7), "passo1": ("pop", 0.6), "passo2": ("pop", 0.6), "passo3": ("pop", 0.6),
    "passo4": ("plim", 0.6), "cta": ("plim", 0.6),
    # cargos políticos
    "urna": ("urna", 0.7), "c1": ("pop", 0.5), "c2": ("pop", 0.5), "c3": ("pop", 0.5), "c4": ("pop", 0.5), "c5": ("pop", 0.5),
    "pergunta": ("brilho", 0.5), "predio": ("whoosh_curto", 0.5), "assembleia": ("pop", 0.5), "regras": ("pop", 0.5),
    "sindico": ("whoosh_curto", 0.5), "faz": ("clique", 0.7), "legislativo": ("plim", 0.55), "executivo": ("plim", 0.55),
    "andares": ("whoosh", 0.55), "cidade": ("thud", 0.45), "estado": ("thud", 0.45), "pais": ("thud", 0.45),
    "colExec": ("brilho", 0.5), "colLeg": ("brilho", 0.5), "prefeito": ("pop", 0.55), "saude": ("pop", 0.45),
    "escola": ("pop", 0.45), "lixo": ("pop", 0.45), "buraco": ("pop", 0.45), "onibus": ("whoosh_curto", 0.5),
    "camara": ("whoosh", 0.6), "vereadores": ("pop", 0.5), "orcamento": ("thud", 0.6), "fiscaliza": ("whoosh_curto", 0.5),
    "naoasfalta": ("thud", 0.6), "cobra": ("plim", 0.5), "governador": ("pop", 0.55), "policia": ("pop", 0.45),
    "hospital": ("pop", 0.45), "ensino": ("pop", 0.45), "estradas": ("whoosh_curto", 0.45), "deputados": ("pop", 0.5),
    "congresso": ("whoosh", 0.55), "casas": ("pop", 0.5), "pontos": ("brilho", 0.6), "povo": ("pop", 0.4),
    "sp": ("plim", 0.5), "rr": ("pop", 0.55), "senado": ("whoosh_curto", 0.55), "tres": ("brilho", 0.55),
    "tamanho": ("plim", 0.5), "lei": ("pop", 0.5), "duas": ("plim", 0.55), "presidente": ("pop", 0.55),
    "ministerios": ("whoosh", 0.5), "economia": ("pop", 0.45), "paises": ("pop", 0.45), "forcas": ("pop", 0.45),
    "sanciona": ("thud", 0.7), "veta": ("thud", 0.7), "sozinho": ("whoosh_curto", 0.5), "derruba": ("thud", 0.7),
    "exec": ("plim", 0.55), "leg": ("plim", 0.55), "perceber": ("brilho", 0.55),
}


def _r(x):
    return round(float(x), 3)


def narrar(roteiro):
    out = []
    for c in roteiro["cenas"]:
        tts = c.get("tts") or c["fala"]
        out.append(voz.narrar(c["fala"], tts, direcao=DIRECAO, voz_nome=roteiro.get("voz", "Achird")))
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


def mixar(ag, falas, saida):
    n = int(ag["total"] * SR)
    voz_buf, efx = np.zeros((n, 2)), np.zeros((n, 2))
    for c, f in zip(ag["cenas"], falas):
        if f.get("wav"):
            _soma(voz_buf, _ler_voz(f["wav"]), c["voz"], 1.0)
        _soma(efx, sons.som("whoosh"), max(0, c["ini"] - 0.3), 0.5)
        for ev, t in c["batidas"].items():
            nome, g = SOM.get(ev, ("pop", 0.4))
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


def montar(roteiro, ag, pasta):
    pasta = Path(pasta)
    if pasta.exists():
        shutil.rmtree(pasta)
    (pasta / "assets").mkdir(parents=True)
    for arq in ("gsap.min.js", "MotionPathPlugin.min.js", "DrawSVGPlugin.min.js", "MorphSVGPlugin.min.js"):
        shutil.copy(NODE / "gsap" / "dist" / arq, pasta / "assets" / arq)
    for peso in (600, 800, 900):
        shutil.copy(NODE / "@fontsource" / "nunito" / "files" / f"nunito-latin-{peso}-normal.woff2", pasta / "assets" / f"nunito-{peso}.woff2")
    dados = {"titulo": roteiro["titulo"], "gancho": roteiro["gancho"], "gancho_destaque": roteiro.get("gancho_destaque", ""), "agenda": ag}
    cenas = (AQUI / "cenas" / f"{roteiro['visual']}.js").read_text()
    html = (AQUI / "template.html").read_text()
    html = html.replace("/*__CENAS__*/", cenas)
    html = html.replace("/*__DADOS__*/null", json.dumps(dados, ensure_ascii=False)).replace("__TOTAL__", str(ag["total"]))
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
    ap.add_argument("roteiro")
    ap.add_argument("--qualidade", default="high", choices=["draft", "standard", "high"])
    ap.add_argument("--so-montar", action="store_true", help="monta o projeto sem renderizar")
    ap.add_argument("--previa", action="store_true", help="só tira fotos de cada cena (output/aprendendo/previa/<slug>)")
    a = ap.parse_args()
    roteiro = json.loads(Path(a.roteiro).read_text())
    falas = narrar(roteiro)
    print("narração:", {f["provedor"] for f in falas}, "| duração das falas:", round(sum(f["dur"] for f in falas), 1), "s")
    ag = agenda(roteiro, falas)
    print("vídeo:", ag["total"], "s")
    SAIDA.mkdir(parents=True, exist_ok=True)
    pasta = SAIDA / "build" / roteiro["slug"]
    montar(roteiro, ag, pasta)
    if a.previa:
        previa(ag, pasta, SAIDA / "previa" / roteiro["slug"])
        return
    if a.so_montar:
        return
    mudo = pasta / "video_mudo.mp4"
    renderizar(pasta, mudo, qualidade=a.qualidade)
    mixar(ag, falas, pasta / "trilha.wav")
    mp4 = SAIDA / f"{roteiro['slug']}.mp4"
    # ilustração chapada comprime bem: CRF 24 fica com ~20 MB e sem perda visível
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), "-i", str(pasta / "trilha.wav"), "-map", "0:v", "-map", "1:a",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-c:a", "aac", "-b:a", "160k", "-shortest", str(mp4)], check=True)
    print("pronto:", mp4)


if __name__ == "__main__":
    main()
