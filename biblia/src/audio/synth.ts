/**
 * Síntese procedural de ambientes e efeitos (sem depender de bibliotecas de samples).
 * Tudo mono a SR=44100, determinístico por semente. Se existir assets/sfx/<nome>.wav,
 * o mixer usa o arquivo no lugar do sintetizado (veja mix.ts) — dá para trocar por samples reais.
 */
import { SR } from "./wav.ts";
import { prng } from "../pipeline/engine.ts";

const N = (seg: number) => Math.max(1, Math.floor(seg * SR));

class Biquad {
  private b0 = 1; private b1 = 0; private b2 = 0; private a1 = 0; private a2 = 0;
  private x1 = 0; private x2 = 0; private y1 = 0; private y2 = 0;
  static tipo(tipo: "lp" | "hp" | "bp", f: number, q = 0.707): Biquad {
    const o = new Biquad();
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q);
    let b0: number, b1: number, b2: number;
    if (tipo === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
    else if (tipo === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
    else { b0 = al; b1 = 0; b2 = -al; }
    const a0 = 1 + al;
    o.b0 = b0 / a0; o.b1 = b1 / a0; o.b2 = b2 / a0; o.a1 = (-2 * c) / a0; o.a2 = (1 - al) / a0;
    return o;
  }
  p(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}
const filtrar = (x: Float32Array, tipo: "lp" | "hp" | "bp", f: number, q?: number) => {
  const b = Biquad.tipo(tipo, f, q); const o = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) o[i] = b.p(x[i]);
  return o;
};

export function ruido(seg: number, seed: number, cor: "branco" | "rosa" | "marrom" = "branco"): Float32Array {
  const r = prng(seed), o = new Float32Array(N(seg));
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, m = 0;
  for (let i = 0; i < o.length; i++) {
    const w = r() * 2 - 1;
    if (cor === "branco") o[i] = w;
    else if (cor === "rosa") { // Paul Kellet
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      o[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    } else { m = (m + 0.02 * w) / 1.02; o[i] = m * 3.5; }
  }
  return o;
}

const lfo = (hz: number, fase = 0) => (i: number) => Math.sin((2 * Math.PI * hz * i) / SR + fase);
const normalizar = (x: Float32Array, pico = 0.9) => {
  let m = 1e-9; for (const v of x) m = Math.max(m, Math.abs(v));
  const g = pico / m; for (let i = 0; i < x.length; i++) x[i] *= g; return x;
};
/** Eco/reverb simples (comb com realimentação) — "tamanho" de caverna. */
export function eco(x: Float32Array, ms: number, fb: number, mix: number, rep = 3): Float32Array {
  const o = Float32Array.from(x);
  for (let k = 1; k <= rep; k++) {
    const d = N((ms * k) / 1000);
    for (let i = d; i < o.length; i++) o[i] += x[i - d] * mix * fb ** k;
  }
  return o;
}
export function reverb(x: Float32Array, cauda = 1.8, mix = 0.35): Float32Array {
  const atrasos = [0.0297, 0.0371, 0.0411, 0.0437], o = new Float32Array(x.length + N(cauda));
  o.set(x);
  for (const a of atrasos) {
    const d = N(a), g = 0.001 ** (a / cauda);
    const buf = new Float32Array(o.length);
    for (let i = 0; i < o.length; i++) buf[i] = (i < x.length ? x[i] : 0) + (i >= d ? buf[i - d] * g : 0);
    for (let i = 0; i < o.length; i++) o[i] += buf[i] * mix * 0.35;
  }
  return o;
}

// ───────────────────────────── ambientes (contínuos, duração livre) ─────────────────────────────
export type Ambiente = (seg: number, seed: number) => Float32Array;

export const AMBIENTES: Record<string, Ambiente> = {
  vento(seg, seed) {
    const r = ruido(seg, seed, "marrom"), a = filtrar(r, "bp", 420, 0.9), b = filtrar(r, "bp", 900, 1.4);
    const l1 = lfo(0.11), l2 = lfo(0.23, 1.3), o = new Float32Array(a.length);
    for (let i = 0; i < o.length; i++) o[i] = a[i] * (0.6 + 0.4 * l1(i)) + b[i] * (0.25 + 0.25 * l2(i));
    return normalizar(o, 0.7);
  },
  deserto(seg, seed) { // vento seco, mais agudo e rasteiro
    const r = ruido(seg, seed, "rosa"), a = filtrar(r, "bp", 1500, 0.7), l = lfo(0.07, 2);
    const o = a.map((v, i) => v * (0.45 + 0.55 * (0.5 + 0.5 * l(i)) ** 2));
    return normalizar(o, 0.6);
  },
  montanha(seg, seed) { return AMBIENTES.vento(seg, seed + 11).map((v) => v * 0.9); },
  chuva(seg, seed) {
    const base = filtrar(ruido(seg, seed, "rosa"), "hp", 1400), gotas = new Float32Array(base.length), r = prng(seed + 3);
    for (let k = 0; k < seg * 60; k++) {
      const p = Math.floor(r() * (gotas.length - 400)), g = 0.2 + r() * 0.6;
      for (let j = 0; j < 400; j++) gotas[p + j] += (r() * 2 - 1) * g * Math.exp(-j / 40);
    }
    const o = new Float32Array(base.length), l = lfo(0.09);
    for (let i = 0; i < o.length; i++) o[i] = base[i] * (0.8 + 0.2 * l(i)) + filtrar(gotas.subarray(i, i + 1), "hp", 2500)[0] * 0;
    for (let i = 0; i < o.length; i++) o[i] += gotas[i] * 0.35;
    return normalizar(o, 0.7);
  },
  fogueira(seg, seed) { // chiado baixo + estalos aleatórios
    const rumor = filtrar(ruido(seg, seed, "marrom"), "lp", 300), o = new Float32Array(rumor.length), r = prng(seed + 5);
    for (let i = 0; i < o.length; i++) o[i] = rumor[i] * 0.35;
    const chiado = filtrar(ruido(seg, seed + 1, "branco"), "bp", 3200, 0.8);
    for (let i = 0; i < o.length; i++) o[i] += chiado[i] * 0.05 * (0.5 + 0.5 * Math.sin(i / 1500 + r() * 0.01));
    for (let k = 0; k < seg * 9; k++) {
      const p = Math.floor(r() * (o.length - 3000)), g = 0.25 + r() * 0.75, tau = 60 + r() * 220;
      for (let j = 0; j < 2500; j++) o[p + j] += (r() * 2 - 1) * g * Math.exp(-j / tau) * (j < 6 ? 1.5 : 1);
    }
    return normalizar(o, 0.8);
  },
  caverna(seg, seed) { // drone grave + pingos com eco longo
    const rumor = filtrar(ruido(seg, seed, "marrom"), "lp", 160), o = new Float32Array(rumor.length), r = prng(seed + 7);
    for (let i = 0; i < o.length; i++) o[i] = rumor[i] * 0.8;
    const gotas = new Float32Array(o.length);
    for (let k = 0; k < seg / 2.2; k++) {
      const p = Math.floor(r() * (o.length - 6000)), f = 900 + r() * 700, g = 0.3 + r() * 0.4;
      for (let j = 0; j < 5000; j++) gotas[p + j] += Math.sin((2 * Math.PI * f * j) / SR) * Math.exp(-j / 450) * g;
    }
    const eg = eco(gotas, 380, 0.6, 0.7, 5);
    for (let i = 0; i < o.length; i++) o[i] += eg[i] * 0.5;
    return normalizar(o, 0.7);
  },
  mar(seg, seed) {
    const r = filtrar(ruido(seg, seed, "rosa"), "lp", 900), l = lfo(0.08), o = r.map((v, i) => v * (0.35 + 0.65 * (0.5 + 0.5 * l(i)) ** 2));
    return normalizar(o, 0.7);
  },
  noite(seg, seed) { // ar parado + grilos longínquos
    const ar = filtrar(ruido(seg, seed, "rosa"), "lp", 500), o = ar.map((v) => v * 0.25), l = lfo(0.2);
    for (let i = 0; i < o.length; i++) {
      const pulso = Math.max(0, Math.sin((2 * Math.PI * 7.3 * i) / SR)) ** 4 * (0.5 + 0.5 * l(i));
      o[i] += Math.sin((2 * Math.PI * 4300 * i) / SR) * pulso * 0.03;
    }
    return normalizar(o, 0.5);
  },
  multidão(seg, seed) { // murmúrio distante
    const r = filtrar(ruido(seg, seed, "rosa"), "bp", 600, 0.6), l = lfo(0.31);
    return normalizar(r.map((v, i) => v * (0.7 + 0.3 * l(i))), 0.55);
  },
  batalha(seg, seed) { // trovejar surdo + metal distante
    const o = filtrar(ruido(seg, seed, "marrom"), "lp", 220), r = prng(seed + 9);
    for (let k = 0; k < seg / 1.6; k++) {
      const p = Math.floor(r() * (o.length - 8000)), f = 1800 + r() * 1800;
      for (let j = 0; j < 7000; j++) o[p + j] += Math.sin((2 * Math.PI * f * j) / SR) * Math.exp(-j / 700) * 0.06 * r();
    }
    return normalizar(o, 0.7);
  },
  silêncio(seg, seed) { return normalizar(filtrar(ruido(seg, seed, "rosa"), "lp", 250), 0.15); },
  tempestade(seg, seed) {
    const c = AMBIENTES.chuva(seg, seed), v = AMBIENTES.vento(seg, seed + 2), o = new Float32Array(c.length);
    for (let i = 0; i < o.length; i++) o[i] = c[i] * 0.75 + v[i] * 0.55;
    return normalizar(o, 0.8);
  },
};
AMBIENTES.trovão = AMBIENTES.tempestade;
AMBIENTES.fogo = AMBIENTES.fogueira;

/** Drone/pad da trilha: quinta justa grave + terça (menor = épico, maior suave = conforto). */
export function drone(seg: number, tom: "epic" | "comfort"): Float32Array {
  const base = tom === "epic" ? 55 : 65.4; // A1 / C2
  const notas = tom === "epic" ? [1, 1.5, 2, 2.378] : [1, 1.5, 2, 2.52];
  const o = new Float32Array(N(seg));
  notas.forEach((m, k) => {
    const f = base * m, l = lfo(0.05 + k * 0.017, k);
    for (let i = 0; i < o.length; i++) {
      const t = i / SR, v = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.003 * t);
      o[i] += v * (0.5 + 0.5 * l(i)) * (k === 0 ? 0.5 : 0.22);
    }
  });
  const f = filtrar(o, "lp", tom === "epic" ? 420 : 320);
  return normalizar(f, 0.8);
}

/** Pulso grave no tempo do BPM (sincroniza com os cortes visuais). */
export function pulso(seg: number, bpm: number, forca = 1): Float32Array {
  const o = new Float32Array(N(seg)), passo = (60 / bpm) * SR;
  for (let k = 0; k * passo < o.length; k++) {
    const p = Math.floor(k * passo), acento = k % 4 === 0 ? 1 : 0.55;
    for (let j = 0; j < N(0.35) && p + j < o.length; j++) {
      const t = j / SR;
      o[p + j] += Math.sin(2 * Math.PI * (48 + 40 * Math.exp(-t * 30)) * t) * Math.exp(-t * 11) * acento * forca;
    }
  }
  return o;
}

// ───────────────────────────── efeitos pontuais ─────────────────────────────
export function swoosh(seg = 1.1, seed = 1): Float32Array {
  const r = ruido(seg, seed, "rosa"), o = new Float32Array(r.length), b = Biquad.tipo("bp", 400, 1.2);
  for (let i = 0; i < o.length; i++) {
    const u = i / o.length, env = Math.sin(Math.PI * u) ** 2.2;
    // varre a frequência central de 400 → 2800 Hz (reaplica o filtro por janelas)
    if (i % 256 === 0) Object.assign(b, Biquad.tipo("bp", 400 + 2400 * u ** 1.5, 1.1));
    o[i] = b.p(r[i]) * env;
  }
  return normalizar(o, 0.7);
}

export function batida(seg = 2.4): Float32Array { // "boom" de revelação
  const o = new Float32Array(N(seg)), r = prng(4);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR, f = 38 + 70 * Math.exp(-t * 9);
    o[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.2) + (r() * 2 - 1) * 0.35 * Math.exp(-t * 28);
  }
  return reverb(normalizar(o, 0.95), 1.4, 0.4).subarray(0, o.length);
}

export function trovao(seg = 4.5, seed = 2): Float32Array {
  const n = N(seg), o = new Float32Array(n), r = prng(seed);
  const estalo = filtrar(ruido(0.5, seed, "branco"), "hp", 800);
  for (let i = 0; i < estalo.length && i < n; i++) o[i] += estalo[i] * Math.exp(-i / (SR * 0.06)) * 1.0; // crack inicial
  const rumor = filtrar(ruido(seg, seed + 1, "marrom"), "lp", 260);
  const picos = [0, 0.35, 0.9, 1.5, 2.3].map((t) => t + r() * 0.15);
  for (let i = 0; i < n; i++) {
    const t = i / SR; let env = 0;
    for (const p of picos) if (t >= p) env += Math.exp(-(t - p) / (0.9 + p * 0.4)) * (1 - p / 4);
    o[i] += rumor[i] * 3.2 * Math.min(1, env) * (1 - Math.exp(-t * 40));
  }
  return reverb(normalizar(o, 0.95), 2.2, 0.3).subarray(0, n);
}

/** Swoosh que ACELERA: o filtro sobe de 250 Hz a 4 kHz e o volume cresce até o fim (termina seco, no impacto). */
export function voo(seg = 0.62, seed = 1): Float32Array {
  const r = ruido(seg, seed, "rosa"), o = new Float32Array(r.length), b = Biquad.tipo("bp", 250, 1.4);
  for (let i = 0; i < o.length; i++) {
    const u = i / o.length, env = u ** 2.4;
    if (i % 192 === 0) Object.assign(b, Biquad.tipo("bp", 250 + 3750 * u ** 2.2, 1.3));
    o[i] = b.p(r[i]) * env;
  }
  return normalizar(o, 0.8);
}

/** Estalo de cera: crack agudo curto + baque grave + estilhaços e eco curto. */
export function estalo(seed = 1): Float32Array {
  const n = N(0.7), o = new Float32Array(n), r = prng(seed + 300);
  const crack = filtrar(ruido(0.2, seed, "branco"), "hp", 1800);
  for (let i = 0; i < crack.length; i++) o[i] += crack[i] * Math.exp(-i / (SR * 0.022)) * 0.9;
  for (let i = 0; i < n; i++) { const t = i / SR; o[i] += Math.sin(2 * Math.PI * (120 * Math.exp(-t * 22) + 48) * t) * Math.exp(-t * 14) * 1.0; }
  for (let k = 0; k < 7; k++) { const t0 = Math.floor((0.03 + r() * 0.3) * SR), g = 0.15 + r() * 0.25; for (let j = 0; j < SR * 0.012 && t0 + j < n; j++) o[t0 + j] += (r() * 2 - 1) * g * Math.exp(-j / (SR * 0.004)); }
  return reverb(normalizar(o, 0.95), 0.7, 0.18).subarray(0, n);
}
