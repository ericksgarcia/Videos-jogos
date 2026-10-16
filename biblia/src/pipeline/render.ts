/**
 * Render RETOMÁVEL: o vídeo é desenhado em blocos de BLOCO_S segundos (só imagem, sem áudio), cada um gravado em
 * out/<id>/blocos/. Se o container for reiniciado no meio (acontece em sessões na nuvem quando ficam ociosas), rodar de
 * novo com --reusar pula os blocos prontos e continua do último. No fim os blocos são unidos e o áudio da mixagem entra.
 * Mudar o plano apaga os blocos (assinatura do plano).
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";
import { FPS } from "../lib/plan.ts";

const BLOCO_S = Number(process.env.BLOCO_S ?? 8);

export function renderEmBlocos(planoArq: string, bruto: string, mixArq: string, duracao: number) {
  const dir = join(dirname(bruto), "blocos");
  mkdirSync(dir, { recursive: true });
  // trava: duas execuções ao mesmo tempo gravavam o mesmo bloco e o encode final lia arquivo pela metade
  const trava = join(dir, ".trava");
  if (existsSync(trava)) { const pid = Number(readFileSync(trava, "utf8")); let vivo = false; try { process.kill(pid, 0); vivo = pid !== process.pid; } catch { /* morto */ } if (vivo) throw new Error(`já existe um render deste vídeo em andamento (pid ${pid}); aguarde ou encerre-o`); }
  writeFileSync(trava, String(process.pid));
  process.on("exit", () => rmSync(trava, { force: true }));
  const assinatura = createHash("sha1").update(readFileSync(planoArq)).digest("hex");
  const arqAss = join(dir, "plano.sha");
  if (!existsSync(arqAss) || readFileSync(arqAss, "utf8") !== assinatura) {
    for (const f of readdirSync(dir)) rmSync(join(dir, f), { force: true });
    writeFileSync(arqAss, assinatura);
  }
  const total = Math.round(duracao * FPS), porBloco = Math.round(BLOCO_S * FPS);
  const lista: string[] = [];
  for (let ini = 0, k = 0; ini < total; ini += porBloco, k++) {
    const fim = Math.min(total, ini + porBloco) - 1;
    const arq = join(dir, `b${String(k).padStart(3, "0")}.mp4`), ok = `${arq}.ok`;
    lista.push(arq);
    if (existsSync(ok)) { console.log(`  bloco ${k} (${ini}-${fim}) já pronto — pulando`); continue; }
    rmSync(arq, { force: true });
    console.log(`  bloco ${k}: quadros ${ini}-${fim}`);
    const r = spawnSync("npx", ["remotion", "render", "src/remotion/index.ts", "Verso", arq, `--props=${planoArq}`, "--codec=h264", "--crf=20", "--muted", `--frames=${ini}-${fim}`], { cwd: RAIZ, stdio: "inherit" });
    if (r.status !== 0) throw new Error(`render do bloco ${k} falhou`);
    writeFileSync(ok, "ok");
  }
  const txt = join(dir, "lista.txt");
  writeFileSync(txt, lista.map((f) => `file '${f}'`).join("\n"));
  const j = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", txt, "-i", mixArq, "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-af", "apad", "-t", String(total / FPS), bruto]);
  if (j.status !== 0) throw new Error("ffmpeg (unir blocos + áudio): " + j.stderr?.toString().slice(0, 300));
}
