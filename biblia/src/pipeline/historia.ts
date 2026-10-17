/**
 * Esteira de HISTÓRIAS bíblicas (até 1:30): data/historias/<id>/roteiro.json (beats aprovados pelo avaliador, REVISAO_HISTORIA.md)
 * + 18 imagens por cena (data/imagens/<id>/img/dn6_NN_*.png, geradas no Replicate ou por fora).
 * Cada beat é narrado separado; a PAUSA é silêncio real (a trilha cai); a imagem troca no beat (ou na 2ª frase, quando o beat tem 2);
 * o versículo-chave só aparece do beat "VERSÍCULO" até o fim da história; o CTA volta à imagem 1 e fecha o loop.
 * Uso: npx tsx src/pipeline/historia.ts <id> [--no-render]
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import "../lib/env.ts";
import { loadCatalog, RAIZ } from "../lib/catalog.ts";
import { FPS, type Plano, type PlanoTomada, type SegmentoPlano } from "../lib/plan.ts";
import { gravarMix, mixar } from "../audio/mix.ts";
import { SR } from "../audio/wav.ts";
import { narrar, type Fala } from "./tts.ts";
import { ampliar, dataUri, gerarProfundidade } from "./replicate.ts";
import { avaliar } from "./fundos.ts";
import { profundidadeLocal } from "./profundidade.ts";
import { renderEmBlocos } from "./render.ts";
import { finalizar } from "./encode.ts";
import { bpmDoTom, palavraClimaxTempo } from "./plan.ts";

interface Beat { id: string; fase: string; fala: string; imagens: number[]; tela?: string; som?: string }
const id = process.argv[2];
if (!id) throw new Error("uso: historia.ts <id> [--no-render]");
const semRender = process.argv.includes("--no-render");
const roteiro = JSON.parse(readFileSync(join(RAIZ, "data/historias", id, "roteiro.json"), "utf8"));
const R = roteiro.revisao as Record<string, number>;
if (!R || Object.entries(R).some(([k, v]) => k !== "rodadas" && !(v >= 8))) throw new Error("história reprovada: falta nota ≥ 8 do avaliador em todas as fases (REVISAO_HISTORIA.md)");
const beats: Beat[] = roteiro.beats;
const entrada = loadCatalog().find((e) => e.id === roteiro.catalogo_id)!;
const GAP = 0.22;

async function main() {
  // 1) narração beat a beat (a PAUSA não tem voz)
  const falasBeat: Record<string, Fala> = await narrar(beats.filter((b) => b.id !== "PAUSA").map((b) => ({
    chave: b.id, texto: b.fala, perfil: b.fase === "climax" && b.id === "B14" ? "leitura" : b.fase === "cta" ? "cta" : "narrador", maxDur: 9,
  })));
  // 2) linha do tempo
  let t = 0.1;
  const ini: Record<string, number> = {}, fim: Record<string, number> = {};
  for (const b of beats) {
    ini[b.id] = t;
    if (b.id === "PAUSA") { t += 1.2; fim[b.id] = t; continue; }
    t += falasBeat[b.id].dur; fim[b.id] = t; t += GAP;
  }
  const total = fim[beats[beats.length - 1].id] + 0.3;
  console.log(`  duração: ${total.toFixed(1)} s ` + beats.filter((b) => b.id !== "PAUSA").map((b) => `${b.id} ${falasBeat[b.id].dur.toFixed(1)}`).join(" | "));
  if (total > 90) console.warn(`⚠ ${total.toFixed(1)} s passa de 90 s — encurte o roteiro`);
  const iVerso = beats.find((b) => b.tela?.startsWith("VERSÍCULO"))!.id;
  const iCta = beats[beats.length - 1].id;
  const idxVerso = beats.findIndex((b) => b.id === iVerso);
  const ate = (a: number, b: number) => beats.slice(a, b).filter((x) => x.id !== "PAUSA").map((x) => x.id);
  const palavrasDe = (ids: string[]) => ids.flatMap((b) => falasBeat[b].palavras.map((w) => ({ t: w.texto, ini: ini[b] + w.ini, fim: ini[b] + w.fim })));
  const idxPayoff = beats.findIndex((b, k) => k > idxVerso && b.fase === "cta");
  const grupos: [SegmentoPlano["id"], string[]][] = [["ato1", ate(0, idxVerso)], ["ato2", [iVerso]], ["ato3", ate(idxVerso + 1, idxPayoff)], ["cta", [iCta]]];
  const segs: SegmentoPlano[] = grupos.map(([sid, ids]) => ({ id: sid, ini: ini[ids[0]], fim: fim[ids[ids.length - 1]], palavras: palavrasDe(ids) }));
  const seg2 = segs.find((s) => s.id === "ato2")!;
  const climaxT = palavraClimaxTempo(seg2, "anjo");
  const fimHistoria = fim[beats[idxPayoff - 1].id];

  // 3) imagens: ampliadas 2× + profundidade (cache); troca no beat, ou na 2ª frase quando o beat tem 2 imagens
  const pub = join(RAIZ, "public/runs", id), saida = join(RAIZ, "out", id);
  mkdirSync(pub, { recursive: true }); mkdirSync(saida, { recursive: true });
  const dirImg = join(RAIZ, "data/imagens", roteiro.catalogo_id, "img");
  const arqImg = (n: number) => { const p = `dn6_${String(n).padStart(2, "0")}_`; const f = readdirSync(dirImg).find((x) => x.startsWith(p) && x.endsWith(".png")); if (!f) throw new Error(`imagem ${n} não encontrada em ${dirImg}`); return join(dirImg, f); };
  const prontas = new Map<number, { src: string; depth?: string; faixa: number }>();
  const preparar = async (n: number) => {
    if (prontas.has(n)) return prontas.get(n)!;
    const origem = arqImg(n), grande = await ampliar(origem);
    copyFileSync(grande, join(pub, `img-${n}.png`));
    let depth: string | undefined;
    try { copyFileSync(await gerarProfundidade(await dataUri(origem), origem), join(pub, `img-${n}-prof.png`)); depth = `runs/${id}/img-${n}-prof.png`; }
    catch (e) { console.warn(`⚠ profundidade da imagem ${n}: ${(e as Error).message} — usando a local`); copyFileSync(profundidadeLocal(origem), join(pub, `img-${n}-prof.png`)); depth = `runs/${id}/img-${n}-prof.png`; }
    const r = { src: `runs/${id}/img-${n}.png`, depth, faixa: avaliar(origem).faixa };
    prontas.set(n, r); return r;
  };
  const slots: { n: number; ini: number }[] = [];
  const empurrar = (n: number, at: number) => { if (slots.length && slots[slots.length - 1].n === n) return; slots.push({ n, ini: slots.length ? at : 0 }); };
  for (const b of beats) {
    if (b.id === "PAUSA") { empurrar(b.imagens[0], ini[b.id]); continue; }
    if (b.imagens.length === 1) { empurrar(b.imagens[0], ini[b.id]); continue; }
    const pal = falasBeat[b.id].palavras; const k = pal.findIndex((w, j) => j > 0 && /[.!?…]$/.test(pal[j - 1].texto));
    const corte = k > 0 ? ini[b.id] + pal[k].ini - 0.05 : (ini[b.id] + fim[b.id]) / 2;
    empurrar(b.imagens[0], ini[b.id]); empurrar(b.imagens[1], corte);
  }
  const tomadas: PlanoTomada[] = [];
  for (let k = 0; k < slots.length; k++) {
    const im = await preparar(slots[k].n);
    const f = k + 1 < slots.length ? slots[k + 1].ini : total;
    tomadas.push({ ini: slots[k].ini, fim: f, tipo: "parallax", src: im.src, depth: im.depth, seed: slots[k].n, faixa: im.faixa });
    console.log(`  imagem ${slots[k].n} @ ${slots[k].ini.toFixed(1)}–${f.toFixed(1)} s (${(f - slots[k].ini).toFixed(1)} s)`);
  }
  const longas = tomadas.filter((x) => x.fim - x.ini > 6.2); if (longas.length) console.warn(`⚠ imagens com mais de 6 s: ${longas.map((x) => x.src.slice(-9)).join(", ")}`);

  // 4) áudio: voz por beat + trilha; a PAUSA vira silêncio real (a trilha cai a ~0)
  const bpm = bpmDoTom(entrada.tone);
  const mix = mixar({
    total, voz: beats.filter((b) => b.id !== "PAUSA").map((b) => ({ ini: ini[b.id], audio: falasBeat[b.id].audio })),
    atos: { ato1: [0, ini[iVerso]], ato2: [ini[iVerso], fim[iVerso]], ato3: [fim[iVerso], ini[iCta]], cta: [ini[iCta], total] },
    cues: entrada.audio_cues, tom: entrada.tone, bpm, climaxEm: climaxT, abertura: true, loop: true,
  });
  const p0 = ini["PAUSA"], p1 = fim["PAUSA"];
  const g = (ts: number) => ts < p0 - 0.3 || ts > p1 + 0.3 ? 1 : ts < p0 ? 1 - 0.88 * (1 - (p0 - ts) / 0.3) : ts > p1 ? 0.12 + 0.88 * ((ts - p1) / 0.3) : 0.12;
  for (const ch of [mix.esq, mix.dir]) for (let i = Math.floor((p0 - 0.3) * SR); i < Math.min(ch.length, Math.ceil((p1 + 0.3) * SR)); i++) ch[i] *= g(i / SR);
  const mixArq = gravarMix(mix.esq, mix.dir, join(pub, "mix"));
  copyFileSync(mixArq, join(saida, basename(mixArq)));

  // 5) plano
  const cta = beats[beats.length - 1];
  const plano: Plano = {
    id, fps: FPS, duracao: total, bpm, tom: entrada.tone, referencia: roteiro.referencia, gancho: entrada.emotional_hook,
    audio: `runs/${id}/${basename(mixArq)}`, segmentos: segs, tomadas, climax: { t: climaxT, palavra: "anjo" },
    rotulo: { texto: "Daniel 6:22", ini: ini[iVerso] - 0.2, fim: fimHistoria },
    verso_fixo: true, verso_intervalo: [ini[iVerso], fimHistoria], imagens_prontas: true, loop: true, blocos: [],
    cta_tela: cta.tela ? { texto: cta.tela, ini: ini[iCta], fim: total - 0.1 } : undefined,
  };
  const planoArq = join(saida, "plano.json");
  writeFileSync(planoArq, JSON.stringify(plano, null, 2));
  writeFileSync(join(saida, "roteiro.json"), JSON.stringify(roteiro, null, 2));
  console.log(`  plano: ${planoArq} (${total.toFixed(1)} s)`);
  if (semRender) return;
  const bruto = join(saida, "bruto.mp4"), video = join(saida, "video.mp4");
  renderEmBlocos(planoArq, bruto, mixArq, total);
  const { mb, kbps } = finalizar(bruto, video, total, 6, { titulo: roteiro.titulo, descricao: roteiro.descricao_tiktok ?? `${roteiro.titulo}. ${roteiro.referencia}.` });
  console.log(`✔ ${video} (${mb.toFixed(1)} MB, vídeo a ${kbps} kbps)`);
}
main().catch((e) => { console.error("✖", e instanceof Error ? e.message : e); process.exit(1); });
