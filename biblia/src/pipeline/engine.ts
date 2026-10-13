/**
 * Engine de seleção: lê o histórico e escolhe a próxima passagem.
 *
 * Regras (da mais forte para a mais fraca; se nenhum candidato passar, relaxa na ordem inversa):
 *  1. nunca repete o LIVRO nem o GANCHO EMOCIONAL do vídeo imediatamente anterior (inviolável);
 *  2. evita repetir uma passagem já usada (só cede com o catálogo quase esgotado);
 *  3. evita livros usados nos últimos LIVROS_JANELA vídeos e ganchos nos últimos GANCHOS_JANELA;
 *  4. alterna o ritmo: depois de uma passagem épica vem uma de reflexão/conforto, e vice-versa;
 *  5. entre os que sobraram, sorteio ponderado que favorece Antigo/Novo Testamento alternados
 *     e livros menos usados.
 */
import type { CatalogEntry, HistoryItem, Tone } from "../lib/types.ts";

export const LIVROS_JANELA = 3;
export const GANCHOS_JANELA = 3;

/** PRNG determinístico (mulberry32) para sorteios reproduzíveis com --seed. */
export function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PickOptions {
  rand?: () => number;
  /** força o ritmo (ignora a alternância) */
  tone?: Tone;
}

export interface PickResult {
  entry: CatalogEntry;
  /** regras que precisaram ser relaxadas (vazio = tudo respeitado) */
  relaxed: string[];
}

export function pickNext(catalog: CatalogEntry[], history: HistoryItem[], opts: PickOptions = {}): PickResult {
  const rand = opts.rand ?? Math.random;
  const usados = new Set(history.map((h) => h.id));
  const recentes = history.slice(-Math.max(LIVROS_JANELA, GANCHOS_JANELA)).reverse(); // mais novo primeiro
  const ultimo = recentes[0];
  const livrosRecentes = new Set(recentes.slice(0, LIVROS_JANELA).map((h) => h.book));
  const ganchosRecentes = new Set(recentes.slice(0, GANCHOS_JANELA).map((h) => h.emotional_hook));
  const tomAlvo: Tone | undefined = opts.tone ?? (ultimo ? (ultimo.tone === "epic" ? "comfort" : "epic") : undefined);

  type Regra = [string, (e: CatalogEntry) => boolean];
  const regras: Regra[] = [
    ["livro diferente do último", (e) => !ultimo || e.book !== ultimo.book],
    ["gancho diferente do último", (e) => !ultimo || e.emotional_hook !== ultimo.emotional_hook],
    ["passagem inédita", (e) => !usados.has(e.id)],
    ["ritmo alternado", (e) => !tomAlvo || e.tone === tomAlvo],
    ["livro fora da janela recente", (e) => !livrosRecentes.has(e.book)],
    ["gancho fora da janela recente", (e) => !ganchosRecentes.has(e.emotional_hook)],
  ];
  // Relaxa primeiro as regras mais fracas (do fim para o começo).
  const relaxed: string[] = [];
  let ativas = regras.slice();
  let candidatos = catalog.filter((e) => ativas.every(([, f]) => f(e)));
  while (candidatos.length === 0 && ativas.length > 1) {
    const [nome] = ativas.pop()!;
    relaxed.push(nome);
    candidatos = catalog.filter((e) => ativas.every(([, f]) => f(e)));
  }
  if (candidatos.length === 0) {
    // catálogo esgotado: recomeça o ciclo mantendo só as regras de variedade.
    relaxed.push("passagem inédita (catálogo esgotado)");
    candidatos = catalog.filter((e) => (!ultimo || (e.book !== ultimo.book && e.emotional_hook !== ultimo.emotional_hook)));
    if (candidatos.length === 0) candidatos = catalog.slice();
  }

  // Peso: livros pouco usados e alternância de testamento.
  const usoLivro = new Map<string, number>();
  for (const h of history) usoLivro.set(h.book, (usoLivro.get(h.book) ?? 0) + 1);
  const ultimoTestamento = ultimo ? catalog.find((c) => c.book === ultimo.book)?.testament : undefined;
  const pesos = candidatos.map((e) => {
    let w = 1 / (1 + (usoLivro.get(e.book) ?? 0));
    if (ultimoTestamento && e.testament !== ultimoTestamento) w *= 2;
    return w;
  });
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < candidatos.length; i++) {
    r -= pesos[i];
    if (r <= 0) return { entry: candidatos[i], relaxed };
  }
  return { entry: candidatos[candidatos.length - 1], relaxed };
}

export function registrar(history: HistoryItem[], e: CatalogEntry, extra: Partial<HistoryItem> = {}): HistoryItem[] {
  return [...history, {
    at: new Date().toISOString(), id: e.id, reference: e.reference, book: e.book,
    emotional_hook: e.emotional_hook, tone: e.tone, ...extra,
  }];
}
