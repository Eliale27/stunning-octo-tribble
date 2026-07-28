#!/bin/bash
# Termina a demo infantil de ponta a ponta: insiste no TTS até completar,
# monta os dados, renderiza em blocos e comprime para envio.
set -u
cd "$(dirname "$0")"
export STORY=kids-contando

for round in $(seq 1 12); do
  N=$(ls public/audio/kids-contando/*.wav 2>/dev/null | wc -l)
  [ "$N" -ge 7 ] && break
  echo ">>> rodada $round: $N/7 cenas, tentando TTS"
  ./generate-tts.sh || true
  N=$(ls public/audio/kids-contando/*.wav 2>/dev/null | wc -l)
  [ "$N" -ge 7 ] && break
  echo ">>> aguardando 10 min para a cota respirar"
  sleep 600
done

N=$(ls public/audio/kids-contando/*.wav 2>/dev/null | wc -l)
if [ "$N" -lt 7 ]; then
  echo "!!! TTS incompleto ($N/7) após todas as rodadas"; exit 1
fi

echo ">>> TTS completo, montando dados"
node build-data.mjs
rm -rf out/chunks
./render-chunks.sh out/kids-contando.mp4 900 KidsCounting
npx remotion ffmpeg -y -hide_banner -loglevel error -i out/kids-contando.mp4 \
  -vf scale=1280:720 -c:v libx264 -crf 26 -preset fast -pix_fmt yuv420p \
  -c:a aac -b:a 128k out/kids-contando-720p.mp4
echo ">>> DEMO PRONTA"
ls -la out/kids-contando*.mp4
