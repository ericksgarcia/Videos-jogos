/**
 * Pexels: vídeos de fundo (retrato) para os atos em que cortes no ritmo da música dão mais energia.
 * Chave grátis em pexels.com/api → PEXELS_API_KEY. Licença Pexels: uso comercial livre, sem
 * atribuição obrigatória (não revender o clipe puro; sem sugerir endosso de pessoas retratadas).
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";
import { comTentativas } from "../lib/env.ts";

const CACHE = join(RAIZ, "data/cache/pexels");

export interface ClipePexels { id: number; arquivo: string; duracao: number; autor: string; url: string }

interface VideoApi {
  id: number; duration: number; url: string; width: number; height: number; user: { name: string };
  video_files: { quality: string; file_type: string; width: number; height: number; link: string }[];
}

export async function buscarClipe(consulta: string, usados: Set<number>, minDur: number, indice = 0): Promise<ClipePexels> {
  const chave = process.env.PEXELS_API_KEY;
  if (!chave) throw new Error("defina PEXELS_API_KEY — veja biblia/README.md");
  mkdirSync(CACHE, { recursive: true });
  const u = new URL("https://api.pexels.com/videos/search");
  u.search = new URLSearchParams({ query: consulta, orientation: "portrait", size: "medium", per_page: "20" }).toString();
  const r = await comTentativas(async () => {
    const x = await fetch(u, { headers: { Authorization: chave } });
    if (!x.ok) throw new Error(`Pexels ${x.status}`);
    return x;
  });
  const videos = ((await r.json()) as { videos: VideoApi[] }).videos ?? [];
  const bons = videos.filter((v) => !usados.has(v.id) && v.duration >= minDur && v.height >= v.width);
  const escolhido = bons[indice % Math.max(1, bons.length)] ?? videos.find((v) => !usados.has(v.id)) ?? videos[0];
  if (!escolhido) throw new Error(`Pexels: nada para "${consulta}"`);
  // arquivo mp4 mais próximo de 1080 de largura (sem estourar o peso do render)
  const arquivos = escolhido.video_files.filter((f) => f.file_type === "video/mp4")
    .sort((a, b) => Math.abs(a.width - 1080) - Math.abs(b.width - 1080));
  const f = arquivos[0];
  if (!f) throw new Error(`Pexels: vídeo ${escolhido.id} sem mp4`);
  const destino = join(CACHE, `${escolhido.id}-${createHash("sha1").update(f.link).digest("hex").slice(0, 6)}.mp4`);
  if (!existsSync(destino)) {
    const d = await comTentativas(async () => {
      const x = await fetch(f.link);
      if (!x.ok) throw new Error(`download Pexels ${x.status}`);
      return x;
    });
    writeFileSync(destino, Buffer.from(await d.arrayBuffer()));
  }
  usados.add(escolhido.id);
  return { id: escolhido.id, arquivo: destino, duracao: escolhido.duration, autor: escolhido.user.name, url: escolhido.url };
}
