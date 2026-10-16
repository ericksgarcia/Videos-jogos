/**
 * Um comando faz o vídeo inteiro com o DeepSeek:
 *   npx tsx scripts/novo-video.ts [--seed N] [--ref id] [--fase roteiro|plano|tudo]
 * 1) escolhe a passagem (engine, sem repetir), 2) autor + 7 analistas escrevem e aprovam o roteiro (todas as fases ≥ 8),
 * 3) grava data/roteiros/<id>.json, 4) roda a esteira (voz, imagens, plano) e, em "tudo", o render + histórico.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import "../src/lib/env.ts";
import { RAIZ, loadCatalog, loadHistory } from "../src/lib/catalog.ts";
import { pickNext, prng } from "../src/pipeline/engine.ts";
import { criarRoteiro } from "../src/pipeline/autor.ts";
import { uso } from "../src/pipeline/deepseek.ts";

const arg = (n: string) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const seed = Number(arg("seed") ?? Date.now() % 1e6), fase = arg("fase") ?? "tudo";

const catalogo = loadCatalog();
const entrada = arg("ref") ? catalogo.find((e) => e.id === arg("ref")) : pickNext(catalogo, loadHistory(), { rand: prng(seed) }).entry;
if (!entrada) throw new Error(`passagem não encontrada: ${arg("ref")}`);
const arq = join(RAIZ, "data/roteiros", `${entrada.id}.json`);
console.log(`▶ ${entrada.reference} (${entrada.id}) | ${entrada.emotional_hook} | ${entrada.tone}`);

if (!existsSync(arq) || process.argv.includes("--refazer")) {
  // ganchos recentes: para o autor não repetir ângulo nem estrutura
  const dir = join(RAIZ, "data/roteiros");
  const recentes = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t).slice(0, 14).map(({ f }) => { try { return String(JSON.parse(readFileSync(join(dir, f), "utf8")).ato1 ?? "").split(/(?<=[.!?…])\s/)[0]; } catch { return ""; } }).filter(Boolean);
  const r = await criarRoteiro({ reference: entrada.reference, text: entrada.text, historical_context: entrada.historical_context, emotional_hook: entrada.emotional_hook, tone: entrada.tone }, recentes);
  const { roteiro, notas, rodadas } = r;
  writeFileSync(arq, JSON.stringify({
    ato1: roteiro.ato1, cta: roteiro.cta, cta_tela: "Comente: AMÉM", versiculo: roteiro.versiculo, climax: roteiro.climax, ato3: roteiro.ato3,
    loop: true, cta_style: "amem", auditoria: roteiro.auditoria, revisao: { ...notas, rodadas },
    descricao_tiktok: roteiro.descricao_tiktok, hashtags: roteiro.hashtags,
  }, null, 2));
  console.log(`✔ roteiro aprovado em ${rodadas} rodada(s) → ${arq}\n  DeepSeek: ${uso.chamadas} chamadas, ${uso.prompt} tokens de entrada, ${uso.saida} de saída`);
} else console.log(`roteiro já existe (${arq}); use --refazer para reescrever`);

if (fase === "roteiro") process.exit(0);
const args = ["tsx", "src/pipeline/run.ts", "--ref", entrada.id, "--roteiro", arq, "--visual", "replicate", "--seed", String(seed), ...(fase === "plano" ? ["--no-render", "--no-history"] : [])];
const r = spawnSync("npx", args, { cwd: RAIZ, stdio: "inherit", env: { ...process.env, TTS_TENTATIVAS: process.env.TTS_TENTATIVAS ?? "12" } });
process.exit(r.status ?? 1);
