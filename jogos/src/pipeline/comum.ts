import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export type Video = { id: string; formato: "diferente"; semente: number; dificuldade: "facil" | "medio" | "dificil" | "extremo"; titulo?: string };

export const lerVideo = (caminho: string): Video => JSON.parse(readFileSync(resolve(caminho), "utf8"));
export const pastaSaida = (v: Video) => { const p = join(RAIZ, "output", v.id); mkdirSync(p, { recursive: true }); return p; };

export function sh(cmd: string, args: string[]) {
  const r = spawnSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`${cmd} falhou:\n${r.stderr?.slice(-2000)}`);
  return r.stdout;
}

/** Trava contra renders simultâneos (ignora travas de processos mortos). */
export function travar(pasta: string) {
  const f = join(pasta, "render.lock");
  if (existsSync(f)) {
    const pid = Number(readFileSync(f, "utf8"));
    let vivo = false;
    try { process.kill(pid, 0); vivo = true; } catch { /* morto */ }
    if (vivo && pid !== process.pid) throw new Error(`já existe um render rodando (pid ${pid})`);
  }
  writeFileSync(f, String(process.pid));
  const solta = () => rmSync(f, { force: true });
  process.on("exit", solta);
  for (const s of ["SIGINT", "SIGTERM"] as const) process.on(s, () => { solta(); process.exit(1); });
}

export const CHROME = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
