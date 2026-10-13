/**
 * Mixagem em 3 camadas, com ducking dinâmico pela envoltória da voz:
 *   1. narração (canal central, limpa e destacada);
 *   2. camas: ambiente por ato (vento, chuva, caverna, fogueira, tempestade…) + drone/pulso no BPM;
 *   3. efeitos pontuais: swoosh nas viradas de ato, batida grave nas revelações e trovão/impacto
 *      no instante exato da palavra de clímax.
 * Depois o FFmpeg normaliza (loudnorm -16 LUFS, pico -1,5 dB) e codifica em MP3.
 */
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";
import type { AudioCue, Tone } from "../lib/types.ts";
import { AMBIENTES, batida, drone, pulso, swoosh, trovao } from "./synth.ts";
import { SR, escreverWavEstereo, lerWavArquivo, reamostrar } from "./wav.ts";

export interface SegmentoAudio { ini: number; audio: Float32Array }
export interface PedidoMix {
  total: number;                                   // s
  voz: SegmentoAudio[];                            // narração posicionada
  atos: { ato1: [number, number]; cta: [number, number]; ato2: [number, number]; ato3: [number, number] };
  cues: AudioCue[];
  tom: Tone;
  bpm: number;
  climaxEm: number;                                // s — início da palavra de clímax
  /** modo teste: grava só o WAV (sem ffmpeg) */
  sem_ffmpeg?: boolean;
}

export interface Config {
  cama: number; drone: number; pulso: number; fx: number;
  duckCama: number; duckFx: number;   // quanto o volume cai (0..1) quando há voz
}
export const CONFIG: Config = { cama: 0.30, drone: 0.16, pulso: 0.12, fx: 0.55, duckCama: 0.72, duckFx: 0.45 };

/** Envoltória da voz (0 = silêncio, 1 = falando), suavizada: ataque rápido, soltura lenta. */
export function envoltoria(voz: Float32Array, atqMs = 25, relMs = 450): Float32Array {
  const jan = Math.floor(SR * 0.02), env = new Float32Array(voz.length);
  let e = 0, soma = 0;
  const aA = Math.exp(-1 / (SR * (atqMs / 1000))), aR = Math.exp(-1 / (SR * (relMs / 1000)));
  for (let i = 0; i < voz.length; i++) {
    soma += voz[i] * voz[i];
    if (i >= jan) soma -= voz[i - jan] * voz[i - jan];
    const rms = Math.sqrt(Math.max(0, soma) / jan);
    const alvo = Math.min(1, rms / 0.03);
    e = alvo > e ? alvo + (e - alvo) * aA : alvo + (e - alvo) * aR;
    env[i] = e;
  }
  return env;
}

function amostraSfx(nome: string): Float32Array | null {
  const f = join(RAIZ, "assets/sfx", `${nome}.wav`);
  return existsSync(f) ? reamostrar(lerWavArquivo(f)) : null;
}

const somar = (alvo: Float32Array, src: Float32Array, ini: number, ganho: number | ((i: number) => number)) => {
  const a = Math.floor(ini * SR);
  for (let i = 0; i < src.length; i++) {
    const k = a + i; if (k < 0 || k >= alvo.length) continue;
    alvo[k] += src[i] * (typeof ganho === "number" ? ganho : ganho(k));
  }
};

export function mixar(p: PedidoMix): { esq: Float32Array; dir: Float32Array; voz: Float32Array; fundo: Float32Array } {
  const n = Math.floor(p.total * SR);
  const voz = new Float32Array(n);
  for (const s of p.voz) somar(voz, s.audio, s.ini, 1);
  let pico = 1e-9; for (const v of voz) pico = Math.max(pico, Math.abs(v));
  const gVoz = pico > 0 ? 0.85 / pico : 1; for (let i = 0; i < n; i++) voz[i] *= gVoz;
  const env = envoltoria(voz);

  // — camas por ato (com cruzamento de 1,2 s) —
  const cama = new Float32Array(n);
  const cue = (k: number) => p.cues[Math.min(k, p.cues.length - 1)] ?? "silêncio";
  const planos: [keyof PedidoMix["atos"], AudioCue, number][] = [
    ["ato1", cue(0), 0.9], ["cta", cue(0), 0.85], ["ato2", cue(1), 1.15], ["ato3", p.tom === "epic" ? cue(1) : "silêncio", 0.8],
  ];
  planos.forEach(([ato, c, g], k) => {
    const [a, b] = p.atos[ato]; const dur = b - a + 2.4;
    const base = amostraSfx(c) ?? (AMBIENTES[c] ?? AMBIENTES.silêncio)(dur, 100 + k * 17);
    const fade = (i: number) => { const t = i / SR - (a - 1.2); return Math.min(1, Math.max(0, t / 1.2), Math.max(0, (b + 1.2 - (i / SR)) / 1.2)); };
    for (let i = 0; i < base.length; i++) {
      const kk = Math.floor((a - 1.2) * SR) + i; if (kk < 0 || kk >= n) continue;
      cama[kk] += base[i] * g * Math.min(1, Math.max(0, fade(kk)));
    }
  });
  // drone + pulso (o pulso só no ato 2, a revelação, e sobe no ato 3 final)
  const dr = drone(p.total + 1, p.tom), pu = pulso(p.total + 1, p.bpm);
  const cm = new Float32Array(n), pl = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR, a2 = p.atos.ato2;
    const intens = t < 2 ? t / 2 : t > p.total - 2.5 ? Math.max(0, (p.total - t) / 2.5) : 1;
    cm[i] = dr[i] * intens * (t >= a2[0] && t <= a2[1] ? 1.25 : 1);
    pl[i] = pu[i] * (t >= a2[0] - 0.5 && t <= a2[1] + 0.5 ? 1 : 0.25) * intens;
  }

  // — efeitos pontuais —
  const fx = new Float32Array(n), fxForte = new Float32Array(n);
  const sw = amostraSfx("swoosh") ?? swoosh(1.2, 3), bo = amostraSfx("batida") ?? batida(2.6);
  const impacto = p.cues.some((c) => c === "trovão" || c === "tempestade") ? (amostraSfx("trovao") ?? trovao(4.6, 5)) : bo;
  somar(fx, sw, p.atos.cta[0] - 0.9, 0.6);
  somar(fx, sw, p.atos.ato2[0] - 1.0, 0.8);
  somar(fx, bo, p.atos.ato2[0], 0.85);
  somar(fx, sw, p.atos.ato3[0] - 0.9, 0.6);
  somar(fxForte, impacto, p.climaxEm - 0.04, 1.0); // o estalo bate no começo da palavra de clímax

  const esq = new Float32Array(n), dir = new Float32Array(n), fundo = new Float32Array(n); // fundo = tudo menos a voz (para medir/depurar)
  for (let i = 0; i < n; i++) {
    const d = env[i];
    const vcama = CONFIG.cama * (1 - CONFIG.duckCama * d);
    const vfx = CONFIG.fx * (1 - CONFIG.duckFx * d);
    const vfxForte = CONFIG.fx * 1.15 * (1 - 0.2 * d);        // o clímax duck só 20%: precisa ser sentido
    fundo[i] = cama[i] * vcama + cm[i] * CONFIG.drone * (1 - 0.6 * d) + pl[i] * CONFIG.pulso * (1 - 0.8 * d)
      + fx[i] * vfx + fxForte[i] * vfxForte;
    const m = voz[i] + fundo[i];
    const largura = (cama[i] * vcama) * 0.12;                 // abre um pouco o estéreo nas camas
    esq[i] = Math.tanh(m + largura); dir[i] = Math.tanh(m - largura);
  }
  return { esq, dir, voz, fundo };
}

export function temFfmpeg(): boolean { return spawnSync("ffmpeg", ["-version"]).status === 0; }

/** Grava o mix: WAV bruto → (ffmpeg) loudnorm -16 LUFS + MP3. Devolve o caminho final. */
export function gravarMix(esq: Float32Array, dir: Float32Array, destinoSemExt: string): string {
  const wav = destinoSemExt + ".wav";
  escreverWavEstereo(wav, esq, dir);
  if (!temFfmpeg()) { console.warn("⚠ ffmpeg não encontrado: usando o WAV sem normalização."); return wav; }
  const mp3 = destinoSemExt + ".mp3";
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", "44100", "-c:a", "libmp3lame", "-q:a", "2", mp3]);
  if (r.status !== 0) { console.warn("⚠ ffmpeg falhou:", r.stderr?.toString().slice(0, 200)); return wav; }
  rmSync(wav, { force: true });
  return mp3;
}
