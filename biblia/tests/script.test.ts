import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCatalog } from "../src/lib/catalog.ts";
import { CTA_ESTILOS, escolherCtaEstilo, gerarRoteiro, palavraClimax, validar } from "../src/pipeline/script.ts";
import { prng } from "../src/pipeline/engine.ts";
import type { HistoryItem } from "../src/lib/types.ts";

test("o estilo do CTA nunca repete nos últimos 3 vídeos", () => {
  const rand = prng(1);
  const hist: HistoryItem[] = [];
  const usados: string[] = [];
  for (let i = 0; i < 60; i++) {
    const { estilo } = escolherCtaEstilo(hist, rand);
    assert.ok(!usados.slice(-3).includes(estilo.id), `repetiu ${estilo.id} em ${i}`);
    usados.push(estilo.id);
    hist.push({ at: "", id: String(i), reference: "", book: "sl", emotional_hook: "medo", tone: "epic", cta_style: estilo.id, cta_text: `cta ${i}` });
  }
  assert.ok(new Set(usados).size === CTA_ESTILOS.length, "todos os estilos devem aparecer");
});

test("palavra de clímax existe no versículo", () => {
  assert.equal(palavraClimax("Mil poderão cair ao teu lado, e dez mil à tua direita;", "direita"), "direita;");
  assert.equal(palavraClimax("O Senhor é o meu pastor; nada me faltará.", "inexistente"), "faltará.");
});

test("roteiro local respeita os limites de CTA e traz cenas", async () => {
  const e = loadCatalog().find((x) => x.id.startsWith("mt-14"))!;
  const r = await gerarRoteiro(e, [], { rand: prng(2), offline: true });
  assert.equal(r.versiculo, e.text);
  assert.deepEqual(validar({ ato1: "uma duas três quatro cinco seis sete oito nove dez onze doze treze catorze", cta: r.cta, ato3: r.ato3.split(" ").slice(0, 22).join(" ") }), []);
  assert.ok(r.cenas.ato1.flux.length > 10 && r.cenas.ato2.pexels.length >= 1);
});
