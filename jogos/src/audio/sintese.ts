// Efeitos sonoros e ambiente SINTETIZADOS por código (sem arquivos externos).
import { prng } from "../nucleo/prng";

export const SR = 44100;
export type Buf = Float32Array;
export const buf = (seg: number): Buf => new Float32Array(Math.ceil(seg * SR));

const env = (i: number, n: number, ataque: number, decai: number) => {
  const t = i / SR;
  return Math.min(1, t / ataque) * Math.exp(-t * decai) * (i > n - 64 ? (n - i) / 64 : 1);
};

function somar(dst: Buf, src: Buf, t0: number, ganho = 1) {
  const o = Math.round(t0 * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * ganho;
}

export const sons = {
  /** Tique-tac do relógio: estalo curto + tom de madeira. */
  tique(alto = false): Buf {
    const n = Math.floor(0.09 * SR), b = new Float32Array(n), r = prng(alto ? 11 : 7);
    const f = alto ? 1500 : 1100;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      b[i] = (Math.sin(2 * Math.PI * f * t) * 0.7 + (r() * 2 - 1) * 0.35 * Math.exp(-t * 400)) * Math.exp(-t * 55);
    }
    return b;
  },
  pop(f0 = 700): Buf {
    const n = Math.floor(0.14 * SR), b = new Float32Array(n);
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ph += (2 * Math.PI * (f0 * Math.exp(-t * 14) + 180)) / SR;
      b[i] = Math.sin(ph) * Math.exp(-t * 28);
    }
    return b;
  },
  whoosh(dur = 0.6, sobe = true): Buf {
    const n = Math.floor(dur * SR), b = new Float32Array(n), r = prng(31);
    let y = 0, y2 = 0;
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const corte = 0.02 + 0.5 * Math.sin(Math.PI * (sobe ? k : 1 - k)) ** 2;
      y += corte * ((r() * 2 - 1) - y);
      y2 += corte * (y - y2);
      b[i] = y2 * 2.2 * Math.sin(Math.PI * k);
    }
    return b;
  },
  /** "Tempo!": zumbido grave + pancada. */
  tempo(): Buf {
    const n = Math.floor(0.7 * SR), b = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const serra = 2 * ((110 * t) % 1) - 1;
      b[i] = (serra * 0.35 + Math.sin(2 * Math.PI * 55 * t * (1 - t * 0.3)) * 0.9) * env(i, n, 0.004, 4.5);
    }
    return b;
  },
  /** Acerto: arpejo brilhante subindo. */
  acerto(): Buf {
    const notas = [523.25, 659.25, 783.99, 1046.5], b = buf(1.4);
    notas.forEach((f, k) => {
      const n = Math.floor(0.9 * SR), s = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        s[i] = (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(4 * Math.PI * f * t) + 0.15 * Math.sin(6 * Math.PI * f * t)) * env(i, n, 0.004, 4);
      }
      somar(b, s, k * 0.07, 0.35);
    });
    return b;
  },
  brilho(): Buf {
    const n = Math.floor(0.5 * SR), b = new Float32Array(n), r = prng(5);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      b[i] = (Math.sin(2 * Math.PI * 2637 * t) * 0.5 + Math.sin(2 * Math.PI * 3951 * t) * 0.3) * env(i, n, 0.002, 9) * (0.6 + 0.4 * r());
    }
    return b;
  },
};

/** Reverb simples (pentes em paralelo) só para dar espaço aos efeitos. */
export function reverb(x: Buf, mix = 0.25): Buf {
  const atrasos = [0.0297, 0.0371, 0.0411, 0.0437].map((s) => Math.round(s * SR));
  const y = new Float32Array(x.length);
  for (const d of atrasos) {
    const lin = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) lin[i] = x[i] + (i >= d ? lin[i - d] * 0.72 : 0);
    for (let i = 0; i < x.length; i++) y[i] += lin[i] / atrasos.length;
  }
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i] * (1 - mix * 0.5) + y[i] * mix;
  return out;
}

/**
 * Ambiente: acorde suave + pulso grave. Todas as frequências são múltiplos de 1/dur,
 * então o trecho fecha em loop sem estalo.
 */
export function ambiente(dur: number): Buf {
  const b = buf(dur), f = (hz: number) => Math.round(hz * dur) / dur;
  const acorde = [f(110), f(164.8), f(220), f(261.6), f(329.6)];
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    let v = 0;
    acorde.forEach((hz, k) => (v += Math.sin(2 * Math.PI * hz * t + k) * (0.5 - k * 0.07) * (0.7 + 0.3 * Math.sin(2 * Math.PI * (k + 1) * t / dur * 2))));
    const pulso = Math.pow(Math.max(0, Math.sin(2 * Math.PI * 2 * t)), 8); // 2 Hz → 40 pulsos
    v += Math.sin(2 * Math.PI * f(55) * t) * pulso * 0.9;
    b[i] = v * 0.05;
  }
  return b;
}

export { somar };
