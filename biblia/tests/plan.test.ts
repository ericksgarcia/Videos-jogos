import { test } from "node:test";
import assert from "node:assert/strict";
import { cortesNoRitmo, montarLinha } from "../src/pipeline/plan.ts";
import type { Fala } from "../src/pipeline/tts.ts";

const fala = (dur: number): Fala => ({ audio: new Float32Array(0), dur, palavras: [], taxa: 0.9 });

test("atos entram logo após o anterior, alinhados às batidas, e o vídeo fica em 15-30 s", () => {
  const bpm = 72, b = 60 / bpm;
  const l = montarLinha({ ato1: fala(7), cta: fala(3.5), ato2: fala(5), ato3: fala(9.5) }, bpm);
  for (const k of ["cta", "ato2", "ato3"] as const) {
    const t = l.ini[k];
    assert.ok(Math.abs(t / b - Math.round(t / b)) < 1e-6, `${k} fora da batida`);
  }
  assert.ok(l.ini.cta < 9.5 && l.ini.ato2 < 14 && l.ini.ato3 < 20.5, JSON.stringify(l.ini));
  assert.ok(l.total >= 15 && l.total <= 30, String(l.total));
});

test("fala longa empurra os atos seguintes e gera aviso quando passa de 30 s", () => {
  const l = montarLinha({ ato1: fala(9), cta: fala(4.5), ato2: fala(10), ato3: fala(12) }, 60);
  assert.ok(l.ini.ato3 > 22);
  assert.ok(l.avisos.some((a) => /30/.test(a)));
});

test("cortes caem em múltiplos de compasso (4 batidas)", () => {
  const bpm = 72, compasso = (60 / bpm) * 4;
  const cortes = cortesNoRitmo(16.7, 36.7, bpm);
  assert.ok(cortes.length >= 2);
  for (const c of cortes) assert.ok(Math.abs(c / compasso - Math.round(c / compasso)) < 1e-6);
});

test("bitrate final calculado para o arquivo caber em 28 MB", async () => {
  const { bitrateKbps } = await import("../src/pipeline/encode.ts");
  const kbps = bitrateKbps(57, 28);
  assert.ok(((kbps + 160) * 57) / 8 / 1024 <= 28, `${kbps} kbps estoura 28 MB`);
  assert.ok(kbps > 2500, "bitrate baixo demais para 1080x1920");
});
