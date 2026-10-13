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
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "../lib/catalog.ts";
import { comTentativas } from "../lib/env.ts";
import { SR, escreverWavMono, lerWav, reamostrar } from "../audio/wav.ts";
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

export interface PedidoSegmento { chave: string; texto: string; perfil: keyof typeof PERFIS; maxDur: number }

/** Sintetiza e, se passar de `maxDur`, refaz mais devagar → mais rápido (até taxaMin). */
export async function narrar(pedidos: PedidoSegmento[], offline = false): Promise<Record<string, Fala>> {
  const resultado: Record<string, Fala> = {};
  for (const ped of pedidos) {
    const p = PERFIS[ped.perfil];
    const fazer = (taxa: number) => (offline ? Promise.resolve(sintetizarOffline(ped.texto, p, taxa)) : sintetizarUma(ped.texto, p, taxa));
    let fala = await fazer(p.taxa);
    // Só acelera se estourar o tempo; a taxa sobe de 0.82 para no máximo 1.0 (nunca "corrido").
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
