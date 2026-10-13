/**
 * Texturas das camadas fixas (fumaça e granulado), geradas uma vez com ffmpeg em public/overlays.
 * Motivo: filtros SVG feTurbulence por quadro custavam ~2 s/quadro no renderizador por software;
 * como imagens pré-geradas (só deslocadas/misturadas) o custo some.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";

export const GRAOS = 6;
const DIR = join(RAIZ, "public/overlays");

function ff(args: string[]) {
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
  if (r.status !== 0) throw new Error("ffmpeg (overlays): " + (r.stderr?.toString() ?? r.error?.message ?? "não encontrado").slice(0, 300));
}

export function prepararOverlays() {
  mkdirSync(DIR, { recursive: true });
  for (let i = 0; i < GRAOS; i++) {
    const f = join(DIR, `grao-${i}.jpg`); // 720p ampliado: grão mais macio (filme) e muito mais leve de codificar
    if (!existsSync(f)) ff(["-f", "lavfi", "-i", `color=c=gray:s=720x1280,noise=alls=100:allf=u:all_seed=${11 + i * 7},format=gray`, "-vf", "scale=1080:1920:flags=bicubic,eq=contrast=1.6", "-frames:v", "1", "-q:v", "4", f]);
  }
  const fumaca = (nome: string, a: string, b: string) => {
    const f = join(DIR, nome);
    if (existsSync(f)) return;
    ff(["-f", "lavfi", "-i", `color=c=gray:s=${a},noise=alls=100:allf=u,format=gray`, "-f", "lavfi", "-i", `color=c=gray:s=${b},noise=alls=100:allf=u,format=gray`,
      "-filter_complex", "[0]scale=1620:1920:flags=bicubic[a];[1]scale=1620:1920:flags=bicubic[b];[a][b]blend=all_expr='A*0.7+B*0.3',gblur=sigma=45,eq=contrast=2.2:brightness=-0.22,format=rgb24,colorchannelmixer=rr=0.95:gg=0.85:bb=0.7",
      "-frames:v", "1", f]);
  };
  fumaca("fumaca-a.png", "9x12", "24x30");
  fumaca("fumaca-b.png", "11x10", "28x26");
}
