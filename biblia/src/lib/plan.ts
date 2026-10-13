/** Plano de render: JSON puro, compartilhado pela esteira (Node) e pelos componentes (Remotion). */
import type { Tone } from "./types.ts";

export const FPS = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;

export type SegmentoId = "ato1" | "cta" | "ato2" | "ato3";

export interface PalavraPlano { t: string; ini: number; fim: number } // segundos absolutos

export interface SegmentoPlano {
  id: SegmentoId;
  ini: number; fim: number;           // janela do ATO na linha do tempo (s)
  palavras: PalavraPlano[];
}

export interface PlanoTomada {
  ini: number; fim: number;           // s
  tipo: "parallax" | "video" | "procedural" | "cenografia";
  src: string;                        // relativo a public/ (staticFile); vazio em "procedural"
  cenario?: string;                   // procedural: deserto | montanha | mar | noite | fogueira | caverna | cidade
  clima?: string[];                   // procedural: tempestade | chuva | vento | fogo | estrelas | raios | brasas
  cena?: string;                      // cenografia: id da cena desenhada (ex.: "cova_leoes")
  variante?: string;                  // cenografia: variação de enquadramento/luz
  depth?: string;                     // mapa de profundidade (parallax)
  seed: number;
  creditos?: string;
}

export type Plano = {
  id: string;
  fps: number;
  duracao: number;                    // s
  bpm: number;
  tom: Tone;
  referencia: string;
  gancho: string;
  audio: string;                      // relativo a public/
  segmentos: SegmentoPlano[];
  tomadas: PlanoTomada[];
  climax: { t: number; palavra: string };
  rotulo: { texto: string; ini: number; fim: number };
  gancho_tela?: string[];             // texto grande nos primeiros ~2,5 s
  cta_tela?: { texto: string; ini: number; fim: number };
  loop?: boolean;                     // sem fade no fim/começo: o vídeo emenda em si mesmo
};

export const planoPadrao: Plano = {
  id: "demo", fps: FPS, duracao: 10, bpm: 66, tom: "epic", referencia: "Salmos 23:3-4", gancho: "proteção",
  audio: "", segmentos: [], tomadas: [], climax: { t: 5, palavra: "" }, rotulo: { texto: "", ini: 0, fim: 0 },
};
