/**
 * Alinhador de legendas GRATUITO (sem Gemini, sem serviço pago).
 *
 * Técnica clássica de alinhamento forçado por síntese:
 *  1. gera o MESMO texto com a voz grátis do Edge TTS, que informa o instante exato de cada palavra;
 *  2. extrai MFCC + deltas (com normalização por locução) das duas gravações;
 *  3. casa as duas quadro a quadro com DTW (programação dinâmica) — fonemas iguais se encontram,
 *     mesmo com vozes, ritmos e pausas diferentes;
 *  4. leva cada fronteira de palavra da referência para o áudio real pelo caminho do DTW;
 *  5. refina: cada início "gruda" no ataque de energia mais próximo (±90 ms) e os fins param
 *     no começo da pausa seguinte.
 * Precisão medida em scripts/avaliar-alinhador.ts.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";
import { escreverWavMono, lerWavArquivo, SR } from "./wav.ts";

export interface PalavraTempo { texto: string; ini: number; fim: number }

const FS = 16000, JAN = 400, PASSO = 160, NFFT = 512, NMEL = 26, NCEP = 13;
const QPS = FS / PASSO; // quadros por segundo (100)
const cache = () => process.env.BIBLIA_ALINHADOR_CACHE ?? join(RAIZ, "data/cache/alinhador");
const python = () => process.env.PYTHON ?? "python3";

// ───────────── áudio ─────────────
function para16k(audio: Float32Array, sr = SR): Float32Array {
  const tmp = join(cache(), `r-${process.pid}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(cache(), { recursive: true });
  escreverWavMono(tmp + ".a.wav", audio, sr);
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp + ".a.wav", "-ac", "1", "-ar", String(FS), tmp + ".b.wav"]);
  if (r.status !== 0) throw new Error("ffmpeg: " + r.stderr?.toString().slice(0, 200));
  const out = lerWavArquivo(tmp + ".b.wav").data;
  rmSync(tmp + ".a.wav", { force: true }); rmSync(tmp + ".b.wav", { force: true });
  return out;
}

function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, ai = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k + len / 2] = re[i + k] - ar; im[i + k + len / 2] = im[i + k] - ai;
        re[i + k] += ar; im[i + k] += ai;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}

let filtrosMel: Float64Array[] | null = null;
function bancoMel(): Float64Array[] {
  if (filtrosMel) return filtrosMel;
  const mel = (f: number) => 2595 * Math.log10(1 + f / 700), inv = (m: number) => 700 * (10 ** (m / 2595) - 1);
  const pts = Array.from({ length: NMEL + 2 }, (_, i) => inv(mel(80) + ((mel(7600) - mel(80)) * i) / (NMEL + 1)));
  const bins = pts.map((f) => Math.floor(((NFFT + 1) * f) / FS));
  filtrosMel = Array.from({ length: NMEL }, (_, m) => {
    const h = new Float64Array(NFFT / 2 + 1);
    for (let k = bins[m]; k < bins[m + 1]; k++) h[k] = (k - bins[m]) / Math.max(1, bins[m + 1] - bins[m]);
    for (let k = bins[m + 1]; k < bins[m + 2]; k++) h[k] = (bins[m + 2] - k) / Math.max(1, bins[m + 2] - bins[m + 1]);
    return h;
  });
  return filtrosMel;
}

/** MFCC(13) + deltas, normalizados (média 0, desvio 1) — devolve [quadros][26] e a energia por quadro. */
export function caracteristicas(x: Float32Array): { f: Float64Array[]; energia: Float64Array } {
  const n = Math.max(1, Math.floor((x.length - JAN) / PASSO) + 1);
  const ham = Float64Array.from({ length: JAN }, (_, i) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (JAN - 1)));
  const banco = bancoMel(), ceps: Float64Array[] = [], energia = new Float64Array(n);
  const re = new Float64Array(NFFT), im = new Float64Array(NFFT);
  for (let q = 0; q < n; q++) {
    re.fill(0); im.fill(0);
    let e = 0, ant = q * PASSO > 0 ? x[q * PASSO - 1] : 0;
    for (let i = 0; i < JAN; i++) {
      const v = x[q * PASSO + i] ?? 0; e += v * v;
      re[i] = (v - 0.97 * ant) * ham[i]; ant = v;
    }
    energia[q] = Math.sqrt(e / JAN);
    fft(re, im);
    const pot = new Float64Array(NFFT / 2 + 1);
    for (let k = 0; k <= NFFT / 2; k++) pot[k] = re[k] * re[k] + im[k] * im[k];
    const lm = banco.map((h) => { let s = 1e-10; for (let k = 0; k < h.length; k++) s += h[k] * pot[k]; return Math.log(s); });
    const c = new Float64Array(NCEP);
    for (let i = 0; i < NCEP; i++) { let s = 0; for (let m = 0; m < NMEL; m++) s += lm[m] * Math.cos((Math.PI * i * (m + 0.5)) / NMEL); c[i] = s; }
    ceps.push(c);
  }
  const f = ceps.map((c, q) => {
    const a = ceps[Math.max(0, q - 2)], b = ceps[Math.min(n - 1, q + 2)];
    const v = new Float64Array(NCEP * 2);
    for (let i = 0; i < NCEP; i++) { v[i] = c[i]; v[NCEP + i] = (b[i] - a[i]) / 4; }
    return v;
  });
  for (let d = 0; d < NCEP * 2; d++) { // CMVN
    let m = 0, s = 0; for (const v of f) m += v[d]; m /= n;
    for (const v of f) s += (v[d] - m) ** 2; s = Math.sqrt(s / n) || 1;
    for (const v of f) v[d] = (v[d] - m) / s;
  }
  return { f, energia };
}

/** DTW com passos (1,1), (1,2), (2,1) e (1,0)/(0,1) penalizados; devolve, para cada quadro da referência, o quadro do alvo. */
export function dtw(a: Float64Array[], b: Float64Array[]): Float64Array {
  const n = a.length, m = b.length, D = new Float32Array(n * m), INF = 1e30;
  const dist = (i: number, j: number) => { let s = 0; const x = a[i], y = b[j]; for (let k = 0; k < x.length; k++) { const d = x[k] - y[k]; s += d * d; } return Math.sqrt(s); };
  const PEN = 1.4; // passos horizontais/verticais (um lado "parado") custam mais
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const d = dist(i, j);
    if (i === 0 && j === 0) { D[0] = d; continue; }
    let best = INF;
    if (i > 0 && j > 0) best = Math.min(best, D[(i - 1) * m + j - 1] + 2 * d);
    if (i > 1 && j > 0) best = Math.min(best, D[(i - 2) * m + j - 1] + 3 * d);
    if (i > 0 && j > 1) best = Math.min(best, D[(i - 1) * m + j - 2] + 3 * d);
    if (i > 0) best = Math.min(best, D[(i - 1) * m + j] + PEN * d);
    if (j > 0) best = Math.min(best, D[i * m + j - 1] + PEN * d);
    D[i * m + j] = best;
  }
  // caminho de volta
  const soma = new Float64Array(n), cont = new Float64Array(n);
  let i = n - 1, j = m - 1;
  soma[i] += j; cont[i]++;
  while (i > 0 || j > 0) {
    const cands: [number, number, number][] = [];
    if (i > 0 && j > 0) cands.push([i - 1, j - 1, D[(i - 1) * m + j - 1]]);
    if (i > 1 && j > 0) cands.push([i - 2, j - 1, D[(i - 2) * m + j - 1]]);
    if (i > 0 && j > 1) cands.push([i - 1, j - 2, D[(i - 1) * m + j - 2]]);
    if (i > 0) cands.push([i - 1, j, D[(i - 1) * m + j]]);
    if (j > 0) cands.push([i, j - 1, D[i * m + j - 1]]);
    cands.sort((x, y) => x[2] - y[2]);
    [i, j] = cands[0];
    soma[i] += j; cont[i]++;
  }
  const mapa = new Float64Array(n);
  for (let k = 0; k < n; k++) mapa[k] = cont[k] ? soma[k] / cont[k] : k > 0 ? mapa[k - 1] : 0;
  return mapa;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/** Voz de referência do Edge (cache em disco). */
function referencia(texto: string, voz: string, taxa: string): { audio: Float32Array; palavras: [string, number, number][] } {
  const h = createHash("sha1").update([texto, voz, taxa].join("|")).digest("hex").slice(0, 16);
  const dir = cache(); mkdirSync(dir, { recursive: true });
  const mp3 = join(dir, `${h}.mp3`), js = join(dir, `${h}.json`), wav = join(dir, `${h}.wav`);
  if (!existsSync(wav) || !existsSync(js)) {
    const r = spawnSync(python(), [join(RAIZ, "scripts/ref_edge.py"), texto, voz, taxa, mp3, js]);
    if (r.status !== 0) throw new Error("referência Edge falhou: " + r.stderr?.toString().slice(-300));
    const c = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp3, "-ac", "1", "-ar", String(FS), wav]);
    if (c.status !== 0) throw new Error("ffmpeg referência");
  }
  return { audio: lerWavArquivo(wav).data, palavras: JSON.parse(readFileSync(js, "utf8")) };
}

/** Converte as palavras do Edge (sem pontuação, às vezes divididas diferente) para as nossas, por posição de caractere. */
function casarPalavras(nossas: string[], edge: [string, number, number][]): { ini: number; fim: number }[] {
  const posEdge: { a: number; b: number; ini: number; fim: number }[] = [];
  let acc = 0;
  for (const [t, ini, fim] of edge) { const n = norm(t).length; if (!n) continue; posEdge.push({ a: acc, b: acc + n, ini, fim }); acc += n; }
  const total = acc;
  let pos = 0;
  const totalNossas = nossas.reduce((s, w) => s + norm(w).length, 0) || 1;
  return nossas.map((w) => {
    const n = norm(w).length;
    // escala por segurança caso a contagem de letras difira (números por extenso etc.)
    const a = (pos * total) / totalNossas, b = ((pos + Math.max(n, 1)) * total) / totalNossas;
    pos += n;
    const ws = posEdge.filter((e) => e.b > a + 1e-9 && e.a < b - 1e-9);
    if (!ws.length) { const e = posEdge.find((x) => x.a >= a) ?? posEdge[posEdge.length - 1]; return { ini: e.ini, fim: e.fim }; }
    const p = ws[0], u = ws[ws.length - 1];
    const ini = p.ini + ((p.fim - p.ini) * Math.max(0, a - p.a)) / Math.max(1, p.b - p.a);
    const fim = u.ini + ((u.fim - u.ini) * Math.min(u.b - u.a, b - u.a)) / Math.max(1, u.b - u.a);
    return { ini, fim };
  });
}

export interface OpcoesAlinhador { voz?: string; taxa?: string }

/** Alinha `texto` ao `audio` (Float32Array em `sr`). Tempos em segundos, relativos ao início do áudio. */
export function alinhar(texto: string, audio: Float32Array, sr = SR, op: OpcoesAlinhador = {}): PalavraTempo[] {
  const palavras = texto.split(/\s+/).filter(Boolean);
  const alvo = para16k(audio, sr);
  const ref = referencia(texto, op.voz ?? "pt-BR-AntonioNeural", op.taxa ?? "-15%");
  const A = caracteristicas(ref.audio), B = caracteristicas(alvo);
  const mapa = dtw(A.f, B.f);
  const leva = (t: number) => { // segundo da referência → segundo do alvo (interpolado)
    const q = Math.max(0, Math.min(mapa.length - 1, t * QPS)), i0 = Math.floor(q), f = q - i0;
    return ((mapa[i0] * (1 - f) + (mapa[Math.min(mapa.length - 1, i0 + 1)] ?? mapa[i0]) * f)) / QPS;
  };
  const brutos = casarPalavras(palavras, ref.palavras).map((w) => ({ ini: leva(w.ini), fim: leva(w.fim) }));

  // refinamento pela energia do áudio real
  const E = B.energia, emax = Math.max(...E), lim = emax * 0.06;
  const voz = (q: number) => (E[Math.max(0, Math.min(E.length - 1, q))] ?? 0) > lim;
  const dur = alvo.length / FS;
  const out: PalavraTempo[] = brutos.map((w, k) => {
    let q = Math.round(w.ini * QPS);
    if (!voz(q)) { // caiu num silêncio: vai até o ataque mais próximo (de preferência para frente)
      let f = q; while (f < E.length - 1 && !voz(f) && f - q < 25) f++;
      let t = q; while (t > 0 && !voz(t) && q - t < 9) t--;
      q = voz(f) && (f - q <= 25) ? f : voz(t) ? t : q;
    } else if (k > 0 && /[.!?…,;:]$/.test(palavras[k - 1])) { // depois de pontuação: início = fim da pausa mais próxima
      for (let d = 1; d <= 9; d++) { if (!voz(q - d)) { q = q - d + 1; break; } }
    }
    return { texto: palavras[k], ini: q / QPS, fim: w.fim };
  });
  for (let k = 0; k < out.length; k++) {
    const prox = k + 1 < out.length ? out[k + 1].ini : dur;
    out[k].ini = Math.max(out[k].ini, k ? out[k - 1].ini + 0.05 : 0);
    let q = Math.round(Math.min(Math.max(out[k].fim, out[k].ini + 0.08), prox) * QPS);
    while (q > Math.round(out[k].ini * QPS) + 4 && !voz(q - 1)) q--; // fim = começo da pausa
    out[k].fim = Math.min(prox, Math.max(out[k].ini + 0.08, q / QPS));
  }
  return out;
}

/** Duração (s) do mesmo texto na voz de referência: régua independente para detectar narração com texto a mais/a menos. */
export function duracaoReferencia(texto: string, op: OpcoesAlinhador = {}): number {
  return referencia(texto, op.voz ?? "pt-BR-AntonioNeural", op.taxa ?? "-15%").audio.length / FS;
}
