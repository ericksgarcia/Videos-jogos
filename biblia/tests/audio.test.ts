import { test } from "node:test";
import assert from "node:assert/strict";
import { SR } from "../src/audio/wav.ts";
import { envoltoria, mixar } from "../src/audio/mix.ts";

const rms = (x: Float32Array, a: number, b: number) => {
  let s = 0; const i0 = Math.floor(a * SR), i1 = Math.floor(b * SR);
  for (let i = i0; i < i1; i++) s += x[i] * x[i];
  return Math.sqrt(s / (i1 - i0));
};
const voz = (ini: number, fim: number) => {
  const o = new Float32Array(Math.floor((fim - ini) * SR));
  for (let i = 0; i < o.length; i++) o[i] = 0.4 * Math.sin((2 * Math.PI * 150 * i) / SR);
  return { ini, audio: o };
};
const base = {
  total: 20, atos: { ato1: [0, 8], cta: [8, 10], ato2: [10, 16], ato3: [16, 20] } as any,
  cues: ["vento", "trovão"] as any, tom: "epic" as const, bpm: 72, climaxEm: 12,
};

test("envoltória: ~1 com voz, ~0 no silêncio", () => {
  const v = new Float32Array(SR * 3); v.set(voz(0, 1).audio, 0);
  const e = envoltoria(v);
  assert.ok(e[Math.floor(0.5 * SR)] > 0.9);
  assert.ok(e[Math.floor(2.9 * SR)] < 0.05);
});

test("ducking: camas e efeitos ficam mais baixos enquanto a voz fala", () => {
  const r = mixar({ ...base, voz: [voz(2, 6)] });
  const falando = rms(r.fundo, 3, 5.5), calado = rms(r.fundo, 7.2, 7.9);
  assert.ok(falando < calado * 0.8, `fundo em fala ${falando.toFixed(4)} deveria ser < ${(calado * 0.8).toFixed(4)}`);
});

test("trovão do clímax entra no instante da palavra e a mixagem não estoura", () => {
  const r = mixar({ ...base, voz: [voz(2, 6), voz(10.5, 14)] });
  const semImpacto = mixar({ ...base, climaxEm: 30, voz: [voz(2, 6), voz(10.5, 14)] });
  const antes = rms(r.fundo, 11.6, 11.95), igual = rms(semImpacto.fundo, 11.6, 11.95);
  const depois = rms(r.fundo, 12.0, 12.3), base2 = rms(semImpacto.fundo, 12.0, 12.3);
  assert.ok(Math.abs(antes - igual) / igual < 0.05, "o impacto não pode começar antes da palavra");
  assert.ok(depois > base2 * 1.3, `impacto ausente: ${depois.toFixed(4)} vs ${base2.toFixed(4)}`);
  for (const x of r.esq) assert.ok(Math.abs(x) <= 1);
  assert.equal(r.esq.length, base.total * SR);
});
