#!/usr/bin/env bash
# Libera disco depois que um vídeo foi ENVIADO. Nada disso vai para o GitHub (public/, out/ e data/cache/ estão no .gitignore).
#  - apaga imagens/planos (public/runs) e o resto de out/<run>/ (plano, bruto, legendas...);
#  - MANTÉM o video.mp4 final por 5 dias (regra do dono); só depois apaga a pasta inteira;
#  - mantém data/fundos-usados.json (hashes, para não repetir imagem).
# Uso: scripts/limpar.sh [pasta-de-run-em-andamento ...]   (ex.: 2026-10-15-dn-12-2 — fica intocada, inclusive o cache de voz)
cd "$(dirname "$0")/.."
DIAS="${MANTER_MP4_DIAS:-5}"
manter=" $* "
for d in public/runs/*; do
  [ -e "$d" ] || continue
  case "$manter" in *" $(basename "$d") "*) continue;; esac
  rm -rf "$d"
done
for d in out/*; do
  [ -d "$d" ] || continue
  case "$manter" in *" $(basename "$d") "*) continue;; esac
  if [ -f "$d/video.mp4" ]; then
    if [ -n "$(find "$d/video.mp4" -mtime +"$DIAS" 2>/dev/null)" ]; then rm -rf "$d"
    else find "$d" -mindepth 1 ! -name video.mp4 -delete 2>/dev/null; fi
  else rm -rf "$d"; fi
done
# caches (voz e imagens) só se NÃO houver vídeo em andamento
if [ $# -eq 0 ]; then rm -rf data/cache; fi
du -sh public out data/cache 2>/dev/null
