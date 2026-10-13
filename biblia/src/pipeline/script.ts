/**
 * Roteiro em 4 atos, com CTA de fé que MUDA a cada vídeo.
 *
 *   ATO 1   0–12 s  contexto histórico e drama (a crise real de quem escreveu)
 *   CTA    12–16 s  interlúdio de fé, no máximo 4 s, estilo/palavras/tom diferentes a cada vídeo
 *   ATO 2  16–35 s  leitura solene da passagem (texto vem do catálogo, nunca do modelo)
 *   ATO 3  35–55 s  conexão com a vida moderna
 *
 * O texto de Ato 1, CTA e Ato 3 e os prompts de imagem vêm do Gemini (credencial do ambiente
 * ou GEMINI_API_KEY). O "prompt do CTA" é montado a cada vídeo com um ESTILO diferente do dos
 * últimos vídeos (lido do histórico), um REGISTRO sorteado e a lista dos CTAs recentes proibidos.
 * Sem Gemini, cai em um banco local (também rotacionado pelo histórico).
 */
import type { CatalogEntry, HistoryItem } from "../lib/types.ts";
import { comTentativas } from "../lib/env.ts"; // também ativa o proxy e lê o .env
import { prng } from "./engine.ts";

export const LIMITES = {
  ato1: { min: 20, max: 28 },   // ≈ 12 s no ritmo solene (~2,3 palavras/s)
  cta: { min: 5, max: 10 },     // ≤ 4 s
  ato3: { min: 36, max: 48 },   // ≈ 20 s
};

export interface CtaStyle { id: string; instrucao: string; exemplo: string }

export const CTA_ESTILOS: CtaStyle[] = [
  { id: "amem", instrucao: "peça um 'Amém' nos comentários de quem crê na promessa", exemplo: "Deixe seu Amém se você crê." },
  { id: "alcance", instrucao: "peça a curtida para que a promessa alcance quem precisa hoje", exemplo: "Curta este vídeo para que essa promessa alcance quem precisa hoje." },
  { id: "nome", instrucao: "peça que escrevam nos comentários o nome de alguém que querem abençoar", exemplo: "Escreva nos comentários o nome de quem você quer abençoar." },
  { id: "compartilhar", instrucao: "peça que enviem esta palavra a alguém que precisa ouvi-la", exemplo: "Envie esta palavra para quem precisa ouvi-la agora." },
  { id: "declaracao", instrucao: "peça que declarem uma frase curta de fé nos comentários", exemplo: "Se isso é pra você, comente: eu recebo." },
  { id: "pergunta", instrucao: "faça uma pergunta pessoal que leve à resposta nos comentários", exemplo: "Qual medo você entrega hoje? Conte aqui embaixo." },
  { id: "oracao", instrucao: "convide a deixar um pedido de oração nos comentários", exemplo: "Deixe seu pedido de oração aqui embaixo, vamos orar juntos." },
  { id: "testemunho", instrucao: "peça um testemunho curto de livramento nos comentários", exemplo: "Já viu Deus agir? Conte em uma frase nos comentários." },
];

const REGISTROS = [
  "convite acolhedor, quase sussurrado",
  "pergunta direta e pessoal",
  "declaração firme de fé",
  "ordem gentil, como um pastor falando",
  "pedido simples, como a um amigo",
  "bênção dita antes da leitura",
];

const BANCO_CTA: Record<string, string[]> = {
  amem: ["Se você crê nessa palavra, escreva Amém.", "Deixe seu Amém, se isso é verdade na sua vida."],
  alcance: ["Curta, para essa promessa chegar em quem precisa.", "Uma curtida leva esta palavra a mais um coração."],
  nome: ["Escreva o nome de quem você quer abençoar.", "Comente o nome de alguém por quem você ora."],
  compartilhar: ["Envie esta palavra a quem precisa ouvi-la hoje.", "Mande para alguém que está cansado agora."],
  declaracao: ["Se é pra você, comente: eu recebo.", "Declare nos comentários: eu creio."],
  pergunta: ["Qual peso você entrega hoje? Conte aqui.", "Que medo você deixa aos pés de Deus hoje?"],
  oracao: ["Deixe seu pedido de oração, vamos orar juntos.", "Escreva seu pedido, ele não será esquecido."],
  testemunho: ["Já viu Deus agir? Conte em uma frase.", "Comente um livramento que você já viveu."],
};

const FOCO_ATO3: Record<string, string> = {
  ansiedade: "ansiedade e a mente que não desliga", medo: "medo do futuro e do desconhecido",
  superação: "recomeçar depois de uma queda", cansaço: "esgotamento no trabalho e na rotina",
  solidão: "sentir-se sozinho no meio de muita gente", dúvida: "decisões difíceis sem resposta clara",
  luto: "perdas e saudade", culpa: "carregar erros do passado", injustiça: "ser tratado injustamente",
  traição: "confiança quebrada por alguém próximo", esperança: "esperar quando nada muda",
  perdão: "perdoar e ser perdoado", proteção: "sentir-se desprotegido", paz: "uma mente em paz no meio do barulho",
  coragem: "enfrentar o que parece grande demais", orgulho: "a pressão de provar valor", sabedoria: "escolher bem num mundo acelerado",
  gratidão: "reconhecer o que já foi dado", chamado: "sentir que a vida tem um propósito", juízo: "viver com integridade",
  provisão: "medo de faltar o essencial",
};

export interface Cena { flux: string; pexels: string[] }
export interface Roteiro {
  ato1: string;
  cta: string;
  ato3: string;
  versiculo: string;        // texto lido no Ato 2 (do catálogo)
  climax: string;           // palavra do versículo em que cai o trovão/impacto
  cta_style: string;
  cenas: { ato1: Cena; ato2: Cena; ato3: Cena };
  origem: "gemini" | "banco-local";
}

export const contar = (t: string) => t.split(/\s+/).filter(Boolean).length;
const limpaPalavra = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");

/** Escolhe o estilo de CTA: nunca um dos últimos 3 usados. */
export function escolherCtaEstilo(history: HistoryItem[], rand: () => number): { estilo: CtaStyle; registro: string; proibidos: string[] } {
  const recentes = history.slice(-3).map((h) => h.cta_style);
  const livres = CTA_ESTILOS.filter((s) => !recentes.includes(s.id));
  const estilo = livres[Math.floor(rand() * livres.length)];
  const registro = REGISTROS[Math.floor(rand() * REGISTROS.length)];
  const proibidos = history.slice(-8).map((h) => h.cta_text).filter(Boolean) as string[];
  return { estilo, registro, proibidos };
}

/** Palavra de clímax: a do modelo se existir no versículo; senão a palavra forte mais perto do fim. */
export function palavraClimax(verso: string, sugerida?: string): string {
  const palavras = verso.split(/\s+/).filter(Boolean);
  if (sugerida) {
    const alvo = limpaPalavra(sugerida);
    const achada = palavras.find((p) => limpaPalavra(p) === alvo);
    if (achada) return achada;
  }
  const fortes = palavras.filter((p) => limpaPalavra(p).length >= 6);
  return fortes.length ? fortes[fortes.length - 1] : palavras[palavras.length - 1];
}

export function validar(r: Pick<Roteiro, "ato1" | "cta" | "ato3">): string[] {
  const erros: string[] = [];
  const chk = (k: "ato1" | "cta" | "ato3", nome: string) => {
    const n = contar(r[k]);
    const { min, max } = LIMITES[k];
    if (n < min || n > max) erros.push(`${nome} tem ${n} palavras (precisa de ${min}-${max})`);
  };
  chk("ato1", "ato1"); chk("cta", "cta"); chk("ato3", "ato3");
  return erros;
}

function montarPrompt(e: CatalogEntry, estilo: CtaStyle, registro: string, proibidos: string[], extra: string[]) {
  return `Você é roteirista de vídeos verticais curtos de um canal cristão sóbrio e cinematográfico, em português do Brasil. Narração grave, pausada, solene — nunca eufórica, nunca "coach".

PASSAGEM: ${e.reference}
TEXTO (já escolhido, NÃO reescreva): "${e.text}"
CONTEXTO HISTÓRICO VERIFICADO (use apenas isto; NÃO invente datas, nomes ou fatos além disto): ${e.historical_context}
GANCHO EMOCIONAL: ${e.emotional_hook} | TOM: ${e.tone === "epic" ? "épico, tenso" : "reflexivo, de conforto"}

Escreva:
1. "ato1": ${LIMITES.ato1.min}-${LIMITES.ato1.max} palavras. Comece direto na crise ou no perigo real que o autor enfrentava, no presente narrativo, sem saudação e sem citar o versículo. Frases curtas.
2. "cta": ${LIMITES.cta.min}-${LIMITES.cta.max} palavras (cabe em 4 segundos falados). Chamada de fé antes da leitura, apelando para curtir/comentar para a mensagem alcançar mais gente. ESTILO DESTE VÍDEO: ${estilo.instrucao} (exemplo de ESTILO, não copie: "${estilo.exemplo}"). REGISTRO: ${registro}. Natural, fluido, sem soar como propaganda. Palavras e estrutura DIFERENTES dos pedidos recentes${proibidos.length ? ` — proibido repetir ou parafrasear: ${proibidos.map((p) => `"${p}"`).join("; ")}` : ""}.
3. "ato3": ${LIMITES.ato3.min}-${LIMITES.ato3.max} palavras. Conexão com a vida moderna, focada em: ${FOCO_ATO3[e.emotional_hook] ?? e.emotional_hook}. Fale em "você", cite uma cena concreta do dia a dia (madrugada olhando o teto, mensagem não respondida, boleto, hospital), termine com uma frase de peso que ecoe a passagem. Sem promessas de ganhos materiais, sem teologia da prosperidade.
4. "climax": UMA palavra do TEXTO acima onde cai o trovão/impacto sonoro (a mais forte).
5. "cenas": para ato1, ato2 e ato3 — "flux" (prompt em inglês, 1 frase, imagem vertical: dark cinematic 35mm film still, Rembrandt chiaroscuro lighting, deep shadows, golden highlights, volumetric light; sem texto na imagem; pessoas apenas de costas ou em silhueta, sem rostos reconhecíveis; coerente com o contexto histórico) e "pexels" (2 buscas curtas em inglês para vídeo de natureza/atmosfera, sem pessoas em primeiro plano, p.ex. "storm clouds timelapse").${extra.length ? "\n\nCORRIJA: " + extra.join("; ") + "." : ""}

Responda SOMENTE com JSON: {"ato1":"","cta":"","ato3":"","climax":"","cenas":{"ato1":{"flux":"","pexels":["",""]},"ato2":{...},"ato3":{...}}}`;
}

async function gemini(prompt: string): Promise<string> {
  const modelo = process.env.GEMINI_TEXT_MODEL ?? "gemini-3.8-flash";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.GEMINI_API_KEY) headers["x-goog-api-key"] = process.env.GEMINI_API_KEY; // senão o proxy injeta
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
    method: "POST", headers,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 1.0 },
    }),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j: any = await r.json();
  const texto = j.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "";
  if (!texto) throw new Error("Gemini sem texto");
  return texto;
}

const CENA_PADRAO = (e: CatalogEntry, ato: 1 | 2 | 3): Cena => {
  const base = "dark cinematic 35mm film still, Rembrandt chiaroscuro lighting, deep shadows, golden highlights, volumetric light, no text, silhouetted figure seen from behind";
  const clima: Record<string, string> = {
    trovão: "thunderstorm over ancient hills", vento: "wind over desert dunes", caverna: "ancient stone cave with a faint firelight",
    fogo: "burning flames in the dark", chuva: "rain on a dark window", deserto: "vast desert at dusk", tempestade: "stormy sea under black clouds",
    fogueira: "campfire at night in the wilderness", mar: "dark sea and cliffs", noite: "starry night over ancient Jerusalem",
    multidão: "ancient city gates at dawn", batalha: "ancient battlefield at dawn in mist", silêncio: "quiet stone path in fog", montanha: "mountains at dawn above clouds",
  };
  const c = e.audio_cues.map((k) => clima[k]).filter(Boolean);
  const fonte = ato === 2 ? c[0] : c[ato === 1 ? 1 : 0] ?? c[0];
  const cena = ato === 3 ? "modern city at night, rain on a window, lone figure seen from behind" : fonte ?? "ancient landscape at dusk";
  return { flux: `${cena}, ${base}`, pexels: ato === 3 ? ["city night rain window", "lonely road fog"] : [(fonte ?? "ancient landscape").replace(/ancient |dark /g, ""), "dramatic clouds timelapse"] };
};

function roteiroLocal(e: CatalogEntry, estilo: CtaStyle, rand: () => number, proibidos: string[]): Roteiro {
  const banco = BANCO_CTA[estilo.id].filter((c) => !proibidos.includes(c));
  const cta = (banco.length ? banco : BANCO_CTA[estilo.id])[Math.floor(rand() * (banco.length || 2))];
  const frases = e.historical_context.replace(/\s+/g, " ").split(/\s+/);
  const ato1 = frases.slice(0, LIMITES.ato1.max).join(" ").replace(/[,;:]$/, "") + (/[.!?]$/.test(frases.slice(0, LIMITES.ato1.max).join(" ")) ? "" : ".");
  const foco = FOCO_ATO3[e.emotional_hook] ?? e.emotional_hook;
  const ato3 = `Hoje o cenário é outro, mas a dor é a mesma: ${foco}. Madrugada, o teto do quarto, a cabeça sem parar. Foi para esse lugar que essa palavra foi escrita. Entregue o próximo passo, e deixe o resto com Aquele que cuida de você.`;
  return {
    ato1, cta, ato3, versiculo: e.text, climax: palavraClimax(e.text), cta_style: estilo.id,
    cenas: { ato1: CENA_PADRAO(e, 1), ato2: CENA_PADRAO(e, 2), ato3: CENA_PADRAO(e, 3) }, origem: "banco-local",
  };
}

export async function gerarRoteiro(
  e: CatalogEntry, history: HistoryItem[],
  opts: { rand?: () => number; offline?: boolean } = {},
): Promise<Roteiro> {
  const rand = opts.rand ?? prng(Date.now());
  const { estilo, registro, proibidos } = escolherCtaEstilo(history, rand);
  if (opts.offline) return roteiroLocal(e, estilo, rand, proibidos);

  let extra: string[] = [];
  for (let i = 0; i < 3; i++) {
    try {
      const bruto = await comTentativas(() => gemini(montarPrompt(e, estilo, registro, proibidos, extra)), 2);
      const j = JSON.parse(bruto.replace(/^```json|```$/g, ""));
      const r = {
        ato1: String(j.ato1 ?? "").trim(), cta: String(j.cta ?? "").trim(), ato3: String(j.ato3 ?? "").trim(),
      };
      const erros = validar(r);
      if (proibidos.some((p) => p.toLowerCase() === r.cta.toLowerCase())) erros.push("cta repetido");
      if (erros.length) { extra = erros; console.warn(`  tentativa ${i + 1}: ${erros.join("; ")}`); continue; }
      const cena = (k: "ato1" | "ato2" | "ato3"): Cena => ({
        flux: String(j.cenas?.[k]?.flux ?? CENA_PADRAO(e, Number(k.slice(-1)) as 1 | 2 | 3).flux),
        pexels: (j.cenas?.[k]?.pexels?.length ? j.cenas[k].pexels : CENA_PADRAO(e, Number(k.slice(-1)) as 1 | 2 | 3).pexels).map(String),
      });
      return {
        ...r, versiculo: e.text, climax: palavraClimax(e.text, j.climax), cta_style: estilo.id,
        cenas: { ato1: cena("ato1"), ato2: cena("ato2"), ato3: cena("ato3") }, origem: "gemini",
      };
    } catch (err) {
      extra = [`erro anterior: ${(err as Error).message.slice(0, 80)}`];
      console.warn(`  tentativa ${i + 1}: ${extra[0]}`);
    }
  }
  console.warn("⚠ Gemini não entregou um roteiro válido; usando o banco local.");
  return roteiroLocal(e, estilo, rand, proibidos);
}
