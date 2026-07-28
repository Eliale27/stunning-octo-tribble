# Elenco — SVG canônico

**Regra dura:** cole o SVG do personagem **exatamente** como está aqui. Não redesenhe,
não mude cor, proporção ou ordem de camadas. A consistência entre cenas depende
disso — cada cena é construída por um worker diferente, e a princesa não pode
mudar de rosto no meio da história.

O que você **pode** fazer: envolver o `<g>` raiz num wrapper e animar esse wrapper
(posição, escala, `scaleX(-1)` para espelhar), além de animar as peças marcadas
abaixo como *hooks*.

## Extensão de paleta (tons de personagem)

O preset daisy-days não traz tons de pele/pelo. Estes quatro são a extensão
oficial deste projeto — use só eles, nada além:

| Token         | Hex       | Uso                        |
| ------------- | --------- | -------------------------- |
| `skin`        | `#F2C6A0` | pele da Lia                |
| `hair`        | `#6B4A3A` | cabelo da Lia              |
| `fur-bear`    | `#C89B72` | pelo do Bruno              |
| `muzzle`      | `#EBD9C4` | focinho/barriga do Bruno   |

Todo o resto vem de `frame.md`: contorno `#2D2D2D` 3px, e a paleta pastel.

## Hooks de animação (presentes em todos)

Cada personagem expõe estas classes. Prefixe-as com o `frame_id` ao usar
(`s03-tico-mouth-open`) para não colidir entre cenas irmãs.

| Classe          | O que é                        | Como animar                                                    |
| --------------- | ------------------------------ | -------------------------------------------------------------- |
| `.mouth-closed` | boca fechada (padrão, opacity 1) | fala: alterna opacity 1↔0 contra `.mouth-open`                |
| `.mouth-open`   | boca aberta (opacity 0)        | fala: o inverso                                                |
| `.eyes`         | grupo dos olhos                | piscada: `scaleY` 1→0.1→1 em ~0.12s                            |
| `.body`         | corpo inteiro                  | respiro/hop: `scaleY`/`y` sutil                                |

### Fala (lip flap) — a receita

Não invente. Durante a janela de fala do personagem (vem de `dialogue_cues.json`),
alterne as duas bocas a ~8 Hz com `.set()` determinístico:

```js
// fala de 2.4s começando em t=1.1s
var t = 1.1, END = 1.1 + 2.4, FLAP = 0.0625; // 8 Hz
var on = true;
while (t < END) {
  tl.set(mouthOpen,   { opacity: on ? 1 : 0 }, t);
  tl.set(mouthClosed, { opacity: on ? 0 : 1 }, t);
  on = !on; t += FLAP;
}
tl.set(mouthOpen, { opacity: 0 }, END);   // sempre fecha a boca no fim
tl.set(mouthClosed, { opacity: 1 }, END);
```

Nada de `repeat: -1` — o render busca frame a frame e um loop infinito quebra.

---

## Princesa Lia

Altura de referência: 320. Ancorar os pés na linha do chão da cena.

```html
<g class="char-lia">
  <!-- saia -->
  <path class="body" d="M110 176 L56 296 Q110 310 164 296 Z" fill="#F7C8D4" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <!-- braços (saem do ombro, sobrepondo o torso) -->
  <rect class="arm-l" x="66" y="138" width="16" height="56" rx="8" fill="#F2C6A0" stroke="#2D2D2D" stroke-width="3"/>
  <rect class="arm-r" x="138" y="138" width="16" height="56" rx="8" fill="#F2C6A0" stroke="#2D2D2D" stroke-width="3"/>
  <!-- faixa na cintura -->
  <rect x="80" y="170" width="60" height="14" rx="7" fill="#F8635F" stroke="#2D2D2D" stroke-width="3"/>
  <!-- torso -->
  <path d="M110 122 Q86 130 84 176 Q110 186 136 176 Q134 130 110 122 Z" fill="#D4A5E8" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <!-- cabelo (atrás) -->
  <path d="M110 34 Q62 34 60 92 Q58 138 74 156 L86 120 Q78 74 110 70 Q142 74 134 120 L146 156 Q162 138 160 92 Q158 34 110 34 Z" fill="#6B4A3A" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <!-- rosto -->
  <circle cx="110" cy="86" r="38" fill="#F2C6A0" stroke="#2D2D2D" stroke-width="3"/>
  <!-- franja -->
  <path d="M74 76 Q80 46 110 46 Q140 46 146 76 Q128 62 110 64 Q92 62 74 76 Z" fill="#6B4A3A" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <!-- coroa -->
  <path d="M86 38 L94 16 L110 32 L126 16 L134 38 Z" fill="#FDE68A" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <!-- olhos -->
  <g class="eyes">
    <circle cx="97" cy="86" r="4.5" fill="#2D2D2D"/>
    <circle cx="123" cy="86" r="4.5" fill="#2D2D2D"/>
  </g>
  <!-- bochechas -->
  <circle cx="86" cy="97" r="6" fill="#F7C8D4" opacity="0.85"/>
  <circle cx="134" cy="97" r="6" fill="#F7C8D4" opacity="0.85"/>
  <!-- bocas -->
  <path class="mouth-closed" d="M102 103 Q110 109 118 103" fill="none" stroke="#2D2D2D" stroke-width="3" stroke-linecap="round"/>
  <ellipse class="mouth-open" cx="110" cy="105" rx="7" ry="6" fill="#8C4A46" stroke="#2D2D2D" stroke-width="3" opacity="0"/>
</g>
```

## Tico — passarinho

Altura de referência: 120. O menor do elenco; costuma entrar voando.

```html
<g class="char-tico">
  <!-- cauda -->
  <path d="M28 66 L4 54 L8 78 Z" fill="#7ECDC0" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <!-- corpo -->
  <ellipse class="body" cx="70" cy="66" rx="42" ry="34" fill="#A8D8F0" stroke="#2D2D2D" stroke-width="3"/>
  <!-- asa -->
  <path class="wing" d="M62 56 Q86 46 96 68 Q76 80 62 56 Z" fill="#7ECDC0" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <!-- pés -->
  <path d="M62 98 L58 112 M78 98 L82 112" stroke="#2D2D2D" stroke-width="3" stroke-linecap="round"/>
  <!-- olho -->
  <g class="eyes"><circle cx="88" cy="54" r="4.5" fill="#2D2D2D"/></g>
  <!-- bicos -->
  <path class="mouth-closed" d="M108 62 L128 66 L108 70 Z" fill="#FDE68A" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <g class="mouth-open" opacity="0">
    <path d="M108 62 L130 56 L110 66 Z" fill="#FDE68A" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
    <path d="M110 68 L130 76 L108 72 Z" fill="#E8B84B" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  </g>
</g>
```

## Gaspar — sapo

Altura de referência: 150. Baixo e largo; resmungão.

```html
<g class="char-gaspar">
  <!-- patas -->
  <ellipse cx="40" cy="126" rx="22" ry="11" fill="#7ECDC0" stroke="#2D2D2D" stroke-width="3"/>
  <ellipse cx="136" cy="126" rx="22" ry="11" fill="#7ECDC0" stroke="#2D2D2D" stroke-width="3"/>
  <!-- corpo -->
  <ellipse class="body" cx="88" cy="94" rx="62" ry="42" fill="#A8E6CF" stroke="#2D2D2D" stroke-width="3"/>
  <!-- barriga -->
  <ellipse cx="88" cy="106" rx="38" ry="22" fill="#D8F5E6" stroke="none"/>
  <!-- olhos (bolhas em cima) -->
  <g class="eyes">
    <circle cx="62" cy="52" r="19" fill="#A8E6CF" stroke="#2D2D2D" stroke-width="3"/>
    <circle cx="114" cy="52" r="19" fill="#A8E6CF" stroke="#2D2D2D" stroke-width="3"/>
    <circle cx="62" cy="54" r="7" fill="#2D2D2D"/>
    <circle cx="114" cy="54" r="7" fill="#2D2D2D"/>
  </g>
  <!-- bocas -->
  <path class="mouth-closed" d="M52 100 Q88 114 124 100" fill="none" stroke="#2D2D2D" stroke-width="3" stroke-linecap="round"/>
  <path class="mouth-open" d="M54 96 Q88 132 122 96 Q88 108 54 96 Z" fill="#8C4A46" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round" opacity="0"/>
</g>
```

## Bruno — urso

Altura de referência: 300. O maior; ocupa peso na cena.

```html
<g class="char-bruno">
  <!-- pernas -->
  <rect x="60" y="228" width="42" height="56" rx="18" fill="#C89B72" stroke="#2D2D2D" stroke-width="3"/>
  <rect x="132" y="228" width="42" height="56" rx="18" fill="#C89B72" stroke="#2D2D2D" stroke-width="3"/>
  <!-- corpo -->
  <ellipse class="body" cx="117" cy="188" rx="76" ry="66" fill="#C89B72" stroke="#2D2D2D" stroke-width="3"/>
  <ellipse cx="117" cy="200" rx="46" ry="44" fill="#EBD9C4" stroke="none"/>
  <!-- braços -->
  <rect class="arm-l" x="26" y="150" width="34" height="76" rx="17" fill="#C89B72" stroke="#2D2D2D" stroke-width="3"/>
  <rect class="arm-r" x="174" y="150" width="34" height="76" rx="17" fill="#C89B72" stroke="#2D2D2D" stroke-width="3"/>
  <!-- orelhas -->
  <circle cx="72" cy="52" r="24" fill="#C89B72" stroke="#2D2D2D" stroke-width="3"/>
  <circle cx="162" cy="52" r="24" fill="#C89B72" stroke="#2D2D2D" stroke-width="3"/>
  <circle cx="72" cy="52" r="11" fill="#EBD9C4"/>
  <circle cx="162" cy="52" r="11" fill="#EBD9C4"/>
  <!-- cabeça -->
  <circle cx="117" cy="84" r="56" fill="#C89B72" stroke="#2D2D2D" stroke-width="3"/>
  <!-- focinho -->
  <ellipse cx="117" cy="104" rx="34" ry="26" fill="#EBD9C4" stroke="#2D2D2D" stroke-width="3"/>
  <path d="M117 92 L106 100 Q117 108 128 100 Z" fill="#2D2D2D"/>
  <!-- olhos -->
  <g class="eyes">
    <circle cx="97" cy="70" r="5.5" fill="#2D2D2D"/>
    <circle cx="137" cy="70" r="5.5" fill="#2D2D2D"/>
  </g>
  <!-- bocas -->
  <path class="mouth-closed" d="M104 114 Q117 122 130 114" fill="none" stroke="#2D2D2D" stroke-width="3" stroke-linecap="round"/>
  <ellipse class="mouth-open" cx="117" cy="116" rx="13" ry="10" fill="#8C4A46" stroke="#2D2D2D" stroke-width="3" opacity="0"/>
</g>
```

---

## Cenário — motivos reutilizáveis

Monte os fundos com estas peças, sempre em camadas: céu → montanhas → colinas →
árvores → chão → personagens. Contorno 3px só nos elementos de primeiro plano;
montanha e céu ficam sem contorno para dar profundidade.

```html
<!-- céu -->
<rect x="0" y="0" width="1920" height="1080" fill="#A8D8F0"/>
<!-- montanha ao fundo (sem contorno) -->
<path d="M-100 700 L300 260 L560 700 Z" fill="#B9C7D6"/>
<path d="M380 700 L760 300 L1040 700 Z" fill="#CBD6E2"/>
<!-- colina -->
<path d="M-100 1080 Q480 660 1100 1080 Z" fill="#A8E6CF" stroke="#2D2D2D" stroke-width="3"/>
<!-- árvore -->
<g class="tree">
  <rect x="-11" y="0" width="22" height="80" rx="6" fill="#8B6B4A" stroke="#2D2D2D" stroke-width="3"/>
  <circle cx="0" cy="-26" r="52" fill="#7ECDC0" stroke="#2D2D2D" stroke-width="3"/>
</g>
<!-- rio (água corrente) -->
<path class="river" d="M0 900 Q480 860 960 900 Q1440 940 1920 900 L1920 1080 L0 1080 Z" fill="#7ECDC0" stroke="#2D2D2D" stroke-width="3"/>
<!-- leito seco (mesmo caminho, cor de terra) -->
<path class="riverbed" d="M0 900 Q480 860 960 900 Q1440 940 1920 900 L1920 1080 L0 1080 Z" fill="#C9B79C" stroke="#2D2D2D" stroke-width="3"/>
```

## Balão de fala

Um por personagem falante, ancorado acima da cabeça. Entra com spring-pop no
início da fala e sai no fim dela.

```html
<g class="bubble">
  <rect x="0" y="0" width="380" height="120" rx="26" fill="#FFFFFF" stroke="#2D2D2D" stroke-width="3"/>
  <path d="M60 120 L52 152 L96 120 Z" fill="#FFFFFF" stroke="#2D2D2D" stroke-width="3" stroke-linejoin="round"/>
  <!-- texto: Quicksand 600, #2D2D2D, no máximo ~6 palavras -->
</g>
```
