#!/bin/bash
# uso: tools/lado-a-lado.sh <NomeFigma> <prefixo-nosso> <n-fatias>
for i in $(seq 0 $(($3-1))); do
  h1=$(ffprobe -v error -select_streams v -show_entries stream=height -of csv=p=0 ../_figma/slices/$1_$i.png)
  h2=$(ffprobe -v error -select_streams v -show_entries stream=height -of csv=p=0 $2_$i.png)
  h=$(( h1 < h2 ? h1 : h2 ))
  ffmpeg -loglevel error -y -i ../_figma/slices/$1_$i.png -i $2_$i.png -filter_complex "[0]crop=iw:$h:0:0[a];[1]crop=iw:$h:0:0[b];[a][b]hstack=inputs=2" cmp-$2_$i.png
done
