/**
 * Esteira completa:  engine → roteiro → narração (Google TTS) → linha do tempo no compasso →
 * visuais (Replicate e/ou Pexels) → mixagem de áudio → plano → render no Remotion.
 *
 *   npm run video                         # tudo, modo "hybrid"
 *   npm run video -- --visual replicate   # só imagens Flux + profundidade (parallax 2.5D)
 *   npm run video -- --visual pexels      # só vídeos do Pexels com cortes no ritmo
 *   npm run video -- --ref sl-23          # força uma passagem (prefixo do id do catálogo)
 *   npm run video -- --offline            # voz/imagens sintéticas de teste (sem chaves)
 *   opções: --seed N  --tone epic|comfort  --no-render  --no-history  --frames 300-450
 *           --reusar (re-renderiza com as MESMAS imagens do plano anterior)  --trocar 3,7 (refaz só essas imagens)
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { loadCatalog, loadHistory, RAIZ, saveHistory } from "../lib/catalog.ts";
import "../lib/env.ts";
import { FPS, type Plano, type PlanoTomada } from "../lib/plan.ts";
import { gravarMix, mixar } from "../audio/mix.ts";
import { pickNext, prng, registrar } from "./engine.ts";
import { finalizar } from "./encode.ts";
import { prepararOverlays } from "./overlays.ts";
import { imagemFalsa, videoFalso } from "./offline.ts";
import { buscarClipe } from "./pexels.ts";
import { dataUri, gerarProfundidade } from "./replicate.ts";
import { DUR_MAX, blocos, bpmDoTom, montarLinha, palavraClimaxTempo, rotuloDe, segmentos } from "./plan.ts";
import { cenaDaTomada } from "./cenarios.ts";
import { avaliar, confirmarFundos, dhash, fundoInedito } from "./fundos.ts";
import { profundidadeLocal } from "./profundidade.ts";
import { agruparParaImagens, montarBlocos } from "../lib/blocos.ts";
import { renderEmBlocos } from "./render.ts";
import { gerarRoteiro, palavraClimax, validar, type Roteiro } from "./script.ts";
import { readFileSync } from "node:fs";
import { narrar } from "./tts.ts";

type ModoVisual = "auto" | "hybrid" | "replicate" | "pexels" | "procedural";

function args() {
  const a = process.argv.slice(2);
  const v = (k: string) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : undefined; };
  return {
    offline: a.includes("--offline"), semRender: a.includes("--no-render"), semHistorico: a.includes("--no-history"),
    visual: (v("visual") ?? "auto") as ModoVisual, roteiro: v("roteiro"), ref: v("ref"), seed: v("seed") ? Number(v("seed")) : undefined,
    tom: v("tone") as "epic" | "comfort" | undefined, frames: v("frames"),
    reusar: a.includes("--reusar"),
    trocar: (v("trocar") ?? "").split(",").filter(Boolean).map(Number),   // índices de imagens a refazer (ex.: texto indesejado)
  };
}

/** Roteiro escrito à mão/por Claude: JSON { ato1, cta, ato3, climax?, cta_style } (o versículo vem sempre do catálogo). */
/** Fim da 1ª frase falada do ato 1 = saída do texto de abertura; início da 2ª = "virada" (2º golpe de retenção). */
function ganchoTempos(segs: { id: string; palavras: { t: string; ini: number; fim: number }[] }[], linhas: string[] = []) {
  const p = segs.find((x) => x.id === "ato1")?.palavras ?? [];
  const i = p.findIndex((w) => /[.!?…]$/.test(w.t));
  if (i < 0 || i + 1 >= p.length) return {};
  // cada linha do texto de abertura entra na palavra em que é falada (o texto = a 1ª frase narrada, palavra por palavra)
  let k = 0;
  const gancho_linhas = linhas.map((l) => { const t = Math.max(0, (p[Math.min(k, i)]?.ini ?? 0) - 0.1); k += l.trim().split(/\s+/).length; return Number(t.toFixed(2)); });
  return { gancho_fim: Math.min(5, Math.max(2.6, p[i].fim + 0.25)), gancho_virada: p[i + 1].ini, gancho_linhas };
}

/** O fato vira cena: lacres que entram no gancho (a partir da palavra "sete", ou de 0,3 s) e quebram na palavra de cada ameaça lida no versículo. */
function visualFato(v: { tipo: "lacres"; gatilhos: string[]; entrada?: string }, segs: { id: string; palavras: { t: string; ini: number; fim: number }[] }[]) {
  const limpa = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
  const a2 = segs.find((s) => s.id === "ato2")!.palavras, a1 = segs.find((s) => s.id === "ato1")!.palavras;
  let k = 0;
  const gatilhos = v.gatilhos.map((g) => { const i = a2.findIndex((w, j) => j >= k && limpa(w.t) === limpa(g)); if (i < 0) throw new Error(`visual_fato: palavra "${g}" não está no versículo`); k = i + 1; return Number(a2[i].fim.toFixed(2)); });
  const ent = v.entrada ? a1.find((w) => limpa(w.t).startsWith(limpa(v.entrada!))) : undefined;
  const t0 = ent ? ent.ini : 0.3;
  return { tipo: v.tipo, n: v.gatilhos.length, entradas: v.gatilhos.map((_, i) => Number((t0 + i * 0.22).toFixed(2))), gatilhos };
}

/** Fases que o roteiro precisa justificar (teste do "dedo rolando" em CADA fase, não só no gancho). */
const FASES_AUDITORIA = ["gancho", "virada", "contexto", "cta", "versiculo", "ato3", "final"] as const;

/**
 * Portão de qualidade do roteiro: sem auditoria por fase, sem nota ≥ 8 do avaliador independente (REVISAO.md) ou com gancho
 * fraco (pergunta, 1ª frase longa, texto de abertura diferente da fala) a esteira não gera o vídeo.
 * --sem-auditoria só para testes técnicos.
 */
function auditarRoteiro(j: { ato1: string; gancho_tela?: string[]; auditoria?: Record<string, string>; revisao?: Record<string, number> }, arq: string, versoFixo = false) {
  if (process.argv.includes("--sem-auditoria")) return;
  const falhas: string[] = [];
  const primeira = (j.ato1.match(/^[^.!?…]*[.!?…]/)?.[0] ?? j.ato1).trim();
  if (primeira.split(/\s+/).length > 9) falhas.push(`1ª frase falada com ${primeira.split(/\s+/).length} palavras (máx. 9): "${primeira}"`);
  if (/\?/.test(primeira)) falhas.push("1ª frase falada é pergunta: abra com fato de choque/paradoxo");
  if (versoFixo) { /* o texto de abertura não aparece na tela: só vale a 1ª frase falada */ }
  else if (!j.gancho_tela?.length) falhas.push("falta gancho_tela (afirmação de abertura)");
  else {
    if (j.gancho_tela.some((l) => /\?/.test(l))) falhas.push("gancho_tela com pergunta: use afirmação");
    const norm = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
    if (norm(j.gancho_tela.join(" ")) !== norm(primeira)) falhas.push(`gancho_tela precisa ser EXATAMENTE a 1ª frase narrada (palavra por palavra), senão o espectador lê uma coisa e ouve outra. Tela: "${j.gancho_tela.join(" ")}" | fala: "${primeira}"`);
    if (j.gancho_tela.length > 3 || j.gancho_tela.some((l) => l.length > 20)) falhas.push("gancho_tela: no máx. 3 linhas de até 20 letras (senão corta nas bordas ou fica pequeno)");
  }
  for (const f of FASES_AUDITORIA) if ((j.auditoria?.[f] ?? "").trim().split(/\s+/).length < 6) falhas.push(`auditoria.${f} ausente ou vaga (explique em ≥ 6 palavras por que o espectador continua aqui)`);
  for (const f of FASES_AUDITORIA) { const n = j.revisao?.[f]; if (typeof n !== "number") falhas.push(`revisao.${f}: falta a nota do avaliador independente (REVISAO.md)`); else if (n < 8) falhas.push(`revisao.${f} = ${n} (< 8): reescreva a fase e passe por novo avaliador`); }
  if (falhas.length) throw new Error(`roteiro ${arq} reprovado na auditoria:\n  - ${falhas.join("\n  - ")}`);
}

type Extras = { fundo?: string; paleta?: string; visual_fato?: { tipo: "lacres"; gatilhos: string[]; entrada?: string }; verso_fixo?: boolean; gancho_tela?: string[]; cta_tela?: string; loop?: boolean; tomadas?: { cena: string; variante?: string; palavra?: string; inicio?: string }[] };
let extras: Extras = {};

function roteiroDeArquivo(arq: string, e: { text: string; id: string }): Roteiro {
  const j = JSON.parse(readFileSync(arq, "utf8"));
  extras = { fundo: j.fundo, paleta: j.paleta, visual_fato: j.visual_fato, verso_fixo: j.texto_na_tela !== "tudo", gancho_tela: j.gancho_tela, cta_tela: j.cta_tela, loop: j.loop, tomadas: j.tomadas };
  const erros = validar(j);
  if (erros.length) console.warn(`⚠ roteiro ${arq}: ${erros.join("; ")}`);
  auditarRoteiro(j, arq, j.texto_na_tela !== "tudo");
  // o roteiro pode usar só um TRECHO do versículo do catálogo — mas ele precisa ser um pedaço exato do texto bíblico
  if (j.versiculo && !e.text.includes(j.versiculo)) throw new Error(`"versiculo" do roteiro não é um trecho exato do texto do catálogo (${e.id})`);
  const versiculo: string = j.versiculo ?? e.text;
  return { ato1: j.ato1, cta: j.cta, ato3: j.ato3, versiculo, climax: palavraClimax(versiculo, j.climax), cta_style: j.cta_style ?? "manual",
    cenas: j.cenas ?? { ato1: { flux: "", pexels: [] }, ato2: { flux: "", pexels: [] }, ato3: { flux: "", pexels: [] } }, origem: "banco-local" };
}

async function main() {
  const o = args();
  prepararOverlays();
  const rand = prng(o.seed ?? Date.now());
  const catalogo = loadCatalog();
  const historico = loadHistory();

  // 1) engine
  let entrada;
  if (o.ref) {
    entrada = catalogo.find((e) => e.id === o.ref) ?? catalogo.find((e) => e.id.startsWith(o.ref!));
    if (!entrada) throw new Error(`passagem "${o.ref}" não existe no catálogo`);
  } else {
    const r = pickNext(catalogo, historico, { rand, tone: o.tom });
    entrada = r.entry;
    if (r.relaxed.length) console.warn(`⚠ regras relaxadas: ${r.relaxed.join(", ")}`);
  }
  console.log(`▶ ${entrada.reference} | gancho: ${entrada.emotional_hook} | ritmo: ${entrada.tone} | sinais: ${entrada.audio_cues.join(", ")}`);

  // 2) roteiro
  const rot = o.roteiro ? roteiroDeArquivo(o.roteiro, entrada) : await gerarRoteiro(entrada, historico, { rand, offline: o.offline });
  console.log(`  roteiro (${rot.origem}); CTA [${rot.cta_style}]: "${rot.cta}"`);

  // 3) narração
  const falas = await narrar([
    { chave: "ato1", texto: rot.ato1, perfil: "narrador", maxDur: 7.6 },
    { chave: "cta", texto: rot.cta, perfil: "cta", maxDur: Number(process.env.CTA_MAX_S ?? 4.5) },
    { chave: "ato2", texto: rot.versiculo, perfil: "leitura", maxDur: 8 },
    { chave: "ato3", texto: rot.ato3, perfil: "narrador", maxDur: 11 },
  ], o.offline) as Record<"ato1" | "cta" | "ato2" | "ato3", Awaited<ReturnType<typeof narrar>>[string]>;
  console.log("  duração: " + (["ato1", "cta", "ato2", "ato3"] as const).map((k) => `${k} ${falas[k].dur.toFixed(1)}s`).join(" | "));

  // 4) linha do tempo
  const bpm = bpmDoTom(entrada.tone);
  let linha = montarLinha(falas, bpm, extras.loop);
  if (linha.total > DUR_MAX) {
    // O ato 3 é o elástico: fala mais ligeiro (até 1.0) para o vídeo fechar em DUR_MAX.
    const orcamento = DUR_MAX - 0.8 - linha.ini.ato3;
    console.warn(`  ato 3 refeito para caber em ${orcamento.toFixed(1)} s`);
    falas.ato3 = (await narrar([{ chave: "ato3", texto: rot.ato3, perfil: "narrador", maxDur: orcamento }], o.offline)).ato3;
    linha = montarLinha(falas, bpm, extras.loop);
  }
  linha.avisos.forEach((x) => console.warn("⚠ " + x));
  const segs = segmentos(falas, linha);
  const climaxT = palavraClimaxTempo(segs.find((s) => s.id === "ato2")!, rot.climax);

  const id = `${new Date().toISOString().slice(0, 10)}-${entrada.id}`;
  const pub = join(RAIZ, "public/runs", id), saida = join(RAIZ, "out", id);
  mkdirSync(pub, { recursive: true }); mkdirSync(saida, { recursive: true });

  // 5) visuais
  let tomadasRoteiro = null as PlanoTomada[] | null;
  if (extras.fundo === "gerativo") {
    // fundo gerado por shader (sem imagens, sem custo): uma única tomada para o vídeo inteiro
    tomadasRoteiro = [{ ini: 0, fim: linha.total, tipo: "gerativo", src: "", seed: entrada.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 97 }];
  } else if (extras.tomadas?.length) {
    // Cenografia do roteiro: cada tomada começa NA palavra indicada (ou no início de um ato).
    const todas = segs.flatMap((sg) => sg.palavras.map((w) => ({ ...w, seg: sg.id })));
    const limpa = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
    let depois = 0;
    const inicios = extras.tomadas.map((tm, k) => {
      if (k === 0) return 0;
      if (tm.inicio) { const sg = segs.find((x) => x.id === tm.inicio); if (sg) return (depois = sg.ini); }
      const w = todas.find((x) => x.ini > depois + 0.3 && limpa(x.t) === limpa(tm.palavra ?? ""));
      if (!w) throw new Error(`tomada ${k}: palavra "${tm.palavra}" não encontrada depois de ${depois.toFixed(1)}s`);
      return (depois = Math.max(0, w.ini - 0.06));   // o corte antecipa a palavra em 2 quadros
    });
    const roteiroTomadas: PlanoTomada[] = extras.tomadas.map((tm, k) => ({
      ini: inicios[k], fim: k + 1 < inicios.length ? inicios[k + 1] : 0, tipo: "cenografia", src: "", cena: tm.cena, variante: tm.variante, seed: k,
    }));
    tomadasRoteiro = roteiroTomadas;
  }
  const anteriores = new Set(historico.slice(-30).flatMap((h) => h.pexels_ids ?? []));
  const usados = new Set<number>(anteriores);   // o Pexels não repete clipes dos últimos 30 vídeos
  const tomadas: PlanoTomada[] = [];
  const creditos: string[] = [];
  const temRep = Boolean(process.env.REPLICATE_API_TOKEN), temPex = Boolean(process.env.PEXELS_API_KEY);
  const fundosAto: Partial<Record<"ato1" | "ato2" | "ato3", { img: string; prof?: string }>> = {};
  const novosFundos: Parameters<typeof confirmarFundos>[0] = [];
  let n = 0;
  // Legenda em blocos de 2 linhas; com o Replicate, CADA bloco ganha uma imagem nova, trocada no instante
  // em que a voz começa o bloco (sincronia). Profundidade calculada localmente (grátis).
  const blocosLeg = montarBlocos(segs);
  const modoGeral: ModoVisual = o.visual !== "auto" ? o.visual : temRep && temPex ? "hybrid" : temRep ? "replicate" : temPex ? "pexels" : "procedural";
  let porBloco = false;
  if (!tomadasRoteiro && modoGeral === "replicate" && !o.offline) {
    porBloco = true;
    const humor = { ato1: "ato1", cta: "ato2", ato2: "ato2", ato3: "ato3" } as const;
    let primeira: { img: string; prof: string; faixa: number } | null = null;
    // metade das imagens de antes: cada imagem fica >= MIN_IMG_S (padrão 4,5 s ≈ 8 imagens por vídeo) e só troca no início de uma linha
    // (ou quando o ato muda); duas partes de 1 linha seguidas sempre dividem a mesma imagem
    const grupos = agruparParaImagens(blocosLeg, Number(process.env.MIN_IMG_S ?? 4.5), Number(process.env.MAX_IMG_S ?? 9));
    for (let k = 0; k < grupos.length; k++) {
      const b = blocosLeg[grupos[k][0]];
      const ini = k === 0 ? 0 : Math.max(0, b.ini - 0.06);
      const fim = k + 1 < grupos.length ? Math.max(0, blocosLeg[grupos[k + 1][0]].ini - 0.06) : linha.total;
      let f: { img: string; prof: string; faixa: number };
      if (extras.loop && k === grupos.length - 1 && primeira) f = primeira;   // loop: termina na imagem do começo
      else {
        // --trocar 3,7: refaz só essas imagens (outra semente), recusando também a anterior
        const jaTem = join(pub, `bloco-${k}.png`);
        if (o.reusar && existsSync(jaTem) && existsSync(join(pub, `bloco-${k}-prof.png`)) && !o.trocar.includes(k)) {
          // mesma imagem do plano anterior: não gera nada novo (e como já foi registrada, não duplica o registro)
          f = { img: jaTem, prof: join(pub, `bloco-${k}-prof.png`), faixa: avaliar(jaTem).faixa };
          // a imagem reaproveitada também precisa constar no registro (confirmarFundos ignora as que já estão lá)
          novosFundos.push({ hash: dhash(jaTem), prompt: "(reaproveitada do plano)", seed: 0, video: id, ato: humor[b.seg], em: new Date().toISOString() });
          if (k === 0) primeira = f;
          tomadas.push({ ini, fim, tipo: "parallax", src: `runs/${id}/bloco-${k}.png`, depth: `runs/${id}/bloco-${k}-prof.png`, seed: k, faixa: f.faixa });
          continue;
        }
        let r = await fundoInedito(humor[b.seg], id, rand, novosFundos.map((x) => x.hash));
        if (o.trocar.includes(k)) {
          const rand2 = prng((o.seed ?? 1) * 7919 + k * 104729 + 13);
          r = await fundoInedito(humor[b.seg], id, rand2, [...novosFundos.map((x) => x.hash), r.registro.hash]);
        }
        novosFundos.push(r.registro);
        f = { img: r.arq, prof: profundidadeLocal(r.arq), faixa: r.faixa };
      }
      if (k === 0) primeira = f;
      const di = `bloco-${k}.png`, dp = `bloco-${k}-prof.png`;
      copyFileSync(f.img, join(pub, di)); copyFileSync(f.prof, join(pub, dp));
      tomadas.push({ ini, fim, tipo: "parallax", src: `runs/${id}/${di}`, depth: `runs/${id}/${dp}`, seed: k, faixa: f.faixa });
    }
    console.log(`  fundos: ${novosFundos.length} imagens inéditas para ${blocosLeg.length} blocos de legenda`);
  }
  for (const bloco of tomadasRoteiro || porBloco ? [] : blocos(linha, bpm)) {
    const limites = [bloco.ini, ...bloco.cortes, bloco.fim];
    for (let k = 0; k < limites.length - 1; k++, n++) {
      const [ini, fim] = [limites[k], limites[k + 1]];
      const cena = rot.cenas[bloco.ato];
      const modo: ModoVisual = o.offline && o.visual === "auto" ? "hybrid"
        : o.visual !== "auto" ? o.visual : temRep && temPex ? "hybrid" : temRep ? "replicate" : temPex ? "pexels" : "procedural";
      if (modo === "procedural") {
        const c = cenaDaTomada(bloco.ato, k, entrada.audio_cues, entrada.tone);
        tomadas.push({ ini, fim, tipo: "procedural", src: "", cenario: c.cenario, clima: c.clima, seed: 3 + n * 2 + (entrada.id.length % 7) });
        continue;
      }
      const usarPexels = o.offline ? bloco.ato !== "ato1"
        : modo === "pexels" ? true : modo === "replicate" ? false
        : bloco.ato !== "ato1" ? temPex || !temRep : !temRep && temPex;   // hybrid: ato1=Flux, resto=Pexels
      const ext = (f: string) => extname(f) || ".png";
      if (usarPexels) {
        const arq = o.offline ? videoFalso(n, Math.ceil(fim - ini) + 2)
          : await (async () => {
            const c = await buscarClipe(cena.pexels[k % cena.pexels.length], usados, Math.ceil(fim - ini) + 1, k);
            creditos.push(`Pexels — ${c.autor}: ${c.url}`);
            return c.arquivo;
          })();
        const dest = `tomada-${n}.mp4`; copyFileSync(arq, join(pub, dest));
        tomadas.push({ ini, fim, tipo: "video", src: `runs/${id}/${dest}`, seed: n });
      } else {
        let img: string, prof: string | undefined;
        if (o.offline) ({ imagem: img, profundidade: prof } = imagemFalsa(n));
        else {
          // fundos neutros do roteiro: UMA imagem por ato (mesmo prompt e semente), cada tomada com outro movimento;
          // em loop, a última tomada volta à imagem do ato 1
          const ultima = k === limites.length - 2 && bloco.ato === "ato3";
          const atoImg = extras.loop && ultima ? "ato1" : bloco.ato;
          if (!fundosAto[atoImg]) { // um fundo INÉDITO por ato (qualidade checada, nunca repetido entre vídeos)
            const f = await fundoInedito(atoImg, id, rand, novosFundos.map((x) => x.hash));
            novosFundos.push(f.registro);
            let d: string | undefined;
            try { d = process.env.PROFUNDIDADE === "replicate" ? await gerarProfundidade(await dataUri(f.arq), f.arq) : profundidadeLocal(f.arq); }
            catch (e) { console.warn(`⚠ sem mapa de profundidade (${atoImg}): ${(e as Error).message}`); }
            fundosAto[atoImg] = { img: f.arq, prof: d };
          }
          img = fundosAto[atoImg]!.img; prof = fundosAto[atoImg]!.prof;
        }
        const di = `tomada-${n}${ext(img)}`; copyFileSync(img, join(pub, di));
        let dp: string | undefined;
        if (prof) { dp = `profundidade-${n}${ext(prof)}`; copyFileSync(prof, join(pub, dp)); }
        tomadas.push({ ini, fim, tipo: "parallax", src: `runs/${id}/${di}`, depth: dp && `runs/${id}/${dp}`, seed: n });
      }
    }
  }
  if (tomadasRoteiro) { tomadasRoteiro[tomadasRoteiro.length - 1].fim = linha.total; tomadas.push(...tomadasRoteiro); }
  console.log(`  visuais: ${tomadas.length} tomadas (${tomadas.filter((t) => t.tipo === "video").length} vídeo, ${tomadas.filter((t) => t.tipo === "parallax").length} parallax); cortes no compasso de ${bpm} BPM`);

  // 6) áudio
  const at = linha.ini;
  const mix = mixar({
    total: linha.total,
    voz: [{ ini: at.ato1, audio: falas.ato1.audio }, { ini: at.cta, audio: falas.cta.audio }, { ini: at.ato2, audio: falas.ato2.audio }, { ini: at.ato3, audio: falas.ato3.audio }],
    atos: { ato1: [0, at.cta], cta: [at.cta, at.ato2], ato2: [at.ato2, at.ato3], ato3: [at.ato3, linha.total] },
    cues: entrada.audio_cues, tom: entrada.tone, bpm, climaxEm: climaxT, abertura: Boolean(extras.gancho_tela), loop: extras.loop,
  });
  const mixArq = gravarMix(mix.esq, mix.dir, join(pub, "mix"));
  copyFileSync(mixArq, join(saida, basename(mixArq)));

  // 7) plano
  const plano: Plano = {
    id, fps: FPS, duracao: linha.total, bpm, tom: entrada.tone, referencia: entrada.reference, gancho: entrada.emotional_hook,
    audio: `runs/${id}/${basename(mixArq)}`, segmentos: segs, tomadas, climax: { t: climaxT, palavra: rot.climax },
    rotulo: rotuloDe(entrada, at.ato2),
    fundo: extras.fundo === "gerativo" ? { paleta: extras.paleta ?? (entrada.tone === "epic" ? "ouro" : "azul"), semente: tomadas[0]?.seed ?? 1 } : undefined,
    visual_fato: extras.visual_fato ? visualFato(extras.visual_fato, segs) : undefined,
    gancho_tela: extras.verso_fixo ? undefined : extras.gancho_tela, ...ganchoTempos(segs, extras.verso_fixo ? [] : extras.gancho_tela), verso_fixo: extras.verso_fixo, loop: extras.loop, blocos: blocosLeg,
    cta_tela: extras.cta_tela ? { texto: extras.cta_tela, ini: at.cta, fim: at.ato2 - 0.2 } : undefined,
  };
  const planoArq = join(saida, "plano.json");
  writeFileSync(planoArq, JSON.stringify(plano, null, 2));
  writeFileSync(join(saida, "roteiro.json"), JSON.stringify({ referencia: entrada.reference, contexto: entrada.historical_context, ...rot, falas: { ato1: rot.ato1, cta: rot.cta, ato2: rot.versiculo, ato3: rot.ato3 } }, null, 2));
  if (creditos.length) writeFileSync(join(saida, "creditos.json"), JSON.stringify(creditos, null, 2));
  console.log(`  plano: ${planoArq} (${linha.total.toFixed(1)} s)`);

  // 8) render
  if (!o.semRender) {
    const bruto = join(saida, "bruto.mp4"), video = join(saida, "video.mp4");
    if (o.frames) {
      const r = spawnSync("npx", ["remotion", "render", "src/remotion/index.ts", "Verso", bruto, `--props=${planoArq}`, "--codec=h264", "--crf=20", `--frames=${o.frames}`], { cwd: RAIZ, stdio: "inherit" });
      if (r.status !== 0) throw new Error("render falhou");
    } else renderEmBlocos(planoArq, bruto, mixArq, linha.total);
    const [f0, f1] = o.frames ? o.frames.split("-").map(Number) : [0, Math.round(linha.total * FPS) - 1];
    const foto = tomadas.some((x) => x.tipo === "parallax" || x.tipo === "video");
    const { mb, kbps } = finalizar(bruto, video, (f1 - f0 + 1) / FPS, foto ? 6 : 0, { titulo: `${entrada.reference} — ${(rot.ato1.match(/^[^.!?…]*[.!?…]?/)?.[0] ?? "").trim()}`, descricao: (rot as { descricao_tiktok?: string }).descricao_tiktok ?? `${entrada.reference}. ${rot.ato1}` });
    if (novosFundos.length) confirmarFundos(novosFundos);   // a partir daqui essas imagens nunca mais se repetem
    console.log(`✔ ${video} (${mb.toFixed(1)} MB, vídeo a ${kbps} kbps)`);
  }

  // 9) histórico (só depois de o vídeo existir)
  if (!o.semHistorico && !o.offline && !o.semRender) { // só conta como publicado quando o vídeo existe
    saveHistory(registrar(historico, entrada, { cta_style: rot.cta_style, cta_text: rot.cta, pexels_ids: [...usados].filter((x) => !anteriores.has(x)) }));
    console.log("  histórico atualizado");
  }
}

main().catch((e) => { console.error("✖", e instanceof Error ? e.message : e); process.exit(1); });
