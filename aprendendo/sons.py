"""Sons do canal Aprendendo Fácil: efeitos e trilha de fundo, sintetizados.

Usa a base de sfx.py. Tudo é gerado por código (sem direitos de
terceiros); para trocar um efeito por um sample, salve `sons/<nome>.wav`
na raiz do projeto.
"""
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sfx  # noqa: E402
from sfx import SR, _bp, _estereo, _hp, _lp, _norm, _ruido, _t  # noqa: E402


def clique():
    d = 0.09
    t = _t(d)
    x = _hp(_ruido(d, 21), 2500) * np.exp(-t * 160) + 0.6 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90)
    return _estereo(_norm(x, 0.5))


def plim():
    """Sininho suave (luz acendendo, ideia)."""
    d = 1.4
    t = _t(d)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in
            ((1318.5, 1.0, 3.0), (2637, 0.35, 5.0), (1975.5, 0.25, 4.0), (3951, 0.1, 7.0)))
    return _estereo(_norm(x * np.minimum(1, t / 0.004), 0.45))


def zap():
    """Faísca elétrica curta."""
    d = 0.35
    t = _t(d)
    r = np.random.default_rng(22)
    buzz = np.sign(np.sin(2 * np.pi * (120 + 40 * r.standard_normal(len(t)).cumsum() / 400) * t))
    x = _bp(buzz, 300, 5000) * 0.5 + _hp(_ruido(d, 23), 3000) * 0.6
    env = np.exp(-t * 9) * (0.6 + 0.4 * (r.random(len(t)) > 0.5))
    return _estereo(_norm(x * env, 0.45))


def agua():
    d = 3.0
    t = _t(d)
    x = _lp(_ruido(d, 24, rosa=True), 1800) + 0.3 * _bp(_ruido(d, 25), 600, 3000)
    env = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.8)
    return _estereo(_norm(x * env, 0.4), np.sin(2 * np.pi * 0.3 * t) * 0.4)


def vento():
    d = 3.0
    t = _t(d)
    base = _ruido(d, 26, rosa=True)
    centro = np.concatenate([np.geomspace(300, 1200, 32), np.geomspace(1200, 400, 32)])
    x = sfx._varre_bp(base, None, centro, q=2.5)
    env = np.sin(np.linspace(0, np.pi, len(t))) ** 1.5
    return _estereo(_norm(x * env, 0.45), np.linspace(-0.6, 0.6, len(t)))


def vapor():
    d = 1.6
    t = _t(d)
    x = _hp(_ruido(d, 27), 3500)
    env = np.minimum(1, t / 0.08) * np.exp(-np.clip(t - 0.3, 0, None) * 2.2)
    return _estereo(_norm(x * env, 0.35))


def tampa():
    """Tampa de panela batendo (metálico curto)."""
    d = 0.5
    t = _t(d)
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in ((820, 14), (1460, 18), (2350, 24)))
    return _estereo(_norm(x + 0.3 * _hp(_ruido(d, 28), 4000) * np.exp(-t * 60), 0.4))


EFEITOS = {f.__name__: f for f in (clique, plim, zap, agua, vento, vapor, tampa)}


@lru_cache(maxsize=None)
def som(nome):
    arq = sfx.SONS_USUARIO / f"{nome}.wav"
    if arq.exists():
        return sfx._ler_wav(arq)
    if nome in EFEITOS:
        return EFEITOS[nome]()
    return sfx.som(nome)


# ------------------------------------------------------------------ trilha

def _nota(f, d, ataque=0.005, queda=2.5, brilho=0.35):
    t = _t(d)
    x = np.sin(2 * np.pi * f * t) + brilho * np.sin(4 * np.pi * f * t) * np.exp(-t * 6) + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t * 9)
    return x * np.minimum(1, t / ataque) * np.exp(-t * queda)


def trilha(dur, bpm=92, seed=30):
    """Fundo leve e moderno: pad + arpejo dedilhado + pulso grave discreto.
    Progressão Dó - Sol - Lá menor - Fá, em loop."""
    n = int(dur * SR)
    out = np.zeros(n)
    batida = 60 / bpm
    acordes = [(261.63, 329.63, 392.00), (196.00, 246.94, 293.66), (220.00, 261.63, 329.63), (174.61, 220.00, 261.63)]
    compasso = 4 * batida
    k = 0
    tempo = 0.0
    while tempo < dur:
        ac = acordes[k % 4]
        # pad: acorde sustentado com ataque lento
        d = compasso + 0.6
        tt = _t(d)
        pad = sum(np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.003 * tt) for f in ac)
        pad *= np.minimum(1, tt / 0.6) * np.minimum(1, np.clip(d - tt, 0, None) / 0.6)
        i = int(tempo * SR)
        j = min(n, i + len(pad))
        out[i:j] += 0.05 * pad[: j - i]
        # arpejo em colcheias
        notas = [ac[0] * 2, ac[1] * 2, ac[2] * 2, ac[1] * 2, ac[0] * 4, ac[2] * 2, ac[1] * 2, ac[2] * 2]
        for m, f in enumerate(notas):
            t0 = tempo + m * batida / 2
            x = _nota(f, 1.2, queda=4.0)
            i = int(t0 * SR)
            j = min(n, i + len(x))
            if i < n:
                out[i:j] += 0.06 * x[: j - i]
        # grave no tempo 1 e 3
        for m in (0, 2):
            t0 = tempo + m * batida
            x = _nota(ac[0] / 2, 0.9, ataque=0.01, queda=4.5, brilho=0.1)
            i = int(t0 * SR)
            j = min(n, i + len(x))
            if i < n:
                out[i:j] += 0.09 * x[: j - i]
        tempo += compasso
        k += 1
    out = _lp(out, 5000)
    f = int(1.0 * SR)
    out[:f] *= np.linspace(0, 1, f)
    out[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))
    return np.stack([out, out], axis=1)
