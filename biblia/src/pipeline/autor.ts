/**
 * Roteiro feito 100 % pelo LLM: 1 autor + 7 analistas (um por fase, em paralelo, prompts completos).
 * Rodadas: autor escreve → checagens objetivas locais → 7 analistas → se alguma fase < 8, o autor reescreve com os pareceres
 * das fases reprovadas → novos analistas (sempre chamadas novas, sem memória) … até todas ≥ 8 (máx. RODADAS_MAX).
 */
import { conversar, extrairJson, MODELOS, uso } from "./llm.ts";
import { DEPENDENCIAS, FASES, SISTEMA_AUTOR, pedidoAnalista, pedidoAutor, type Fase, type Passagem, type Rot } from "./equipe.ts";
import { LIMITES, validar } from "./script.ts";

export const RODADAS_MAX = Number(process.env.RODADAS_MAX ?? 14);
const NOTA_MIN = 8;

export interface Analise { nota: number; onde_rolaria: string; motivo: string; reescrita: string | null; riscos: string; auditoria: string }
export interface Roteiro extends Rot { auditoria: Record<Fase, string>; descricao_tiktok: string; hashtags: string }
export interface Resultado { roteiro: Roteiro; notas: Record<Fase, number>; rodadas: number; analises: Record<Fase, Analise> }

const nPal = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const limpa = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");

/** Checagens objetivas (sem IA): limites, 1ª frase, trecho exato, clímax, CTA, final aberto. */
export function checagens(r: Rot, texto: string): string[] {
  const erros = validar(r);
  const primeira = (r.ato1.match(/^[^.!?…]*[.!?…]/)?.[0] ?? r.ato1).trim();
  if (nPal(primeira) > 9) erros.push(`1ª frase com ${nPal(primeira)} palavras (máx. 9)`);
  if (/\?/.test(primeira)) erros.push("1ª frase é pergunta");
  if (!r.versiculo || !texto.includes(r.versiculo)) erros.push("versiculo NÃO é um trecho exato (letra por letra, com a pontuação) do texto bíblico");
  else if (nPal(r.versiculo) > 16) erros.push(`versiculo com ${nPal(r.versiculo)} palavras (máx. 16)`);
  if (r.versiculo && !r.versiculo.split(/\s+/).some((w) => limpa(w) === limpa(r.climax))) erros.push("climax não é uma palavra do versiculo");
  if (!/curt/i.test(r.cta) || !/coment/i.test(r.cta) || !/am[ée]m/i.test(r.cta)) erros.push('o CTA precisa pedir "curte", "comenta" e "amém"');
  if (/[.!?…:]\s*$/.test(r.ato3.trim())) erros.push("o ato 3 precisa terminar SEM ponto final (frase incompleta que emenda no ato 1)");
  if (/\bpor isso\b/i.test(r.ato3.split(/[.!?]/).pop() ?? "")) erros.push('emenda mecânica ("Por isso")');
  return erros;
}

async function escrever(p: Passagem, evitar: string[], fb?: Parameters<typeof pedidoAutor>[2]): Promise<Roteiro> {
  for (let t = 0; t < 3; t++) {
    const txt = await conversar({ model: MODELOS.autor(), system: SISTEMA_AUTOR, user: pedidoAutor(p, evitar, fb), maxTokens: 32000 });
    try {
      const j = extrairJson<Roteiro>(txt);
      if (j.ato1 && j.cta && j.versiculo && j.ato3) return { ...j, ato1: j.ato1.trim(), cta: j.cta.trim(), versiculo: j.versiculo.trim(), ato3: j.ato3.trim(), climax: String(j.climax ?? "").trim() };
    } catch (e) { console.warn(`  autor: resposta inválida (${(e as Error).message.slice(0, 80)}) — de novo`); }
  }
  throw new Error("o autor não devolveu um roteiro em JSON válido");
}

/** Modelos sem raciocínio erram contagem: um ajuste dedicado, com as palavras NUMERADAS, verificado no código. */
async function ajustarContagem(campo: "ato1" | "cta" | "ato3", texto: string, min: number, max: number, extra = ""): Promise<string> {
  let atual = texto;
  const frasesOk = (t: string) => campo !== "ato1" || nPal((t.match(/^[^.!?…]*[.!?…]/)?.[0] ?? t).trim()) <= 9;
  for (let t = 0; t < 5 && (nPal(atual) < min || nPal(atual) > max || !frasesOk(atual)); t++) {
    const numerado = atual.trim().split(/\s+/).map((w, i) => `${i + 1}:${w}`).join(" ");
    const sistema = "Você edita textos curtos falados em português do Brasil. Responda SOMENTE com o texto reescrito (sem aspas, sem comentário).";
    const n = nPal(atual), alvo = Math.round((min + max) / 2);
    const acao = n > max ? `REMOVA exatamente ${n - alvo} palavras (corte enchimento, adjetivos e detalhes menores)` : n < min ? `ACRESCENTE exatamente ${alvo - n} palavras (detalhe concreto, sem inventar fatos)` : "encurte a 1ª frase para no máximo 9 palavras";
    const usuario = `Texto (palavras numeradas; tem ${n} palavras): ${numerado}\n\n${acao}. O resultado deve ter entre ${min} e ${max} palavras (alvo ${alvo}). MANTENHA a ideia, o tom, os fatos e o sentido.${campo === "ato1" ? " A 1ª frase deve ter NO MÁXIMO 9 palavras." : ""}${campo === "ato3" ? " Mantenha o final INCOMPLETO, sem ponto final, exatamente como está (ele emenda no começo do vídeo)." : ""}${extra}`;
    const r = (await conversar({ model: MODELOS.analista(), system: sistema, user: usuario, temperatura: 0.3, maxTokens: 800, pensar: "off" })).trim().replace(/^["“]|["”]$/g, "");
    if (r) atual = r;
  }
  return atual;
}

export async function corrigirContagens(r: Rot): Promise<Rot> {
  const o = { ...r };
  const primeira = (s: string) => (s.match(/^[^.!?…]*[.!?…]/)?.[0] ?? s).trim();
  if (nPal(o.ato1) < LIMITES.ato1.min || nPal(o.ato1) > LIMITES.ato1.max || nPal(primeira(o.ato1)) > 9) o.ato1 = await ajustarContagem("ato1", o.ato1, LIMITES.ato1.min, LIMITES.ato1.max);
  if (nPal(o.cta) < LIMITES.cta.min || nPal(o.cta) > LIMITES.cta.max) o.cta = await ajustarContagem("cta", o.cta, LIMITES.cta.min, LIMITES.cta.max, ' Mantenha os pedidos "curte", "comenta" e "amém".');
  if (nPal(o.ato3) < LIMITES.ato3.min || nPal(o.ato3) > LIMITES.ato3.max) o.ato3 = await ajustarContagem("ato3", o.ato3, LIMITES.ato3.min, LIMITES.ato3.max);
  return o;
}

async function analisar(fase: Fase, r: Rot, p: Passagem): Promise<Analise> {
  const fatos = fase === "ato3" || fase === "final";   // fatos/laço: usam MODELOS.fatos() (hoje também flash)
  const modelo = fatos ? MODELOS.fatos() : MODELOS.analista();
  const { system, user } = pedidoAnalista(fase, r, p);
  for (let t = 0; t < 3; t++) {
    const txt = await conversar({ model: modelo, system, user, temperatura: 0.2, maxTokens: 14000, pensar: process.env.LLM_PENSAR_ANALISTA as "off" | "low" | "high" ?? "off" });
    try {
      const a = extrairJson<Analise>(txt);
      if (typeof a.nota === "number") return { ...a, nota: Math.round(a.nota) };
    } catch { /* tenta de novo */ }
  }
  throw new Error(`analista de ${fase} não devolveu JSON válido`);
}

const CAMPO: Record<Fase, string> = { gancho: "1ª frase do ato1", virada: "2ª frase do ato1", contexto: "restante do ato1", cta: "cta", versiculo: "versiculo e climax", ato3: "ato3 (exceto o final)", final: "final do ato3 (a emenda)" };

export async function criarRoteiro(p: Passagem, evitar: string[] = [], log: (s: string) => void = console.log): Promise<Resultado> {
  let rot = await escrever(p, evitar);
  let melhor: { rot: Roteiro; soma: number; analises: Record<Fase, Analise>; notas: Record<Fase, number> } | undefined;
  for (let rodada = 1; rodada <= RODADAS_MAX; rodada++) {
    log(`  rodada ${rodada}: "${rot.ato1.split(/(?<=[.!?…])\s/)[0]}" | cta "${rot.cta}"`);
    rot = { ...rot, ...(await corrigirContagens(rot)) };
    const erros = checagens(rot, p.text);
    if (erros.length) {
      log(`  rodada ${rodada}: ${erros.length} erro(s) objetivo(s): ${erros.join("; ")}`);
      rot = await escrever(p, evitar, { rot, falhas: erros, analises: {} });
      continue;
    }
    const lista = await Promise.all(FASES.map(async (f) => [f, await analisar(f, rot, p)] as const));
    const analises = Object.fromEntries(lista) as Record<Fase, Analise>;
    const notas = Object.fromEntries(lista.map(([f, a]) => [f, a.nota])) as Record<Fase, number>;
    log(`  rodada ${rodada}: ${FASES.map((f) => `${f} ${notas[f]}`).join(" | ")}`);
    const reprovadas = FASES.filter((f) => notas[f] < NOTA_MIN);
    if (!reprovadas.length) {
      const auditoria = Object.fromEntries(FASES.map((f) => [f, analises[f].auditoria && nPal(analises[f].auditoria) >= 6 ? analises[f].auditoria : rot.auditoria?.[f] ?? ""])) as Record<Fase, string>;
      return { roteiro: { ...rot, auditoria }, notas, rodadas: rodada, analises };
    }
    const pareceres: Partial<Record<Fase, string>> = {};
    for (const f of reprovadas) {
      const a = analises[f];
      pareceres[f] = `nota ${a.nota}. Onde rola: ${a.onde_rolaria}. Motivo: ${a.motivo}. Reescrita sugerida: ${a.reescrita ?? "(nenhuma)"}. Riscos: ${a.riscos}.` +
        ` [Depois de mudar esta fase, confira as vizinhas: ${DEPENDENCIAS[f].join(", ")}]`;
    }
    const soma = FASES.reduce((x, f) => x + Math.min(notas[f], 9), 0);
    if (!melhor || soma >= melhor.soma) melhor = { rot, soma, analises, notas };
    else { // piorou: volta à melhor versão e usa os pareceres dela
      rot = melhor.rot;
      for (const f of FASES) delete pareceres[f];
      for (const f of FASES.filter((x) => melhor!.notas[x] < NOTA_MIN)) { const a = melhor.analises[f]; pareceres[f] = `nota ${a.nota}. Onde rola: ${a.onde_rolaria}. Motivo: ${a.motivo}. Reescrita sugerida: ${a.reescrita ?? "(nenhuma)"}. Riscos: ${a.riscos}.`; }
      log(`  (piorou; voltando à melhor versão: ${FASES.map((x) => `${x} ${melhor!.notas[x]}`).join(" ")})`);
    }
    const base = melhor.rot;
    const aprovadas = FASES.filter((f) => melhor!.notas[f] >= NOTA_MIN).map((f) => CAMPO[f]);
    const falhas = aprovadas.length ? [`NÃO ALTERE (já aprovados pelos analistas): ${aprovadas.join("; ")}. Reescreva SOMENTE o que reprovou; copie o resto palavra por palavra.`] : [];
    log(`  reprovadas: ${reprovadas.join(", ")} — o autor reescreve`);
    rot = await escrever(p, evitar, { rot: base, falhas, analises: pareceres });
  }
  throw new Error(`roteiro não convergiu em ${RODADAS_MAX} rodadas (uso LLM: ${uso.chamadas} chamadas, ${uso.prompt} tokens de entrada, ${uso.saida} de saída)`);
}

export const limites = LIMITES;
