"""Base dos efeitos sonoros sintetizados (48 kHz, estéreo): filtros, ruído,
envelopes e os efeitos genéricos whoosh, whoosh_curto, pop, thud e brilho.

Tudo é gerado por código, então não há questão de direitos. Para trocar um
efeito por um sample real, coloque `sons/<nome>.wav` na raiz do projeto.
"""
from functools import lru_cache
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
SONS_USUARIO = Path(__file__).resolve().parents[2] / "sons"


def _t(dur):
    return np.arange(int(dur * SR)) / SR


def _rng(seed):
    return np.random.default_rng(seed)


def _ruido(dur, seed, rosa=False):
    x = _rng(seed).standard_normal(int(dur * SR))
    if rosa:  # aproximação de ruído rosa (filtro de Paul Kellet)
        b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
        a = [1, -2.494956002, 2.017265875, -0.522189400]
        x = signal.lfilter(b, a, x)
    return x / (np.max(np.abs(x)) + 1e-9)


def _bp(x, lo, hi, ordem=2):
    sos = signal.butter(ordem, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def _lp(x, f, ordem=2):
    return signal.sosfilt(signal.butter(ordem, f, fs=SR, output="sos"), x)


def _hp(x, f, ordem=2):
    return signal.sosfilt(signal.butter(ordem, f, btype="high", fs=SR, output="sos"), x)


def _env(n, ataque, decaimento, curva=4.0):
    """Envelope ataque linear + decaimento exponencial, em amostras totais n."""
    e = np.ones(n)
    a = max(1, int(ataque * SR))
    e[:a] = np.linspace(0, 1, a)
    resto = n - a
    if resto > 0:
        e[a:] = np.exp(-curva * np.linspace(0, 1, resto) * (resto / SR) / max(decaimento, 1e-3))
    return e


def _norm(x, pico=0.9):
    return x * (pico / (np.max(np.abs(x)) + 1e-9))


def _estereo(x, pan=0.0):
    """pan -1 (esq) .. 1 (dir); aceita pan como array para movimento."""
    pan = np.broadcast_to(pan, x.shape)
    ang = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(ang), x * np.sin(ang)], axis=1)


def _varre_bp(x, f0, f1, q=2.0, blocos=64):
    """Passa-banda cuja frequência central varre de f0 a f1 (em blocos)."""
    n = len(x)
    out = np.zeros(n)
    idx = np.linspace(0, n, blocos + 1).astype(int)
    fs = np.geomspace(f0, f1, blocos) if np.isscalar(f1) else f1
    zi = None
    for i in range(blocos):
        fc = float(fs[i])
        bw = fc / q
        sos = signal.butter(2, [max(30, fc - bw / 2), min(SR / 2 - 100, fc + bw / 2)], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        seg, zi = signal.sosfilt(sos, x[idx[i]:idx[i + 1]], zi=zi)
        out[idx[i]:idx[i + 1]] = seg
    return out


# ---------------------------------------------------------------- efeitos

def whoosh(dur=0.55, seed=3, de=-0.8, ate=0.8, f0=250, f1=4000):
    n = int(dur * SR)
    x = _ruido(dur, seed, rosa=True)
    meio = np.concatenate([np.geomspace(f0, f1, 32), np.geomspace(f1, f0 * 1.5, 32)])
    y = _varre_bp(x, None, meio, q=1.4)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2.2
    return _estereo(_norm(y * env, 0.8), np.linspace(de, ate, n))


def whoosh_curto(seed=4):
    return whoosh(0.32, seed, -0.4, 0.6, 600, 6000)


def pop(seed=12):
    d = 0.12
    t = _t(d)
    f = 900 + 700 * np.exp(-t * 60)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
    return _estereo(_norm(x, 0.5))


def thud(seed=14):
    d = 0.5
    t = _t(d)
    f = 60 + 90 * np.exp(-t * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) + 0.2 * _lp(_ruido(d, seed), 1500) * np.exp(-t * 40)
    return _estereo(_norm(np.tanh(1.5 * x), 0.8))


def brilho(seed=16):
    d = 1.0
    t = _t(d)
    r = _rng(seed)
    x = np.zeros(len(t))
    for i in range(10):
        inicio = i * 0.04
        f = r.uniform(3000, 7000)
        x += np.sin(2 * np.pi * f * t) * np.exp(-np.clip(t - inicio, 0, None) * 9) * (t >= inicio)
    return _estereo(_norm(x, 0.3), np.linspace(-0.6, 0.6, len(t)))


EFEITOS = {f.__name__: f for f in (whoosh, whoosh_curto, pop, thud, brilho)}


def _ler_wav(arq):
    sr, x = wavfile.read(arq)
    if x.dtype.kind in "iu":
        x = x.astype(np.float64) / np.iinfo(x.dtype).max
    else:
        x = x.astype(np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr, axis=0)
    return x[:, :2]


@lru_cache(maxsize=None)
def som(nome):
    arq = SONS_USUARIO / f"{nome}.wav"
    if arq.exists():
        return _ler_wav(arq)
    return EFEITOS[nome]()
