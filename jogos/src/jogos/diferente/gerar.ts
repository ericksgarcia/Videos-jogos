import { prng } from "../../nucleo/prng";
import { MATIZES } from "../../identidade/marca";

export type Dificuldade = "facil" | "medio" | "dificil" | "extremo";
export type Variacao = "rotacao" | "cor" | "espessura";

export type Simbolo = {
  pontas: number;
  rotacao: number; // graus
  matiz: number; // graus
  espessura: number; // contorno, px
};

export type Desafio = {
  semente: number;
  dificuldade: Dificuldade;
  variacao: Variacao;
  colunas: number;
  linhas: number;
  simbolos: Simbolo[]; // linha a linha
  indiceCorreto: number;
  /** Diferença do símbolo certo, na unidade da variação (graus, graus de matiz ou px). */
  diferenca: number;
  /** Sinal da diferença (+1/-1). */
  sinal: 1 | -1;
};

// Quanto o símbolo diferente se afasta dos outros. Menor = mais difícil.
export const DIFERENCA: Record<Variacao, Record<Dificuldade, number>> = {
  rotacao: { facil: 30, medio: 14, dificil: 8, extremo: 5 },
  cor: { facil: 40, medio: 22, dificil: 14, extremo: 9 },
  espessura: { facil: 10, medio: 6, dificil: 4, extremo: 3 },
};
export const DIFERENCA_MINIMA: Record<Variacao, number> = { rotacao: 5, cor: 9, espessura: 3 };

const LINHAS: Record<Dificuldade, [number, number]> = {
  facil: [4, 4],
  medio: [5, 5],
  dificil: [5, 5],
  extremo: [5, 5],
};

export function gerarDesafio(semente: number, dificuldade: Dificuldade, variacao?: Variacao): Desafio {
  const r = prng(semente * 7919 + 13);
  const v = variacao ?? r.pick<Variacao>(["rotacao", "cor", "espessura"]);
  const [linhas, colunas] = LINHAS[dificuldade];
  const base: Simbolo = {
    pontas: r.pick([5, 5, 6, 7]),
    rotacao: -90,
    matiz: r.pick(MATIZES),
    espessura: 10,
  };
  const diferenca = DIFERENCA[v][dificuldade];
  const sinal = r.sign();
  const total = linhas * colunas;
  const indiceCorreto = r.int(0, total - 1);
  const simbolos: Simbolo[] = Array.from({ length: total }, () => ({ ...base }));
  const alvo = simbolos[indiceCorreto];
  if (v === "rotacao") alvo.rotacao += sinal * diferenca;
  if (v === "cor") alvo.matiz = (alvo.matiz + sinal * diferenca + 360) % 360;
  if (v === "espessura") alvo.espessura += sinal * diferenca * 0.5; // metade: contorno aparece dos dois lados
  return { semente, dificuldade, variacao: v, colunas, linhas, simbolos, indiceCorreto, diferenca, sinal };
}

/** Nome da posição, ex.: "C3" (coluna em letra, linha em número). */
export function nomeDaPosicao(d: Pick<Desafio, "colunas" | "indiceCorreto">) {
  const col = d.indiceCorreto % d.colunas;
  const lin = Math.floor(d.indiceCorreto / d.colunas);
  return `${"ABCDEFGH"[col]}${lin + 1}`;
}

export function explicacao(d: Desafio): string {
  if (d.variacao === "rotacao") {
    return `Girada ${d.diferenca}° para ${d.sinal > 0 ? "a direita" : "a esquerda"}`;
  }
  if (d.variacao === "cor") return "A cor é um pouco diferente das outras";
  return d.sinal > 0 ? "O contorno é mais grosso" : "O contorno é mais fino";
}

/**
 * VERIFICAÇÃO INDEPENDENTE: acha o símbolo diferente olhando só os símbolos
 * (sem usar indiceCorreto). Devolve o índice, ou -1 se não houver exatamente um.
 */
export function acharDiferente(simbolos: Simbolo[]): number {
  const chave = (s: Simbolo) => `${s.pontas}|${s.rotacao}|${s.matiz}|${s.espessura}`;
  const cont = new Map<string, number[]>();
  simbolos.forEach((s, i) => cont.set(chave(s), [...(cont.get(chave(s)) ?? []), i]));
  const unicos = [...cont.values()].filter((l) => l.length === 1);
  const outros = [...cont.values()].filter((l) => l.length > 1);
  return unicos.length === 1 && outros.length === 1 ? unicos[0][0] : -1;
}
