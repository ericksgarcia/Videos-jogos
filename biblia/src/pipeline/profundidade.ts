/**
 * Mapa de profundidade LOCAL e gratuito para fundos de paisagem (céu em cima, terra embaixo).
 *
 * Como os fundos são paisagens neutras, a geometria é previsível:
 *  1. acha a LINHA DO HORIZONTE em cada coluna: a transição mais forte de "claro em cima → escuro embaixo"
 *     (silhueta de montanha/duna contra o céu), entre 25 % e 88 % da altura; cada coluna presa a ±10 % do
 *     horizonte geral (feixes de luz e lua não viram "montanha") e suavizada entre colunas;
 *  2. céu = longe (0,05 no topo → 0,22 no horizonte), com as nuvens mais brilhantes um pouco à frente;
 *  3. terra = do horizonte (0,35) até a borda de baixo (1,0), em curva — o primeiro plano anda mais;
 *  4. textura: regiões com mais detalhe abaixo do horizonte ganham um pouco de profundidade (relevo);
 *  5. desfoque final para o parallax não "rasgar" bordas.
 * Saída: PNG cinza do mesmo tamanho da imagem (branco = perto), como o shader do ParallaxScene espera.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";

const W = 192, H = 336; // análise em baixa resolução (proporção 9:16 aproximada)

function lerCinza(arq: string): Float32Array {
  const r = spawnSync("ffmpeg", ["-loglevel", "error", "-i", arq, "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("ffmpeg (profundidade): " + r.stderr?.toString().slice(0, 200));
  return Float32Array.from(r.stdout, (v) => v / 255);
}

const mediana = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];

/** Linha do horizonte (em pixels da análise) para cada coluna. */
export function horizonte(g: Float32Array): number[] {
  const desf = new Float32Array(g.length); // desfoque vertical leve para ignorar ruído
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    let s = 0, n = 0;
    for (let d = -3; d <= 3; d++) { const yy = y + d; if (yy >= 0 && yy < H) { s += g[yy * W + x]; n++; } }
    desf[y * W + x] = s / n;
  }
  const y0 = Math.floor(H * 0.25), y1 = Math.floor(H * 0.88), J = 10;
  const bruto: number[] = [];
  for (let x = 0; x < W; x++) {
    let melhor = -1, yb = Math.floor(H * 0.6);
    for (let y = y0; y < y1; y++) {
      let acima = 0, abaixo = 0;
      for (let d = 1; d <= J; d++) { acima += desf[Math.max(0, y - d) * W + x]; abaixo += desf[Math.min(H - 1, y + d) * W + x]; }
      const salto = (acima - abaixo) / J;                    // claro em cima, escuro embaixo
      const pref = 1 - Math.abs(y / H - 0.6) * 0.35;           // leve preferência pelo meio-baixo
      if (salto * pref > melhor) { melhor = salto * pref; yb = y; }
    }
    bruto.push(melhor > 0.04 ? yb : Math.floor(H * 0.62));      // sem silhueta clara: horizonte típico
  }
  // feixes de luz e a lua criam falsos "horizontes" altos em poucas colunas: cada coluna fica a no máximo
  // 10 % da altura do horizonte geral (mediana da imagem), depois mediana larga + média entre vizinhas
  const geral = mediana(bruto), lim = H * 0.1;
  const preso = bruto.map((y) => Math.min(geral + lim, Math.max(geral - lim, y)));
  const med = preso.map((_, x) => mediana(preso.slice(Math.max(0, x - 24), Math.min(W, x + 25))));
  return med.map((_, x) => { const v = med.slice(Math.max(0, x - 8), Math.min(W, x + 9)); return v.reduce((a, b) => a + b, 0) / v.length; });
}

export function calcularProfundidade(g: Float32Array): Float32Array {
  const hz = horizonte(g), d = new Float32Array(W * H);
  // detalhe local (variância 5×5) para dar relevo ao chão
  const det = new Float32Array(W * H);
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    let s = 0, s2 = 0;
    for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) { const v = g[(y + a) * W + x + b]; s += v; s2 += v * v; }
    det[y * W + x] = Math.sqrt(Math.max(0, s2 / 25 - (s / 25) ** 2));
  }
  for (let x = 0; x < W; x++) {
    const h = hz[x];
    for (let y = 0; y < H; y++) {
      const i = y * W + x;
      if (y < h) { // céu
        const u = y / Math.max(1, h);
        d[i] = 0.05 + 0.17 * u + 0.06 * g[i];                // nuvens claras um pouco à frente
      } else {     // terra
        const u = (y - h) / Math.max(1, H - 1 - h);
        d[i] = 0.35 + 0.65 * Math.pow(u, 0.8) + Math.min(0.08, det[i] * 0.6);
      }
    }
  }
  // desfoque (caixa 7×7, 2 passadas)
  let a = d;
  for (let k = 0; k < 2; k++) {
    const b = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let s = 0, n = 0;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < H && xx >= 0 && xx < W) { s += a[yy * W + xx]; n++; }
      }
      b[y * W + x] = s / n;
    }
    a = b;
  }
  return a;
}

/** Gera (com cache) o PNG de profundidade ao lado da imagem. Grátis: tudo local. */
export function profundidadeLocal(imagem: string): string {
  const dir = join(RAIZ, "data/cache/profundidade"); mkdirSync(dir, { recursive: true });
  const h = createHash("sha1").update(imagem).digest("hex").slice(0, 14);
  const saida = join(dir, `depth-${h}.png`);
  if (existsSync(saida)) return saida;
  const d = calcularProfundidade(lerCinza(imagem));
  const pgm = join(dir, `depth-${h}.pgm`);
  const cab = Buffer.from(`P5\n${W} ${H}\n255\n`, "ascii");
  writeFileSync(pgm, Buffer.concat([cab, Buffer.from(Uint8Array.from(d, (v) => Math.round(Math.min(1, Math.max(0, v)) * 255)))]));
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", pgm, "-vf", "scale=768:1344:flags=bicubic,gblur=sigma=4,format=gray", saida]);
  if (r.status !== 0) throw new Error("ffmpeg (profundidade png): " + r.stderr?.toString().slice(0, 200));
  return saida;
}
