/**
 * Mede o alinhador com GABARITO: gera o texto com outra voz do Edge (que informa os tempos verdadeiros
 * das palavras), alinha esse áudio usando a referência padrão e compara.
 *   npx tsx scripts/avaliar-alinhador.ts
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { alinhar } from "../src/audio/alinhador.ts";
import { lerWavArquivo } from "../src/audio/wav.ts";
import { loadCatalog, RAIZ } from "../src/lib/catalog.ts";

const dir = join(RAIZ, "data/cache/avaliacao"); mkdirSync(dir, { recursive: true });
const cat = loadCatalog();
const textos = [
  ...["sl-46", "sl-23", "is-41-10", "dn-6-19", "mt-11-28", "ap-21-1"].map((p) => cat.find((e) => e.id.startsWith(p))!.text),
  "Hoje o cerco não tem muralha. É o boleto vencido, o exame que demora, a notícia que você teme abrir. Respire. Você não está sozinho.",
];
const casos = [["pt-BR-FranciscaNeural", "-30%"], ["pt-BR-ThalitaMultilingualNeural", "-20%"], ["pt-BR-AntonioNeural", "-40%"]];
const erros: number[] = [];
for (const t of textos) for (const [voz, taxa] of casos) {
  const base = join(dir, `${voz}-${taxa}-${t.length}-${t.slice(0, 8).replace(/\W/g, "")}`);
  const r = spawnSync("python3", [join(RAIZ, "scripts/ref_edge.py"), t, voz, taxa, base + ".mp3", base + ".json"]);
  if (r.status !== 0) { console.log("falhou", voz, r.stderr.toString().slice(-200)); continue; }
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", base + ".mp3", "-ac", "1", "-ar", "44100", base + ".wav"]);
  const verdade: [string, number, number][] = JSON.parse(readFileSync(base + ".json", "utf8"));
  const pcm = lerWavArquivo(base + ".wav");
  const res = alinhar(t, pcm.data, pcm.sr);
  if (verdade.length !== res.length) { console.log(`(tokens diferentes: ${verdade.length} vs ${res.length}, pulado)`); continue; }
  const e = res.map((w, i) => Math.abs(w.ini - verdade[i][1]));
  erros.push(...e);
  console.log(`${voz.padEnd(32)} ${taxa}  palavras ${String(e.length).padStart(3)}  média ${(e.reduce((a, b) => a + b, 0) / e.length * 1000).toFixed(0)} ms  pior ${(Math.max(...e) * 1000).toFixed(0)} ms`);
}
erros.sort((a, b) => a - b);
const pct = (p: number) => (erros[Math.floor(p * (erros.length - 1))] * 1000).toFixed(0);
console.log(`\nTOTAL ${erros.length} palavras | média ${(erros.reduce((a, b) => a + b, 0) / erros.length * 1000).toFixed(0)} ms | mediana ${pct(0.5)} ms | 90% ${pct(0.9)} ms | 99% ${pct(0.99)} ms | pior ${pct(1)} ms | <100 ms: ${(100 * erros.filter((x) => x < 0.1).length / erros.length).toFixed(0)}%`);
