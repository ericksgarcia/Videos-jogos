"""Monta a trilha sonora do vídeo a partir da agenda.

Cada efeito é disparado num instante de `agenda["m"]` ou de uma parada,
os mesmos que o template usa para animar. Som e imagem ficam no mesmo frame.
"""
import subprocess

import numpy as np
from scipy.io import wavfile

import sfx

SR = sfx.SR
AMBIENTE = 0.34      # volume da torcida de fundo
LIMITE = 0.89        # pico final (-1 dBFS)

# Efeitos por tipo de destaque: (som, atraso em s a partir da parada, ganho)
POR_TIPO = {
    "gol":             [("impacto", 0.0, 1.0), ("grito_gol", 0.0, 0.95)],
    "vermelho":        [("apito_curto", 0.0, 0.8), ("impacto", 0.12, 0.8), ("whoosh_curto", 0.05, 0.6)],
    "amarelo":         [("apito_curto", 0.0, 0.7), ("whoosh_curto", 0.05, 0.6)],
    "chance":          [("impacto", 0.0, 0.55), ("lamento", 0.25, 0.85)],
    "penalti_perdido": [("apito_curto", 0.0, 0.7), ("impacto", 0.1, 0.6), ("lamento", 0.3, 0.9)],
    "anulado":         [("var", 0.0, 0.9), ("apito_curto", 0.6, 0.7), ("lamento", 0.65, 0.7)],
}


def cues(dados, ag):
    m = ag["m"]
    c = []
    for i, t in enumerate(m["palavras"]):
        c.append(("impacto_grave" if i == 0 else "impacto", t, 1.0 if i == 0 else 0.55))
    c += [
        ("pop", m["sub"], 0.5),
        ("whoosh", m["wipe1"], 0.9),
        ("whoosh_curto", m["escudo_casa"], 0.7),
        ("whoosh_curto", m["escudo_fora"], 0.7),
        ("impacto", m["vs"], 1.0),
        ("brilho", m["brilho"], 0.8),
        ("pop", m["info"], 0.45),
        ("apito_longo", m["rolando"], 0.8),
        ("whoosh", m["wipe2"], 0.9),
        ("thud", m["placar_entra"], 0.7),
    ]
    for d, p in zip(dados["destaques"], ag["paradas"]):
        t = p["t"]
        if p["viagem"] >= 0.7:
            dur = min(0.8, p["viagem"])
            c.append(("riser", t - dur, 0.55))
        c.append(("pop", t, 0.4))
        c += [(s, t + atraso, g) for s, atraso, g in POR_TIPO[d["tipo"]]]
        if d["tipo"] == "gol":
            c.append(("thud", p["placar"], 0.85))
        c.append(("whoosh_curto", p["saida"], 0.55))
    c += [
        ("apito_final", m["apito_final"], 0.85),
        ("whoosh", m["wipe3"], 0.9),
        ("impacto", m["fim"], 0.9),
        ("impacto_grave", m["fim_placar"], 0.9),
        ("grito_gol", m["fim_placar"], 0.45),
    ]
    c += [("tick", t, 0.8) for t in m["fim_stats"]]
    c.append(("pop", m["cta"], 0.6))
    return c


def _soma(buf, x, t, ganho):
    i = int(round(t * SR))
    if i < 0:
        x, i = x[-i:], 0
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * ganho


def mixar(dados, ag, saida_wav):
    total = ag["total"]
    n = int(total * SR) + SR // 10
    buf = np.zeros((n, 2))

    # torcida de fundo: entra com o apito inicial, em loop, sai no fim do vídeo
    amb = sfx.som("torcida")
    a0 = ag["m"]["rolando"] - 0.4
    loop = np.tile(amb, (int(np.ceil((total - a0) / (len(amb) / SR))) + 1, 1))
    env = np.ones(len(loop))
    f = int(0.8 * SR)
    env[:f] = np.linspace(0, 1, f)
    fim = int((total - a0) * SR)
    env[max(0, fim - int(1.5 * SR)):fim] = np.linspace(1, 0, min(fim, int(1.5 * SR)))
    env[fim:] = 0
    _soma(buf, loop * env[:, None], a0, AMBIENTE)

    for nome, t, ganho in cues(dados, ag):
        _soma(buf, sfx.som(nome), t, ganho)

    # limitador suave e normalização
    buf = np.tanh(buf * 1.2) / np.tanh(1.2)
    buf *= LIMITE / (np.max(np.abs(buf)) + 1e-9)
    buf = buf[: int(total * SR)]
    wavfile.write(saida_wav, SR, (buf * 32767).astype(np.int16))
    return saida_wav


def juntar(video, wav, saida):
    """Coloca a trilha no MP4 (vídeo copiado, áudio AAC)."""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-i", str(wav), "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(saida)], check=True)
