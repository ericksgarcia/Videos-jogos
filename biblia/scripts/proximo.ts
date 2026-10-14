/** Mostra a próxima passagem que a engine escolheria (sem gravar nada).  npx tsx scripts/proximo.ts [seed] */
import { loadCatalog, loadHistory } from "../src/lib/catalog.ts";
import { pickNext, prng } from "../src/pipeline/engine.ts";
const { entry, relaxed } = pickNext(loadCatalog(), loadHistory(), { rand: prng(Number(process.argv[2] ?? Date.now() % 1e6)) });
console.log(JSON.stringify({ ...entry, relaxed }, null, 2));
