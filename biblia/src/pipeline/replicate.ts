/**
 * Replicate: imagens (FLUX) e mapas de profundidade (Depth Anything).
 * Modelos configuráveis por ambiente:
 *   FLUX_MODEL  (padrão black-forest-labs/flux-schnell; use black-forest-labs/flux-dev p/ mais qualidade)
 *   DEPTH_MODEL (padrão cjwbw/depth-anything; alternativa: chenxwh/depth-anything-v2)
 * Modelos oficiais usam /models/{dono}/{nome}/predictions; os da comunidade exigem o id da versão,
 * buscado automaticamente (latest_version). Resultados ficam em cache em data/cache/replicate.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";
import { comTentativas } from "../lib/env.ts";

const API = "https://api.replicate.com/v1";
const CACHE = join(RAIZ, "data/cache/replicate");
export const FLUX_MODEL = () => process.env.FLUX_MODEL ?? "black-forest-labs/flux-schnell";
export const DEPTH_MODEL = () => process.env.DEPTH_MODEL ?? "cjwbw/depth-anything";

/** Estilo fixo do canal: escuro, cinema 35 mm, Rembrandt. Acrescentado a todo prompt. */
export const ESTILO_FLUX =
  "cinematic 35mm film still, Rembrandt lighting, chiaroscuro, deep dark shadows with warm golden highlights, volumetric haze, fine film grain, shallow depth of field, muted desaturated palette, no text, no watermark";

const token = () => {
  const t = process.env.REPLICATE_API_TOKEN;
  if (!t) throw new Error("defina REPLICATE_API_TOKEN — veja biblia/README.md");
  return t;
};
const cab = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

async function criar(modelo: string, input: Record<string, unknown>) {
  const [dono, nome] = modelo.split("/");
  const headers = { ...cab(), Prefer: "wait=60" };
  let r = await fetch(`${API}/models/${dono}/${nome}/predictions`, { method: "POST", headers, body: JSON.stringify({ input }) });
  if (r.status === 404) { // modelo da comunidade: precisa da versão
    const m = await fetch(`${API}/models/${dono}/${nome}`, { headers: cab() });
    if (!m.ok) throw new Error(`Replicate: modelo ${modelo} não encontrado (${m.status})`);
    const versao = ((await m.json()) as any).latest_version?.id;
    r = await fetch(`${API}/predictions`, { method: "POST", headers, body: JSON.stringify({ version: versao, input }) });
  }
  if (!r.ok) throw new Error(`Replicate ${r.status}: ${(await r.text()).slice(0, 300)}`);
  let p: any = await r.json();
  for (let i = 0; i < 120 && !["succeeded", "failed", "canceled"].includes(p.status); i++) {
    await new Promise((res) => setTimeout(res, 1500));
    p = await (await fetch(p.urls.get, { headers: cab() })).json();
  }
  if (p.status !== "succeeded") throw new Error(`Replicate ${modelo}: ${p.status} ${p.error ?? ""}`);
  return p.output;
}

/** A saída pode ser URL, lista de URLs ou objeto {grey_depth, color_depth,...}. */
export function urlDaSaida(out: unknown, preferir: RegExp[] = []): string {
  if (typeof out === "string") return out;
  if (Array.isArray(out)) return urlDaSaida(out[0], preferir);
  if (out && typeof out === "object") {
    const o = out as Record<string, unknown>;
    for (const re of preferir) {
      const k = Object.keys(o).find((x) => re.test(x));
      if (k) return urlDaSaida(o[k]);
    }
    const primeiro = Object.values(o).find((v) => typeof v === "string" && /^https?:/.test(v));
    if (primeiro) return primeiro as string;
  }
  throw new Error("Replicate: saída sem URL de imagem");
}

async function baixar(url: string, destino: string) {
  const r = await comTentativas(async () => {
    const x = await fetch(url);
    if (!x.ok) throw new Error(`download ${x.status}`);
    return x;
  });
  writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
}

const hash = (...p: unknown[]) => createHash("sha1").update(JSON.stringify(p)).digest("hex").slice(0, 14);

export async function gerarImagem(prompt: string, seed: number): Promise<string> {
  mkdirSync(CACHE, { recursive: true });
  const modelo = FLUX_MODEL();
  const arq = join(CACHE, `img-${hash(modelo, prompt, seed)}.png`);
  if (existsSync(arq)) return arq;
  const dev = /flux-dev|flux-1\.1|pro/.test(modelo);
  const out = await comTentativas(() => criar(modelo, {
    prompt: `${prompt}, ${ESTILO_FLUX}`, aspect_ratio: "9:16", num_outputs: 1, seed,
    output_format: "png", output_quality: 95,
    ...(dev ? { num_inference_steps: 28, guidance: 3 } : { num_inference_steps: 4, go_fast: true }),
  }), 2);
  await baixar(urlDaSaida(out), arq);
  return arq;
}

export async function gerarProfundidade(imagemUrlOuArquivo: string, arquivoImagem: string): Promise<string> {
  mkdirSync(CACHE, { recursive: true });
  const modelo = DEPTH_MODEL();
  const arq = join(CACHE, `depth-${hash(modelo, arquivoImagem)}.png`);
  if (existsSync(arq)) return arq;
  const out = await comTentativas(() => criar(modelo, { image: imagemUrlOuArquivo }), 2);
  await baixar(urlDaSaida(out, [/grey|gray/i, /depth/i]), arq);
  return arq;
}

/** Envia a imagem como data URI (o Replicate aceita data URI no campo `image`). */
export async function dataUri(arquivo: string): Promise<string> {
  const { readFileSync } = await import("node:fs");
  return `data:image/png;base64,${readFileSync(arquivo).toString("base64")}`;
}
