#!/usr/bin/env bash
# Apaga os arquivos pesados de vídeos JÁ ENVIADOS (imagens do Replicate, planos, MP4 e caches). Nada disso vai para o GitHub
# (public/, out/ e data/cache/ estão no .gitignore); isto só libera disco. Mantém data/fundos-usados.json (hashes, para não repetir imagem).
# Uso: scripts/limpar.sh [pasta-de-run-a-manter ...]   (ex.: o vídeo em andamento: 2026-10-15-dn-12-2)
cd "$(dirname "$0")/.."
manter=" $* "
for d in public/runs/* out/*; do
  [ -e "$d" ] || continue
  b=$(basename "$d")
  case "$manter" in *" $b "*) continue;; esac
  rm -rf "$d"
done
# caches (voz e imagens) só se NÃO houver vídeo em andamento
if [ $# -eq 0 ]; then rm -rf data/cache; fi
du -sh public out data/cache 2>/dev/null
