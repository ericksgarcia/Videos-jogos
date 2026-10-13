export type Tone = "epic" | "comfort";

export type Hook =
  | "medo" | "traição" | "superação" | "injustiça" | "proteção" | "ansiedade"
  | "luto" | "culpa" | "solidão" | "esperança" | "gratidão" | "perdão"
  | "cansaço" | "provisão" | "dúvida" | "orgulho" | "sabedoria" | "chamado"
  | "juízo" | "coragem" | "paz";

export type AudioCue =
  | "trovão" | "vento" | "caverna" | "fogo" | "chuva" | "deserto" | "tempestade"
  | "fogueira" | "mar" | "noite" | "multidão" | "batalha" | "silêncio" | "montanha";

export interface CatalogEntry {
  id: string;                 // ex.: "sl-23-1-4"
  book: string;               // código: sl, pv, is...
  bookName: string;           // "Salmos"
  testament: "AT" | "NT";
  reference: string;          // "Salmos 23:1-4"
  text: string;               // texto corrido do trecho (Almeida Revista e Atualizada)
  words: number;
  historical_context: string;
  emotional_hook: Hook;
  tone: Tone;
  audio_cues: AudioCue[];
}

export interface HistoryItem {
  at: string;                 // ISO
  id: string;
  reference: string;
  book: string;
  emotional_hook: Hook;
  tone: Tone;
  cta_style?: string;         // estilo do pedido de fé usado (para não repetir)
  cta_text?: string;
  pexels_ids?: number[];      // clipes de fundo usados (não repetir nos próximos vídeos)
}
