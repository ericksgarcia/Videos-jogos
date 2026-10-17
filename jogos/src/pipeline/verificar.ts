import { acharDiferente, gerarDesafio, DIFERENCA_MINIMA } from "../jogos/diferente/gerar";
import type { Video } from "./comum";

/** Trava o render se a resposta do desafio não for a correta. Lança erro se algo estiver errado. */
export function verificarVideo(v: Video) {
  if (v.formato === "diferente") {
    const d = gerarDesafio(v.semente, v.dificuldade);
    const achado = acharDiferente(d.simbolos);
    if (achado !== d.indiceCorreto) throw new Error(`RESPOSTA ERRADA: calculado ${achado}, mostrado ${d.indiceCorreto}`);
    if (d.diferenca < DIFERENCA_MINIMA[d.variacao]) throw new Error("diferença imperceptível");
    return d;
  }
  throw new Error(`formato desconhecido: ${v.formato}`);
}
