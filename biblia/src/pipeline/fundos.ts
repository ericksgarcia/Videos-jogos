/**
 * Fundos neutros gerados com FLUX schnell — SEMPRE inéditos.
 *
 *  - o prompt de cada ato é sorteado de um banco de céus × paisagens × luz (sem pessoas nem elementos da
 *    história), com o clima do ato: tensão (ato 1), luz divina (ato 2), esperança (ato 3);
 *  - semente aleatória nova a cada geração;
 *  - controle de qualidade automático (o schnell tem limites): brilho, contraste, nitidez e "faixa preta"
 *    (metade da imagem sem informação). Reprovada → gera outra;
 *  - unicidade: guarda a impressão digital (dHash 64 bits) de toda imagem já usada em
 *    data/fundos-usados.json e recusa qualquer imagem parecida (distância de Hamming < 10 em 128 bits) com uma de
 *    QUALQUER vídeo anterior — e também prompts repetidos.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";
import { gerarImagem } from "./replicate.ts";

const REGISTRO = join(RAIZ, "data/fundos-usados.json");

type Ato = "ato1" | "ato2" | "ato3";
interface Registro { hash: string; prompt: string; seed: number; video: string; ato: Ato; em: string }

const CEUS: Record<Ato, string[]> = {
  ato1: [ // tensão, mas com luz: o schnell faz cenas noturnas escuras demais (o filtro recusava ~50%)
    "a dramatic stormy dusk sky with heavy dark clouds and silver light breaking through",
    "a brooding overcast sky with towering storm clouds and distant faint lightning",
    "a blue-hour sky with drifting clouds and a pale rising moon",
    "a dark dusk sky with swirling wind-blown clouds and a last thin line of red light",
    "a stormy late-afternoon sky with dark clouds and a band of cold light near the horizon",
    "a tense twilight sky with dense layered clouds and shafts of cold silver light",
  ],
  ato2: [
    "majestic golden god rays bursting through parting storm clouds",
    "brilliant beams of heavenly light breaking through a hole in dark clouds",
    "a radiant sunburst behind dramatic clouds with golden light rays fanning out",
    "warm divine light pouring down from the sky through towering clouds",
    "glowing crepuscular rays streaming across a vast sky at golden hour",
    "a luminous opening in the clouds with soft golden light spilling down",
  ],
  ato3: [ // esperança sem sol estourado no meio (é onde fica a legenda)
    "a soft morning sky with warm diffused light, the sun hidden behind gentle clouds",
    "a calm early morning sky in pastel pink and gold, sun just out of frame",
    "a serene overcast morning with soft warm light filtering through thin clouds",
    "a hopeful morning sky with light breaking softly through high clouds, no visible sun",
    "a tranquil sky at first light with delicate high clouds and a warm glow at the top of the frame",
    "a quiet golden-hour sky with gentle haze, the light coming from behind the viewer",
  ],

};
const TERRAS = [
  "over vast desert dunes", "over a rugged mountain range", "over misty rolling hills", "over a calm open sea",
  "over a winding river valley", "over a wide golden wheat field", "over a deep rocky canyon", "over a still mirror-like lake",
  "over tall sea cliffs", "over a wide plain with scattered rocks", "over snow-capped peaks", "over a forest of pines in fog",
];
const FINAL = "vertical 9:16 composition, cinematic landscape photography, epic scale, crisp detailed textures in clouds and terrain, rich detail, natural colors, no people, no animals, no buildings, no text";

/** Prompt inédito: combinação de céu × terra ainda não usada para esse ato. */
export function promptNovo(ato: Ato, rand: () => number, usados: Set<string>): string {
  for (let i = 0; i < 200; i++) {
    const p = `${CEUS[ato][Math.floor(rand() * CEUS[ato].length)]} ${TERRAS[Math.floor(rand() * TERRAS.length)]}, ${FINAL}`;
    if (!usados.has(p)) return p;
  }
  // banco esgotado para este ato: acrescenta uma variação de lente/hora para continuar inédito
  const extra = ["shot from a high vantage point", "low angle view", "panoramic view", "seen through light haze"][Math.floor(rand() * 4)];
  return `${CEUS[ato][Math.floor(rand() * CEUS[ato].length)]} ${TERRAS[Math.floor(rand() * TERRAS.length)]}, ${extra}, ${FINAL}`;
}

/** Cinza reduzido (largura × altura) da imagem, via ffmpeg. */
function cinza(arq: string, w: number, h: number): Uint8Array {
  const r = spawnSync("ffmpeg", ["-loglevel", "error", "-i", arq, "-vf", `scale=${w}:${h}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error("ffmpeg (análise): " + r.stderr?.toString().slice(0, 200));
  return new Uint8Array(r.stdout);
}

/** Impressão digital de 128 bits (hex): dHash horizontal (9×8) + vertical (8×9). Cópias e recortes ficam a < 10 bits. */
export function dhash(arq: string): string {
  const h = cinza(arq, 9, 8), v = cinza(arq, 8, 9);
  let bits = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += h[y * 9 + x] > h[y * 9 + x + 1] ? "1" : "0";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += v[y * 8 + x] > v[(y + 1) * 8 + x] ? "1" : "0";
  return BigInt("0b" + bits).toString(16).padStart(32, "0");
}
export const hamming = (a: string, b: string) => {
  let x = BigInt("0x" + a) ^ BigInt("0x" + b), n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
};

export interface Qualidade { ok: boolean; motivos: string[]; brilho: number; contraste: number; nitidez: number; escuro: number; baixo: number; faixa: number }

/** Checagens objetivas para os limites do schnell. */
export function avaliar(arq: string): Qualidade {
  const W = 216, H = 384, g = cinza(arq, W, H);
  let soma = 0, soma2 = 0, escuros = 0, somaBaixo = 0, somaFaixa = 0, nFaixa = 0;
  g.forEach((v, i) => {
    soma += v; soma2 += v * v; if (v < 14) escuros++; if (i >= (W * H) / 2) somaBaixo += v;
    const y = Math.floor(i / W); if (y >= H * 0.42 && y < H * 0.66) { somaFaixa += v; nFaixa++; }
  });
  const faixa = somaFaixa / nFaixa; // onde fica a legenda: clara demais apaga o texto
  const baixo = somaBaixo / ((W * H) / 2); // a metade de baixo recebe a legenda: não pode ser um bloco preto
  const n = g.length, brilho = soma / n, contraste = Math.sqrt(soma2 / n - brilho * brilho), escuro = escuros / n;
  let lap = 0, lap2 = 0, m = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x, v = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - W] - g[i + W];
    lap += v; lap2 += v * v; m++;
  }
  const nitidez = lap2 / m - (lap / m) ** 2;
  const motivos: string[] = [];
  if (brilho < 38) motivos.push(`escura demais (brilho ${brilho.toFixed(0)})`);
  if (brilho > 200) motivos.push(`estourada (brilho ${brilho.toFixed(0)})`);
  if (contraste < 22) motivos.push(`chapada (contraste ${contraste.toFixed(0)})`);
  if (nitidez < 25) motivos.push(`sem detalhe (nitidez ${nitidez.toFixed(0)})`);
  if (escuro > 0.22) motivos.push(`${Math.round(escuro * 100)}% preto puro`);
  if (baixo < 28) motivos.push(`metade de baixo apagada (${baixo.toFixed(0)})`);
  if (faixa > 170) motivos.push(`faixa da legenda clara demais (${faixa.toFixed(0)})`);
  return { ok: motivos.length === 0, motivos, brilho, contraste, nitidez, escuro, baixo, faixa };
}

export const carregarRegistro = (): Registro[] => (existsSync(REGISTRO) ? JSON.parse(readFileSync(REGISTRO, "utf8")) : []);

/**
 * Gera o fundo de um ato garantindo qualidade mínima e que seja diferente de TODOS os fundos já usados.
 * Grava no registro só quando `confirmar` for chamado (depois do vídeo pronto), para um teste não "gastar" a imagem.
 */
export async function fundoInedito(ato: Ato, video: string, rand: () => number, jaNesteVideo: string[] = []) {
  const reg = carregarRegistro();
  const prompts = new Set(reg.map((r) => r.prompt));
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const prompt = promptNovo(ato, rand, prompts);
    const seed = Math.floor(rand() * 2 ** 31);
    let arq: string;
    try { arq = await gerarImagem(prompt, seed); }
    catch (e) { // falha do serviço (erro interno do Replicate etc.): tenta outra semente, sem perder a rodada
      console.warn(`  ⚠ geração falhou (${(e as Error).message.slice(0, 90)}) — tentando de novo`);
      await new Promise((r) => setTimeout(r, 5000)); continue;
    }
    const q = avaliar(arq), hash = dhash(arq);
    const parecida = [...reg.map((r) => r.hash), ...jaNesteVideo].find((h) => hamming(h, hash) < 10);
    if (q.ok && !parecida) {
      console.log(`  fundo ${ato}: ok (brilho ${q.brilho.toFixed(0)}, contraste ${q.contraste.toFixed(0)}, nitidez ${q.nitidez.toFixed(0)}) — ${prompt.split(",")[0]}`);
      return { arq, faixa: q.faixa, registro: { hash, prompt, seed, video, ato, em: new Date().toISOString() } as Registro };
    }
    console.warn(`  ⚠ fundo ${ato} recusado (${parecida ? "parecido com um já usado" : q.motivos.join(", ")}) — gerando outro`);
    prompts.add(prompt);
  }
  throw new Error(`não consegui um fundo bom e inédito para ${ato} em 10 tentativas`);
}

export function confirmarFundos(novos: Registro[]) {
  writeFileSync(REGISTRO, JSON.stringify([...carregarRegistro(), ...novos], null, 1) + "\n");
}
