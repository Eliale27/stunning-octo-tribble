#!/bin/bash
# Gera a narração de cada cena via Gemini TTS.
#   GEMINI_API_KEY=... ./generate-tts.sh                 -> scenes.json, public/audio/
#   GEMINI_API_KEY=... STORY=uskudar ./generate-tts.sh   -> stories/uskudar.json, public/audio/uskudar/
# A voz e o prompt-base vêm do próprio arquivo de cenas (campos "voice"/"basePrompt").
# Se um modelo esgotar a cota, tenta o próximo da lista.
set -u
cd "$(dirname "$0")"

if [ -n "${STORY:-}" ]; then
  SCENES="stories/$STORY.json"
  OUT="public/audio/$STORY"
else
  SCENES="scenes.json"
  OUT="public/audio"
fi
MODELS=(${TTS_MODELS:-gemini-3.1-flash-tts-preview gemini-2.5-flash-preview-tts gemini-2.5-pro-preview-tts})
mkdir -p "$OUT"

N=$(python3 -c "import json; print(len(json.load(open('$SCENES'))['scenes']))")
VOICE=$(python3 -c "import json; print(json.load(open('$SCENES')).get('voice','Sulafat'))")
FAILED=0

for i in $(seq 0 $((N-1))); do
  WAV="$OUT/scene_$(printf '%02d' $((i+1))).wav"
  [ -s "$WAV" ] && { echo "cena $((i+1)) já existe, pulando"; continue; }
  python3 - "$SCENES" "$i" "$VOICE" <<'PY' > /tmp/tts_payload.json
import json, sys
data = json.load(open(sys.argv[1]))
scene = data['scenes'][int(sys.argv[2])]
base = data.get('basePrompt',
  'Leia em português do Brasil, em tom de contador de histórias, caloroso e envolvente.')
tone = scene.get('tone', '')
prompt = f"{base} {tone} Texto: {scene['text']}"
print(json.dumps({
  "contents": [{"parts": [{"text": prompt}]}],
  "generationConfig": {
    "responseModalities": ["AUDIO"],
    "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": sys.argv[3]}}}
  }
}))
PY
  DONE=0
  for MODEL in "${MODELS[@]}"; do
    for attempt in 1 2 3; do
      curl -sS -X POST "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:generateContent" \
        -H "x-goog-api-key: $GEMINI_API_KEY" -H "Content-Type: application/json" \
        -d @/tmp/tts_payload.json > /tmp/tts_resp.json
      if python3 - "$WAV" <<'PY'
import json, base64, wave, sys
d = json.load(open('/tmp/tts_resp.json'))
try:
    part = d['candidates'][0]['content']['parts'][0]['inlineData']
    pcm = base64.b64decode(part['data'])
except Exception:
    print('falha:', json.dumps(d)[:160]); sys.exit(1)
w = wave.open(sys.argv[1], 'wb')
w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
w.writeframes(pcm); w.close()
print('ok', sys.argv[1], round(len(pcm)/2/24000, 2), 's')
PY
      then DONE=1; break; else echo "cena $((i+1)) [$MODEL] tentativa $attempt falhou"; sleep $((attempt*15)); fi
    done
    [ "$DONE" = 1 ] && break
  done
  [ "$DONE" = 0 ] && { echo "cena $((i+1)) FALHOU em todos os modelos"; FAILED=$((FAILED+1)); }
  sleep 8
done
echo "TTS finalizado. Falhas: $FAILED"
exit $FAILED
