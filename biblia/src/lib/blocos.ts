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

const LIGACAO = new Set(["a", "o", "as", "os", "e", "em", "de", "do", "da", "dos", "das", "no", "na", "nos", "nas", "um", "uma", "que", "se", "por", "para", "pra", "com", "nem", "mas", "ou", "ao", "aos", "à", "às", "pelo", "pela", "me", "te", "meu", "seu", "sua", "teu", "tua"]);
const ligacao = (w: PalavraPlano) => LIGACAO.has(w.t.toLowerCase().replace(/[^\p{L}]/gu, ""));

/**
 * Divide um trecho em pedaços que cabem em 2 linhas: testa todas as combinações de cortes (com poucos pedaços)
 * e escolhe a de tamanhos mais parecidos, evitando terminar um pedaço numa palavra de ligação ("em", "de", "que"…).
 */
function dividirEquilibrado(ws: PalavraPlano[], max: number): PalavraPlano[][] {
  for (let n = 2; n <= Math.min(5, ws.length); n++) {
    const achado: { custo: number; cortes: number[] }[] = [];
    const tenta = (ini: number, restantes: number, cortes: number[]) => {
      if (restantes === 0) {
        const lim = [0, ...cortes, ws.length], pedacos = lim.slice(0, -1).map((c, i) => ws.slice(c, lim[i + 1]));
        if (!pedacos.every((p) => p.length && cabe(p, max))) return;
        const tam = pedacos.map((p) => larg(p)), media = tam.reduce((x, y) => x + y, 0) / n;
        let custo = tam.reduce((x, t) => x + (t - media) ** 2, 0) / n;
        for (const p of pedacos.slice(0, -1)) if (ligacao(p[p.length - 1])) custo += 400;    // termina em "em/de/que…"
        for (const p of pedacos) if (p.length === 1) custo += 600;
        if (!achado.length || custo < achado[0].custo) achado[0] = { custo, cortes: [...cortes] };
        return;
      }
      for (let c = ini; c <= ws.length - restantes; c++) tenta(c + 1, restantes - 1, [...cortes, c]);
    };
    tenta(1, n - 1, []);
    if (achado.length) { const lim = [0, ...achado[0].cortes, ws.length]; return lim.slice(0, -1).map((c, i) => ws.slice(c, lim[i + 1])); }
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
      const fimFrase = (b: PalavraPlano[]) => /[.!?…]$/.test(b[b.length - 1].t);
      // nunca junta por cima de um ponto final: a imagem/legenda troca junto com a frase
      if (ant && !fimFrase(ant) && cabe([...ant, ...doSeg[i]], folga)) { ant.push(...doSeg[i]); doSeg.splice(i--, 1); }
      else if (prox && !fimFrase(doSeg[i]) && cabe([...doSeg[i], ...prox], folga)) { prox.unshift(...doSeg[i]); doSeg.splice(i--, 1); }
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

/**
 * Agrupa blocos de legenda em TOMADAS de imagem: duas partes de uma linha seguidas dividem a mesma
 * imagem, e nenhuma imagem fica menos de `minS` segundos (parte curta junta com a seguinte do mesmo ato).
 * Devolve listas de índices de blocos.
 */
export function agruparParaImagens(blocos: Bloco[], minS = 2.0): number[][] {
  const grupos: number[][] = [];
  for (let i = 0; i < blocos.length; i++) {
    const g = [i];
    const mesmoSeg = (j: number) => j < blocos.length && blocos[j].seg === blocos[i].seg;
    if (blocos[i].linhas.length === 1 && mesmoSeg(i + 1) && blocos[i + 1].linhas.length === 1) g.push(++i);
    const dur = () => blocos[g[g.length - 1]].fim - blocos[g[0]].ini;
    while (dur() < minS && mesmoSeg(g[g.length - 1] + 1)) g.push(++i);
    grupos.push(g);
  }
  // sobra curta no fim de um ato (ex.: última frase) volta para o grupo anterior do mesmo ato
  for (let k = grupos.length - 1; k > 0; k--) {
    const g = grupos[k], dur = blocos[g[g.length - 1]].fim - blocos[g[0]].ini;
    if (dur < minS * 0.75 && blocos[grupos[k - 1][0]].seg === blocos[g[0]].seg) { grupos[k - 1].push(...g); grupos.splice(k, 1); }
  }
  return grupos;
}
