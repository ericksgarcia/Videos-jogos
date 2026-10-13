/** Do `audio_cues` do catálogo para os cenários/climas procedurais (sem APIs externas). */
import type { AudioCue, Tone } from "../lib/types.ts";

export type Cenario = "deserto" | "montanha" | "mar" | "noite" | "fogueira" | "caverna" | "cidade";
export type Clima = "tempestade" | "chuva" | "vento" | "fogo" | "estrelas" | "raios" | "brasas";
export interface CenaProc { cenario: Cenario; clima: Clima[] }

const CENARIO: Partial<Record<AudioCue, Cenario>> = {
  deserto: "deserto", montanha: "montanha", mar: "mar", noite: "noite", fogueira: "fogueira", fogo: "fogueira",
  caverna: "caverna", vento: "deserto", batalha: "deserto", multidão: "montanha", silêncio: "noite", chuva: "montanha",
  trovão: "montanha", tempestade: "mar",
};

export function climaDe(cues: AudioCue[], tom: Tone): Clima[] {
  const c: Clima[] = [];
  if (cues.includes("tempestade") || cues.includes("trovão")) c.push("tempestade");
  else if (cues.includes("chuva")) c.push("chuva");
  if (cues.includes("vento") || cues.includes("deserto")) c.push("vento");
  if (cues.includes("fogo") || cues.includes("fogueira") || cues.includes("batalha")) c.push("brasas");
  if (cues.includes("noite") || cues.includes("silêncio") || cues.includes("caverna")) c.push("estrelas");
  if (tom === "epic" && c.includes("tempestade")) c.push("raios");
  return c;
}

/**
 * Cenário de cada tomada. Ato 1: cenas do contexto histórico (cues na ordem); ato 2: o clima mais
 * forte (raios no clímax); ato 3: cidade moderna à noite (chuva se o catálogo pede chuva/tempestade).
 */
export function cenaDaTomada(ato: "ato1" | "ato2" | "ato3", k: number, cues: AudioCue[], tom: Tone): CenaProc {
  const base = cues.map((x) => CENARIO[x]).filter((x): x is Cenario => Boolean(x));
  const unicos = [...new Set(base)];
  const reserva: Cenario[] = ["montanha", "noite", "deserto"];
  const lista = unicos.length ? unicos : reserva;
  const clima = climaDe(cues, tom);
  if (ato === "ato3") {
    const chove = cues.some((x) => x === "chuva" || x === "tempestade" || x === "trovão");
    return { cenario: "cidade", clima: chove ? ["chuva"] : ["estrelas"] };
  }
  const cenario = lista[(ato === "ato2" ? k : k + 1) % lista.length];
  return { cenario, clima: ato === "ato2" ? clima : clima.filter((x) => x !== "raios") };
}
