import { test } from "node:test";
import assert from "node:assert/strict";
import { montarBlocos, MAX_CARS } from "../src/lib/blocos.ts";
import type { SegmentoPlano } from "../src/lib/plan.ts";

const seg = (id: SegmentoPlano["id"], texto: string, t0: number): SegmentoPlano => {
  const ws = texto.split(" ");
  return { id, ini: t0, fim: t0 + ws.length * 0.4 + 1, palavras: ws.map((t, i) => ({ t, ini: t0 + i * 0.4, fim: t0 + i * 0.4 + 0.35 })) };
};

test("blocos de no máximo 2 linhas que cabem na largura, sem perder palavras, em ordem", () => {
  const segs = [
    seg("ato1", "Se este vídeo chegou até você, não foi por acaso. Segundo a tradição, Moisés escreve isto no deserto, com uma praga atravessando o acampamento.", 0),
    seg("ato2", "Não temerás espanto noturno, nem seta que voe de dia, nem peste que ande na escuridão. Mil cairão ao teu lado, e dez mil, à tua direita, mas tu não serás atingido.", 20),
  ];
  const b = montarBlocos(segs);
  const todas = segs.flatMap((s) => s.palavras.map((w) => w.t));
  assert.deepEqual(b.flatMap((x) => x.linhas.flat().map((w) => w.t)), todas);
  for (const x of b) {
    assert.ok(x.linhas.length >= 1 && x.linhas.length <= 2);
    for (const l of x.linhas) assert.ok(l.map((w) => w.t).join(" ").length <= Math.round(MAX_CARS[x.seg] * 1.25) || l.length === 1, l.map((w) => w.t).join(" "));
  }
  for (let i = 1; i < b.length; i++) assert.ok(b[i].ini > b[i - 1].ini);
  assert.ok(b.length >= 6, `poucos blocos: ${b.length}`);
});

test("tomadas de imagem: duas partes de uma linha seguidas dividem a imagem; nenhuma imagem curta demais", async () => {
  const { agruparParaImagens } = await import("../src/lib/blocos.ts");
  const w = (t: string, ini: number) => ({ t, ini, fim: ini + 0.3 });
  const b = (ini: number, fim: number, linhas: number) => ({ seg: "ato1" as const, ini, fim, linhas: Array.from({ length: linhas }, (_, k) => [w("x" + k, ini)]) });
  const blocos = [b(0, 2.5, 2), b(2.5, 4.0, 1), b(4.0, 5.5, 1), b(5.5, 8, 2), b(8, 9, 2), b(9, 12, 2)];
  const g = agruparParaImagens(blocos);
  assert.deepEqual(g[0], [0]);
  assert.deepEqual(g[1], [1, 2]);                 // as duas de uma linha juntas
  for (const x of g) assert.ok(blocos[x[x.length - 1]].fim - blocos[x[0]].ini >= 2.0, JSON.stringify(x));
  assert.deepEqual(g.flat(), [0, 1, 2, 3, 4, 5]);
});
