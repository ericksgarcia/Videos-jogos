/**
 * Passe final no FFmpeg: o Remotion renderiza em CRF alto (qualidade) e aqui o arquivo é recodificado
 * em 2 passadas (x264 slow) com o bitrate calculado para caber em MAX_MB (padrão 28 MB), sem
 * mexer no áudio. Granulado de filme comprime mal; a 2 passadas distribui o bitrate onde precisa.
 */
import { spawnSync } from "node:child_process";
import { rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

export function bitrateKbps(duracao: number, maxMb = 28, audioKbps = 160): number {
  const total = (maxMb * 8 * 1024 * 0.94) / duracao;      // kbit/s, com 6% de folga para o contêiner
  return Math.max(1500, Math.floor(total - audioKbps));
}

export function finalizar(bruto: string, final: string, duracao: number, grao = 0): { mb: number; kbps: number } {
  const maxMb = Number(process.env.MAX_MB ?? 28);
  const kbps = Math.min(Number(process.env.VIDEO_KBPS ?? 12000), bitrateKbps(duracao, maxMb));
  const log = join(dirname(final), "x264-2pass");
  // granulado de filme temporal (muda a cada quadro, suave): mais fluido que textura trocada a cada 2 quadros
  const vf = grao > 0 ? ["-vf", `noise=c0s=${grao}:c0f=t+u`] : [];
  const base = ["-y", "-loglevel", "error", "-i", bruto, ...vf, "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.6)}k`, "-bufsize", `${kbps * 2}k`, "-passlogfile", log];
  const p1 = spawnSync("ffmpeg", [...base, "-pass", "1", "-an", "-f", "null", "/dev/null"]);
  if (p1.status !== 0) throw new Error("ffmpeg passada 1: " + p1.stderr?.toString().slice(0, 300));
  const p2 = spawnSync("ffmpeg", [...base, "-pass", "2", "-c:a", "copy", "-movflags", "+faststart", final]);
  if (p2.status !== 0) throw new Error("ffmpeg passada 2: " + p2.stderr?.toString().slice(0, 300));
  for (const f of [`${log}-0.log`, `${log}-0.log.mbtree`]) rmSync(f, { force: true });
  rmSync(bruto, { force: true });
  return { mb: statSync(final).size / 1024 / 1024, kbps };
}
