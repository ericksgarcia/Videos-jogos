#!/usr/bin/env bash
# Montagens AMPLIADAS do rodapé (/tmp/claude-0/rodapes.png) e do TOPO (/tmp/claude-0/topos.png) de todas as imagens de
# um vídeo, para achar texto indesejado que o Flux pinta (rodapés e cantos).
# Uso: scripts/rodapes.sh <pasta public/runs/...>
set -e
dir="$1"; i=0; ab=(); at=()
for f in $(ls "$dir"/bloco-*.png | grep -v prof | sort -V); do
  for parte in rodape topo; do
    if [ $parte = rodape ]; then crop="crop=iw:ih*0.11:0:ih*0.89"; else crop="crop=iw:ih*0.14:0:0"; fi
    out="/tmp/claude-0/${parte}_$i.png"
    ffmpeg -nostdin -y -loglevel error -i "$f" -vf "$crop,scale=iw*1.3:-1,drawtext=text='$i':x=6:y=4:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.6" "$out" 2>/dev/null \
     || ffmpeg -nostdin -y -loglevel error -i "$f" -vf "$crop,scale=iw*1.3:-1" "$out"
    if [ $parte = rodape ]; then ab+=(-i "$out"); else at+=(-i "$out"); fi
  done
  i=$((i+1))
done
ffmpeg -nostdin -y -loglevel error "${ab[@]}" -filter_complex "vstack=$i" /tmp/claude-0/rodapes.png
ffmpeg -nostdin -y -loglevel error "${at[@]}" -filter_complex "vstack=$i" /tmp/claude-0/topos.png
echo "$i imagens → /tmp/claude-0/rodapes.png e topos.png"
