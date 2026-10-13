import { readFileSync, writeFileSync } from "node:fs";

export const SR = 44100;

export interface Pcm { sr: number; data: Float32Array } // mono

/** Lê WAV PCM 16 bits (mono ou estéreo) e devolve mono. */
export function lerWav(buf: Buffer): Pcm {
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new Error("não é WAV");
  let pos = 12, sr = SR, canais = 1, bits = 16, ini = -1, tam = 0;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4);
    let n = buf.readUInt32LE(pos + 4);
    if (id === "fmt ") { canais = buf.readUInt16LE(pos + 10); sr = buf.readUInt32LE(pos + 12); bits = buf.readUInt16LE(pos + 22); }
    if (id === "data") { ini = pos + 8; if (n === 0 || ini + n > buf.length) n = buf.length - ini; tam = n; break; }
    pos += 8 + n + (n & 1);
  }
  if (ini < 0 || bits !== 16) throw new Error("WAV 16 bits sem dados");
  const quadros = Math.floor(tam / (2 * canais));
  const out = new Float32Array(quadros);
  for (let i = 0; i < quadros; i++) {
    let soma = 0;
    for (let c = 0; c < canais; c++) soma += buf.readInt16LE(ini + (i * canais + c) * 2);
    out[i] = soma / canais / 32768;
  }
  return { sr, data: out };
}

export const lerWavArquivo = (p: string) => lerWav(readFileSync(p));

/** Reamostragem linear simples (a narração vem a 24/44,1 kHz; o mix roda a SR). */
export function reamostrar(p: Pcm, para = SR): Float32Array {
  if (p.sr === para) return p.data;
  const n = Math.floor((p.data.length * para) / p.sr);
  const out = new Float32Array(n);
  const k = p.sr / para;
  for (let i = 0; i < n; i++) {
    const x = i * k, i0 = Math.floor(x), f = x - i0;
    out[i] = p.data[i0] * (1 - f) + (p.data[Math.min(i0 + 1, p.data.length - 1)] ?? 0) * f;
  }
  return out;
}

export function escreverWavEstereo(path: string, esq: Float32Array, dir: Float32Array, sr = SR) {
  const n = Math.min(esq.length, dir.length);
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
  const q = (v: number) => Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
  for (let i = 0; i < n; i++) { buf.writeInt16LE(q(esq[i]), 44 + i * 4); buf.writeInt16LE(q(dir[i]), 46 + i * 4); }
  writeFileSync(path, buf);
}

export function escreverWavMono(path: string, data: Float32Array, sr = SR) {
  escreverWavEstereo(path, data, data, sr);
}
