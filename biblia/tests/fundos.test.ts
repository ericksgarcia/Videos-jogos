import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { avaliar, dhash, hamming, promptNovo } from "../src/pipeline/fundos.ts";
import { prng } from "../src/pipeline/engine.ts";

const dir = mkdtempSync(join(tmpdir(), "fundos-"));
const img = (nome: string, filtro: string) => {
  const f = join(dir, nome);
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", filtro, "-frames:v", "1", f]);
  return f;
};

test("impressão digital: mesma imagem = 0; recorte leve ≈ igual; imagens diferentes ficam longe", () => {
  const a = img("a.png", "mandelbrot=s=768x1344");
  const b = img("b.png", "testsrc2=s=768x1344");
  const aCorte = join(dir, "a2.png");
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", a, "-vf", "crop=740:1300:10:20", aCorte]);
  assert.equal(hamming(dhash(a), dhash(a)), 0);
  assert.ok(hamming(dhash(a), dhash(aCorte)) < 10);
  assert.ok(hamming(dhash(a), dhash(b)) >= 10);
});

test("qualidade: recusa imagem lisa e imagem com metade de baixo preta", () => {
  const lisa = img("lisa.png", "color=c=0x406080:s=768x1344");
  const metade = img("metade.png", "color=c=black:s=768x1344,drawbox=x=0:y=0:w=768:h=600:color=0x80a0c0:t=fill,noise=alls=60:allf=u");
  assert.equal(avaliar(lisa).ok, false);
  assert.equal(avaliar(metade).ok, false);
});

test("prompts não se repetem", () => {
  const usados = new Set<string>(), rand = prng(5);
  for (let i = 0; i < 60; i++) { const p = promptNovo("ato2", rand, usados); assert.ok(!usados.has(p)); usados.add(p); }
});
