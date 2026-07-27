import React from 'react';

// Ícones em line-art dourado, viewBox 0 0 120 120
const S: React.CSSProperties & {fill: string} = {
  fill: 'none',
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Wrap: React.FC<{children: React.ReactNode; stroke: string}> = ({children, stroke}) => (
  <svg viewBox="0 0 120 120" style={{width: '100%', height: '100%'}} stroke={stroke} {...({} as object)}>
    <g style={S} stroke={stroke}>
      {children}
    </g>
  </svg>
);

export const Icons: Record<string, React.FC<{stroke: string}>> = {
  chandelier: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M60 6 L60 24" />
      <path d="M60 24 C32 24 18 44 18 66" />
      <path d="M60 24 C88 24 102 44 102 66" />
      <path d="M60 24 L60 62" />
      <path d="M12 70 L24 70 M18 70 L18 54 M54 66 L66 66 M60 66 L60 50 M96 70 L108 70 M102 70 L102 54" />
      <path d="M18 40 C22 46 22 50 18 54 C14 50 14 46 18 40 Z M60 36 C64 42 64 46 60 50 C56 46 56 42 60 36 Z M102 40 C106 46 106 50 102 54 C98 50 98 46 102 40 Z" strokeWidth={2} />
      <path d="M38 30 L38 42 M82 30 L82 42 M60 78 L60 88" strokeWidth={1.5} />
      <circle cx="60" cy="92" r="2.5" strokeWidth={1.5} />
    </Wrap>
  ),
  book: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M60 42 C46 33 31 33 20 37 L20 82 C31 78 46 78 60 86 C74 78 89 78 100 82 L100 37 C89 33 74 33 60 42 Z" />
      <path d="M60 42 L60 86" />
      <path d="M30 48 C38 46 46 46 52 49 M30 58 C38 56 46 56 52 59 M68 49 C74 46 82 46 90 48 M68 59 C74 56 82 56 90 58" strokeWidth={1.5} />
    </Wrap>
  ),
  letter: ({stroke}) => (
    <Wrap stroke={stroke}>
      <rect x="24" y="36" width="72" height="50" rx="4" />
      <path d="M24 38 L60 66 L96 38" />
      <path d="M40 22 C48 16 56 18 60 24 C64 18 72 16 80 22" strokeWidth={1.5} />
    </Wrap>
  ),
  fan: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M60 88 L28 44 M60 88 L43 34 M60 88 L60 28 M60 88 L77 34 M60 88 L92 44" />
      <path d="M28 44 C38 32 50 26 60 26 C70 26 82 32 92 44" />
      <circle cx="60" cy="90" r="4" />
    </Wrap>
  ),
  crown: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M30 78 L28 48 L45 62 L60 38 L75 62 L92 48 L90 78 Z" />
      <path d="M30 86 L90 86" />
      <circle cx="60" cy="30" r="4" strokeWidth={2} />
    </Wrap>
  ),
  moon: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M72 20 C52 26 40 44 40 62 C40 80 52 94 68 98 C48 100 26 86 26 60 C26 36 48 20 72 20 Z" />
      <path d="M82 34 L82 46 M76 40 L88 40 M94 60 L94 68 M90 64 L98 64" strokeWidth={2} />
    </Wrap>
  ),
  pistols: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M32 86 L92 22" />
      <path d="M88 86 L28 22" />
      <path d="M22 66 L44 88 M98 66 L76 88" />
      <circle cx="28" cy="92" r="4" strokeWidth={2} />
      <circle cx="92" cy="92" r="4" strokeWidth={2} />
      <path d="M92 22 L97 15 M28 22 L23 15" strokeWidth={2} />
    </Wrap>
  ),
  rings: ({stroke}) => (
    <Wrap stroke={stroke}>
      <circle cx="47" cy="64" r="20" />
      <circle cx="73" cy="64" r="20" />
      <path d="M47 38 L42 30 L52 30 Z M73 38 L68 30 L78 30 Z" strokeWidth={2} />
    </Wrap>
  ),
  manor: ({stroke}) => (
    <Wrap stroke={stroke}>
      <rect x="28" y="52" width="64" height="38" />
      <path d="M22 52 L60 28 L98 52" />
      <rect x="54" y="70" width="12" height="20" />
      <rect x="36" y="60" width="10" height="12" strokeWidth={2} />
      <rect x="74" y="60" width="10" height="12" strokeWidth={2} />
      <path d="M88 12 L78 26 L85 26 L74 42" strokeWidth={2} />
    </Wrap>
  ),
  candle: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M52 56 L52 86 L68 86 L68 56" />
      <path d="M44 92 C44 88 76 88 76 92 C76 98 44 98 44 92 Z" />
      <path d="M60 30 C67 39 67 46 60 51 C53 46 53 39 60 30 Z" />
      <path d="M60 51 L60 56" strokeWidth={2} />
    </Wrap>
  ),
  heart: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M60 90 C28 64 32 34 60 50 C88 34 92 64 60 90 Z" />
      <path d="M40 26 C44 22 50 22 52 26 M68 26 C72 22 78 22 80 26" strokeWidth={1.5} />
    </Wrap>
  ),
  teacup: ({stroke}) => (
    <Wrap stroke={stroke}>
      {/* copo de chá turco (tulipa) com pires */}
      <path d="M44 34 C44 48 40 52 40 62 C40 76 48 84 60 84 C72 84 80 76 80 62 C80 52 76 48 76 34 Z" />
      <path d="M34 92 C34 88 86 88 86 92 C86 97 34 97 34 92 Z" />
      <path d="M52 16 C50 22 54 24 52 30 M66 14 C64 20 68 22 66 28" strokeWidth={2} />
      <path d="M48 62 L72 62" strokeWidth={1.5} />
    </Wrap>
  ),
  key: ({stroke}) => (
    <Wrap stroke={stroke}>
      <circle cx="38" cy="42" r="18" />
      <circle cx="38" cy="42" r="8" strokeWidth={2} />
      <path d="M51 55 L88 92" />
      <path d="M74 78 L84 68 M82 86 L92 76" />
    </Wrap>
  ),
  boat: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M22 64 L98 64 L86 82 L34 82 Z" />
      <path d="M60 64 L60 24 M60 24 C74 32 78 44 74 56 L60 56" />
      <path d="M14 92 C22 86 30 98 38 92 C46 86 54 98 62 92 C70 86 78 98 86 92 C94 86 100 92 106 92" strokeWidth={2} />
      <path d="M28 22 C32 18 36 22 40 18 M84 14 C88 10 92 14 96 10" strokeWidth={1.5} />
    </Wrap>
  ),
  frame: ({stroke}) => (
    <Wrap stroke={stroke}>
      <rect x="30" y="22" width="60" height="76" rx="2" />
      <rect x="38" y="30" width="44" height="60" strokeWidth={1.5} />
      <path d="M60 74 C48 64 50 52 60 58 C70 52 72 64 60 74 Z" strokeWidth={2} />
      <path d="M52 44 C55 40 65 40 68 44" strokeWidth={1.5} />
    </Wrap>
  ),
  family: ({stroke}) => (
    <Wrap stroke={stroke}>
      <path d="M60 74 C40 58 43 38 60 48 C77 38 80 58 60 74 Z" />
      <path d="M32 96 C22 88 24 78 32 82 C40 78 42 88 32 96 Z" strokeWidth={2} />
      <path d="M88 96 C78 88 80 78 88 82 C96 78 98 88 88 96 Z" strokeWidth={2} />
    </Wrap>
  ),
};
