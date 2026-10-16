/**
 * Cliente de texto (Gemini). A credencial é injetada pelo proxy do ambiente (ou GEMINI_API_KEY no .env, nunca versionado).
 * Padrão = o modelo mais barato que aceita raciocínio desligado: "gemini-3.1-flash-lite". Raciocínio DESLIGADO por padrão
 * (ele é cobrado como saída e foi o que consumiu o saldo do DeepSeek). Trocáveis: LLM_MODEL_AUTOR|ANALISTA|FATOS, LLM_PENSAR=low|high.
 * Trava de custo: cada processo para ao passar de LLM_MAX_TOKENS tokens (entrada+saída; padrão 400 mil).
 */
import "../lib/env.ts";

export const MODELOS = {
  autor: () => process.env.LLM_MODEL_AUTOR ?? "gemini-3.1-flash-lite",
  analista: () => process.env.LLM_MODEL_ANALISTA ?? "gemini-3.1-flash-lite",
  fatos: () => process.env.LLM_MODEL_FATOS ?? "gemini-3.1-flash-lite",
};

export interface Uso { prompt: number; saida: number; chamadas: number }
export const uso: Uso = { prompt: 0, saida: 0, chamadas: 0 };
export class LimiteDeTokens extends Error { constructor(m: string) { super(m); } }

/** pensar: "off" = sem raciocínio (barato e rápido); "low"/"high" = orçamento de 1024/4096 tokens de raciocínio. */
export interface Pedido { model: string; system: string; user: string; temperatura?: number; maxTokens?: number; pensar?: "off" | "low" | "high" }

const LIMITE = Number(process.env.LLM_CONCORRENCIA ?? 4);
let ativas = 0;
const fila: (() => void)[] = [];
const pegar = () => new Promise<void>((ok) => { if (ativas < LIMITE) { ativas++; ok(); } else fila.push(() => { ativas++; ok(); }); });
const soltar = () => { ativas--; fila.shift()?.(); };

export async function conversar(p: Pedido): Promise<string> {
  const teto = Number(process.env.LLM_MAX_TOKENS ?? 400_000);
  if (uso.prompt + uso.saida > teto) throw new LimiteDeTokens(`trava de custo: ${uso.prompt + uso.saida} tokens gastos neste processo (limite ${teto}; mude com LLM_MAX_TOKENS)`);
  await pegar();
  try {
    let erro: unknown;
    for (let i = 0; i < 3; i++) {
      try { return await uma(p); } catch (e) { erro = e; if (e instanceof LimiteDeTokens) throw e; await new Promise((r) => setTimeout(r, 2000 * 2 ** i)); }
    }
    throw erro;
  } finally { soltar(); }
}

async function uma(p: Pedido): Promise<string> {
  const pensar = p.pensar ?? (process.env.LLM_PENSAR as Pedido["pensar"]) ?? "off";
  const corpo = {
    systemInstruction: { parts: [{ text: p.system }] },
    contents: [{ role: "user", parts: [{ text: p.user }] }],
    generationConfig: { temperature: p.temperatura ?? 0.7, maxOutputTokens: p.maxTokens ?? 4000, thinkingConfig: { thinkingBudget: pensar === "off" ? 0 : pensar === "low" ? 1024 : 4096 } },
  };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${p.model}:generateContent`, {
    method: "POST", headers: { "content-type": "application/json", ...(process.env.GEMINI_API_KEY ? { "x-goog-api-key": process.env.GEMINI_API_KEY } : {}) },
    body: JSON.stringify(corpo), signal: AbortSignal.timeout(Number(process.env.LLM_TIMEOUT_MS ?? 120_000)),
  });
  if (!r.ok) throw new Error(`LLM ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json() as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[]; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number } };
  uso.chamadas++; uso.prompt += j.usageMetadata?.promptTokenCount ?? 0; uso.saida += (j.usageMetadata?.candidatesTokenCount ?? 0) + (j.usageMetadata?.thoughtsTokenCount ?? 0);
  const txt = (j.candidates?.[0]?.content?.parts ?? []).filter((x) => !x.thought).map((x) => x.text ?? "").join("").trim();
  if (!txt) throw new Error(`LLM devolveu resposta vazia (${j.candidates?.[0]?.finishReason})`);
  return txt;
}

/** Extrai o primeiro objeto JSON (equilibrando chaves, ignorando cercas ``` e texto em volta). */
export function extrairJson<T = Record<string, unknown>>(texto: string): T {
  const s = texto.replace(/```(?:json)?/gi, "");
  const ini = s.indexOf("{");
  if (ini < 0) throw new Error("sem JSON na resposta: " + texto.slice(0, 200));
  let nivel = 0, dentro = false, esc = false;
  for (let i = ini; i < s.length; i++) {
    const c = s[i];
    if (dentro) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') dentro = false; continue; }
    if (c === '"') dentro = true;
    else if (c === "{") nivel++;
    else if (c === "}" && --nivel === 0) return JSON.parse(s.slice(ini, i + 1)) as T;
  }
  throw new Error("JSON incompleto na resposta: " + texto.slice(0, 200));
}
