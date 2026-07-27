// Monta public/video-data.json a partir de scenes.json, dos WAVs de narração
// e das imagens baixadas. Cada cena dura a narração + 0,5s de respiro.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const PAD_SECONDS = 0.5;

// cena (1-15) -> imagem (1-10)
const SCENE_IMAGE = [1, 2, 3, 4, 5, 6, 3, 1, 7, 8, 9, 5, 9, 10, 2];

const wavDuration = (path) => {
  const buf = readFileSync(path);
  // WAV PCM: procura o chunk "data"; áudio é mono 16-bit 24 kHz
  const idx = buf.indexOf('data');
  const dataSize = buf.readUInt32LE(idx + 4);
  const byteRate = buf.readUInt32LE(28);
  return dataSize / byteRate;
};

const scenesJson = JSON.parse(readFileSync(join(root, 'scenes.json'), 'utf8'));

const scenes = scenesJson.scenes.map((scene, i) => {
  const audio = `audio/scene_${String(i + 1).padStart(2, '0')}.wav`;
  const image = `images/img_${String(SCENE_IMAGE[i]).padStart(2, '0')}.jpg`;
  for (const rel of [audio, image]) {
    if (!existsSync(join(root, 'public', rel))) {
      throw new Error(`arquivo faltando: public/${rel}`);
    }
  }
  const seconds = wavDuration(join(root, 'public', audio)) + PAD_SECONDS;
  return {image, audio, durationInFrames: Math.round(seconds * FPS)};
});

const data = {title: scenesJson.title, subtitle: scenesJson.subtitle, scenes};
writeFileSync(join(root, 'public', 'video-data.json'), JSON.stringify(data, null, 2));
const total = scenes.reduce((a, s) => a + s.durationInFrames, 0);
console.log(`video-data.json gerado: ${scenes.length} cenas, ${(total / FPS).toFixed(1)}s no total`);
