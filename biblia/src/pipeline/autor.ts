/**
 * Roteiro feito 100 % pelo DeepSeek: 1 autor + 7 analistas (um por fase, em paralelo, prompts completos).
 * Rodadas: autor escreve → checagens objetivas locais → 7 analistas → se alguma fase < 8, o autor reescreve com os pareceres
 * das fases reprovadas → novos analistas (sempre chamadas novas, sem memória) … até todas ≥ 8 (máx. RODADAS_MAX).
 */
import { conversar, extrairJson, MODELOS, uso } from "./deepseek.ts";
import { DEPENDENCIAS, FASES, SISTEMA_AUTOR, pedidoAnalista, pedidoAutor, type Fase, type Passagem, type Rot } from "./equipe.ts";
import { LIMITES, validar } from "./script.ts";

export const RODADAS_MAX = Number(process.env.RODADAS_MAX ?? 8);
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
    const txt = await conversar({ model: MODELOS.autor(), system: SISTEMA_AUTOR, user: pedidoAutor(p, evitar, fb), maxTokens: 12000 });
    try {
      const j = extrairJson<Roteiro>(txt);
      if (j.ato1 && j.cta && j.versiculo && j.ato3) return { ...j, ato1: j.ato1.trim(), cta: j.cta.trim(), versiculo: j.versiculo.trim(), ato3: j.ato3.trim(), climax: String(j.climax ?? "").trim() };
    } catch (e) { console.warn(`  autor: resposta inválida (${(e as Error).message.slice(0, 80)}) — de novo`); }
  }
  throw new Error("o autor não devolveu um roteiro em JSON válido");
}

async function analisar(fase: Fase, r: Rot, p: Passagem): Promise<Analise> {
  const modelo = fase === "ato3" || fase === "final" ? MODELOS.fatos() : MODELOS.analista();
  const { system, user } = pedidoAnalista(fase, r, p);
  for (let t = 0; t < 3; t++) {
    const txt = await conversar({ model: modelo, system, user, temperatura: 0.2, maxTokens: 6000 });
    try {
      const a = extrairJson<Analise>(txt);
      if (typeof a.nota === "number") return { ...a, nota: Math.round(a.nota) };
    } catch { /* tenta de novo */ }
  }
  throw new Error(`analista de ${fase} não devolveu JSON válido`);
}

export async function criarRoteiro(p: Passagem, evitar: string[] = [], log: (s: string) => void = console.log): Promise<Resultado> {
  let rot = await escrever(p, evitar);
  let fb: Parameters<typeof pedidoAutor>[2] | undefined;
  for (let rodada = 1; rodada <= RODADAS_MAX; rodada++) {
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
    log(`  reprovadas: ${reprovadas.join(", ")} — o autor reescreve`);
    rot = await escrever(p, evitar, { rot, falhas: [], analises: pareceres });
  }
  throw new Error(`roteiro não convergiu em ${RODADAS_MAX} rodadas (uso DeepSeek: ${uso.chamadas} chamadas, ${uso.prompt} tokens de entrada, ${uso.saida} de saída)`);
}

export const limites = LIMITES;
