/**
 * Gera as imagens de uma especificação data/imagens/<id>.json no Replicate (mesmo gerador do pipeline, cache em data/…)
 * Uso: FLUX_ESTILO="" npx tsx scripts/imagens-json.ts sl-126-5-6 [modelo]   → out/imagens/<id>/<arquivo>.png
 */
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "dotenv/config";
import { gerarImagem } from "../src/pipeline/replicate.ts";

const id = process.argv[2], modelo = process.argv[3];
if (!id) throw new Error("uso: imagens-json.ts <id> [modelo]");
if (modelo) process.env.FLUX_MODEL = modelo;
const spec = JSON.parse(readFileSync(join("data/imagens", `${id}.json`), "utf8"));
const saida = join("out/imagens", id + (modelo ? "-" + modelo.split("/").pop() : ""));
mkdirSync(saida, { recursive: true });
const ordem = [2, 1, 3, 4, 5, 6, 7];   // a imagem 2 é a referência de estilo
for (const n of ordem) {
  const c = spec.cenas.find((x: { ordem: number }) => x.ordem === n);
  const arq = await gerarImagem(`${c.prompt_en}. No text, no letters, no modern objects`, 1260 + n);
  copyFileSync(arq, join(saida, c.arquivo));
  console.log("✔", c.arquivo);
}
