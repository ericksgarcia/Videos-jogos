import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CatalogEntry, HistoryItem } from "./types.ts";

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const CATALOG_PATH = join(RAIZ, "data/catalog.json");
export const HISTORY_PATH = join(RAIZ, "data/history.json");

export const loadCatalog = (p = CATALOG_PATH): CatalogEntry[] => JSON.parse(readFileSync(p, "utf8"));

export const loadHistory = (p = HISTORY_PATH): HistoryItem[] =>
  existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : [];

export const saveHistory = (h: HistoryItem[], p = HISTORY_PATH) =>
  writeFileSync(p, JSON.stringify(h, null, 2) + "\n");
