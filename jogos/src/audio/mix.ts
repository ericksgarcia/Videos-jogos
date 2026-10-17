import { writeFileSync } from "node:fs";
import { ambiente, buf, reverb, SR, somar, sons, type Buf } from "./sintese";

export type EventoSom = { t: number; som: "tique" | "tiqueAlto" | "pop" | "whoosh" | "whooshDesce" | "tempo" | "acerto" | "brilho"; ganho?: number };

export function mixar(eventos: EventoSom[], dur: number): Buf {
  const sfx = buf(dur + 1.5);
  for (const e of eventos) {
    const s =
      e.som === "tique" ? sons.tique() : e.som === "tiqueAlto" ? sons.tique(true) : e.som === "pop" ? sons.pop() :
      e.som === "whoosh" ? sons.whoosh() : e.som === "whooshDesce" ? sons.whoosh(0.6, false) :
      e.som === "tempo" ? sons.tempo() : e.som === "acerto" ? sons.acerto() : sons.brilho();
    somar(sfx, s, e.t, e.ganho ?? 1);
  }
  const molhado = reverb(sfx, 0.22);
  const amb = ambiente(dur);
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) out[i] = amb[i] + molhado[i] * 0.9;
  // limitador suave + normalização de pico
  let pico = 0;
  for (let i = 0; i < out.length; i++) { out[i] = Math.tanh(out[i] * 1.3); pico = Math.max(pico, Math.abs(out[i])); }
  const g = 0.89 / (pico || 1);
  for (let i = 0; i < out.length; i++) out[i] *= g;
  // a cauda do último efeito fecha no começo: soma o que passou do fim de volta ao início (loop sem corte)
  for (let i = out.length; i < molhado.length; i++) out[i - out.length] += molhado[i] * 0.9 * g;
  return out;
}

export function escreverWav(caminho: string, x: Buf) {
  const n = x.length, d = Buffer.alloc(44 + n * 2);
  d.write("RIFF", 0); d.writeUInt32LE(36 + n * 2, 4); d.write("WAVEfmt ", 8);
  d.writeUInt32LE(16, 16); d.writeUInt16LE(1, 20); d.writeUInt16LE(1, 22);
  d.writeUInt32LE(SR, 24); d.writeUInt32LE(SR * 2, 28); d.writeUInt16LE(2, 32); d.writeUInt16LE(16, 34);
  d.write("data", 36); d.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) d.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), 44 + i * 2);
  writeFileSync(caminho, d);
}
