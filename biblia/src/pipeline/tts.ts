/**
 * Narração com Google Cloud Text-to-Speech (vozes Neural2/Wavenet pt-BR graves).
 *
 *  - SSML com <mark> antes de cada palavra + enableTimePointing → o Google devolve o instante real
 *    de cada palavra (legendas cinéticas exatas, e o impacto do trovão cai na palavra do clímax);
 *  - pitch negativo e speakingRate < 1 para o tom solene e pausado;
 *  - cada segmento (ato 1, CTA, ato 2, ato 3) é sintetizado separado, para ser posicionado na
 *    linha do tempo (0 / 12 / 16 / 35 s) e ter o ritmo ajustado até caber no seu tempo;
 *  - cache em data/cache/tts por hash da requisição (não gasta cota ao re-renderizar).
 * Autenticação: GOOGLE_TTS_API_KEY (chave de API) ou GOOGLE_TTS_ACCESS_TOKEN (OAuth/gcloud).
 * `offline`: voz sintética de teste (rajadas de ruído por palavra) — só para validar a esteira.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";
import { comTentativas } from "../lib/env.ts";
import { alinhar, duracaoReferencia } from "../audio/alinhador.ts";
import { SR, escreverWavMono, lerWav, lerWavArquivo, reamostrar } from "../audio/wav.ts";
import { prng } from "./engine.ts";

const cacheDir = () => process.env.BIBLIA_TTS_CACHE ?? join(RAIZ, "data/cache/tts");

export interface Palavra { texto: string; ini: number; fim: number }
export interface Fala { audio: Float32Array; dur: number; palavras: Palavra[]; taxa: number }

export interface Perfil {
  voz: string;           // ex.: pt-BR-Neural2-B
  pitch: number;         // semitons (-20..20)
  taxa: number;          // speakingRate (0.25..4)
  taxaMin: number;       // piso ao encurtar para caber
  pausaFrase: number;    // ms depois de . ! ?
  pausaVirgula: number;  // ms depois de , ; :
}

export const VOZ_PADRAO = process.env.GOOGLE_TTS_VOICE ?? "pt-BR-Neural2-B";
export const PERFIS: Record<"narrador" | "leitura" | "cta", Perfil> = {
  narrador: { voz: VOZ_PADRAO, pitch: -3.5, taxa: 0.9, taxaMin: 0.8, pausaFrase: 450, pausaVirgula: 180 },
  leitura: { voz: VOZ_PADRAO, pitch: -5, taxa: 0.82, taxaMin: 0.74, pausaFrase: 700, pausaVirgula: 320 },
  cta: { voz: VOZ_PADRAO, pitch: -3, taxa: 0.92, taxaMin: 0.8, pausaFrase: 250, pausaVirgula: 120 },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function montarSsml(texto: string, p: Perfil): { ssml: string; palavras: string[] } {
  const palavras = texto.split(/\s+/).filter(Boolean);
  const partes = palavras.map((w, i) => {
    const pausa = /[.!?…]$/.test(w) ? p.pausaFrase : /[,;:]$/.test(w) ? p.pausaVirgula : 0;
    return `<mark name="w${i}"/>${esc(w)}${pausa ? `<break time="${pausa}ms"/>` : ""}`;
  });
  return { ssml: `<speak>${partes.join(" ")}<mark name="fim"/></speak>`, palavras };
}

/** Tempo estimado (usado pelo modo offline e como reserva). */
export function estimar(palavras: string[], taxa: number, p: Perfil): { dur: number; ini: number[] } {
  let t = 0.15; const ini: number[] = [];
  for (const w of palavras) {
    ini.push(t);
    t += (0.12 + w.replace(/[^\p{L}\p{N}]/gu, "").length * 0.062) / taxa;
    if (/[.!?…]$/.test(w)) t += p.pausaFrase / 1000; else if (/[,;:]$/.test(w)) t += p.pausaVirgula / 1000;
  }
  return { dur: t + 0.25, ini };
}

async function chamarGoogle(ssml: string, p: Perfil, taxa: number) {
  const chave = process.env.GOOGLE_TTS_API_KEY ?? process.env.GOOGLE_API_KEY;
  const token = process.env.GOOGLE_TTS_ACCESS_TOKEN;
  if (!chave && !token) throw new Error("defina GOOGLE_TTS_API_KEY (ou GOOGLE_TTS_ACCESS_TOKEN) — veja biblia/README.md");
  const corpo = {
    input: { ssml },
    voice: { languageCode: "pt-BR", name: p.voz },
    audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: SR, speakingRate: +taxa.toFixed(3), pitch: p.pitch, effectsProfileId: ["headphone-class-device"] },
    enableTimePointing: ["SSML_MARK"],
  };
  const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize${chave ? `?key=${chave}` : ""}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!chave && token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(corpo) });
  if (!r.ok) throw new Error(`Google TTS ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return (await r.json()) as { audioContent: string; timepoints?: { markName: string; timeSeconds: number }[] };
}

async function sintetizarUma(texto: string, p: Perfil, taxa: number): Promise<Fala> {
  const { ssml, palavras } = montarSsml(texto, p);
  const chaveCache = createHash("sha1").update(JSON.stringify([ssml, p.voz, p.pitch, taxa])).digest("hex").slice(0, 16);
  mkdirSync(cacheDir(), { recursive: true });
  const arq = join(cacheDir(), `${chaveCache}.json`);
  let resp: { audioContent: string; timepoints?: { markName: string; timeSeconds: number }[] };
  if (existsSync(arq)) resp = JSON.parse(readFileSync(arq, "utf8"));
  else {
    resp = await comTentativas(() => chamarGoogle(ssml, p, taxa));
    writeFileSync(arq, JSON.stringify(resp));
  }
  const pcm = lerWav(Buffer.from(resp.audioContent, "base64"));
  const audio = reamostrar(pcm);
  const dur = audio.length / SR;
  const marcas = new Map((resp.timepoints ?? []).map((t) => [t.markName, t.timeSeconds]));
  let ini = palavras.map((_, i) => marcas.get(`w${i}`));
  if (ini.some((v) => v === undefined)) {
    // Voz sem suporte a marcas: distribui pelo comprimento, escalado à duração real.
    const est = estimar(palavras, taxa, p);
    ini = est.ini.map((v) => (v / est.dur) * dur);
  }
  const inicios = ini as number[];
  const fimAudio = marcas.get("fim") ?? dur;
  const out: Palavra[] = palavras.map((w, i) => {
    const pausa = /[.!?…]$/.test(w) ? p.pausaFrase : /[,;:]$/.test(w) ? p.pausaVirgula : 0;
    const prox = i + 1 < palavras.length ? inicios[i + 1] : fimAudio;
    return { texto: w, ini: inicios[i], fim: Math.max(inicios[i] + 0.12, prox - pausa / 1000) };
  });
  return { audio, dur, palavras: out, taxa };
}

/** Voz de teste: tom grave + ruído modulado por palavra. Só para validar áudio/ducking/legendas. */
function sintetizarOffline(texto: string, p: Perfil, taxa: number): Fala {
  const palavras = texto.split(/\s+/).filter(Boolean);
  const est = estimar(palavras, taxa, p);
  const audio = new Float32Array(Math.ceil(est.dur * SR));
  const rnd = prng(texto.length);
  const out: Palavra[] = palavras.map((w, i) => {
    const ini = est.ini[i];
    const fim = i + 1 < palavras.length ? est.ini[i + 1] : est.dur - 0.25;
    const pausa = /[.!?…]$/.test(w) ? p.pausaFrase : /[,;:]$/.test(w) ? p.pausaVirgula : 0;
    return { texto: w, ini, fim: Math.max(ini + 0.1, fim - pausa / 1000) };
  });
  for (const w of out) {
    const a = Math.floor(w.ini * SR), b = Math.floor(w.fim * SR);
    for (let i = a; i < b && i < audio.length; i++) {
      const u = (i - a) / (b - a);
      const env = Math.sin(Math.PI * Math.min(1, u * 1.1)) ** 0.7;
      audio[i] = env * 0.3 * (Math.sin((2 * Math.PI * 118 * i) / SR) * 0.7 + (rnd() * 2 - 1) * 0.3);
    }
  }
  return { audio, dur: est.dur, palavras: out, taxa };
}


// ───────────────────────────── Gemini TTS (alternativa, sem chave própria nas sessões na nuvem) ─────────────────────────────
const GEMINI_VOZ = () => process.env.GEMINI_TTS_VOICE ?? "Charon";
const GEMINI_MODELO = () => process.env.GEMINI_TTS_MODEL ?? "gemini-3.8-flash-tts";
const DIRECAO_BASE =
  "# AUDIO PROFILE: Narrador de um canal cristão sóbrio e cinematográfico, português do Brasil.\n" +
  "## DIRECTOR'S NOTES\nStyle: voz grave, profunda e calorosa; solene, nunca eufórica, sem tom de pregador nem de propaganda; " +
  "gravidade e ternura. Accent: português do Brasil. IMPORTANT: read the transcript exactly ONCE, word for word, as written; never repeat any part of it and never add words, titles or comments. ";
const DIRECAO: Record<keyof typeof PERFIS, string> = {
  narrador: "Pace: pausado mas fluido, como trailer de cinema: frases curtas, pausas breves, tensão crescente, sem arrastar.\n#### TRANSCRIPT\n",
  leitura: "Pace: solene e firme, cada frase com peso, como a leitura de um texto sagrado; pausas curtas entre as frases.\n#### TRANSCRIPT\n",
  cta: "Pace: ritmo natural de conversa, direto e caloroso, sem pausas longas entre as palavras, como quem faz um convite rápido a um amigo; leia em cerca de 5 segundos.\n#### TRANSCRIPT\n",
};

/** Instantes de silêncio (>= minDur s) do áudio, para ancorar as palavras. */
function silencios(audio: Float32Array, minDur = 0.14, limiar = 0.012): { ini: number; fim: number }[] {
  const out: { ini: number; fim: number }[] = [];
  const jan = Math.floor(SR * 0.01);
  let ini = -1;
  for (let i = 0; i + jan <= audio.length; i += jan) {
    let m = 0; for (let k = 0; k < jan; k++) m = Math.max(m, Math.abs(audio[i + k]));
    if (m < limiar) { if (ini < 0) ini = i; }
    else if (ini >= 0) { if ((i - ini) / SR >= minDur) out.push({ ini: ini / SR, fim: i / SR }); ini = -1; }
  }
  return out;
}

/**
 * O Gemini não devolve o tempo das palavras: distribui as palavras (peso = letras) apenas pelos trechos COM voz,
 * pulando os silêncios detectados — as pausas de pontuação ficam no lugar certo e o erro típico é < 0,15 s.
 */
export function alinharPorPausas(palavras: string[], audio: Float32Array): Palavra[] {
  const dur = audio.length / SR;
  const sil = silencios(audio).filter((x) => x.ini > 0.05 && x.fim < dur - 0.05);
  const falas: [number, number][] = [];
  let a = 0;
  for (const x of sil) { falas.push([a, x.ini]); a = x.fim; }
  falas.push([a, dur]);
  const total = falas.reduce((t, [i, f]) => t + (f - i), 0);
  const pesos = palavras.map((w) => 0.6 + w.replace(/[^\p{L}\p{N}]/gu, "").length);
  const soma = pesos.reduce((x, y) => x + y, 0);
  const noTempo = (u: number) => { // u em [0,1] do tempo de fala → segundos reais
    let alvo = u * total;
    for (const [i, f] of falas) { if (alvo <= f - i + 1e-9) return i + alvo; alvo -= f - i; }
    return dur;
  };
  let acc = 0;
  return palavras.map((w, k) => {
    const ini = noTempo(acc / soma); acc += pesos[k];
    const fim = noTempo(acc / soma);
    return { texto: w, ini, fim: Math.max(ini + 0.1, fim - (/[.!?…,;:]$/.test(w) ? 0.04 : 0)) };
  });
}


/** Pergunta ao Gemini (que "ouve" o áudio) em que segundo começa cada frase e encaixa cada início na pausa mais próxima. */
export async function alinharComGemini(palavras: string[], audio: Float32Array): Promise<Palavra[]> {
  const frases: number[][] = []; let atual: number[] = [];
  palavras.forEach((w, i) => { atual.push(i); if (/[.!?…,;:]$/.test(w)) { frases.push(atual); atual = []; } });
  if (atual.length) frases.push(atual);
  const dur = audio.length / SR;
  const tmp = join(cacheDir(), `al-${process.pid}-${Math.random().toString(36).slice(2, 8)}.wav`);
  mkdirSync(cacheDir(), { recursive: true });
  escreverWavMono(tmp, audio);
  const wav = readFileSync(tmp); rmSync(tmp, { force: true });
  const chave = createHash("sha1").update(wav).update(palavras.join(" ")).digest("hex").slice(0, 16);
  const arq = join(cacheDir(), `al-${chave}.json`);
  let inicios: number[];
  if (existsSync(arq)) inicios = JSON.parse(readFileSync(arq, "utf8"));
  else {
    const lista = frases.map((f, k) => `${k + 1}. ${f.map((i) => palavras[i]).join(" ")}`).join("\n");
    const pergunta = "Ouça o áudio e diga em que segundo começa a fala de cada trecho abaixo (na ordem). " +
      "Responda só um array JSON de números com 2 casas decimais, um por trecho.\n" + lista;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.GEMINI_API_KEY) headers["x-goog-api-key"] = process.env.GEMINI_API_KEY;
    inicios = await comTentativas(async () => {
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
        method: "POST", headers,
        body: JSON.stringify({
          contents: [{ parts: [{ inlineData: { mimeType: "audio/wav", data: wav.toString("base64") } }, { text: pergunta }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0 },
        }),
      });
      if (!r.ok) throw new Error(`Gemini alinhamento ${r.status}`);
      const j: any = await r.json();
      const v = JSON.parse(j.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]");
      if (!Array.isArray(v) || v.length !== frases.length) throw new Error("número de trechos diferente");
      return v.map(Number);
    }, 3, 2000);
    writeFileSync(arq, JSON.stringify(inicios));
  }
  const pausas = silencios(audio, 0.08);
  const aj: number[] = [];
  inicios.forEach((t0, k) => {
    let t = Math.min(Math.max(0, t0), dur - 0.1);
    if (k) { // a frase começa no fim da pausa mais longa por perto (±0,6 s)
      const perto = pausas.filter((x) => Math.abs(x.fim - t) <= 0.6).sort((a, b) => b.fim - b.ini - (a.fim - a.ini))[0];
      if (perto) t = perto.fim;
    }
    aj.push(aj.length ? Math.max(t, aj[aj.length - 1] + 0.15) : t);
  });
  const out: Palavra[] = [];
  frases.forEach((f, k) => {
    const t0 = aj[k], t1 = k + 1 < frases.length ? aj[k + 1] : dur;
    // o fim da fala é o começo da pausa COLADA ao fim da frase (não uma pausa no meio dela)
    const colada = pausas.filter((x) => x.ini > t0 + 0.2 && x.ini < t1 && t1 - x.fim < 0.15)[0];
    const fimFala = Math.max(t0 + 0.2, colada ? colada.ini : k + 1 < frases.length ? t1 : dur - 0.08);
    const pesos = f.map((i) => palavras[i].length + 1), soma = pesos.reduce((a, b) => a + b, 0);
    let t = t0;
    f.forEach((i, j) => { const d = ((fimFala - t0) * pesos[j]) / soma; out.push({ texto: palavras[i], ini: t, fim: t + d * 0.92 }); t += d; });
  });
  return out;
}


/** Encurta silêncios longos para no máximo `max` s (corta o meio da pausa, com fusão de 10 ms). */
export function encurtarPausas(audio: Float32Array, max = 0.5, limiar = 0.012): Float32Array {
  const jan = Math.floor(SR * 0.01), maxA = Math.floor(max * SR), fusao = Math.floor(SR * 0.01);
  const silencioso = (i: number) => { let m = 0; for (let k = i; k < Math.min(audio.length, i + jan); k++) m = Math.max(m, Math.abs(audio[k])); return m < limiar; };
  const cortes: [number, number][] = [];
  let ini = -1;
  for (let i = 0; i < audio.length; i += jan) {
    if (silencioso(i)) { if (ini < 0) ini = i; }
    else if (ini >= 0) { if (i - ini > maxA) cortes.push([ini + Math.floor(maxA / 2), i - Math.floor(maxA / 2)]); ini = -1; }
  }
  if (!cortes.length) return audio;
  const partes: Float32Array[] = [];
  let a = 0;
  for (const [c0, c1] of cortes) { partes.push(audio.subarray(a, c0)); a = c1; }
  partes.push(audio.subarray(a));
  const out = new Float32Array(partes.reduce((n, p) => n + p.length, 0));
  let o = 0;
  partes.forEach((p, k) => {
    out.set(p, o);
    if (k > 0) for (let i = 0; i < fusao && o + i < out.length; i++) out[o + i] *= i / fusao; // entrada suave
    o += p.length;
  });
  return out;
}

function aparar(audio: Float32Array): Float32Array {
  let a = 0, b = audio.length;
  while (a < b && Math.abs(audio[a]) < 0.004) a++;
  while (b > a && Math.abs(audio[b - 1]) < 0.004) b--;
  const folga = Math.floor(SR * 0.08);
  return audio.slice(Math.max(0, a - folga), Math.min(audio.length, b + folga));
}

/** Acelera sem mudar o tom (ffmpeg atempo). */
function acelerar(audio: Float32Array, fator: number): Float32Array {
  const tmp = join(cacheDir(), `at-${process.pid}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(cacheDir(), { recursive: true });
  escreverWavMono(tmp + ".in.wav", audio);
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp + ".in.wav", "-af", `atempo=${fator.toFixed(4)}`, "-ar", String(SR), "-ac", "1", tmp + ".out.wav"]);
  if (r.status !== 0) throw new Error("ffmpeg atempo: " + r.stderr?.toString().slice(0, 200));
  const out = reamostrar(lerWavArquivo(tmp + ".out.wav"));
  rmSync(tmp + ".in.wav", { force: true }); rmSync(tmp + ".out.wav", { force: true });
  return out;
}

async function geminiBruto(texto: string, perfil: keyof typeof PERFIS, tentativa = 0): Promise<string> {
  const chaveCache = createHash("sha1").update(JSON.stringify([texto, perfil, GEMINI_VOZ(), GEMINI_MODELO(), DIRECAO[perfil], tentativa || undefined])).digest("hex").slice(0, 16);
  mkdirSync(cacheDir(), { recursive: true });
  const arq = join(cacheDir(), `gem-${chaveCache}.b64`);
  if (existsSync(arq)) return readFileSync(arq, "utf8");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.GEMINI_API_KEY) headers["x-goog-api-key"] = process.env.GEMINI_API_KEY; // senão o proxy injeta
  const b64 = await comTentativas(async () => {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELO()}:generateContent`, {
      method: "POST", headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: DIRECAO_BASE + DIRECAO[perfil] + texto }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOZ() } } } },
      }),
    });
    if (!r.ok) throw new Error(`Gemini TTS ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j: any = await r.json();
    const d = j.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!d) throw new Error("Gemini TTS sem áudio");
    return d as string;
  }, 4, 4000);
  writeFileSync(arq, b64);
  return b64;
}

const decodificar = (buf: Buffer) => buf.toString("ascii", 0, 4) === "RIFF"
  ? reamostrar(lerWav(buf))
  : (() => { const n = Math.floor(buf.length / 2), f = new Float32Array(n); for (let i = 0; i < n; i++) f[i] = buf.readInt16LE(i * 2) / 32768; return reamostrar({ sr: 24000, data: f }); })();

/** Segundos de FALA (sem pausas) por palavra: acima de ~0,75 o modelo leu algo a mais (direção, repetição). */
export const segundosPorPalavra = (audio: Float32Array, palavras: number) => {
  const sem = encurtarPausas(audio, 0.08);
  return sem.length / SR / Math.max(1, palavras);
};

async function sintetizarGemini(texto: string, perfil: keyof typeof PERFIS, maxDur: number): Promise<Fala> {
  const n = texto.split(/\s+/).filter(Boolean).length;
  // régua independente: a mesma frase na voz grátis de referência. Narração bem acima disso = o modelo repetiu/acrescentou texto
  let ref = 0;
  try { ref = duracaoReferencia(texto); } catch { /* sem edge-tts: cai só na checagem de s/palavra */ }
  const limite = perfil === "leitura" ? 1.55 : 1.4;
  let melhor: { audio: Float32Array; razao: number } | null = null;
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const a = aparar(decodificar(Buffer.from(await geminiBruto(texto, perfil, tentativa), "base64")));
    const efetiva = encurtarPausas(a, 0.4).length / SR;
    const razao = ref ? efetiva / ref : segundosPorPalavra(a, n) / 0.5;
    if (!melhor || razao < melhor.razao) melhor = { audio: a, razao };
    if (razao <= limite && segundosPorPalavra(a, n) <= 0.75) break;
    console.warn(`  ⚠ narração suspeita (${efetiva.toFixed(1)} s para ${ref ? `${ref.toFixed(1)} s esperados` : `${n} palavras`}: leu algo a mais ou repetiu) — pedindo de novo`);
  }
  if (melhor!.razao > limite * 1.15) throw new Error(`narração com texto a mais em 5 tentativas (${perfil}): "${texto.slice(0, 40)}…"`);
  let audio = melhor!.audio;
  audio = encurtarPausas(audio, perfil === "leitura" ? 0.6 : 0.42);
  let taxa = 1;
  if (audio.length / SR > maxDur) { // acelera só o necessário, no máximo 1,18x
    taxa = Math.min(1.18, (audio.length / SR / maxDur) * 1.01);
    audio = acelerar(audio, taxa);
  }
  const palavras = texto.split(/\s+/).filter(Boolean);
  // Alinhamento GRATUITO (referência Edge TTS + DTW). ALINHADOR=gemini usa o Gemini (pago) como antes.
  let alinhadas: Palavra[];
  try {
    alinhadas = process.env.ALINHADOR === "gemini" ? await alinharComGemini(palavras, audio) : alinhar(texto, audio, SR);
  } catch (e) { console.warn(`⚠ alinhamento falhou (${(e as Error).message}); usando as pausas`); alinhadas = alinharPorPausas(palavras, audio); }
  return { audio, dur: audio.length / SR, palavras: alinhadas, taxa };
}

export type Provedor = "google" | "gemini" | "offline";
export function escolherProvedor(offline: boolean): Provedor {
  const pedido = process.env.VOZ_PROVEDOR as Provedor | undefined;
  if (offline) return "offline";
  if (pedido) return pedido;
  if (process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_TTS_ACCESS_TOKEN) return "google";
  return "gemini";
}

export interface PedidoSegmento { chave: string; texto: string; perfil: keyof typeof PERFIS; maxDur: number }

/** Sintetiza e, se passar de `maxDur`, refaz mais devagar → mais rápido (até taxaMin). */
export async function narrar(pedidos: PedidoSegmento[], offline = false): Promise<Record<string, Fala>> {
  const resultado: Record<string, Fala> = {};
  const provedor = escolherProvedor(offline);
  console.log(`  narração: provedor ${provedor}${provedor === "gemini" ? ` (voz ${GEMINI_VOZ()})` : provedor === "google" ? ` (voz ${VOZ_PADRAO})` : " (voz de teste)"}`);
  for (const ped of pedidos) {
    const p = PERFIS[ped.perfil];
    if (provedor === "gemini") { resultado[ped.chave] = await sintetizarGemini(ped.texto, ped.perfil, ped.maxDur); continue; }
    const fazer = (taxa: number) => (provedor === "offline" ? Promise.resolve(sintetizarOffline(ped.texto, p, taxa)) : sintetizarUma(ped.texto, p, taxa));
    let fala = await fazer(p.taxa);
    // Só acelera se estourar o tempo; a taxa sobe no máximo até 1.0 (nunca "corrido").
    for (let t = 0; t < 2 && fala.dur > ped.maxDur && fala.taxa < 1.0; t++) {
      const nova = Math.min(1.0, fala.taxa * (fala.dur / ped.maxDur) * 1.02);
      fala = await fazer(nova);
    }
    if (fala.dur > ped.maxDur) console.warn(`⚠ ${ped.chave}: ${fala.dur.toFixed(1)} s > ${ped.maxDur} s (ritmo ${fala.taxa.toFixed(2)})`);
    resultado[ped.chave] = fala;
  }
  return resultado;
}

export { escreverWavMono };
