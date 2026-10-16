import { test } from "node:test";
import assert from "node:assert/strict";
import { extrairJson } from "../src/pipeline/llm.ts";
import { checagens } from "../src/pipeline/autor.ts";
import { FASES, pedidoAnalista } from "../src/pipeline/equipe.ts";

test("extrairJson ignora cercas e texto em volta e respeita chaves dentro de strings", () => {
  const j = extrairJson<{ a: string; b: { c: number } }>('Aqui vai:\n```json\n{"a":"x } y","b":{"c":2}}\n```\nfim');
  assert.equal(j.a, "x } y"); assert.equal(j.b.c, 2);
});

const texto = "Mas ele negou diante de todos, dizendo: Não sei o que dizes.";
const bom = { ato1: "Pedro negou Jesus, e Jesus se virou. Só um evangelho conta isso.", cta: "Curte e comenta amém. Escuta as cinco palavras de Pedro.", versiculo: texto, climax: "negou", ato3: "Lucas conta: o Senhor olhou para Pedro. Pedro chorou amargamente. Na praia, Jesus perguntou: amas-me? Três vezes, como na noite em que" };

test("checagens aceitam um roteiro bom e acusam os erros objetivos", () => {
  assert.deepEqual(checagens(bom, texto), []);
  assert.ok(checagens({ ...bom, versiculo: "Mas ele negou todos" }, texto).some((e) => /trecho exato/.test(e)));
  assert.ok(checagens({ ...bom, ato1: "Você sabia que Pedro negou Jesus? Só um evangelho conta isso e muito mais coisas." }, texto).some((e) => /pergunta|palavras/.test(e)));
  assert.ok(checagens({ ...bom, cta: "Escuta as cinco palavras de Pedro." }, texto).some((e) => /CTA/.test(e)));
  assert.ok(checagens({ ...bom, ato3: bom.ato3 + "." }, texto).some((e) => /ponto final/.test(e)));
  assert.ok(checagens({ ...bom, climax: "xyz" }, texto).some((e) => /climax/.test(e)));
});

test("cada analista recebe um prompt próprio e só o que precisa", () => {
  const p = { reference: "Mateus 26:70", text: texto, historical_context: "ctx", emotional_hook: "culpa", tone: "epic" };
  const ped = FASES.map((f) => pedidoAnalista(f, bom, p));
  assert.equal(new Set(ped.map((x) => x.system)).size, 7);
  assert.ok(!ped[0].user.includes(bom.ato3), "o gancho não vê o ato 3");
  assert.ok(ped[6].user.includes("LEITURA DA EMENDA"));
});
