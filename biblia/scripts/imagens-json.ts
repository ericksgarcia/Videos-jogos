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
const dirImg = join("data/imagens", id, "img"); mkdirSync(dirImg, { recursive: true });
for (let n = 1; n <= spec.cenas.length; n++) {
  const c = spec.cenas[n - 1]; const nome = c.arquivo ?? c.arquivo_de_saida;
  const arq = await gerarImagem(`${c.prompt_en}. No text, no letters, no modern objects`, 1260 + n);
  copyFileSync(arq, join(saida, nome)); copyFileSync(arq, join(dirImg, nome));
  console.log("✔", nome);
}
