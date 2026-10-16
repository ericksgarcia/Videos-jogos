/**
 * Cliente mínimo do DeepSeek (API compatível com OpenAI). A chave vem de DEEPSEEK_API_KEY (.env, nunca versionado).
 * Padrão (pedido do dono: o mais barato e o mais rápido): "deepseek-flash" (V4.1 Flash) para TODOS, com o raciocínio
 * desligado (~2 s por chamada). Para mais qualidade: DEEPSEEK_MODEL_AUTOR|ANALISTA|FATOS (ex.: deepseek-v4-pro) e
 * DEEPSEEK_PENSAR=low|high (liga o raciocínio; use limites de tokens maiores).
 */
import "../lib/env.ts";

export class SemSaldo extends Error { constructor() { super("DeepSeek: saldo insuficiente (402). Recarregue em platform.deepseek.com e rode de novo."); } }
let semSaldo = false;

async function comTentativas<T>(fn: () => Promise<T>, vezes: number, base: number): Promise<T> {
  let erro: unknown;
  for (let i = 0; i < vezes; i++) {
    try { return await fn(); } catch (e) {
      if (e instanceof SemSaldo) throw e;   // sem saldo não adianta tentar de novo
      erro = e;
      if (i < vezes - 1) await new Promise((r) => setTimeout(r, base * 2 ** i));
    }
  }
  throw erro;
}

export const MODELOS = {
  autor: () => process.env.DEEPSEEK_MODEL_AUTOR ?? "deepseek-flash",
  analista: () => process.env.DEEPSEEK_MODEL_ANALISTA ?? "deepseek-flash",
  fatos: () => process.env.DEEPSEEK_MODEL_FATOS ?? "deepseek-flash",
};

export interface Uso { prompt: number; saida: number; chamadas: number }
export const uso: Uso = { prompt: 0, saida: 0, chamadas: 0 };

/** pensar: "off" desliga o raciocínio (rápido, ~2 s); "low"/"high" ligam (o raciocínio consome tokens: use maxTokens ≥ 16000). */
export interface Pedido { model: string; system: string; user: string; temperatura?: number; maxTokens?: number; pensar?: "off" | "low" | "high" }

/** Limite de chamadas simultâneas (o DeepSeek reduz a concorrência conforme o saldo: 429 acima disso). */
const LIMITE = Number(process.env.DEEPSEEK_CONCORRENCIA ?? 4);
let ativas = 0;
const fila: (() => void)[] = [];
const pegar = () => new Promise<void>((ok) => { if (ativas < LIMITE) { ativas++; ok(); } else fila.push(() => { ativas++; ok(); }); });
const soltar = () => { ativas--; fila.shift()?.(); };

export async function conversar(p: Pedido): Promise<string> {
  if (semSaldo) throw new SemSaldo();
  await pegar();
  try { return await conversarSemFila(p); } finally { soltar(); }
}

async function conversarSemFila(p: Pedido): Promise<string> {
  const chave = process.env.DEEPSEEK_API_KEY;
  if (!chave) throw new Error("DEEPSEEK_API_KEY ausente (coloque em biblia/.env)");
  const base = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  return comTentativas(async () => {
    const corpo: Record<string, unknown> = {
      model: p.model, stream: false, max_tokens: p.maxTokens ?? 8000,
      messages: [{ role: "system", content: p.system }, { role: "user", content: p.user }],
    };
    corpo.temperature = p.temperatura ?? 0.7;   // ignorada quando o raciocínio está ligado
    const pensar = p.pensar ?? (process.env.DEEPSEEK_PENSAR as Pedido["pensar"]) ?? "off";
    if (pensar === "off") corpo.thinking = { type: "disabled" }; else corpo.reasoning_effort = pensar;
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${chave}` },
      body: JSON.stringify(corpo), signal: AbortSignal.timeout(Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 400_000)),
    });
    if (r.status === 402) { semSaldo = true; throw new SemSaldo(); }
    if (!r.ok) throw new Error(`DeepSeek ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json() as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
    uso.chamadas++; uso.prompt += j.usage?.prompt_tokens ?? 0; uso.saida += j.usage?.completion_tokens ?? 0;
    const txt = j.choices?.[0]?.message?.content?.trim();
    if (!txt) throw new Error(`DeepSeek devolveu resposta vazia (${(j as { choices?: { finish_reason?: string }[] }).choices?.[0]?.finish_reason}; aumente maxTokens ou desligue o raciocínio)`);
    return txt;
  }, 4, 5000);
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
