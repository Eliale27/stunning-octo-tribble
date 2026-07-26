export type NarrationSegment = {
  id: string;
  text: string;
};

// One segment per video section: intro, the 8 eras, outro.
// The order must match the ERAS array in constants.ts.
export const NARRATION: NarrationSegment[] = [
  {
    id: "00-intro",
    text: "Quatro mil anos de história em menos de um minuto. Esta é a história da China.",
  },
  {
    id: "01-primeiras-dinastias",
    text: "Às margens do Rio Amarelo, as dinastias Xia, Shang e Zhou dão origem à civilização chinesa, com o bronze, a escrita e os grandes filósofos.",
  },
  {
    id: "02-qin",
    text: "Em 221 antes de Cristo, Qin Shi Huang unifica o país e torna-se o primeiro imperador, padronizando a escrita e iniciando a Grande Muralha.",
  },
  {
    id: "03-han",
    text: "Sob a dinastia Han, a Rota da Seda conecta a China ao resto do mundo, e o papel é inventado.",
  },
  {
    id: "04-tang-song",
    text: "Nas dinastias Tang e Song, a China vive a sua era de ouro: poesia, porcelana, pólvora, bússola e imprensa.",
  },
  {
    id: "05-ming",
    text: "Na dinastia Ming, a Cidade Proibida é erguida em Pequim, e as frotas de Zheng He cruzam o Oceano Índico.",
  },
  {
    id: "06-qing",
    text: "A dinastia Qing, a última do império, expande o território, mas as Guerras do Ópio abalam o poder imperial.",
  },
  {
    id: "07-republica",
    text: "Em 1949, após décadas de guerra, Mao Zedong proclama a República Popular da China.",
  },
  {
    id: "08-china-moderna",
    text: "Com as reformas de Deng Xiaoping, a China abre-se ao mundo e torna-se a segunda maior economia do planeta.",
  },
  {
    id: "09-encerramento",
    text: "Quatro milênios de história, e uma civilização que continua a se reinventar.",
  },
];

export const VOICEOVER_FOLDER = "voiceover/historia-da-china";

export const audioFileFor = (id: string): string =>
  `${VOICEOVER_FOLDER}/${id}.mp3`;
