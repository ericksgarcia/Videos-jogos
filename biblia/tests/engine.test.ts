import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCatalog } from "../src/lib/catalog.ts";
import { pickNext, prng, registrar } from "../src/pipeline/engine.ts";
import type { HistoryItem } from "../src/lib/types.ts";

const catalogo = loadCatalog();

test("catálogo cobre os 150 salmos e tem o vocabulário completo", () => {
  const salmos = new Set(catalogo.filter((e) => e.book === "sl").map((e) => e.id.split("-")[1]));
  assert.equal(salmos.size, 150);
  for (const e of catalogo) {
    assert.ok(e.text.length > 20 && e.historical_context && e.audio_cues.length, e.id);
  }
});

test("120 vídeos seguidos: nunca repete livro nem gancho em sequência, ritmo alterna, sem passagem repetida", () => {
  let h: HistoryItem[] = [];
  const rand = prng(7);
  let ant;
  for (let i = 0; i < 120; i++) {
    const { entry, relaxed } = pickNext(catalogo, h, { rand });
    assert.ok(!relaxed.some((r) => /último|ritmo|inédita/.test(r)), `regra forte relaxada em ${i}: ${relaxed}`);
    if (ant) {
      assert.notEqual(entry.book, ant.book, `livro repetido em ${i}`);
      assert.notEqual(entry.emotional_hook, ant.emotional_hook, `gancho repetido em ${i}`);
      assert.notEqual(entry.tone, ant.tone, `ritmo não alternou em ${i}`);
    }
    assert.ok(!h.some((x) => x.id === entry.id), "passagem repetida");
    h = registrar(h, entry);
    ant = entry;
  }
});

test("é determinístico com a mesma semente", () => {
  const a = pickNext(catalogo, [], { rand: prng(42) }).entry.id;
  const b = pickNext(catalogo, [], { rand: prng(42) }).entry.id;
  assert.equal(a, b);
});

test("com o catálogo quase esgotado relaxa só as regras fracas: livro e gancho seguidos continuam proibidos", () => {
  let h: HistoryItem[] = [];
  const rand = prng(3);
  let ant;
  for (let i = 0; i < 280; i++) {
    const { entry } = pickNext(catalogo, h, { rand });
    if (ant) {
      assert.notEqual(entry.book, ant.book, `livro repetido em ${i}`);
      assert.notEqual(entry.emotional_hook, ant.emotional_hook, `gancho repetido em ${i}`);
    }
    h = registrar(h, entry);
    ant = entry;
  }
});
