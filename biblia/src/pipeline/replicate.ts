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
export const ESTILO_FLUX = process.env.FLUX_ESTILO ??
  "cinematic 35mm film still, dramatic volumetric light, rich detail, high dynamic range, deep but readable shadows, warm golden highlights, subtle film grain, epic scale, no people, no text, no watermark";

const token = () => {
  const t = process.env.REPLICATE_API_TOKEN;
  if (!t) throw new Error("defina REPLICATE_API_TOKEN — veja biblia/README.md");
  return t;
};
const cab = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

async function criar(modelo: string, input: Record<string, unknown>) {
  const [dono, nome] = modelo.split("/");
  const headers = { ...cab(), Prefer: "wait=60" };
  // contas com pouco crédito: 6 criações/minuto, uma por vez → respeita o retry_after do 429
  const postar = async (url: string, corpo: unknown) => {
    for (let i = 0; ; i++) {
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(corpo) });
      if (res.status !== 429 || i >= 8) return res;
      const j: any = await res.json().catch(() => ({}));
      await new Promise((ok) => setTimeout(ok, (Number(j.retry_after ?? 10) + 1) * 1000));
    }
  };
  let r = await postar(`${API}/models/${dono}/${nome}/predictions`, { input });
  if (r.status === 404) { // modelo da comunidade: precisa da versão
    const m = await fetch(`${API}/models/${dono}/${nome}`, { headers: cab() });
    if (!m.ok) throw new Error(`Replicate: modelo ${modelo} não encontrado (${m.status})`);
    const versao = ((await m.json()) as any).latest_version?.id;
    r = await postar(`${API}/predictions`, { version: versao, input });
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
  // alguns modelos devolvem o mapa colorido (paleta inferno/magma): a luminância é monótona → vira cinza
  const { spawnSync } = await import("node:child_process");
  const tmp = arq + ".cinza.png";
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", arq, "-vf", "format=gray,gblur=sigma=1.5", tmp]);
  if (r.status === 0) (await import("node:fs")).renameSync(tmp, arq);
  return arq;
}

export const UPSCALE_MODEL = () => process.env.UPSCALE_MODEL ?? "nightmareai/real-esrgan";

/** Amplia a imagem 2× (Real-ESRGAN): 768×1344 → 1536×2688, nitidez para o zoom e o parallax parecerem 4K no vídeo de 1080p. */
export async function ampliar(arquivo: string, escala = 2): Promise<string> {
  mkdirSync(CACHE, { recursive: true });
  const { readFileSync, statSync, renameSync } = await import("node:fs");
  const modelo = UPSCALE_MODEL();
  const arq = join(CACHE, `up-${hash(modelo, escala, createHash("sha1").update(readFileSync(arquivo)).digest("hex"))}.png`);
  if (existsSync(arq)) return arq;
  const out = await comTentativas(async () => criar(modelo, { image: await dataUri(arquivo), scale: escala, face_enhance: false }), 2);
  await baixar(urlDaSaida(out), arq);
  const { spawnSync } = await import("node:child_process");
  const tmp = arq + ".tmp.png";   // garante PNG (alguns modelos devolvem webp/jpg)
  if (spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", arq, tmp]).status === 0) renameSync(tmp, arq);
  if (statSync(arq).size < 1000) throw new Error("ampliação vazia");
  return arq;
}

/** Envia a imagem como data URI (o Replicate aceita data URI no campo `image`). */
export async function dataUri(arquivo: string): Promise<string> {
  const { readFileSync } = await import("node:fs");
  return `data:image/png;base64,${readFileSync(arquivo).toString("base64")}`;
}
