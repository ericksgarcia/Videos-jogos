"""Sons do canal Aprendendo Fácil: efeitos e trilha de fundo, sintetizados.

Usa a base de sfx.py. Tudo é gerado por código (sem direitos de
terceiros); para trocar um efeito por um sample, salve `sons/<nome>.wav`
na raiz do projeto.
"""
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np
from scipy import signal

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


def urna():
    """Bipes de confirmação da urna eletrônica (sequência rápida + nota final)."""
    d = 0.75
    t = _t(d)
    x = np.zeros(len(t))
    for k in range(6):
        f = 2350 if k % 2 else 1950
        m = (t >= k * 0.055) & (t < k * 0.055 + 0.045)
        x += np.sign(np.sin(2 * np.pi * f * t)) * m * 0.5
    m = t >= 0.33
    x += np.sign(np.sin(2 * np.pi * 2350 * t)) * m * 0.5 * np.exp(-np.clip(t - 0.33, 0, None) * 4)
    return _estereo(_norm(_lp(x, 6000), 0.3))


# ------------------------------------------------------------------ espaço e efeitos "de cinema"

def reverb(x, dur=2.2, brilho=6000, seed=40):
    """Reverb de sala grande: convolução com resposta sintética (ruído decaindo, estéreo)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    r = np.random.default_rng(seed)
    env = np.exp(-t * 6.9 / dur) * np.minimum(1, t / 0.012)
    ir = np.stack([_lp(r.standard_normal(n), brilho) * env, _lp(r.standard_normal(n), brilho) * env], axis=1)
    ir /= np.sqrt((ir ** 2).sum(axis=0, keepdims=True)) + 1e-9
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    return np.stack([signal.fftconvolve(x[:, k], ir[:, k])[: len(x) + n] for k in range(2)], axis=1)


def _com_cauda(x, mix=0.3, dur=1.6):
    """Efeito seco + cauda de reverb (som fica 'no espaço')."""
    w = reverb(x, dur)
    out = np.zeros_like(w)
    out[: len(x)] += x
    return out + w * mix


def plim2():
    """Sino brilhante com coro e cauda longa (luz acendendo, ideia, conclusão)."""
    d = 1.8
    t = _t(d)
    x = np.zeros(len(t))
    for f, a, k in ((1318.5, 1.0, 2.6), (2637, 0.3, 4.5), (1975.5, 0.28, 3.4), (3951, 0.08, 6), (659.25, 0.25, 2.0)):
        for det in (-1.5, 0, 1.7):
            x += a / 3 * np.sin(2 * np.pi * (f + det) * t) * np.exp(-t * k)
    x *= np.minimum(1, t / 0.003)
    return _com_cauda(_estereo(_norm(x, 0.42)), 0.35, 2.2)


def pop2():
    """Pop macio com corpo (bolha), para coisas que aparecem."""
    d = 0.18
    t = _t(d)
    f = 520 + 900 * np.exp(-t * 38)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26) + 0.25 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * np.exp(-t * 45)
    x += 0.15 * _hp(_ruido(d, 31), 3000) * np.exp(-t * 120)
    return _com_cauda(_estereo(_norm(x, 0.5)), 0.18, 0.9)


def whoosh2(dur=0.7, seed=33):
    """Passagem de ar em camadas, com varredura estéreo e um grave por baixo."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = _ruido(dur, seed, rosa=True)
    cen = np.concatenate([np.geomspace(200, 3500, 32), np.geomspace(3500, 500, 32)])
    ar = sfx._varre_bp(base, None, cen, q=1.2)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2.4
    tom = np.sin(2 * np.pi * np.cumsum(np.geomspace(90, 45, n)) / SR) * env ** 1.5 * 0.35
    x = _estereo(_norm(ar * env, 0.75), np.linspace(-0.9, 0.9, n)) + _estereo(tom)
    return _com_cauda(x, 0.25, 1.4)


def whoosh_curto2():
    return whoosh2(0.38, 34)


def thud2():
    """Impacto cinematográfico: sub que cai + batida + cauda."""
    d = 1.1
    t = _t(d)
    f = 38 + 110 * np.exp(-t * 22)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    bat = _lp(_ruido(d, 35), 1800) * np.exp(-t * 35)
    x = np.tanh(1.6 * (sub + 0.4 * bat))
    return _com_cauda(_estereo(_norm(x, 0.8)), 0.22, 1.8)


def brilho2():
    """Cintilar mágico: notas agudas espalhadas no estéreo, com cauda."""
    d = 1.3
    t = _t(d)
    r = np.random.default_rng(36)
    esq, dir_ = np.zeros(len(t)), np.zeros(len(t))
    escala = [1046.5, 1318.5, 1568, 2093, 2637, 3136]
    for i in range(12):
        t0 = i * 0.045
        f = escala[i % len(escala)] * (2 if i > 7 else 1)
        nota = np.sin(2 * np.pi * f * t) * np.exp(-np.clip(t - t0, 0, None) * 7) * (t >= t0)
        pan = r.uniform(-1, 1)
        esq += nota * (1 - pan) / 2
        dir_ += nota * (1 + pan) / 2
    x = np.stack([esq, dir_], axis=1)
    return _com_cauda(x * (0.3 / (np.abs(x).max() + 1e-9)), 0.4, 2.0)


def zap2():
    """Faísca elétrica: estalos irregulares + zumbido."""
    d = 0.45
    t = _t(d)
    r = np.random.default_rng(37)
    estalos = np.zeros(len(t))
    for _ in range(18):
        i = int(r.uniform(0, 0.35) * SR)
        L = int(r.uniform(0.002, 0.008) * SR)
        estalos[i:i + L] += r.standard_normal(min(L, len(t) - i)) * r.uniform(0.4, 1)
    zumbido = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.25 + np.sin(2 * np.pi * 240 * t) * 0.2
    x = _hp(estalos, 1500) + _bp(zumbido, 100, 3000) * np.exp(-t * 6)
    return _com_cauda(_estereo(_norm(x * np.exp(-t * 4), 0.42)), 0.2, 1.0)


def riser(dur=2.4, seed=41):
    """Som que cresce até o grande momento (padrão de trailer): ruído que sobe de agudo,
    tom que sobe de altura e volume que acelera no fim. Termina seco, sem cauda."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    ar = sfx._varre_bp(_ruido(dur, seed, rosa=True), None, np.geomspace(300, 7000, 64), q=2.4)
    f = 110 * 2 ** (2.5 * u ** 1.6)  # sobe ~2,5 oitavas
    tom = sum(np.sin(2 * np.pi * np.cumsum(f * d) / SR) for d in (0.995, 1.0, 1.006)) / 3
    env = u ** 2.6
    x = _norm(ar, 0.6) * env + tom * env * 0.35
    return _estereo(_norm(x, 0.7), np.sin(np.linspace(0, 6 * np.pi, n)) * 0.4 * u)


def impacto():
    """Batida do grande momento: sub profundo + estalo + brilho, com cauda longa."""
    d = 2.0
    t = _t(d)
    sub = np.sin(2 * np.pi * np.cumsum(32 + 70 * np.exp(-t * 14)) / SR) * np.exp(-t * 2.2)
    est = _lp(_ruido(d, 42), 2600) * np.exp(-t * 28)
    x = _estereo(_norm(np.tanh(1.8 * (sub + 0.5 * est)), 0.9))
    b = brilho2()[: len(x)]
    x[: len(b)] += b * 0.6
    return _com_cauda(x, 0.3, 2.4)


def assinatura():
    """Logo sonoro do canal (cartão final): três notas que sobem (Dó, Mi, Sol) e um
    acorde que fica, com brilho e reverb. Sempre igual: vira a "marca" de ouvido."""
    d = 2.6
    out = np.zeros((int(d * SR), 2))
    for i, (f, t0) in enumerate([(523.25, 0.0), (659.25, 0.14), (783.99, 0.28)]):
        x = _nota(f, d - t0, 0.004, 2.2, 0.5) + 0.5 * _nota(f * 2, d - t0, 0.004, 3.5, 0.3)
        i0 = int(t0 * SR)
        out[i0:] += _estereo(x * 0.3, (-0.5, 0.0, 0.5)[i])[: len(out) - i0]
    acorde = sum(_nota(f, d - 0.42, 0.06, 1.1, 0.2) for f in (261.63, 392.0, 523.25)) * 0.12
    out[int(0.42 * SR):] += _estereo(acorde)[: len(out) - int(0.42 * SR)]
    return _com_cauda(out * (0.7 / (np.abs(out).max() + 1e-9)), 0.45, 2.5)


def transicao():
    """Troca de cena: whoosh largo + grave suave."""
    w = whoosh2(0.9, 38)
    g = thud2() * 0.35
    out = np.zeros((max(len(w), len(g) + int(0.55 * SR)), 2))
    out[: len(w)] += w
    i = int(0.55 * SR)
    out[i:i + len(g)] += g
    return out


EFEITOS = {f.__name__: f for f in (clique, plim, zap, agua, vento, vapor, tampa, urna, transicao, riser, impacto, assinatura)}
# versões "de cinema" substituem as básicas com o mesmo nome
EFEITOS.update({"plim": plim2, "pop": pop2, "whoosh": whoosh2, "whoosh_curto": whoosh_curto2, "thud": thud2, "brilho": brilho2, "zap": zap2})


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


def _saw(f, t):
    return 2 * ((f * t) % 1) - 1


@lru_cache(maxsize=None)
def _pluck(f, d, seed):
    """Corda dedilhada (Karplus-Strong)."""
    n = int(d * SR)
    p = max(2, int(SR / f))
    r = np.random.default_rng(seed)
    buf = r.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * np.exp(-np.arange(n) / SR * 2.2)


def trilha(dur, bpm=96, seed=30, marcos=None):
    """Trilha de fundo "documentário moderno": pad largo com saws desafinadas e filtro
    que respira, dedilhado com eco, sub grave, batida suave e shaker que entram
    depois da abertura, e reverb. Progressão Dó - Sol - Lá menor - Fá, em loop.
    `marcos`: instantes (s) de troca de cena, onde entra um pequeno "respiro" na batida."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    batida = 60 / bpm
    compasso = 4 * batida
    acordes = [(130.81, 164.81, 196.0, 261.63), (98.0, 146.83, 196.0, 246.94), (110.0, 164.81, 220.0, 261.63), (87.31, 130.81, 174.61, 220.0)]
    pad = np.zeros(n)
    k, t0 = 0, 0.0
    while t0 < dur:
        i0, i1 = int(t0 * SR), min(n, int((t0 + compasso + 0.8) * SR))
        tt = t[i0:i1] - t0
        env = np.minimum(1, tt / 0.9) * np.minimum(1, np.clip(compasso + 0.8 - tt, 0, None) / 0.8)
        som = sum(_saw(f * d, tt) for f in acordes[k % 4] for d in (0.996, 1.004))
        pad[i0:i1] += som * env * 0.05
        t0 += compasso
        k += 1
    # filtro passa-baixa que "respira" (abre e fecha devagar)
    blocos = 200
    out_pad = np.zeros(n)
    idx = np.linspace(0, n, blocos + 1).astype(int)
    zi = None
    for b in range(blocos):
        fc = 900 + 700 * (0.5 + 0.5 * np.sin(2 * np.pi * (idx[b] / SR) / 16))
        sos = signal.butter(2, fc, fs=SR, output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        out_pad[idx[b]:idx[b + 1]], zi = signal.sosfilt(sos, pad[idx[b]:idx[b + 1]], zi=zi)
    # dedilhado em colcheias, com eco
    ded = np.zeros(n)
    k, t0, j = 0, 0.0, 0
    while t0 < dur:
        ac = acordes[k % 4]
        notas = [ac[1] * 2, ac[2] * 2, ac[3] * 2, ac[2] * 2, ac[1] * 4, ac[3] * 2, ac[2] * 2, ac[3] * 2]
        for m, f in enumerate(notas):
            ti = int((t0 + m * batida / 2) * SR)
            if ti >= n:
                break
            x = _pluck(round(f, 2), 1.1, seed + j % 3)
            j += 1
            ded[ti:ti + len(x)] += x[: n - ti] * 0.09
        t0 += compasso
        k += 1
    eco = np.zeros(n)
    atraso = int(batida * 0.75 * SR)
    eco[atraso:] += ded[:-atraso] * 0.35
    eco[2 * atraso:] += ded[:-2 * atraso] * 0.12
    # sub grave e batida suave (entram depois de 8 s)
    sub = np.zeros(n)
    kick = np.zeros(n)
    shaker = np.zeros(n)
    k, t0 = 0, 0.0
    rr = np.random.default_rng(seed)
    kd = _t(0.35)
    kick1 = np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-kd * 30)) / SR) * np.exp(-kd * 9)
    shk = _hp(rr.standard_normal(int(0.06 * SR)), 6000) * np.exp(-np.arange(int(0.06 * SR)) / SR * 70)
    marcos = sorted(marcos or [])
    while t0 < dur:
        f = acordes[k % 4][0] / 2
        i0, i1 = int(t0 * SR), min(n, int((t0 + compasso) * SR))
        tt = t[i0:i1] - t0
        sub[i0:i1] += np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / 0.05) * 0.16
        if t0 >= 8:
            for m in range(4):
                tb = t0 + m * batida
                if any(abs(tb - mk) < batida for mk in marcos):
                    continue  # respiro na troca de cena
                ib = int(tb * SR)
                if ib < n:
                    kick[ib:ib + len(kick1)] += kick1[: n - ib] * (0.32 if m % 2 == 0 else 0.0)
                    ih = int((tb + batida / 2) * SR)
                    if ih < n:
                        shaker[ih:ih + len(shk)] += shk[: n - ih] * 0.05
        t0 += compasso
        k += 1
    # "bombeamento": pad e sub abaixam um pouco em cada batida (sidechain)
    pump = np.ones(n)
    fase = (t % batida) / batida
    pump -= 0.25 * np.exp(-fase * 8) * (t >= 8)
    mono = (out_pad + sub) * pump
    est = np.stack([mono + ded * 0.9 + eco * 0.3, mono + ded * 0.6 + eco * 0.9], axis=1)
    est[:, 0] += kick + shaker * 0.7
    est[:, 1] += kick + shaker * 1.3
    molhado = reverb(est, 3.0, 5000)[:n] * 0.28
    out = est + molhado
    f = int(1.5 * SR)
    out[:f] *= np.linspace(0, 1, f)[:, None]
    g = int(2.5 * SR)
    out[-g:] *= np.linspace(1, 0, g)[:, None]
    return out / (np.abs(out).max() + 1e-9) * 0.8
