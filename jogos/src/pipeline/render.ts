import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { CHROME, RAIZ, pastaSaida, sh, travar, type Video } from "./comum";
import { verificarVideo } from "./verificar";
import { mixar, escreverWav } from "../audio/mix";
import { eventosDiferente } from "../jogos/diferente/sons";
import { FPS, T } from "../jogos/diferente/tempos";
import { encodar } from "./encode";

const BLOCO = 8 * FPS; // ~8 s

async function preparar(v: Video) {
  const desafio = verificarVideo(v);
  const serveUrl = await bundle({ entryPoint: join(RAIZ, "src/index.ts"), onProgress: () => {} });
  const chromiumOptions = { gl: (process.env.REMOTION_GL ?? "swangle") as "swangle" };
  const inputProps = { semente: v.semente, dificuldade: v.dificuldade };
  const comp = await selectComposition({ serveUrl, id: v.formato, inputProps, browserExecutable: CHROME, chromiumOptions });
  return { desafio, serveUrl, chromiumOptions, inputProps, comp };
}

/** Fotos de momentos-chave + folha de contatos, para revisar antes do render final. */
export async function previa(v: Video) {
  const pasta = pastaSaida(v), dir = join(pasta, "previa");
  mkdirSync(dir, { recursive: true });
  const { serveUrl, chromiumOptions, inputProps, comp } = await preparar(v);
  const momentos = [0, 1.9, 2.5, 3.2, 6, 11.5, 12.8, 13.3, 14.0, 14.8, 17, 18.5, 19.4, 19.99];
  const arquivos: string[] = [];
  for (const s of momentos) {
    const f = join(dir, `f${s.toFixed(2).padStart(5, "0")}.png`);
    await renderStill({ composition: comp, serveUrl, output: f, frame: Math.min(Math.round(s * FPS), comp.durationInFrames - 1), inputProps, browserExecutable: CHROME, chromiumOptions });
    arquivos.push(f);
  }
  for (let k = 0; k < arquivos.length; k += 7) {
    const grupo = arquivos.slice(k, k + 7);
    const entradas = grupo.flatMap((f) => ["-i", f]);
    const fc = grupo.map((_, i) => `[${i}:v]scale=360:-1[s${i}]`).join(";") + ";" + grupo.map((_, i) => `[s${i}]`).join("") + `hstack=inputs=${grupo.length}[o]`;
    sh("ffmpeg", ["-y", ...entradas, "-filter_complex", fc, "-map", "[o]", "-frames:v", "1", join(dir, `folha-${k / 7 + 1}.jpg`)]);
  }
  return dir;
}

export async function render(v: Video) {
  const pasta = pastaSaida(v);
  travar(pasta);
  const { desafio, serveUrl, chromiumOptions, inputProps, comp } = await preparar(v);
  console.log(`desafio: ${desafio.variacao}/${v.dificuldade}, resposta ${desafio.indiceCorreto}`);
  const blocos = join(pasta, "blocos");
  mkdirSync(blocos, { recursive: true });
  const total = comp.durationInFrames, lista: string[] = [];
  for (let ini = 0, k = 0; ini < total; ini += BLOCO, k++) {
    const fim = Math.min(ini + BLOCO, total) - 1;
    const nome = join(blocos, `b${String(k).padStart(2, "0")}.mp4`);
    lista.push(nome);
    if (existsSync(nome + ".ok")) { console.log(`bloco ${k} pronto (pulando)`); continue; }
    await renderMedia({
      composition: comp, serveUrl, codec: "h264", crf: 14, pixelFormat: "yuv420p", outputLocation: nome,
      frameRange: [ini, fim], inputProps, browserExecutable: CHROME, chromiumOptions,
      concurrency: Number(process.env.REMOTION_CONCURRENCY ?? 4), logLevel: "error",
      onProgress: ({ progress }) => process.stdout.write(`\rbloco ${k} ${(progress * 100).toFixed(0)}%   `),
    });
    writeFileSync(nome + ".ok", "");
    console.log(`\rbloco ${k} ok            `);
  }
  const wav = join(pasta, "audio.wav");
  escreverWav(wav, mixar(eventosDiferente(), T.total));
  return encodar(pasta, lista, wav, join(pasta, `${v.id}.mp4`));
}
