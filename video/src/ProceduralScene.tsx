import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Icons} from './icons';

export type Visual = {
  caption: string;
  icon: string;
  palette: [string, string, string]; // [fundo1, fundo2, dourado]
};

const SERIF = "Georgia, 'Times New Roman', serif";

// Ornamento de canto (flourish) em curvas
const Corner: React.FC<{color: string; flip?: boolean; bottom?: boolean}> = ({
  color,
  flip,
  bottom,
}) => (
  <svg
    viewBox="0 0 100 100"
    style={{
      position: 'absolute',
      width: 130,
      height: 130,
      top: bottom ? undefined : 40,
      bottom: bottom ? 40 : undefined,
      left: flip ? undefined : 48,
      right: flip ? 48 : undefined,
      transform: `scale(${flip ? -1 : 1}, ${bottom ? -1 : 1})`,
      opacity: 0.85,
    }}
  >
    <g fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
      <path d="M6 60 L6 6 L60 6" />
      <path d="M14 40 C14 22 22 14 40 14" />
      <path d="M14 40 C14 52 8 56 4 52 M40 14 C52 14 56 8 52 4" strokeWidth={1.8} />
    </g>
  </svg>
);

export const ProceduralScene: React.FC<{
  visual: Visual;
  duration: number;
  index: number;
  fadeFrames: number;
}> = ({visual, duration, index, fadeFrames}) => {
  const frame = useCurrentFrame();
  const [bg1, bg2, gold] = visual.palette;
  const Icon = Icons[visual.icon] ?? Icons.book;

  const opacity = interpolate(frame, [0, fadeFrames], [0, 1], {
    extrapolateRight: 'clamp',
  });
  // respiração lenta do gradiente e do medalhão
  const drift = interpolate(frame, [0, duration], [0, 1]);
  const angle = 20 + Math.sin(drift * Math.PI * 2) * 8 + index * 12;
  const medalScale = interpolate(frame, [0, duration], [0.98, 1.06]);
  const iconIn = interpolate(frame, [8, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const captionIn = interpolate(frame, [22, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringSpin = drift * (index % 2 === 0 ? 18 : -18);

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(${angle}deg, ${bg1} 0%, ${bg2} 100%)`,
      }}
    >
      {/* brilho central de vela */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 60% at 50% 46%, ${gold}22 0%, transparent 70%)`,
        }}
      />
      {/* vinheta */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 90% 95% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {/* moldura fina */}
      <div
        style={{
          position: 'absolute',
          inset: 56,
          border: `1.5px solid ${gold}66`,
        }}
      />
      <Corner color={gold} />
      <Corner color={gold} flip />
      <Corner color={gold} bottom />
      <Corner color={gold} flip bottom />

      {/* medalhão com ícone */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            width: 430,
            height: 430,
            position: 'relative',
            transform: `scale(${medalScale})`,
            marginBottom: 130,
          }}
        >
          <svg viewBox="0 0 200 200" style={{position: 'absolute', inset: 0}}>
            <circle cx="100" cy="100" r="96" fill={`${bg1}55`} stroke={`${gold}88`} strokeWidth="1.5" />
            <circle cx="100" cy="100" r="86" fill="none" stroke={gold} strokeWidth="2" />
            <g transform={`rotate(${ringSpin} 100 100)`} stroke={gold} strokeWidth="1.2" opacity="0.7">
              {Array.from({length: 24}, (_, i) => {
                const a = (i * 15 * Math.PI) / 180;
                const x1 = 100 + Math.cos(a) * 88;
                const y1 = 100 + Math.sin(a) * 88;
                const x2 = 100 + Math.cos(a) * 93;
                const y2 = 100 + Math.sin(a) * 93;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
            </g>
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 68,
              opacity: iconIn,
              transform: `translateY(${(1 - iconIn) * 14}px)`,
            }}
          >
            <Icon stroke={gold} />
          </div>
        </div>
      </AbsoluteFill>

      {/* legenda da cena */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center'}}>
        <div
          style={{
            marginBottom: 150,
            textAlign: 'center',
            opacity: captionIn,
            transform: `translateY(${(1 - captionIn) * 18}px)`,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              color: gold,
              fontSize: 26,
              letterSpacing: 10,
              textTransform: 'uppercase',
              marginBottom: 18,
              opacity: 0.85,
            }}
          >
            {`Capítulo ${index + 1}`}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              color: '#f5ead8',
              fontSize: 64,
              fontStyle: 'italic',
              textShadow: '0 3px 24px rgba(0,0,0,0.55)',
              maxWidth: 1300,
            }}
          >
            {visual.caption}
          </div>
          <svg width="340" height="16" style={{marginTop: 26, opacity: 0.9}}>
            <line x1="0" y1="8" x2="140" y2="8" stroke={gold} strokeWidth="1.5" />
            <circle cx="170" cy="8" r="4" fill="none" stroke={gold} strokeWidth="1.5" />
            <line x1="200" y1="8" x2="340" y2="8" stroke={gold} strokeWidth="1.5" />
          </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
