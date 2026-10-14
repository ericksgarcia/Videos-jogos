/**
 * Linha do tempo (alinhada às batidas) e tomadas visuais.
 *  - os atos começam nas marcas 0 / 12 / 16 / 35 s, empurrados para a próxima batida do BPM
 *    (e para depois do fim da fala anterior, se ela passar do previsto);
 *  - dentro de cada bloco de imagem (ato 1+CTA, ato 2, ato 3) os cortes caem em compassos de
 *    4 batidas → o vídeo "troca de imagem com a música".
 */
import type { CatalogEntry, Tone } from "../lib/types.ts";
import type { PalavraPlano, SegmentoPlano } from "../lib/plan.ts";
import type { Fala } from "./tts.ts";

export const DUR_MIN = 45;
export const DUR_MAX = 58;

export const bpmDoTom = (tom: Tone) => (tom === "epic" ? 72 : 60);
const sobeBatida = (t: number, bpm: number) => Math.ceil(t / (60 / bpm) - 1e-6) * (60 / bpm);

export interface Linha {
  ini: { ato1: number; cta: number; ato2: number; ato3: number };
  total: number;
  avisos: string[];
}

export function montarLinha(f: Record<"ato1" | "cta" | "ato2" | "ato3", Fala>, bpm: number, loop = false): Linha {
  const avisos: string[] = [];
  const ato1 = 0.5;
  const cta = sobeBatida(Math.max(12, ato1 + f.ato1.dur + 0.35), bpm);
  const ato2 = sobeBatida(Math.max(16, cta + f.cta.dur + 0.5), bpm);
  // marca nominal 35 s, mas se o versículo for curto não deixa mais que ~2 s de silêncio antes do ato 3
  const ato3 = sobeBatida(Math.max(ato2 + f.ato2.dur + 0.9, Math.min(35, ato2 + f.ato2.dur + 2)), bpm);
  const fala3 = ato3 + f.ato3.dur;
  // cauda de 0,8-1,6 s (encolhe para fechar em 58 s); em loop, quase nada: a última palavra emenda na primeira
  let total = fala3 + (loop ? 0.3 : Math.min(1.6, Math.max(0.8, DUR_MAX - fala3)));
  if (cta + f.cta.dur > ato2) avisos.push("CTA invadiu o ato 2");
  if (cta - 12 > 1.5 || ato2 - 16 > 1.5) avisos.push(`atos atrasados: CTA ${cta.toFixed(1)}s, ato 2 ${ato2.toFixed(1)}s`);
  if (total < DUR_MIN) { if (loop) avisos.push(`duração ${total.toFixed(1)}s abaixo de ${DUR_MIN}s (loop não estica)`); else total = DUR_MIN; }
  if (total > DUR_MAX) avisos.push(`duração ${total.toFixed(1)}s passa de ${DUR_MAX}s — encurte o roteiro`);
  return { ini: { ato1, cta, ato2, ato3 }, total, avisos };
}

export function segmentos(f: Record<"ato1" | "cta" | "ato2" | "ato3", Fala>, l: Linha): SegmentoPlano[] {
  const fins = { ato1: l.ini.cta, cta: l.ini.ato2, ato2: l.ini.ato3, ato3: l.total };
  return (["ato1", "cta", "ato2", "ato3"] as const).map((id) => ({
    id, ini: id === "ato1" ? 0 : l.ini[id], fim: fins[id],
    palavras: f[id].palavras.map((w): PalavraPlano => ({ t: w.texto, ini: l.ini[id] + w.ini, fim: l.ini[id] + w.fim })),
  }));
}

export interface BlocoVisual { ato: "ato1" | "ato2" | "ato3"; ini: number; fim: number; cortes: number[] } // cortes: instantes internos
const BATIDAS_POR_CORTE = 4;

/** Cortes internos de um bloco, em compassos inteiros contados desde o início do vídeo. */
export function cortesNoRitmo(ini: number, fim: number, bpm: number): number[] {
  const compasso = (60 / bpm) * BATIDAS_POR_CORTE;
  const n = Math.max(1, Math.round((fim - ini) / (compasso * 1.15)));   // ~4-5 s por tomada
  const alvo = (fim - ini) / n;
  const cortes: number[] = [];
  for (let k = 1; k < n; k++) {
    const t = Math.round((ini + alvo * k) / compasso) * compasso;
    if (t > ini + 1.5 && t < fim - 1.5 && (!cortes.length || t - cortes[cortes.length - 1] > 1.5)) cortes.push(t);
  }
  return cortes;
}

export function blocos(l: Linha, bpm: number): BlocoVisual[] {
  const defs: [BlocoVisual["ato"], number, number][] = [["ato1", 0, l.ini.ato2], ["ato2", l.ini.ato2, l.ini.ato3], ["ato3", l.ini.ato3, l.total]];
  return defs.map(([ato, ini, fim]) => ({ ato, ini, fim, cortes: cortesNoRitmo(ini, fim, bpm) }));
}

/** Variações de enquadramento por tomada (para a mesma ideia render planos diferentes). */
export const ENQUADRAMENTOS = [
  "wide establishing shot", "medium shot", "close detail shot", "low angle dramatic shot", "distant silhouette on the horizon",
];

export function palavraClimaxTempo(seg: SegmentoPlano, palavra: string): number {
  const alvo = palavra.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
  const w = seg.palavras.find((p) => p.t.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "") === alvo) ?? seg.palavras[seg.palavras.length - 1];
  return w.ini;
}

export const rotuloDe = (e: CatalogEntry, ato2Ini: number) => ({ texto: e.reference, ini: ato2Ini - 0.2, fim: ato2Ini + 4.2 });
