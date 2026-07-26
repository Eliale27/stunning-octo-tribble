# ATC Voice — mini-documentário (colagem editorial)

Filme curto (3 beats, ~30s) no estilo "documentary-collage motion graphics":
colagem de scrapbook sobre papel de arquivo envelhecido, recortes em meio-tom
P&B com keyline branca e stroke vermelho, headlines condensadas e etiquetas
de máquina de escrever. Assunto: o app **ATC Voice** deste repositório
(PWA que grava o áudio do rádio/ambiente e transcreve com IA via Whisper/Groq).

Gerado com Higgsfield (imagens: Nano Banana Pro · vídeo: Kling 3.0 Turbo ·
narração: Seed Audio, voz "Andre", pt-BR).

## Roteiro (narração)

| Beat | Duração do clipe | Narração |
|------|------------------|----------|
| 1 | 9 s | No rádio da aviação, cada palavra voa rápido demais. Ouvir, entender e registrar cada frase é um desafio para quem está aprendendo. |
| 2 | 8 s | Então nasceu uma ideia simples: um app que escuta o rádio e transcreve cada palavra na hora, usando inteligência artificial. |
| 3 | 9 s | Este é o ATC Voice: gratuito, direto do navegador, instalado na tela inicial. Aperte gravar, fale, e veja a transcrição aparecer. |

Headlines: `RÁPIDO DEMAIS` (beat 1) · `TRANSCREVE NA HORA` (beat 2) · `ATC VOICE` (beat 3).
Etiquetas mostarda: `aviação` · `ideia simples` · `aperte gravar`.

## Pipeline e jobs (Higgsfield)

| Etapa | Job ID |
|-------|--------|
| THE STAGE (fundo persistente, text-to-image) | `0fe5e539-8d32-4897-aab8-ee0ac29fe2c8` |
| Board beat 1 (image-to-image sobre o STAGE) | `a98172c8-b233-4483-9bb3-cc74a2e12a68` |
| Board beat 2 | `74516069-da5d-4762-bfbb-f784119821a3` |
| Board beat 3 | `123e3170-e0e3-4e2f-8132-448a77b0d75b` |
| Clipe beat 1 (image-to-video, 9 s) | `340327d2-f5dd-4261-9959-a8201a5bab5b` |
| Clipe beat 2 (8 s) | `ae3b7e6e-b4c2-4cf0-9828-5bc7ff3f511c` |
| Clipe beat 3 (9 s) | `2a7f7616-2eed-4e6f-902a-b66a002f91ee` |
| Narração beat 1 (12,6 s) | `2aa72ef2-ac42-4fe3-85d2-cede83b713f9` |
| Narração beat 2 (9,1 s) | `78b6409c-60f8-4a95-b073-216627a58f4f` |
| Narração beat 3 (7,9 s) | `3b2312d1-ee94-4ad1-a7b1-f2020d9ecf34` |

Montagem final: cada beat = clipe + narração; quando a narração excede o
clipe, o último quadro do clipe é congelado até o fim da fala; os três
segmentos são concatenados em `atc-voice-doc.mp4` (1280×720, H.264 + AAC).

Observações de produção:
- O repositório é privado, então o screenshot real do app não pôde ser
  anexado como referência ao gerador; os boards descrevem a interface real
  (fundo preto, âmbar, "ATC VOICE", botão GRAVAR, timer 00:00) textualmente.
  O screenshot de referência está em `docs/film/atc-voice-app.png`.
- Todos os prompts de imagem/vídeo carregam o bloco STYLE verbatim; os de
  vídeo carregam também o CHARACTER LOCK verbatim e um whitelist de palavras
  visíveis por cena.
