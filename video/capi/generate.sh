#!/bin/bash
# Gera as cenas do Detetive Capi com Veo 3.1 via REST (com retomada).
#   GEMINI_API_KEY=... ./generate.sh            -> todas as cenas que faltam
#   GEMINI_API_KEY=... ./generate.sh 3          -> só a cena 3
#   MODEL=veo-3.1-generate-preview ./generate.sh  (padrão: fast)
set -u
cd "$(dirname "$0")"
MODEL="${MODEL:-veo-3.1-fast-generate-preview}"
API="https://generativelanguage.googleapis.com/v1beta"
ONLY="${1:-}"
mkdir -p out

N=$(python3 -c "import json; print(len(json.load(open('scenes.json'))['scenes']))")
FAILED=0

for i in $(seq 1 "$N"); do
  [ -n "$ONLY" ] && [ "$i" != "$ONLY" ] && continue
  MP4="out/cena_$(printf '%02d' "$i").mp4"
  [ -s "$MP4" ] && { echo "cena $i já existe, pulando"; continue; }

  python3 - "$i" <<'PY' > /tmp/veo_payload.json
import json, sys
d = json.load(open('scenes.json'))
s = d['scenes'][int(sys.argv[1]) - 1]
prompt = d['style'] + ''.join(d['characters'][c] for c in s['chars']) + s['action']
print(json.dumps({
  "instances": [{"prompt": prompt}],
  "parameters": {"aspectRatio": "16:9", "resolution": "1080p"}
}))
PY

  echo ">>> cena $i: enviando para $MODEL"
  OP=$(curl -sS -X POST "$API/models/$MODEL:predictLongRunning" \
    -H "x-goog-api-key: $GEMINI_API_KEY" -H "Content-Type: application/json" \
    -d @/tmp/veo_payload.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('name',''))")
  if [ -z "$OP" ]; then echo "cena $i: falha ao iniciar"; FAILED=$((FAILED+1)); continue; fi

  echo ">>> cena $i: aguardando ($OP)"
  URI=""
  for t in $(seq 1 80); do
    sleep 15
    curl -sS "$API/$OP" -H "x-goog-api-key: $GEMINI_API_KEY" > /tmp/veo_op.json
    URI=$(python3 - <<'PY'
import json
d = json.load(open('/tmp/veo_op.json'))
if d.get('error'):
    print('ERROR:' + json.dumps(d['error'])[:200]); raise SystemExit
if not d.get('done'):
    print(''); raise SystemExit
r = d.get('response', {})
samples = (r.get('generateVideoResponse', {}).get('generatedSamples')
           or r.get('generatedVideos') or [])
v = samples[0] if samples else {}
print(v.get('video', {}).get('uri', ''))
PY
)
    case "$URI" in
      ERROR:*) echo "cena $i: $URI"; break;;
      "") continue;;
      *) break;;
    esac
  done

  if [ -z "$URI" ] || [ "${URI#ERROR:}" != "$URI" ]; then
    echo "cena $i FALHOU"; FAILED=$((FAILED+1)); continue
  fi
  echo ">>> cena $i: baixando"
  curl -sS -L -o "$MP4" "$URI" -H "x-goog-api-key: $GEMINI_API_KEY" \
    && echo "cena $i ok ($(stat -c%s "$MP4") bytes)" \
    || { echo "cena $i: download falhou"; rm -f "$MP4"; FAILED=$((FAILED+1)); }
done

echo "concluído. falhas: $FAILED"
exit "$FAILED"
