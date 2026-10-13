import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
import { RAIZ } from "./catalog.ts";

// O fetch do Node ignora HTTPS_PROXY; em redes com proxy (ex.: sessões na nuvem) isto o respeita.
if (process.env.HTTPS_PROXY || process.env.https_proxy) setGlobalDispatcher(new EnvHttpProxyAgent());

/** Lê .env (ignorado pelo git) sem sobrescrever variáveis já definidas. */
export function carregarEnv() {
  for (const dir of [RAIZ, join(RAIZ, "..")]) {
    const f = join(dir, ".env");
    if (!existsSync(f)) continue;
    for (const l of readFileSync(f, "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
carregarEnv();

export const temChave = (nome: string) => Boolean(process.env[nome]);

export async function comTentativas<T>(fn: () => Promise<T>, vezes = 3, base = 1500): Promise<T> {
  let erro: unknown;
  for (let i = 0; i < vezes; i++) {
    try { return await fn(); } catch (e) {
      erro = e;
      if (i < vezes - 1) await new Promise((r) => setTimeout(r, base * 2 ** i));
    }
  }
  throw erro;
}
