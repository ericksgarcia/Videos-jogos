import { test, beforeEach, afterEach } from "node:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { SR } from "../src/audio/wav.ts";
import { montarSsml, narrar, PERFIS } from "../src/pipeline/tts.ts";
import { urlDaSaida } from "../src/pipeline/replicate.ts";

const original = globalThis.fetch;
let chamadas: { url: string; init?: RequestInit }[] = [];
beforeEach(() => { chamadas = []; process.env.BIBLIA_TTS_CACHE = mkdtempSync(join(tmpdir(), "tts-")); });
afterEach(() => { globalThis.fetch = original; });

/** WAV 16 bits mono com `seg` segundos de seno. */
function wavBase64(seg: number) {
  const n = Math.floor(seg * SR), b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(8000 * Math.sin((2 * Math.PI * 150 * i) / SR)), 44 + i * 2);
  return b.toString("base64");
}

test("SSML: uma marca por palavra, pausas na pontuação, XML escapado", () => {
  const { ssml, palavras } = montarSsml('Tu & eu, "vamos". Fim', PERFIS.leitura);
  assert.equal(palavras.length, 5);
  assert.match(ssml, /<mark name="w0"\/>Tu/);
  assert.match(ssml, /&amp;/);
  assert.match(ssml, /eu,<break time="320ms"\/>/);
  assert.match(ssml, /&quot;vamos&quot;\.<break time="700ms"\/>/);
  assert.ok(ssml.endsWith('<mark name="fim"/></speak>'));
});

test("Google TTS: pede Neural2 grave com timepoints e usa as marcas devolvidas", async () => {
  process.env.GOOGLE_TTS_API_KEY = "chave-falsa";
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    chamadas.push({ url: String(url), init });
    return new Response(JSON.stringify({
      audioContent: wavBase64(3),
      timepoints: [{ markName: "w0", timeSeconds: 0.2 }, { markName: "w1", timeSeconds: 1.1 }, { markName: "w2", timeSeconds: 2.0 }, { markName: "fim", timeSeconds: 2.8 }],
    }), { status: 200 });
  }) as typeof fetch;
  const r = await narrar([{ chave: "x", texto: "O Senhor é", perfil: "narrador", maxDur: 10 }]);
  const corpo = JSON.parse(String(chamadas[0].init!.body));
  assert.match(chamadas[0].url, /texttospeech\.googleapis\.com\/v1beta1\/text:synthesize\?key=chave-falsa/);
  assert.match(corpo.voice.name, /^pt-BR-(Neural2|Wavenet)/);
  assert.ok(corpo.audioConfig.pitch < 0 && corpo.audioConfig.speakingRate < 1);
  assert.deepEqual(corpo.enableTimePointing, ["SSML_MARK"]);
  assert.equal(r.x.palavras.length, 3);
  assert.equal(r.x.palavras[1].ini, 1.1);
  assert.ok(Math.abs(r.x.dur - 3) < 0.01);
});

test("Google TTS: se a narração passa do tempo, refaz com ritmo mais rápido (no máximo 1.0)", async () => {
  process.env.GOOGLE_TTS_API_KEY = "chave-falsa";
  const taxas: number[] = [];
  globalThis.fetch = (async (_u: string, init?: RequestInit) => {
    const t = JSON.parse(String(init!.body)).audioConfig.speakingRate as number;
    taxas.push(t);
    return new Response(JSON.stringify({ audioContent: wavBase64(4.3 * (0.92 / t)), timepoints: [{ markName: "w0", timeSeconds: 0.1 }, { markName: "fim", timeSeconds: 4 }] }), { status: 200 });
  }) as typeof fetch;
  const r = await narrar([{ chave: "cta", texto: "Curta", perfil: "cta", maxDur: 4.0 }]);
  assert.ok(taxas.length >= 2 && taxas[1] > taxas[0] && taxas.every((t) => t <= 1.0), String(taxas));
  assert.ok(r.cta.dur <= 4.0, String(r.cta.dur));
});

test("Replicate: extrai a URL de saídas em string, lista ou objeto de profundidade", () => {
  assert.equal(urlDaSaida("https://x/a.png"), "https://x/a.png");
  assert.equal(urlDaSaida(["https://x/b.png"]), "https://x/b.png");
  assert.equal(urlDaSaida({ color_depth: "https://x/c.png", grey_depth: "https://x/g.png" }, [/grey|gray/i]), "https://x/g.png");
  assert.throws(() => urlDaSaida({}));
});
