import test from "node:test";
import assert from "node:assert/strict";
import { acharDiferente, DIFERENCA_MINIMA, gerarDesafio, nomeDaPosicao, type Dificuldade, type Variacao } from "../src/jogos/diferente/gerar";
import { dentroDaSegura } from "../src/nucleo/seguro";
import { GRADE } from "../src/jogos/diferente/Cena";
import { eventosDiferente } from "../src/jogos/diferente/sons";
import { T } from "../src/jogos/diferente/tempos";

const DIFS: Dificuldade[] = ["facil", "medio", "dificil", "extremo"];
const VARS: Variacao[] = ["rotacao", "cor", "espessura"];

test("a resposta mostrada é a única diferente, em 2400 desafios", () => {
  for (let semente = 1; semente <= 200; semente++)
    for (const dif of DIFS) for (const v of VARS) {
      const d = gerarDesafio(semente, dif, v);
      assert.equal(acharDiferente(d.simbolos), d.indiceCorreto, `semente ${semente} ${dif} ${v}`);
      assert.ok(d.diferenca >= DIFERENCA_MINIMA[v]);
    }
});

test("determinístico: mesma semente, mesmo desafio; sementes diferentes variam", () => {
  assert.deepEqual(gerarDesafio(7, "medio"), gerarDesafio(7, "medio"));
  const resp = new Set(Array.from({ length: 60 }, (_, i) => gerarDesafio(i + 1, "medio").indiceCorreto));
  assert.ok(resp.size > 10);
});

test("nome da posição bate com o índice", () => {
  const d = gerarDesafio(2024, "medio");
  const nome = nomeDaPosicao(d);
  assert.equal(nome[0], "ABCDE"[d.indiceCorreto % 5]);
  assert.equal(Number(nome[1]), Math.floor(d.indiceCorreto / 5) + 1);
});

test("grade e textos ficam na área segura; sons dentro da duração", () => {
  assert.ok(dentroDaSegura(GRADE.x - 50, GRADE.y - 50, GRADE.w + 50, GRADE.h + 50));
  for (const e of eventosDiferente()) assert.ok(e.t >= 0 && e.t < T.total, String(e.t));
});
