/**
 * Monta data/catalog.json a partir de data/seeds/*.txt.
 * O TEXTO bíblico vem de um JSON de Bíblia (padrão: Almeida Revista e Corrigida, base de 1898 em
 * domínio público) — nunca da memória do modelo.
 * Cada semente dá o intervalo MÁXIMO; versículos são cortados do fim até o trecho caber
 * em MAX_PALAVRAS (a leitura solene do Ato 2 dura ~19 s: 44 palavras a ~2,3 palavras/s).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AudioCue, CatalogEntry, Hook, Tone } from "../src/lib/types.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
// Versão do texto (arquivo em github.com/thiagobodruk/bible, licença MIT para o código). Padrão: Almeida Revista e
// Corrigida (pt_arc), cuja base de 1898 é domínio público. Trocar por NVI/ARA/NAA etc. exige conferir a licença da editora.
const VERSAO = process.env.BIBLIA_VERSAO ?? "pt_arc";
const FONTE = `https://raw.githubusercontent.com/thiagobodruk/bible/master/json/${VERSAO}.json`;
const CACHE = join(RAIZ, `data/raw/${VERSAO}.json`);
const MAX_PALAVRAS = 44;
const MIN_PALAVRAS = 8;

const LIVROS: Record<string, [string, "AT" | "NT"]> = {
  sl: ["Salmos", "AT"], pv: ["Provérbios", "AT"], is: ["Isaías", "AT"], jr: ["Jeremias", "AT"],
  lm: ["Lamentações", "AT"], ez: ["Ezequiel", "AT"], dn: ["Daniel", "AT"],
  mt: ["Mateus", "NT"], mc: ["Marcos", "NT"], lc: ["Lucas", "NT"], jo: ["João", "NT"],
  ap: ["Apocalipse", "NT"], rm: ["Romanos", "NT"], "2co": ["2 Coríntios", "NT"],
  fp: ["Filipenses", "NT"], "2tm": ["2 Timóteo", "NT"], hb: ["Hebreus", "NT"],
  tg: ["Tiago", "NT"], "1pe": ["1 Pedro", "NT"], "1jo": ["1 João", "NT"],
};
const HOOKS: Hook[] = ["medo","traição","superação","injustiça","proteção","ansiedade","luto","culpa","solidão","esperança","gratidão","perdão","cansaço","provisão","dúvida","orgulho","sabedoria","chamado","juízo","coragem","paz"];
const CUES: AudioCue[] = ["trovão","vento","caverna","fogo","chuva","deserto","tempestade","fogueira","mar","noite","multidão","batalha","silêncio","montanha"];

async function carregarBiblia(): Promise<{ abbrev: string; chapters: string[][] }[]> {
  if (!existsSync(CACHE)) {
    mkdirSync(dirname(CACHE), { recursive: true });
    const r = await fetch(FONTE);
    if (!r.ok) throw new Error(`Falha ao baixar a Bíblia: ${r.status}`);
    writeFileSync(CACHE, Buffer.from(await r.arrayBuffer()));
  }
  return JSON.parse(readFileSync(CACHE, "utf8").replace(/^﻿/, ""));
}

const limpar = (v: string) => v.replace(/\{[^}]*\}/g, "").replace(/\s+/g, " ").trim();
const contar = (t: string) => t.split(/\s+/).filter(Boolean).length;

async function main() {
  const biblia = await carregarBiblia();
  const porLivro = new Map(biblia.map((b) => [b.abbrev, b.chapters]));
  const entradas: CatalogEntry[] = [];
  const avisos: string[] = [];
  const vistos = new Set<string>();

  const dir = join(RAIZ, "data/seeds");
  for (const arq of readdirSync(dir).filter((f) => f.endsWith(".txt")).sort()) {
    readFileSync(join(dir, arq), "utf8").split("\n").forEach((linha, i) => {
      if (!linha.trim() || linha.startsWith("#")) return;
      const onde = `${arq}:${i + 1}`;
      const [ref, gancho, tom, sinais, ...ctx] = linha.split("|").map((s) => s.trim());
      const m = ref?.match(/^(\S+)\s+(\d+):(\d+)(?:-(\d+))?$/);
      if (!m || !LIVROS[m[1]]) return void avisos.push(`${onde}: referência inválida "${ref}"`);
      const [, cod, capS, v1S, v2S] = m;
      const cap = Number(capS), v1 = Number(v1S);
      let v2 = Number(v2S ?? v1S);
      const versos = porLivro.get(cod)?.[cap - 1];
      if (!versos) return void avisos.push(`${onde}: capítulo inexistente ${ref}`);
      if (v1 > versos.length) return void avisos.push(`${onde}: versículo inexistente ${ref}`);
      v2 = Math.min(v2, versos.length);
      if (!HOOKS.includes(gancho as Hook)) avisos.push(`${onde}: gancho fora do vocabulário "${gancho}"`);
      if (tom !== "epic" && tom !== "comfort") avisos.push(`${onde}: tom inválido "${tom}"`);
      const cues = sinais.split(",").map((s) => s.trim()).filter(Boolean) as AudioCue[];
      for (const c of cues) if (!CUES.includes(c)) avisos.push(`${onde}: sinal de áudio fora do vocabulário "${c}"`);

      const texto = (a: number, b: number) => versos.slice(a - 1, b).map(limpar).join(" ");
      while (v2 > v1 && contar(texto(v1, v2)) > MAX_PALAVRAS) v2--;
      const t = texto(v1, v2);
      if (contar(t) > MAX_PALAVRAS + 8 || contar(t) < MIN_PALAVRAS) {
        return void avisos.push(`${onde}: ${ref} tem ${contar(t)} palavras (fora de ${MIN_PALAVRAS}-${MAX_PALAVRAS + 8}) — descartado`);
      }
      const [nome, test] = LIVROS[cod];
      const faixa = v2 > v1 ? `${v1}-${v2}` : `${v1}`;
      const id = `${cod}-${cap}-${v1}${v2 > v1 ? "-" + v2 : ""}`;
      if (vistos.has(id)) return void avisos.push(`${onde}: duplicado ${id}`);
      vistos.add(id);
      entradas.push({
        id, book: cod, bookName: nome, testament: test, reference: `${nome} ${cap}:${faixa}`,
        text: t, words: contar(t), historical_context: ctx.join("|").trim(),
        emotional_hook: gancho as Hook, tone: tom as Tone, audio_cues: cues,
      });
    });
  }

  writeFileSync(join(RAIZ, "data/catalog.json"), JSON.stringify(entradas, null, 1) + "\n");
  const salmos = new Set(entradas.filter((e) => e.book === "sl").map((e) => e.id.split("-")[1]));
  const faltam = Array.from({ length: 150 }, (_, i) => String(i + 1)).filter((n) => !salmos.has(n));
  console.log(`catálogo: ${entradas.length} trechos; salmos cobertos: ${salmos.size}/150`);
  if (faltam.length) avisos.push(`salmos sem trecho válido: ${faltam.join(", ")}`);
  const porGancho: Record<string, number> = {};
  for (const e of entradas) porGancho[e.emotional_hook] = (porGancho[e.emotional_hook] ?? 0) + 1;
  console.log("por gancho:", porGancho);
  console.log("por tom:", { epic: entradas.filter((e) => e.tone === "epic").length, comfort: entradas.filter((e) => e.tone === "comfort").length });
  if (avisos.length) { console.warn(`\n${avisos.length} aviso(s):\n` + avisos.join("\n")); process.exitCode = 1; }
}
main();
