// Generates the narration MP3s with the ElevenLabs API.
//
// Usage:
//   ELEVENLABS_API_KEY=... node --strip-types scripts/generate-voiceover.ts [--force]
//
// Optional: set ELEVENLABS_VOICE_ID to use a different voice.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NARRATION, VOICEOVER_FOLDER } from "../src/ChinaHistory/narration.ts";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY environment variable.");
  process.exit(1);
}

// "Daniel" — a deep narrator voice that works well with the multilingual model.
const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "onwK4e9ZLuTAKqWW03F9";
const force = process.argv.includes("--force");

const outputDir = path.join(import.meta.dirname, "..", "public", VOICEOVER_FOLDER);
mkdirSync(outputDir, { recursive: true });

for (const segment of NARRATION) {
  const outputFile = path.join(outputDir, `${segment.id}.mp3`);
  if (existsSync(outputFile) && !force) {
    console.log(`skip   ${segment.id}.mp3 (exists, use --force to regenerate)`);
    continue;
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: segment.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    },
  );

  if (!response.ok) {
    console.error(
      `Failed for ${segment.id}: HTTP ${response.status} — ${await response.text()}`,
    );
    process.exit(1);
  }

  writeFileSync(outputFile, Buffer.from(await response.arrayBuffer()));
  console.log(`wrote  ${segment.id}.mp3`);
}

console.log("Done.");
