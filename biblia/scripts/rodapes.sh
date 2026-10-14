#!/usr/bin/env bash
# Montagem do rodapé (e do topo) AMPLIADO de todas as imagens de um vídeo, para achar texto indesejado do Flux.
# Uso: scripts/rodapes.sh <pasta public/runs/...>  → grava /tmp/claude-0/rodapes.png
set -e
dir="$1"; i=0; args=()
for f in $(ls "$dir"/bloco-*.png | grep -v prof | sort -V); do
  ffmpeg -nostdin -y -loglevel error -i "$f" -vf "crop=iw:ih*0.11:0:ih*0.89,scale=iw*1.3:-1,drawtext=text='$i':x=6:y=4:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.6" "/tmp/claude-0/rp_$i.png" 2>/dev/null \
   || ffmpeg -nostdin -y -loglevel error -i "$f" -vf "crop=iw:ih*0.11:0:ih*0.89,scale=iw*1.3:-1" "/tmp/claude-0/rp_$i.png"
  args+=(-i "/tmp/claude-0/rp_$i.png"); i=$((i+1))
done
ffmpeg -nostdin -y -loglevel error "${args[@]}" -filter_complex "vstack=$i" /tmp/claude-0/rodapes.png
echo "$i imagens → /tmp/claude-0/rodapes.png"
