---
format: 1920x1080
duration: 124s
message: "Quem escuta os pequenos encontra o que os grandes não veem"
arc: story-explainer
audience: crianças e famílias — historinha animada 2D
mode: autonomous
music: none
---

## Video direction

- **paleta** — daisy-days: fundo `cream` #F5F0E6, céu `sky` #A8D8F0, vegetação `mint`/`turquoise`, acentos `coral`/`butter`. Contorno `#2D2D2D` 3px em todo elemento de primeiro plano; montanhas e céu SEM contorno (profundidade por camada, não por sombra). Tons de personagem só os quatro de `CHARACTERS.md`.
- **elenco** — SVG canônico em `CHARACTERS.md`, colado literalmente. Lia, Tico, Gaspar e Bruno têm que ser idênticos em toda cena. Escala relativa fixa: Bruno ≈ 300, Lia ≈ 320, Gaspar ≈ 150, Tico ≈ 120 (o urso é largo, não alto).
- **encenação** — palco lateral 16:9: personagens sobre uma linha de chão comum, falante à esquerda ou direita, quem escuta vira-se para ele. Câmera quase sempre parada; a atuação vem dos personagens, não de push-in.
- **fala** — receita de lip flap de `CHARACTERS.md` (8 Hz, `.set()` determinístico), presa às janelas em `dialogue_cues.json`. Boca SEMPRE fecha ao fim da fala. Balão de fala entra em spring-pop no início da fala e sai no fim — no máximo ~6 palavras, nunca a frase inteira.
- **respiro** — a fala é o piso da cena, não o teto. Depois da última fala há uma batida visual (reação, caminhada, água correndo). Nada de congelar: alguém sempre reage.
- **piscada** — cada personagem em cena pisca 1–2 vezes, dessincronizado dos outros (ninguém pisca junto).
- **negative list** — sem gradiente de IA, sem bokeh, sem sombra borrada (só offset duro), sem texto de narração na tela (só balões curtos e os dois cartões de título), sem `repeat: -1`.

## Frame 1 — Abertura

- scene: Cartão de título sobre o reino ao amanhecer; castelo à distância, rio azul cortando o vale.
- voiceover: "Era uma vez um reino onde a água vinha cantando da montanha."
- duration: 8s
- transition_in: cut
- status: outline
- src: compositions/frames/s01-abertura.html
- type: hook
- beat: encantamento
- focal: o título "A Princesa e o Rio que Parou"
- roles: céu + montanhas = background · castelo + colinas + rio = supporting · título = foreground subject

Scene 1 (0.0–2.0s): céu sky com duas montanhas cinza-azuladas ao fundo; colina mint entra por baixo (slide-up suave). Castelo butter com telhados coral no terço direito, sobre a colina.
Scene 2 (2.0–4.5s): o rio turquoise se desenha da montanha até a base do quadro (stroke draw, esquerda→direita), enquanto o narrador fala.
Scene 3 (4.5–8.0s): título em Fredoka 600 spring-pop no terço superior-esquerdo, com sombra offset dura; três nuvens cream derivam devagar. Held read.

## Frame 2 — O rio parou

- scene: Mesmo vale, agora com o leito seco cor de terra. Lia parada na margem, ombros caídos.
- voiceover: "Até que, numa manhã, o rio simplesmente parou." / "O rio sumiu. E ninguém no castelo sabe por quê."
- duration: 9s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s02-rio-parou.html
- type: pain_point
- beat: estranhamento
- focal: o leito seco
- roles: vale = background · leito seco = foreground subject · Lia = foreground subject

Scene 1 (0.0–2.8s): mesmo enquadramento do Frame 1, mas o rio agora é `riverbed` cor de terra. Duas pedras cinza no leito. Narrador fala; nada se move além de uma nuvem.
Scene 2 (2.8–5.8s): Lia entra andando pela esquerda (bob de caminhada: y sobe/desce 6px por passo), para no terço esquerdo sobre o leito e fala — lip flap 3.09–5.80s, balão "o rio sumiu…".
Scene 3 (5.8–9.0s): Lia se agacha e toca o chão seco (braço desce); ela olha para a montanha (cabeça inclina). Batida de reação, sem fala.

## Frame 3 — Chega o Tico

- scene: Tico chega voando em disparada e circula a cabeça da Lia antes de pousar no braço dela.
- voiceover: "Princesa! Princesa! Eu vi!" / "Calma, Tico. Respira." / "A água tá presa!"
- duration: 11s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s03-tico.html
- type: feature_showcase
- beat: urgência divertida
- focal: Tico
- roles: vale seco = background · Lia = foreground subject · Tico = foreground subject

Scene 1 (0.0–3.2s): Lia à esquerda. Tico entra voando pela direita numa curva larga (path de voo, asa oscilando), muito agitado — lip flap 0.12–3.19s, balão "eu vi! lá em cima!".
Scene 2 (3.2–5.8s): Tico pousa no braço estendido da Lia. Ela fala calma — lip flap 3.49–5.79s, balão "calma, tico. respira."
Scene 3 (5.8–8.9s): Tico bate as asas duas vezes e aponta o bico para a montanha — lip flap 6.09–8.88s, balão "a água tá presa!".
Scene 4 (8.9–11.0s): Lia vira a cabeça na direção da montanha; Tico segue o olhar. Batida de reação.

## Frame 4 — Gaspar reclama

- scene: Poça de lama em primeiro plano; Gaspar sentado nela, emburrado. Lia e Tico chegam.
- voiceover: "Meu brejo virou uma poça de lama." / "Então vem comigo, Gaspar." / "Eu? Andando?"
- duration: 11s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s04-gaspar.html
- type: feature_showcase
- beat: humor resmungão
- focal: Gaspar
- roles: brejo seco = background · Gaspar = foreground subject · Lia + Tico = supporting

Scene 1 (0.0–3.1s): poça marrom irregular no terço inferior-esquerdo, juncos mint atrás. Gaspar no centro dela, corpo afundado — lip flap 0.12–3.10s, balão "virou lama.".
Scene 2 (3.1–6.3s): Lia (com Tico no ombro) entra pela direita e se agacha até a altura do sapo — lip flap 3.40–6.29s, balão "vem comigo, gaspar."
Scene 3 (6.3–9.1s): Gaspar dá um hop curto para fora da poça (arco de salto), aterrissa e fala — lip flap 6.58–9.05s, balão "essa história tá cara."
Scene 4 (9.1–11.0s): os três se viram para a direita (rumo à montanha). Tico levanta voo. Batida de partida.

## Frame 5 — Subindo a montanha

- scene: Plano aberto da trilha subindo; os três em silhueta pequena avançando pelo leito seco.
- voiceover: "E lá foram os três, trilha acima, seguindo o leito seco."
- duration: 9s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s05-trilha.html
- type: feature_showcase
- beat: jornada
- focal: o trio caminhando
- roles: montanha + céu = background · trilha/leito seco = supporting · trio = foreground subject

Scene 1 (0.0–3.3s): plano mais aberto — montanha ocupa metade do quadro, leito seco serpenteia da base ao alto. Narrador fala. Trio entra pequeno pela esquerda.
Scene 2 (3.3–6.5s): trio atravessa o quadro da esquerda para o centro-direita, subindo (y diminui conforme avança), com bob de caminhada; Tico voa em arcos acima deles; Gaspar dá hops.
Scene 3 (6.5–9.0s): eles chegam ao terço direito, menores, e param diante da sombra de um bosque. Duas árvores entram em primeiro plano pelas bordas (parallax). Sem fala.

## Frame 6 — O urso

- scene: Bosque escuro. Bruno surge enorme atrás das árvores — ameaçador, depois triste.
- voiceover: "Quem anda pisando no meu bosque?" / "Sou eu, Lia." / "Faz três dias que eu não bebo."
- duration: 12s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s06-urso.html
- type: pain_point
- beat: susto que vira empatia
- focal: Bruno
- roles: bosque = background (mais escuro) · Bruno = foreground subject · trio = supporting

Scene 1 (0.0–2.1s): bosque com quatro árvores turquoise escuras; o trio pequeno à esquerda. Bruno entra por trás das árvores à direita, subindo (y desce), grande — lip flap 0.12–2.07s, balão "quem pisa no meu bosque?".
Scene 2 (2.1–4.6s): Gaspar pula para trás da saia da Lia (hop rápido). Lia dá um passo à frente, firme — lip flap 2.37–4.59s, balão "sou eu, lia."
Scene 3 (4.6–8.6s): Bruno baixa a cabeça e os ombros (todo o corpo desce ~14px), o olhar cai — lip flap 4.89–8.58s, balão "eu também procuro."
Scene 4 (8.6–12.0s): Lia caminha até Bruno e encosta a mão no braço dele. Batida de empatia, sem fala; Tico pousa no ombro do urso.

## Frame 7 — A descoberta

- scene: Do alto, o entupimento: tronco caído, pedras e galhos travando a passagem da água.
- voiceover: "Ali! Olha ali embaixo!" / "A tempestade tinha derrubado um tronco enorme."
- duration: 10s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/s07-descoberta.html
- type: social_proof
- beat: revelação
- focal: o tronco entupindo a passagem
- roles: garganta da montanha = background · tronco + pedras = foreground subject · água represada = supporting

Scene 1 (0.0–1.7s): Tico voa alto no canto superior-esquerdo e aponta para baixo — lip flap 0.12–1.61s, balão "ali embaixo!".
Scene 2 (1.7–5.0s): revela-se a garganta: paredes de rocha dos dois lados, e um tronco marrom enorme atravessado na passagem, com pedras encaixadas. Elementos entram escalonados conforme o narrador nomeia (tronco → pedras → galhos).
Scene 3 (5.0–7.1s): atrás do tronco, uma massa de água turquoise represada aparece e pressiona (ela pulsa uma vez contra a barreira).
Scene 4 (7.1–10.0s): o grupo chega na borda inferior e olha para cima, pequenos diante do obstáculo — contraste de escala. Sem fala.

## Frame 8 — Ninguém sozinho

- scene: Os quatro lado a lado diante do tronco; cada um constata a própria limitação.
- voiceover: "Sozinho eu empurro, mas não enxergo." / "Eu enxergo, mas não empurro." / "Eu caibo em qualquer fresta." / "Cada um faz a sua parte."
- duration: 13s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s08-juntos.html
- type: benefit_highlight
- beat: virada — a soma das partes
- focal: os quatro alinhados
- roles: tronco = background/supporting · os quatro personagens = foreground subject

Scene 1 (0.0–3.5s): os quatro em fila diante do tronco (Bruno, Tico num galho, Gaspar, Lia). Bruno fala e empurra o tronco com o ombro — ele range mas não cede — lip flap 0.12–3.48s.
Scene 2 (3.5–6.4s): Tico sobe voando e circula, enxergando o encaixe — um destaque butter pisca sobre a pedra-chave — lip flap 3.77–6.31s.
Scene 3 (6.4–9.0s): Gaspar se espreme e some numa fresta escura entre as pedras (escala vai a zero na fenda) — lip flap 6.61–8.97s.
Scene 4 (9.0–13.0s): Lia levanta a mão e os três se voltam para ela — lip flap 9.27–11.68s, balão "cada um faz a sua parte." Batida final: eles se olham, decididos.

## Frame 9 — Trabalhando juntos

- scene: A operação: Tico guia do alto, Gaspar solta a pedra-chave na fresta, Bruno empurra.
- voiceover: "Tico, de cima! Gaspar, na fresta! Bruno, agora!" / "Mais pra esquerda!" / "Segura... firme..."
- duration: 12s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s09-operacao.html
- type: feature_showcase
- beat: esforço coletivo, tensão crescente
- focal: o tronco cedendo
- roles: tronco + pedras = foreground subject · os quatro = foreground subject

Scene 1 (0.0–3.0s): Lia no primeiro plano direito comandando, braço apontando — lip flap 0.12–3.00s. Tico sobe, Gaspar entra na fresta, Bruno se posiciona no tronco.
Scene 2 (3.0–4.9s): Tico paira sobre a pedra-chave corrigindo a mira — lip flap 3.30–4.85s. A pedra-chave brilha butter.
Scene 3 (4.9–6.5s): Bruno empurra — corpo inclina, patas afundam, o tronco range e gira alguns graus — lip flap 5.15–6.41s.
Scene 4 (6.5–12.0s): a pedra-chave se solta e cai; o tronco gira forte e desliza para fora do quadro. Sem fala — só a ação, escalonada. Poeira/lascas cream saltam no impacto.

## Frame 10 — A água volta

- scene: A água arrebenta pela passagem e desce a montanha; o brejo do Gaspar enche de novo.
- voiceover: "O tronco cedeu. E a montanha voltou a cantar." / "Ah... Isso sim é um brejo decente."
- duration: 11s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/s10-agua-volta.html
- type: benefit_highlight
- beat: alívio e alegria
- focal: a onda de água descendo
- roles: montanha = background · água turquoise = foreground subject · os quatro = supporting

Scene 1 (0.0–2.9s): a barreira se abre e uma massa turquoise irrompe — a água avança preenchendo o leito da esquerda para a direita (clip-path/scaleX crescendo) — narrador fala.
Scene 2 (2.9–5.1s): corta para o brejo enchendo: a poça de lama vira água turquoise. Gaspar boia de costas, satisfeito — lip flap 3.15–5.05s, balão "um brejo decente."
Scene 3 (5.1–8.0s): Tico mergulha e sobe respingando (arco); três gotas cream saltam.
Scene 4 (8.0–11.0s): Bruno enfia o focinho na água e bebe — cabeça desce e sobe duas vezes. Lia ri ao lado (boca aberta segurada). Batida de alegria.

## Frame 11 — O reino agradece

- scene: A água chega ao castelo; o rio corre outra vez pelo vale, e o reino vem ver.
- voiceover: "A água desceu correndo até o castelo." / "Não fui eu que achei o caminho. Foi quem ninguém escuta."
- duration: 10s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s11-reino.html
- type: branding
- beat: gratidão e sentido
- focal: Lia com os três animais diante do rio cheio
- roles: castelo + vale = background · rio corrente = supporting · Lia + os três = foreground subject

Scene 1 (0.0–4.0s): volta ao enquadramento da abertura — mesmo vale, mesmo castelo — mas o rio turquoise corre cheio outra vez (ondulação sutil na superfície). Narrador fala.
Scene 2 (4.0–7.4s): Lia em primeiro plano à esquerda, com Bruno atrás, Gaspar aos pés e Tico no ombro. Ela fala olhando para eles, não para a câmera — lip flap 4.32–7.42s, balão "foi quem ninguém escuta."
Scene 3 (7.4–10.0s): os quatro olham juntos para o rio. Bruno levanta a pata; Tico dá um voo curto e volta. Batida de fecho.

## Frame 12 — Moral

- scene: Cartão final sobre o vale, com a frase-moral.
- voiceover: "Quem escuta os pequenos, encontra o que os grandes não veem."
- duration: 8s
- transition_in: crossfade
- status: outline
- src: compositions/frames/s12-moral.html
- type: cta
- beat: sentido que fica
- focal: a frase-moral
- roles: vale ao entardecer = background · silhuetas dos quatro = supporting · frase = foreground subject

Scene 1 (0.0–2.0s): o vale em tom mais quente (céu peach), rio correndo; os quatro pequenos em silhueta na colina, de costas.
Scene 2 (2.0–5.0s): a frase entra em dois blocos, Fredoka 600, per-word reveal escalonado, centralizada no terço superior — "quem escuta os pequenos" / "encontra o que os grandes não veem".
Scene 3 (5.0–8.0s): a palavra "escuta" ganha destaque coral (spring-pop) e segura. Nuvens derivam. Fecho suave — esta é a única cena com exit real (fade macio no fim).
