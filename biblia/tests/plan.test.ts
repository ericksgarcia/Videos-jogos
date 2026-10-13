import { test } from "node:test";
import assert from "node:assert/strict";
import { cortesNoRitmo, montarLinha } from "../src/pipeline/plan.ts";
import type { Fala } from "../src/pipeline/tts.ts";

const fala = (dur: number): Fala => ({ audio: new Float32Array(0), dur, palavras: [], taxa: 0.9 });

test("atos começam nas marcas 12/16/35 s, alinhados às batidas, e o vídeo fica em 45-58 s", () => {
  const bpm = 72, b = 60 / bpm;
  const l = montarLinha({ ato1: fala(11), cta: fala(3.5), ato2: fala(17), ato3: fala(19) }, bpm);
  for (const [k, ref] of [["cta", 12], ["ato2", 16], ["ato3", 35]] as const) {
    const t = l.ini[k];
    assert.ok(t >= ref && t < ref + 2 * b, `${k} em ${t}`);
    assert.ok(Math.abs(t / b - Math.round(t / b)) < 1e-6, `${k} fora da batida`);
  }
  assert.ok(l.total >= 45 && l.total <= 58, String(l.total));
});

test("fala longa empurra os atos seguintes e gera aviso quando passa de 58 s", () => {
  const l = montarLinha({ ato1: fala(11), cta: fala(4), ato2: fala(24), ato3: fala(22) }, 60);
  assert.ok(l.ini.ato3 > 35);
  assert.ok(l.avisos.some((a) => /58/.test(a)));
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
