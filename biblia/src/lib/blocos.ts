/**
 * Blocos de legenda de 2 linhas: a mesma divisão define a LEGENDA (KineticText) e os CORTES de imagem
 * (uma imagem nova no instante em que a voz começa cada bloco). Puro: roda no Node e no Remotion.
 */
import type { PalavraPlano, SegmentoPlano } from "./plan";

export interface Bloco { seg: SegmentoPlano["id"]; ini: number; fim: number; linhas: PalavraPlano[][] }

/** Caracteres por linha que cabem em ~940 px em cada estilo (Cormorant 92 px; CTA itálico 84 px; Cinzel 78 px). */
export const MAX_CARS: Record<SegmentoPlano["id"], number> = { ato1: 21, cta: 22, ato2: 18, ato3: 21 };

const larg = (l: PalavraPlano[]) => l.reduce((n, w, i) => n + w.t.length + (i ? 1 : 0), 0);

/** Quebra gulosa em linhas de até `max` caracteres. */
function quebrar(ws: PalavraPlano[], max: number): PalavraPlano[][] {
  const linhas: PalavraPlano[][] = [[]];
  for (const w of ws) {
    const atual = linhas[linhas.length - 1];
    if (atual.length && larg(atual) + 1 + w.t.length > max) linhas.push([]);
    linhas[linhas.length - 1].push(w);
  }
  return linhas;
}
const cabe = (ws: PalavraPlano[], max: number) => quebrar(ws, max).length <= 2;

/** Divide um trecho em n pedaços de tamanho parecido, cada um cabendo em 2 linhas. */
function dividirEquilibrado(ws: PalavraPlano[], max: number): PalavraPlano[][] {
  const total = larg(ws);
  for (let n = 2; n <= ws.length; n++) {
    const alvo = total / n, pedacos: PalavraPlano[][] = [[]];
    for (const w of ws) {
      const p = pedacos[pedacos.length - 1];
      if (p.length && larg(p) + 1 + w.t.length / 2 > alvo && pedacos.length < n) pedacos.push([]);
      pedacos[pedacos.length - 1].push(w);
    }
    if (pedacos.every((p) => cabe(p, max))) return pedacos;
  }
  return ws.map((w) => [w]);
}

/**
 * Monta blocos de no máximo 2 linhas respeitando a fala: as unidades são trechos entre pontuações
 * (vírgula, ponto…); um bloco junta unidades enquanto couberem em 2 linhas e fecha no fim de frase.
 * Só um trecho maior que 2 linhas é partido por palavras.
 */
export function montarBlocos(segs: SegmentoPlano[]): Bloco[] {
  const out: Bloco[] = [];
  for (const s of segs) {
    const max = MAX_CARS[s.id];
    const unidades: PalavraPlano[][] = [];
    let u: PalavraPlano[] = [];
    for (const w of s.palavras) { u.push(w); if (/[.!?…,;:]$/.test(w.t)) { unidades.push(u); u = []; } }
    if (u.length) unidades.push(u);
    const doSeg: PalavraPlano[][] = [];
    let atual: PalavraPlano[] = [];
    for (const un of unidades) {
      if (!cabe(un, max)) { // trecho longo demais: parte em pedaços EQUILIBRADOS (sem sobrar 1 palavra)
        if (atual.length) { doSeg.push(atual); atual = []; }
        const pedacos = dividirEquilibrado(un, max);
        doSeg.push(...pedacos.slice(0, -1));
        atual = pedacos[pedacos.length - 1];
      } else if (cabe([...atual, ...un], max)) atual.push(...un);
      else { doSeg.push(atual); atual = [...un]; }
      const fim = un[un.length - 1].t;
      if (/[.!?…]$/.test(fim) && atual.length >= 4) { doSeg.push(atual); atual = []; }
    }
    if (atual.length) doSeg.push(atual);
    // bloco de 1–2 palavras junta com o vizinho (tolerância de 25 %: a fonte encolhe para caber)
    const folga = Math.round(max * 1.25);
    for (let i = 0; i < doSeg.length; i++) {
      if (doSeg[i].length > 2 || doSeg.length === 1) continue;
      const ant = doSeg[i - 1], prox = doSeg[i + 1];
      if (ant && cabe([...ant, ...doSeg[i]], folga)) { ant.push(...doSeg[i]); doSeg.splice(i--, 1); }
      else if (prox && cabe([...doSeg[i], ...prox], folga)) { prox.unshift(...doSeg[i]); doSeg.splice(i--, 1); }
    }
    for (const ws of doSeg.filter((x) => x.length)) {
      // 2 linhas sempre: se não cabe na largura normal (bloco que recebeu a sobra), usa a folga (a fonte encolhe)
      let m = max; while (quebrar(ws, m).length > 2) m++;
      out.push({ seg: s.id, ini: ws[0].ini, fim: 0, linhas: quebrar(ws, m) });
    }
  }
  out.forEach((b, i) => {
    const seg = segs.find((s) => s.id === b.seg)!;
    const prox = out[i + 1];
    b.fim = prox && prox.seg === b.seg ? prox.ini : Math.min(seg.fim, b.linhas.flat().slice(-1)[0].fim + 0.6);
  });
  return out;
}
