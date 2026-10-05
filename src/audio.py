"""Monta a trilha: narração + efeitos + torcida, tudo a partir da agenda.

Cada efeito é disparado num instante de `agenda` (os mesmos que o template
usa para animar), então som e imagem ficam no mesmo frame. Enquanto o
narrador fala, torcida e efeitos abaixam (ducking) para a voz ficar clara.
"""
import subprocess

import numpy as np
from scipy import signal
from scipy.io import wavfile

import sfx

SR = sfx.SR
AMBIENTE = 0.34      # volume da torcida de fundo
VOZ = 1.0            # volume da narração
DUCK = 0.5           # quanto o resto abaixa sob a voz (0 = nada, 1 = silêncio)
LIMITE = 0.89        # pico final (-1 dBFS)

# Clímax de cada lance: (som, atraso a partir do clímax, ganho)
CLIMAX = {
    "gol":      [("impacto", 0.0, 1.0), ("grito_gol", 0.0, 1.0)],
    "save":     [("impacto", 0.0, 0.6), ("lamento", 0.2, 0.9)],
    "post":     [("thud", 0.0, 0.9), ("impacto", 0.0, 0.5), ("lamento", 0.15, 0.9)],
    "miss":     [("whoosh_curto", -0.1, 0.6), ("lamento", 0.15, 0.85)],
    "block":    [("thud", 0.0, 0.8), ("lamento", 0.15, 0.7)],
    "amarelo":  [("whoosh_curto", -0.2, 0.7), ("impacto", 0.3, 0.6)],
    "vermelho": [("whoosh_curto", -0.2, 0.7), ("impacto", 0.3, 1.0), ("lamento", 0.6, 0.5)],
    "anulado":  [("impacto", 0.0, 0.8), ("lamento", 0.1, 0.8)],
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
        t, S, C = p["t"], p["lance"], p["clima"]
        if p["viagem"] >= 0.7:
            c.append(("riser", t - min(0.8, p["viagem"]), 0.55))
        c += [("pop", t, 0.45), ("whoosh", t + 0.3, 0.8), ("impacto", S - 0.05, 0.5)]
        if d["tipo"] in ("amarelo", "vermelho", "penalti_perdido"):
            c.append(("apito_curto", S + 0.35, 0.75))
        if d["tipo"] == "anulado":
            c.append(("var", S + 0.5, 0.9))
        # toques na bola: passes do campinho ou a cadeia A → B
        if d.get("campinho"):
            for tp in p.get("passes_t", []):
                c.append(("thud", tp, 0.3))
        elif d["tipo"] in ("gol", "chance", "penalti_perdido"):
            if (d.get("cadeia") or {}).get("a"):
                c += [("pop", p["cadeia_a"], 0.5), ("thud", p["cadeia_b"] - 0.45, 0.35)]
            c.append(("pop", p["cadeia_b"], 0.55))
        if d["tipo"] in ("gol", "chance", "penalti_perdido") and d.get("lance"):
            c.append(("thud", p["chute"], 0.55))
            chave = "gol" if d["tipo"] == "gol" else d["lance"].get("resultado", "miss")
        else:
            chave = d["tipo"]
        c += [(s, C + atraso, g) for s, atraso, g in CLIMAX.get(chave, CLIMAX["miss"])]
        c.append(("whoosh", p["wipe"], 0.85))
        if d["tipo"] == "gol":
            c.append(("thud", p["placar"], 0.8))
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


def mixar(dados, ag, vozes, saida_wav):
    total = ag["total"]
    n = int(total * SR) + SR // 10
    resto = np.zeros((n, 2))
    voz = np.zeros((n, 2))

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
    _soma(resto, loop * env[:, None], a0, AMBIENTE)

    for nome, t, ganho in cues(dados, ag):
        _soma(resto, sfx.som(nome), t, ganho)

    # narração
    falas = [(vozes["gancho"], ag["voz"]["gancho"]), (vozes["intro"], ag["voz"]["intro"]),
             (vozes["fim"], ag["voz"]["fim"])]
    falas += [(v, p["voz"]) for v, p in zip(vozes["lances"], ag["paradas"])]
    for v, t in falas:
        if v.get("wav"):
            _soma(voz, _ler_voz(v["wav"]), t, VOZ)

    # ducking: o envelope suavizado da voz controla o volume do resto
    if np.any(voz):
        nivel = np.abs(voz[:, 0])
        janela = int(0.08 * SR)
        nivel = np.convolve(nivel, np.ones(janela) / janela, mode="same")
        nivel = np.clip(nivel / 0.05, 0, 1)
        sos = signal.butter(1, 3, fs=SR, output="sos")
        nivel = np.clip(signal.sosfiltfilt(sos, nivel), 0, 1)
        resto *= (1 - DUCK * nivel)[:, None]

    buf = np.tanh((resto + voz) * 1.15) / np.tanh(1.15)
    buf *= LIMITE / (np.max(np.abs(buf)) + 1e-9)
    buf = buf[: int(total * SR)]
    wavfile.write(saida_wav, SR, (buf * 32767).astype(np.int16))
    return saida_wav


def juntar(video, wav, saida):
    """Coloca a trilha no MP4. O vídeo é recodificado a no máximo 8 Mbps:
    a granulação infla o render em alta (35+ MB) e o TikTok recomprime acima disso."""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-i", str(wav), "-map", "0:v", "-map", "1:a",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "8M", "-bufsize", "16M",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", str(saida)], check=True)
