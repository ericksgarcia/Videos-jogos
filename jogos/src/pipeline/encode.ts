import { statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sh } from "./comum";

const LIMITE = 28 * 1024 * 1024;

/** Junta os blocos, põe o áudio e codifica: CRF 20; se passar de 28 MB, refaz em 2 passadas. */
export function encodar(pasta: string, blocos: string[], wav: string, saida: string) {
  const lista = join(pasta, "blocos.txt");
  writeFileSync(lista, blocos.map((b) => `file '${b}'`).join("\n"));
  const unido = join(pasta, "unido.mp4");
  sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", unido]);
  const comum = ["-y", "-i", unido, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart"];
  sh("ffmpeg", [...comum, "-crf", "20", saida]);
  let tam = statSync(saida).size;
  if (tam > LIMITE) {
    const dur = Number(sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", unido]).trim());
    const kbps = Math.floor(((LIMITE * 0.93 * 8) / dur - 160000) / 1000);
    const log = join(pasta, "x264pass");
    sh("ffmpeg", ["-y", "-i", unido, "-an", "-c:v", "libx264", "-preset", "slow", "-b:v", `${kbps}k`, "-pass", "1", "-passlogfile", log, "-f", "null", "/dev/null"]);
    sh("ffmpeg", [...comum, "-b:v", `${kbps}k`, "-pass", "2", "-passlogfile", log, saida]);
    tam = statSync(saida).size;
  }
  console.log(`${saida}: ${(tam / 1048576).toFixed(1)} MB`);
  if (tam > LIMITE) throw new Error("passou de 28 MB");
  return saida;
}
