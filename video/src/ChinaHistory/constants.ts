export const FPS = 30;
export const INTRO_DURATION = 90;
export const SCENE_DURATION = 105;
export const OUTRO_DURATION = 105;

export const COLORS = {
  gold: "#fbbf24",
  goldDark: "#d97706",
  cream: "#fef3c7",
  ink: "#1c1917",
} as const;

export type Era = {
  period: string;
  title: string;
  description: string;
  emoji: string;
  background: string;
};

export const ERAS: Era[] = [
  {
    period: "c. 2070 – 256 a.C.",
    title: "As Primeiras Dinastias",
    description:
      "Xia, Shang e Zhou: a civilização chinesa nasce às margens do Rio Amarelo, com bronze, escrita e filosofia.",
    emoji: "🏺",
    background: "linear-gradient(135deg, #451a03 0%, #78350f 100%)",
  },
  {
    period: "221 a.C.",
    title: "A Unificação de Qin",
    description:
      "Qin Shi Huang torna-se o primeiro imperador, padroniza a escrita e inicia a Grande Muralha.",
    emoji: "🧱",
    background: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
  },
  {
    period: "206 a.C. – 220 d.C.",
    title: "Dinastia Han",
    description:
      "A Rota da Seda conecta a China ao mundo e o papel é inventado — nasce a identidade 'Han'.",
    emoji: "🐫",
    background: "linear-gradient(135deg, #431407 0%, #9a3412 100%)",
  },
  {
    period: "618 – 1279",
    title: "Tang e Song: Era de Ouro",
    description:
      "Poesia, porcelana, pólvora, bússola e imprensa: a China é a civilização mais avançada do mundo.",
    emoji: "🧭",
    background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
  },
  {
    period: "1368 – 1644",
    title: "Dinastia Ming",
    description:
      "A Cidade Proibida é erguida em Pequim e as frotas de Zheng He cruzam o Oceano Índico.",
    emoji: "🏯",
    background: "linear-gradient(135deg, #450a0a 0%, #991b1b 100%)",
  },
  {
    period: "1644 – 1912",
    title: "Dinastia Qing",
    description:
      "O último império expande o território, mas as Guerras do Ópio abalam o poder imperial.",
    emoji: "🐉",
    background: "linear-gradient(135deg, #052e16 0%, #166534 100%)",
  },
  {
    period: "1949",
    title: "República Popular",
    description:
      "Após guerra civil, Mao Zedong proclama a República Popular da China em 1º de outubro.",
    emoji: "🚩",
    background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
  },
  {
    period: "1978 – hoje",
    title: "A China Moderna",
    description:
      "As reformas de Deng Xiaoping abrem a economia: a China torna-se a segunda maior do planeta.",
    emoji: "🚄",
    background: "linear-gradient(135deg, #0c4a6e 0%, #075985 100%)",
  },
];

export const TOTAL_DURATION =
  INTRO_DURATION + ERAS.length * SCENE_DURATION + OUTRO_DURATION;

// Narration timing: the voiceover starts a beat after the scene appears
// and the scene lingers briefly after the speech ends.
export const AUDIO_START_FRAMES = 10;
export const AUDIO_TAIL_FRAMES = 20;

export type Segment = {
  durationInFrames: number;
  hasAudio: boolean;
};

// Segment layout: index 0 is the intro, 1..ERAS.length are the era
// scenes, and the last one is the outro.
export const defaultSegmentDuration = (index: number): number => {
  if (index === 0) {
    return INTRO_DURATION;
  }
  if (index === ERAS.length + 1) {
    return OUTRO_DURATION;
  }
  return SCENE_DURATION;
};
