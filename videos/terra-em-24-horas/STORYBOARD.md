---
format: 1080x1920
duration: 45s
message: "Toda a história humana cabe nos últimos segundos do dia da Terra"
arc: concept-explainer
audience: curiosos no YouTube Shorts / TikTok que gostam de fatos de "escala impossível"
mode: autonomous
music: tense cinematic ambient build, minimal, escalating
---

## Video direction

- **palette system** — Broadside dark register em quase todo o vídeo: ground `ink-black`, texto `cream`, um único acento `fire-orange` para o elemento-herói de cada beat (ponteiro, número, palavra emfática). Frame 5 (a explosão da vida) inverte para o register `orange` (ground fire-orange, tinta ink-black) como pico visual. Nunca inventar cor fora de `frame.md`.
- **stage consistente** — um mostrador de relógio de 24h é o palco recorrente (Frames 2–7): mesma posição no terço superior, o ponteiro varre conforme a narração avança. Ele é o fio que costura os shots num só filme.
- **motion grammar + reveal model** — eases de cauda longa (`power3`, suave, nunca elástico). Reveal preso à voz: em t=0 só aparece o que a narração diz naquele instante; cada peça seguinte entra na sua deixa falada, concentrando revelações na metade final. Durante um hold, no máximo um leve jitter — nada de "respiração" preguiçosa.
- **rhythm / held-frame allocation** — Frame 3 (meia-noite) e Frame 7 (os 4 segundos) são beats de stillness: conteúdo revela e segura para o espanto assentar. Os demais mantêm conteúdo chegando ao longo do shot.
- **negative list** — sem bokeh flutuante, sem gradientes roxo/azul "de IA", sem chrome de navegador/cursor real, sem foto de banco. Proibidos os dois modos de falha: slideshow (despejar tudo em ~25% e congelar) e screensaver (tudo flutuando solto). Um register por frame — nunca misturar cream/paper.

## Frame 1 — Gancho

- scene: Fundo escuro. Uma pergunta cresce em beats e enche a tela; um mostrador de relógio fantasma pulsa fraco atrás.
- voiceover: "E se toda a história da Terra fosse um único dia?"
- duration: 2.859s
- transition_in: cut
- status: outline
- src: compositions/frames/01-gancho.html
- type: hook
- persuasion: Rhetorical question + Concretization
- beat: curiosidade e intriga
- blueprint: kinetic-type-beats (Adapt)
- focal: a palavra "24h" que fecha a pergunta
- roles: mostrador-fantasma = background full-bleed (dim ~40%) · linhas da pergunta = foreground subject · marcações de hora = supporting

Adapt: mantenho a assinatura de beats de tipo trocando/entrando em lugar; a "payoff" spring-pop é a palavra "24h" acendendo em fire-orange sobre o relógio fantasma.
Scene 1 (0.0–1.2s): ground ink-black; um mostrador circular de 24h em hairline `border-dark` pulsa fraco no terço superior (background, dim ~40%). Sobre ele, "e se toda a história da terra" entra por per-word reveal em Barlow lowercase display, cream — Centered, ~55% do frame.
Scene 2 (1.2–2.6s): a linha "fosse um único" completa por per-word reveal logo abaixo, mesma coluna.
Scene 3 (2.6–4.0s): a palavra "24h" spring-pop em fire-orange, escala maior que o resto, e o mostrador-fantasma acende 1px mais forte por trás — glow bloom curto e segura. Held read até o corte.

narrativeRole: Abre uma lacuna cognitiva imediata e propõe a metáfora que rege o vídeo inteiro.
keyMessage: Vamos comprimir 4,5 bilhões de anos em 24 horas.

## Frame 2 — A escala

- scene: O número "4.540.000.000" conta e colapsa num mostrador de relógio de 24h que se firma no centro-alto.
- voiceover: "Quatro bilhões e meio de anos — espremidos em vinte e quatro horas."
- duration: 3.904s
- transition_in: crossfade
- status: outline
- src: compositions/frames/02-escala.html
- type: product_intro
- persuasion: Anchoring on a familiar referent
- beat: clareza e orientação
- blueprint: dataviz-countup (Adapt)
- focal: o mostrador de relógio de 24h
- roles: número count-up = foreground subject (Scene 1) · mostrador de 24h = foreground subject (Scene 2+) · legenda "cada segundo = 52 mil anos" = supporting

Adapt: mantenho a assinatura count-up-para-um-número-herói, mas o número colapsa no mostrador que vira o palco do vídeo. Sem chart de tendência.
Scene 1 (0.0–2.0s): ground ink-black; "4.540.000.000" faz count-up em stat-value fire-orange, tabular, dominando o terço superior — Centered, ~60% do frame. Slow push-in por baixo.
Scene 2 (2.0–3.6s): na deixa "espremidos", o número encolhe e colapsa (scale-down + fade) para dentro de um mostrador de 24h que se desenha (SVG stroke draw) no centro-alto; marcas de hora em IBM Plex Mono supporting.
Scene 3 (3.6–5.0s): ponteiro aponta 00h; legenda "cada segundo ≈ 52 mil anos" faz um per-word reveal quieto abaixo do mostrador e segura. Held read.

narrativeRole: Nomeia o "protagonista" — o relógio de 24h — e ancora a escala num objeto familiar.
keyMessage: Um dia inteiro representa a idade da Terra; cada segundo vale ~52 mil anos.

## Frame 3 — Meia-noite: a Terra nasce

- scene: Ponteiro do relógio em 00h00. Poeira e rocha derretida se juntam num planeta incandescente.
- voiceover: "Meia-noite. A Terra se forma — rocha derretida e caos."
- duration: 3.392s
- transition_in: crossfade
- status: outline
- src: compositions/frames/03-meia-noite.html
- type: feature_showcase
- persuasion: Signposting ("primeiro...")
- beat: começo e expectativa
- blueprint: dataviz-countup (Adapt)
- focal: o planeta incandescente formando-se no centro do mostrador
- roles: mostrador de 24h = background/supporting (mesma posição) · planeta = foreground subject · rótulo "00:00" = supporting

Adapt: o mostrador persiste como palco; o "número-herói" vira a esfera do planeta que se agrega no seu centro. Held frame (stillness allocation).
Scene 1 (0.0–1.6s): mesmo mostrador de 24h no terço superior; ponteiro crava em 00h com um tick. Rótulo "00:00" em mono fire-orange entra ao lado — Centered no relógio, ~50% do frame.
Scene 2 (1.6–3.4s): na deixa "a Terra se forma", partículas escuras convergem (depth-scatter-assemble) para o centro do mostrador e fundem numa esfera com borda incandescente fire-orange; glow bloom quente cresce por trás.
Scene 3 (3.4–5.0s): a esfera pulsa uma vez e segura, quieta — held read; o caos é sugerido por um leve jitter da borda, sem deriva de câmera.

narrativeRole: Primeiro passo da linha do tempo; fixa o relógio como estágio consistente.
keyMessage: O dia começa à meia-noite com a formação do planeta.

## Frame 4 — 18 horas de micróbios

- scene: Ponteiro varre de 00h a ~18h enquanto pequenos pontos (micróbios) pulsam nos oceanos. Nada mais.
- voiceover: "Por quase dezoito horas — só micróbios. Sem plantas. Sem animais."
- duration: 4.011s
- transition_in: crossfade
- status: outline
- src: compositions/frames/04-microbios.html
- type: feature_showcase
- persuasion: Progressive disclosure + Contrast (vazio vs. o que virá)
- beat: surpresa e paciência
- blueprint: dataviz-countup (Adapt)
- focal: o ponteiro varrendo o grande arco vazio do mostrador
- roles: mostrador de 24h + arco varrido = foreground subject · pontos de micróbios = supporting (poucos, quietos) · negações "sem plantas / sem animais" = supporting kinetic

Adapt: o "count-up" vira o ponteiro varrendo o tempo; o vazio do arco É o dado. As negações entram em staccato na deixa.
Scene 1 (0.0–1.8s): mostrador no terço superior; o ponteiro começa a varrer de 00h e um arco fire-orange fino traça atrás dele (SVG draw) enquanto avança até ~18h. Uns poucos pontos cream pulsam fracos dentro do disco — Centered, ~55% do frame.
Scene 2 (1.8–3.4s): na deixa "só micróbios", os pontos ganham um leve pulso sincronizado; o resto do mostrador segue deliberadamente vazio (contraste).
Scene 3 (3.4–6.0s): "sem plantas." e "sem animais." entram em dois beats de tipo (per-word reveal, hard-cut entre eles) abaixo do relógio, cada um sumindo antes do próximo; o arco varrido segura no fim. Ritmo staccato, não front-load.

narrativeRole: Revela quão tarde a vida complexa chega — a maior parte do dia é vazia.
keyMessage: A vida ficou microscópica pela maior parte do dia.

## Frame 5 — 21h: a explosão da vida

- scene: Em ~21h o quadro inverte para laranja; formas de vida complexas explodem para fora do centro.
- voiceover: "Nove da noite. De repente — a vida complexa explode."
- duration: 3.456s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/05-cambriano.html
- type: feature_showcase
- persuasion: Demonstration (mostrar o mecanismo acontecendo)
- beat: fascínio e "aha"
- blueprint: constellation-hub (Adapt)
- focal: a explosão de formas de vida a partir do centro do relógio
- roles: ground orange = background full-bleed · silhuetas de vida (nós) = foreground subject · rótulo "21:00" = supporting

Adapt: uso a assinatura "nós brotam de um centro" da constellation-hub, mas em vez de anel ordenado é uma explosão radial (depth-scatter-assemble) — o register vira `orange` para marcar o pico.
Scene 1 (0.0–1.4s): crossfade/zoom-through entra já invertido: ground fire-orange, tinta ink-black. O mostrador reaparece como linha fina ink-black; ponteiro salta para 21h com um rótulo "21:00" mono — Centered, ~55% do frame.
Scene 2 (1.4–3.0s): na deixa "de repente", ~10 silhuetas ink-black (trilobita, peixe, folha, concha estilizados em SVG) explodem do centro para fora em scatter radial escalonado, com motion-blur streak curtinho.
Scene 3 (3.0–5.0s): as silhuetas assentam espalhadas pelo disco e dão um micro-settle; a palavra "vida" em display ink-black spring-pop no centro e segura. Held read curto.

narrativeRole: Marca a Explosão Cambriana como a virada — animais surgem quase no fim do dia.
keyMessage: Os animais complexos só aparecem às 21h.

## Frame 6 — 23h40: os dinossauros somem

- scene: Ponteiro em ~22h30 (silhuetas de dinossauros), depois um risco de asteroide atravessa a tela em 23h40.
- voiceover: "Onze e meia — os dinossauros reinam. Vinte para a meia-noite — um asteroide apaga tudo."
- duration: 5.184s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/06-dinossauros.html
- type: social_proof
- persuasion: Causal chain (A → B → C) + Worked example
- beat: tensão e inevitabilidade
- blueprint: dataviz-countup (Adapt)
- focal: o risco do asteroide cruzando o mostrador em 23h40
- roles: mostrador (de volta ao register dark) = foreground subject · silhuetas de dinossauro = supporting · risco/impacto do asteroide = foreground subject (Scene 3)

Adapt: mantenho o ponteiro-como-relógio; a "leitura de dado" é a hora exata do impacto. Cadeia causal em dois tempos: reinado → colisão.
Scene 1 (0.0–2.0s): volta ao register dark (ground ink-black, texto cream); mostrador no terço superior, ponteiro em ~22h30. Duas silhuetas de dinossauro cream sobem por baixo (per-word/layer reveal) com rótulo "22:30" mono — asymmetric 60/40, 3 camadas de profundidade.
Scene 2 (2.0–3.6s): ponteiro avança para 23h40; um rótulo "23:40" acende fire-orange. Tensão: leve escurecimento do ground.
Scene 3 (3.6–6.0s): na deixa "apaga tudo", um risco fire-orange corta o mostrador na diagonal (motion-blur streak) e estoura num flash curto; as silhuetas somem no impacto e o disco fica quieto. Held beat de inevitabilidade (sem exit tween — é corte).

narrativeRole: Dá um exemplo concreto e datado (66 milhões de anos = 20 min antes da meia-noite).
keyMessage: Até os dinossauros duraram só até os últimos 20 minutos do dia.

## Frame 7 — Os últimos 4 segundos

- scene: Close no mostrador em 23h59. Um cronômetro grande conta 4, 3, 2, 1 enquanto "humanos" aparece minúsculo.
- voiceover: "E nós? Os humanos chegam a quatro segundos da meia-noite."
- duration: 3.179s
- transition_in: crossfade
- status: outline
- src: compositions/frames/07-quatro-segundos.html
- type: benefit_highlight
- persuasion: Distillation + Callback (volta ao relógio do gancho)
- beat: espanto e "agora eu entendi"
- blueprint: kinetic-type-beats (Adapt)
- focal: o cronômetro "0:04 → 0:00" contando os últimos segundos
- roles: mostrador ampliado em 23h59 = background (dim ~40%) · cronômetro count-down = foreground subject · palavra "humanos" minúscula = supporting

Adapt: assinatura de beats de tipo com um count-down como herói; callback ao mostrador do gancho. Held frame (stillness allocation) — o espanto precisa de ar.
Scene 1 (0.0–1.6s): push-in fecha no mostrador em 23h59 (background, dim ~40%). "e nós?" entra em display cream, Centered, ~50% do frame.
Scene 2 (1.6–3.4s): um cronômetro grande fire-orange "0:04" surge e faz count-down 4 → 3 → 2 → 1 em tabular, um dígito por tick, dominando o centro.
Scene 3 (3.4–6.0s): a palavra "humanos" aparece minúscula ao lado do cronômetro (contraste de escala 6:1) para vender quão pequenos somos; o count-down para em "0:00" e tudo segura, imóvel. Held read longo — o beat do espanto.

narrativeRole: Entrega o payoff da metáfora — toda a nossa espécie cabe em 4 segundos.
keyMessage: O Homo sapiens inteiro ocupa os últimos 4 segundos do dia.

## Frame 8 — Um piscar de olhos

- scene: O relógio bate meia-noite; "toda a história registrada" pisca (0,1s). Fecha com a linha-tese e um convite a compartilhar.
- voiceover: "Impérios, guerras, a internet — tudo num piscar de olhos. Compartilha e assombra alguém hoje."
- duration: 5.355s
- transition_in: crossfade
- status: outline
- src: compositions/frames/08-piscar.html
- type: cta
- persuasion: Generalization (específico → princípio)
- beat: inspiração e resolução
- blueprint: kinetic-type-beats (Adapt)
- focal: a linha-tese "somos um piscar de olhos"
- roles: enumeração "impérios / guerras / internet" = foreground subject (Scene 1) · flash de meia-noite = supporting · linha-tese + CTA = foreground subject (Scene 3)

Adapt: barragem de palavras resolvendo numa linha-tese, assinatura kinetic-type-beats. Frame final — único com exit real (settle/fade suave).
Scene 1 (0.0–2.0s): ground ink-black; "impérios", "guerras", "a internet" entram em rajada de beats de tipo cream (per-word reveal, hard-cut), cada palavra maior que a anterior — full-width strip empilhado.
Scene 2 (2.0–3.4s): o mostrador bate 00h com um flash fire-orange de ~0,1s (piscar) e limpa o palco.
Scene 3 (3.4–6.0s): a linha-tese "somos um piscar de olhos" em display, com "piscar" em fire-orange (spring-pop), Centered; abaixo, "compartilha" em mono chrome como CTA quieto. Held read, depois settle/fade suave no fim (frame final).

narrativeRole: Generaliza a lição (somos recém-chegados) e fecha com um CTA de compartilhamento.
keyMessage: Toda a história humana é um piscar de olhos no dia da Terra.
