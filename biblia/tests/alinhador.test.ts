import { test } from "node:test";
import assert from "node:assert/strict";
import { caracteristicas, dtw } from "../src/audio/alinhador.ts";
import { prng } from "../src/pipeline/engine.ts";

/** "Fala" sintética: sequência de vogais (formantes diferentes) com silêncios. */
function sinal(duracoes: number[], fs = 16000) {
  const formantes = [[700, 1200], [300, 2300], [500, 900], [400, 1900], [650, 1700]];
  const r = prng(4), partes: number[] = [];
  duracoes.forEach((d, k) => {
    const [f1, f2] = formantes[k % formantes.length];
    for (let i = 0; i < d * fs; i++) partes.push(k % 2 ? (r() - 0.5) * 0.002 : 0.3 * Math.sin((2 * Math.PI * f1 * i) / fs) + 0.2 * Math.sin((2 * Math.PI * f2 * i) / fs) + (r() - 0.5) * 0.01);
  });
  return Float32Array.from(partes);
}

test("DTW leva fronteiras de um ritmo para outro (mesmo conteúdo, velocidade diferente)", () => {
  const a = [0.3, 0.1, 0.4, 0.15, 0.3, 0.1, 0.35], b = a.map((d, i) => d * (i % 2 ? 2.2 : 1.4)); // pausas e sons esticados
  const A = caracteristicas(sinal(a)), B = caracteristicas(sinal(b));
  const mapa = dtw(A.f, B.f);
  let ta = 0, tb = 0;
  for (let k = 0; k < a.length - 1; k++) {
    ta += a[k]; tb += b[k];
    const previsto = mapa[Math.round(ta * 100)] / 100;
    assert.ok(Math.abs(previsto - tb) < 0.06, `fronteira ${k}: previsto ${previsto.toFixed(3)} vs ${tb.toFixed(3)}`);
  }
});
