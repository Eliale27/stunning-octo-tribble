// Monta public/video-data.json a partir de scenes.json, dos WAVs de narração
// e (opcionalmente) das imagens. Cada cena dura a narração + 0,5s de respiro.
//
//   node build-data.mjs               -> usa imagens (video/public/images)
//   VISUALS=procedural node build-data.mjs -> cenas 100% Remotion (sem imagens)
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const PAD_SECONDS = 0.5;
const STORY = process.env.STORY || '';
// Histórias em stories/ são sempre procedurais (sem imagens de IA)
const PROCEDURAL = process.env.VISUALS === 'procedural' || Boolean(STORY);
const SCENES_FILE = STORY ? join('stories', `${STORY}.json`) : 'scenes.json';
const AUDIO_DIR = STORY ? `audio/${STORY}` : 'audio';

// cena (1-15) -> imagem (1-10)
const SCENE_IMAGE = [1, 2, 3, 4, 5, 6, 3, 1, 7, 8, 9, 5, 9, 10, 2];

const wavDuration = (path) => {
  const buf = readFileSync(path);
  const idx = buf.indexOf('data');
  const dataSize = buf.readUInt32LE(idx + 4);
  const byteRate = buf.readUInt32LE(28);
  return dataSize / byteRate;
};

const scenesJson = JSON.parse(readFileSync(join(root, SCENES_FILE), 'utf8'));

const scenes = scenesJson.scenes.map((scene, i) => {
  const audio = `${AUDIO_DIR}/scene_${String(i + 1).padStart(2, '0')}.wav`;
  if (!existsSync(join(root, 'public', audio))) {
    throw new Error(`arquivo faltando: public/${audio}`);
  }
  let image = null;
  if (!PROCEDURAL) {
    image = `images/img_${String(SCENE_IMAGE[i]).padStart(2, '0')}.jpg`;
    if (!existsSync(join(root, 'public', image))) {
      throw new Error(`arquivo faltando: public/${image}`);
    }
  }
  const pad = scene.padAfter ?? PAD_SECONDS;
  const seconds = wavDuration(join(root, 'public', audio)) + pad;
  return {
    image,
    audio,
    durationInFrames: Math.round(seconds * FPS),
    visual: {caption: scene.caption, icon: scene.icon, palette: scene.palette},
    meta: scene.meta ?? null,
  };
});

const data = {title: scenesJson.title, subtitle: scenesJson.subtitle, scenes};
writeFileSync(join(root, 'public', 'video-data.json'), JSON.stringify(data, null, 2));
const total = scenes.reduce((a, s) => a + s.durationInFrames, 0);
console.log(
  `video-data.json gerado (${PROCEDURAL ? 'procedural' : 'imagens'}): ${scenes.length} cenas, ${(total / FPS).toFixed(1)}s`
);
