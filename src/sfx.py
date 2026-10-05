"""Biblioteca de efeitos sonoros sintetizados (48 kHz, estéreo).

Tudo é gerado por código, então não há questão de direitos. Para trocar um
efeito por um sample real, coloque `sons/<nome>.wav` na raiz do projeto:
o arquivo substitui o som sintetizado de mesmo nome.

Nomes: impacto, impacto_grave, whoosh, whoosh_curto, riser, apito_curto,
apito_longo, apito_final, torcida, grito_gol, lamento, pop, tick, thud,
var, brilho.
"""
from functools import lru_cache
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
SONS_USUARIO = Path(__file__).resolve().parent.parent / "sons"


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

def impacto(seed=1):
    """Batida cinematográfica: sub que cai de tom + transiente + cauda."""
    d = 1.2
    t = _t(d)
    f = 40 + 110 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    clique = _hp(_ruido(d, seed), 2000) * np.exp(-t * 90)
    corpo = _lp(_ruido(d, seed + 1), 900) * np.exp(-t * 9)
    x = 1.0 * sub + 0.35 * clique + 0.5 * corpo
    return _estereo(_norm(np.tanh(1.6 * x)))


def impacto_grave(seed=2):
    d = 2.0
    t = _t(d)
    f = 32 + 70 * np.exp(-t * 10)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.8)
    ruido = _lp(_ruido(d, seed, rosa=True), 400) * np.exp(-t * 4)
    x = np.tanh(2.0 * (sub + 0.4 * ruido))
    return _estereo(_norm(x))


def whoosh(dur=0.55, seed=3, de=-0.8, ate=0.8, f0=250, f1=4000):
    n = int(dur * SR)
    x = _ruido(dur, seed, rosa=True)
    meio = np.concatenate([np.geomspace(f0, f1, 32), np.geomspace(f1, f0 * 1.5, 32)])
    y = _varre_bp(x, None, meio, q=1.4)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2.2
    return _estereo(_norm(y * env, 0.8), np.linspace(de, ate, n))


def whoosh_curto(seed=4):
    return whoosh(0.32, seed, -0.4, 0.6, 600, 6000)


def riser(dur=0.8, seed=5):
    n = int(dur * SR)
    t = _t(dur)
    ruido = _varre_bp(_ruido(dur, seed), 400, 6000, q=1.2)
    f = np.geomspace(180, 900, n)
    tom = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    env = (t / dur) ** 2.5
    return _estereo(_norm((0.7 * ruido + 0.25 * tom) * env, 0.6))


def _apito(dur, seed):
    """Apito de árbitro: portadora ~2.9 kHz com rolha (FM a ~38 Hz)."""
    t = _t(dur)
    r = _rng(seed)
    rolha = 38 + 4 * np.sin(2 * np.pi * 0.7 * t)
    fm = 2950 + 160 * np.sin(2 * np.pi * np.cumsum(rolha) / SR)
    fase = 2 * np.pi * np.cumsum(fm) / SR
    am = 0.75 + 0.25 * np.sin(2 * np.pi * np.cumsum(rolha) / SR + 0.5)
    tom = np.sin(fase) + 0.25 * np.sin(2 * fase) + 0.08 * np.sin(3 * fase)
    sopro = _bp(r.standard_normal(len(t)), 2400, 4200) * 0.08
    env = np.minimum(1, t / 0.025) * np.minimum(1, (dur - t) / 0.05)
    return (tom * am + sopro) * np.clip(env, 0, 1)


def apito_curto(seed=6):
    return _estereo(_norm(_apito(0.32, seed), 0.55))


def apito_longo(seed=7):
    return _estereo(_norm(_apito(1.0, seed), 0.55))


def apito_final(seed=8):
    partes = [_apito(0.28, seed), np.zeros(int(0.18 * SR)), _apito(0.28, seed + 1),
              np.zeros(int(0.18 * SR)), _apito(1.1, seed + 2)]
    return _estereo(_norm(np.concatenate(partes), 0.55))


def _multidao(dur, seed, vozes=28, lo=280, hi=2600, taxa=(0.6, 3.5)):
    """Massa de vozes: ruído em bandas com modulação lenta independente."""
    n = int(dur * SR)
    r = _rng(seed)
    x = np.zeros(n)
    t = _t(dur)
    for v in range(vozes):
        centro = r.uniform(lo, hi)
        banda = _bp(r.standard_normal(n), centro * 0.75, centro * 1.3)
        f = r.uniform(*taxa)
        mod = 0.55 + 0.45 * np.sin(2 * np.pi * f * t + r.uniform(0, 6.28)) * np.sin(2 * np.pi * f * 0.37 * t + r.uniform(0, 6.28))
        x += banda * mod
    corpo = _lp(_ruido(dur, seed + 99, rosa=True), 500)
    return x / vozes + 0.5 * corpo / (np.max(np.abs(corpo)) + 1e-9) * 0.2


def torcida(dur=8.0, seed=9):
    """Ambiente de estádio, para loop de fundo."""
    x = _multidao(dur, seed)
    e = _multidao(dur, seed + 1)
    # crossfade nas pontas para emendar o loop
    n = len(x)
    f = int(0.5 * SR)
    jan = np.ones(n)
    jan[:f] = np.linspace(0, 1, f)
    jan[-f:] = np.linspace(1, 0, f)
    return np.stack([_norm(x * jan, 0.5), _norm(e * jan, 0.5)], axis=1)


def grito_gol(seed=10):
    """Explosão da torcida: ataque rápido, sustentação e queda lenta."""
    d = 4.5
    t = _t(d)
    x = _multidao(d, seed, vozes=40, lo=350, hi=3800, taxa=(2, 6))
    y = _multidao(d, seed + 3, vozes=40, lo=350, hi=3800, taxa=(2, 6))
    env = np.minimum(1, t / 0.18) * np.where(t < 1.6, 1, np.exp(-(t - 1.6) * 1.1))
    brilho = _hp(_ruido(d, seed + 7), 3000) * 0.08 * env
    return np.stack([_norm((x + brilho) * env, 0.85), _norm((y + brilho) * env, 0.85)], axis=1)


def lamento(seed=11):
    """'Uuuh' da torcida: vozes graves que sobem e caem de tom."""
    d = 2.2
    t = _t(d)
    r = _rng(seed)
    x = np.zeros(len(t))
    contorno = 1 + 0.25 * np.sin(np.pi * np.clip(t / 1.4, 0, 1))  # sobe e desce
    for v in range(36):
        f0 = r.uniform(140, 320)
        f = f0 * contorno * (1 + 0.01 * r.standard_normal())
        fase = 2 * np.pi * np.cumsum(f) / SR + r.uniform(0, 6.28)
        voz = np.sin(fase) + 0.5 * np.sin(2 * fase) + 0.25 * np.sin(3 * fase)
        x += voz * (0.7 + 0.3 * np.sin(2 * np.pi * r.uniform(3, 6) * t + r.uniform(0, 6.28)))
    x = _lp(x, 1400) + 0.3 * _bp(_ruido(d, seed), 300, 1500)
    env = np.minimum(1, t / 0.25) * np.exp(-np.clip(t - 0.9, 0, None) * 2.0)
    return _estereo(_norm(x * env, 0.6))


def pop(seed=12):
    d = 0.12
    t = _t(d)
    f = 900 + 700 * np.exp(-t * 60)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
    return _estereo(_norm(x, 0.5))


def tick(seed=13):
    d = 0.06
    t = _t(d)
    x = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120) + 0.3 * _hp(_ruido(d, seed), 4000) * np.exp(-t * 200)
    return _estereo(_norm(x, 0.35))


def thud(seed=14):
    d = 0.5
    t = _t(d)
    f = 60 + 90 * np.exp(-t * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) + 0.2 * _lp(_ruido(d, seed), 1500) * np.exp(-t * 40)
    return _estereo(_norm(np.tanh(1.5 * x), 0.8))


def var(seed=15):
    d = 0.7
    t = _t(d)
    bip = lambda a, b: np.sin(2 * np.pi * 880 * t) * ((t >= a) & (t < b))
    x = bip(0, 0.18) + bip(0.3, 0.48)
    return _estereo(_norm(_lp(x, 4000), 0.4))


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


EFEITOS = {f.__name__: f for f in (impacto, impacto_grave, whoosh, whoosh_curto, riser, apito_curto, apito_longo,
                                    apito_final, torcida, grito_gol, lamento, pop, tick, thud, var, brilho)}


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
