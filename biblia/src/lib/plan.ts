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
  tipo: "parallax" | "video" | "procedural" | "cenografia" | "gerativo";
  src: string;                        // relativo a public/ (staticFile); vazio em "procedural"
  cenario?: string;                   // procedural: deserto | montanha | mar | noite | fogueira | caverna | cidade
  clima?: string[];                   // procedural: tempestade | chuva | vento | fogo | estrelas | raios | brasas
  faixa?: number;                     // brilho médio (0-255) da faixa da legenda nesta imagem: define a força do escurecimento atrás do texto
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
  gancho_tela?: string[];             // texto grande de abertura (afirmação de choque, não pergunta de autoajuda)
  gancho_linhas?: number[];           // s em que cada linha do texto de abertura entra: NA PALAVRA em que é falada (o texto é a 1ª frase narrada)
  gancho_fim?: number;                // s em que o texto de abertura sai (fim da 1ª frase falada); padrão 2,6
  gancho_virada?: number;             // s do 2º golpe (início da 2ª frase): flash + empurrão de câmera que segura a retenção aos 3-4 s
  cta_tela?: { texto: string; ini: number; fim: number };
  fundo?: { paleta: string; semente: number };   // fundo gerativo (shader), sem imagens pagas
  visual_fato?: { tipo: "lacres"; n: number; entradas: number[]; gatilhos: number[]; idx: number[] };   // o fato vira cena, sincronizado com a voz
  verso_fixo?: boolean;               // o versículo inteiro fica escrito na tela o vídeo todo; as outras falas não têm texto
  loop?: boolean;                     // sem fade no fim/começo: o vídeo emenda em si mesmo
  blocos?: import("./blocos").Bloco[]; // legenda em 2 linhas = cortes de imagem
};

export const planoPadrao: Plano = {
  id: "demo", fps: FPS, duracao: 10, bpm: 66, tom: "epic", referencia: "Salmos 23:3-4", gancho: "proteção",
  audio: "", segmentos: [], tomadas: [], climax: { t: 5, palavra: "" }, rotulo: { texto: "", ini: 0, fim: 0 },
};
