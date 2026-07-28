#!/bin/bash
# Renderiza a composição em blocos com retomada, depois concatena.
# Uso: ./render-chunks.sh <saida.mp4> [frames_por_bloco] [composicao]
set -eu
cd "$(dirname "$0")"
OUT="${1:-out/video-procedural.mp4}"
STEP="${2:-900}"
COMP="${3:-BookVideo}"
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell

TOTAL=$(node -e "const d=require('./public/video-data.json');console.log(d.scenes.reduce((a,s)=>a+s.durationInFrames,0))")
mkdir -p out/chunks
LIST=out/chunks/list.txt
: > "$LIST"

START=0
IDX=0
while [ "$START" -lt "$TOTAL" ]; do
  END=$((START + STEP - 1)); [ "$END" -ge "$TOTAL" ] && END=$((TOTAL - 1))
  CHUNK="out/chunks/chunk_$(printf '%03d' $IDX).mp4"
  echo "file 'chunk_$(printf '%03d' $IDX).mp4'" >> "$LIST"
  if [ ! -s "$CHUNK" ] || [ -f "$CHUNK.tmp" ]; then
    rm -f "$CHUNK" "$CHUNK.tmp"; touch "$CHUNK.tmp"
    echo ">>> bloco $IDX: frames $START-$END"
    npx remotion render src/index.ts "$COMP" "$CHUNK" \
      --frames="$START-$END" --concurrency=2 2>&1 | tail -1
    rm -f "$CHUNK.tmp"
  else
    echo ">>> bloco $IDX já pronto, pulando"
  fi
  START=$((END + 1)); IDX=$((IDX + 1))
done

echo ">>> concatenando $IDX blocos"
npx remotion ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "$LIST" -c copy "$OUT"
echo ">>> pronto: $OUT"
ls -la "$OUT"
