/** Mídia sintética (ffmpeg) para testar a esteira sem chaves de API. NUNCA usada em produção. */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";

const CACHE = join(RAIZ, "data/cache/offline");

function ff(args: string[]) {
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
  if (r.status !== 0) throw new Error("ffmpeg: " + r.stderr?.toString().slice(0, 300));
}

const PALETAS: [string, string][] = [["0x1b1208", "0xc98a3a"], ["0x0a1220", "0x5b7fa6"], ["0x180a0a", "0xb24a2c"], ["0x0b1510", "0x6a8f5d"]];

/** Cena "pintada": degradê radial + névoa de ruído; profundidade: centro perto, bordas longe. */
export function imagemFalsa(seed: number): { imagem: string; profundidade: string } {
  mkdirSync(CACHE, { recursive: true });
  const [a, b] = PALETAS[seed % PALETAS.length];
  const imagem = join(CACHE, `img-${seed}.png`), prof = join(CACHE, `depth-${seed}.png`);
  if (!existsSync(imagem)) ff(["-f", "lavfi", "-i", `gradients=s=1080x1920:c0=${a}:c1=${b}:x0=540:y0=1100:x1=540:y1=200:type=radial:seed=${seed}`,
    "-vf", "noise=alls=18:allf=t,gblur=sigma=3", "-frames:v", "1", imagem]);
  if (!existsSync(prof)) ff(["-f", "lavfi", "-i", "gradients=s=1080x1920:c0=white:c1=black:x0=540:y0=1000:x1=540:y1=100:type=radial", "-vf", "format=gray", "-frames:v", "1", prof]);
  return { imagem, profundidade: prof };
}

export function videoFalso(seed: number, seg: number): string {
  mkdirSync(CACHE, { recursive: true });
  const [a, b] = PALETAS[seed % PALETAS.length];
  const arq = join(CACHE, `vid-${seed}.mp4`);
  if (!existsSync(arq)) ff(["-f", "lavfi", "-i", `gradients=s=540x960:c0=${a}:c1=${b}:speed=0.08:d=${seg}:rate=30:seed=${seed}`,
    "-vf", "noise=alls=12:allf=t", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "34", arq]);
  return arq;
}
