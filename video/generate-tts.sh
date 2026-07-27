#!/bin/bash
# Gera a narração de cada cena de scenes.json via Gemini TTS.
# Uso: GEMINI_API_KEY=... ./generate-tts.sh [voz]
set -u
cd "$(dirname "$0")"
VOICE="${1:-Sulafat}"
MODEL="gemini-3.1-flash-tts-preview"
OUT=public/audio
mkdir -p "$OUT"

N=$(python3 -c "import json; print(len(json.load(open('scenes.json'))['scenes']))")
for i in $(seq 0 $((N-1))); do
  WAV="$OUT/scene_$(printf '%02d' $((i+1))).wav"
  [ -s "$WAV" ] && { echo "cena $((i+1)) já existe, pulando"; continue; }
  python3 - "$i" <<'PY' > /tmp/tts_payload.json
import json, sys
i = int(sys.argv[1])
scene = json.load(open('scenes.json'))['scenes'][i]
prompt = ("Leia em português do Brasil, em tom de contadora de histórias, caloroso, "
          "envolvente e bem articulado, como uma resenha de booktube: " + scene['text'])
print(json.dumps({
  "contents": [{"parts": [{"text": prompt}]}],
  "generationConfig": {
    "responseModalities": ["AUDIO"],
    "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "VOICENAME"}}}
  }
}).replace("VOICENAME", "__VOICE__"))
PY
  sed -i "s/__VOICE__/$VOICE/" /tmp/tts_payload.json
  for attempt in 1 2 3 4; do
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
    print('resposta sem audio:', json.dumps(d)[:200]); sys.exit(1)
w = wave.open(sys.argv[1], 'wb')
w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
w.writeframes(pcm); w.close()
print('ok', sys.argv[1], round(len(pcm)/2/24000, 2), 's')
PY
    then break; else echo "cena $((i+1)) tentativa $attempt falhou, aguardando..."; sleep $((attempt*20)); fi
  done
  sleep 8
done
echo "TTS finalizado."
