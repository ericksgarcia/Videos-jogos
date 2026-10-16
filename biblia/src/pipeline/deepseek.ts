/**
 * Cliente mínimo do DeepSeek (API compatível com OpenAI). A chave vem de DEEPSEEK_API_KEY (.env, nunca versionado).
 * Modelos (GET /models): "deepseek-flash" (V4.1 Flash, barato e rápido) para 5 dos 7 analistas;
 * "deepseek-v4-pro" para o autor do roteiro e os analistas de FATOS (ato 3 e final). Trocáveis por variável de ambiente.
 */
import { comTentativas } from "../lib/env.ts";

export const MODELOS = {
  autor: () => process.env.DEEPSEEK_MODEL_AUTOR ?? "deepseek-v4-pro",
  analista: () => process.env.DEEPSEEK_MODEL_ANALISTA ?? "deepseek-flash",
  fatos: () => process.env.DEEPSEEK_MODEL_FATOS ?? "deepseek-v4-pro",
};

export interface Uso { prompt: number; saida: number; chamadas: number }
export const uso: Uso = { prompt: 0, saida: 0, chamadas: 0 };

/** pensar: "off" desliga o raciocínio (rápido, ~2 s); "low"/"high" ligam (o raciocínio consome tokens: use maxTokens ≥ 16000). */
export interface Pedido { model: string; system: string; user: string; temperatura?: number; maxTokens?: number; pensar?: "off" | "low" | "high" }

export async function conversar(p: Pedido): Promise<string> {
  const chave = process.env.DEEPSEEK_API_KEY;
  if (!chave) throw new Error("DEEPSEEK_API_KEY ausente (coloque em biblia/.env)");
  const base = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
  return comTentativas(async () => {
    const corpo: Record<string, unknown> = {
      model: p.model, stream: false, max_tokens: p.maxTokens ?? 8000,
      messages: [{ role: "system", content: p.system }, { role: "user", content: p.user }],
    };
    corpo.temperature = p.temperatura ?? 0.7;   // ignorada quando o raciocínio está ligado
    if (p.pensar === "off") corpo.thinking = { type: "disabled" }; else corpo.reasoning_effort = p.pensar ?? "low";
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${chave}` },
      body: JSON.stringify(corpo), signal: AbortSignal.timeout(Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 400_000)),
    });
    if (!r.ok) throw new Error(`DeepSeek ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json() as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
    uso.chamadas++; uso.prompt += j.usage?.prompt_tokens ?? 0; uso.saida += j.usage?.completion_tokens ?? 0;
    const txt = j.choices?.[0]?.message?.content?.trim();
    if (!txt) throw new Error(`DeepSeek devolveu resposta vazia (${(j as { choices?: { finish_reason?: string }[] }).choices?.[0]?.finish_reason}; aumente maxTokens ou desligue o raciocínio)`);
    return txt;
  }, 3, 4000);
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
