import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import data from '../../public/video-data.json';
import {Animals} from './animals';

const FONT = "'Comic Sans MS', 'Chalkboard SE', 'Baloo 2', cursive, sans-serif";
const CONFETTI_COLORS = ['#ff6b6b', '#ffd93b', '#7ed957', '#7c4dff', '#42c8f5', '#ff8fab'];

const Confetti: React.FC<{count?: number}> = ({count = 60}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}, (_, i) => {
        const seed = `confetti-${i}`;
        const x = random(seed) * 1920;
        const speed = 3 + random(seed + 'v') * 5;
        const y = ((random(seed + 'y') * 1180 + frame * speed) % 1180) - 60;
        const rot = frame * (2 + random(seed + 'r') * 4) + random(seed + 'a') * 360;
        const c = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const w = 14 + random(seed + 'w') * 14;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: w * 0.6,
              backgroundColor: c,
              borderRadius: 3,
              transform: `rotate(${rot}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Sky: React.FC<{bg?: string[]}> = ({bg}) => {
  const frame = useCurrentFrame();
  const [c1, c2] = bg ?? ['#7ec8f7', '#cdeeff'];
  const sunRot = frame * 0.3;
  return (
    <AbsoluteFill style={{background: `linear-gradient(to bottom, ${c1}, ${c2} 70%)`}}>
      {/* sol girando */}
      <div style={{position: 'absolute', top: 40, right: 90, width: 220, height: 220}}>
        <svg viewBox="0 0 100 100" style={{transform: `rotate(${sunRot}deg)`}}>
          {Array.from({length: 12}, (_, i) => (
            <rect key={i} x="47" y="2" width="6" height="16" rx="3" fill="#ffb703"
              transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="26" fill="#ffd93b" />
          <circle cx="43" cy="46" r="2.5" fill="#e8850c" />
          <circle cx="57" cy="46" r="2.5" fill="#e8850c" />
          <path d="M42 55 C46 60 54 60 58 55" fill="none" stroke="#e8850c" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      {/* nuvens passeando */}
      {[0, 1, 2].map((i) => {
        const speed = 1.2 + i * 0.6;
        const x = ((frame * speed + i * 700) % 2400) - 400;
        const y = 60 + i * 110;
        const s = 1 + i * 0.3;
        return (
          <svg key={i} viewBox="0 0 120 60" style={{position: 'absolute', left: x, top: y, width: 260 * s, opacity: 0.95}}>
            <ellipse cx="40" cy="40" rx="30" ry="18" fill="#fff" />
            <ellipse cx="70" cy="32" rx="26" ry="20" fill="#fff" />
            <ellipse cx="92" cy="42" rx="22" ry="14" fill="#fff" />
          </svg>
        );
      })}
      {/* colinas de grama */}
      <div style={{position: 'absolute', bottom: -160, left: -200, width: 1400, height: 500, borderRadius: '50%', background: '#7ed957'}} />
      <div style={{position: 'absolute', bottom: -200, right: -300, width: 1600, height: 520, borderRadius: '50%', background: '#5bc236'}} />
    </AbsoluteFill>
  );
};

const BouncyAnimal: React.FC<{animal: string; appearAt: number; size: number; idx: number}> = ({
  animal, appearAt, size, idx,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - appearAt, fps, config: {damping: 9, stiffness: 120}});
  const bounce = Math.abs(Math.sin((frame + idx * 12) / 11));
  const A = Animals[animal] ?? Animals.duck;
  if (frame < appearAt) return null;
  return (
    <div style={{width: size, height: size, position: 'relative', transform: `scale(${pop})`}}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translateY(${-bounce * 26}px) scaleY(${1 - bounce * 0.08}) rotate(${Math.sin((frame + idx * 20) / 14) * 4}deg)`,
        }}
      >
        <A />
      </div>
      <div style={{position: 'absolute', bottom: -6, left: '18%', width: '64%', height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.12)', transform: `scaleX(${1 + bounce * 0.25})`}} />
    </div>
  );
};

const BigNumber: React.FC<{n: number; color: string}> = ({n, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 8, fps, config: {damping: 8, stiffness: 100}});
  const pulse = 1 + Math.sin(frame / 9) * 0.04;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 440,
        fontWeight: 900,
        color,
        transform: `scale(${pop * pulse}) rotate(${Math.sin(frame / 16) * 3}deg)`,
        textShadow: '0 12px 0 rgba(0,0,0,0.12)',
        WebkitTextStroke: '14px #fff',
        paintOrder: 'stroke',
      }}
    >
      {n}
    </div>
  );
};

const WordPop: React.FC<{words: string[]; startAt?: number; fontSize?: number; colors?: string[]}> = ({
  words, startAt = 6, fontSize = 130, colors = CONFETTI_COLORS,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: 34, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1500}}>
      {words.map((w, i) => {
        const pop = spring({frame: frame - startAt - i * 9, fps, config: {damping: 9, stiffness: 130}});
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT,
              fontSize,
              fontWeight: 900,
              color: colors[i % colors.length],
              WebkitTextStroke: '10px #fff',
              paintOrder: 'stroke',
              textShadow: '0 8px 0 rgba(0,0,0,0.12)',
              display: 'inline-block',
              transform: `scale(${pop}) rotate(${Math.sin((frame + i * 30) / 12) * 3}deg)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Scene: React.FC<{scene: (typeof data.scenes)[number]; index: number}> = ({scene, index}) => {
  const frame = useCurrentFrame();
  const meta = (scene.meta ?? {kind: 'intro'}) as {
    kind: string; count?: number; animal?: string; bg?: string[]; numColor?: string;
  };
  const dur = scene.durationInFrames;
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <Sky bg={meta.bg} />
      {meta.kind === 'intro' && (
        <>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 220}}>
            <WordPop words={['Vamos', 'Contar', 'com os', 'Bichinhos!']} />
          </AbsoluteFill>
          <div style={{position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'center', gap: 40}}>
            {['duck', 'cat', 'dog', 'frog', 'chick'].map((a, i) => (
              <BouncyAnimal key={a} animal={a} appearAt={30 + i * 10} size={200} idx={i} />
            ))}
          </div>
          <Confetti count={40} />
        </>
      )}
      {meta.kind === 'count' && (
        <>
          <div style={{position: 'absolute', left: 120, top: '50%', transform: 'translateY(-58%)'}}>
            <BigNumber n={meta.count!} color={meta.numColor!} />
          </div>
          <div
            style={{
              position: 'absolute', right: 80, bottom: 90, width: 1100,
              display: 'flex', flexWrap: 'wrap-reverse', justifyContent: 'center',
              alignItems: 'flex-end', gap: 30,
            }}
          >
            {Array.from({length: meta.count!}, (_, i) => (
              <BouncyAnimal
                key={i}
                animal={meta.animal!}
                appearAt={Math.round(dur * 0.28) + i * Math.round((dur * 0.5) / meta.count!)}
                size={meta.count! <= 2 ? 400 : meta.count! <= 4 ? 320 : 280}
                idx={i}
              />
            ))}
          </div>
        </>
      )}
      {meta.kind === 'finale' && (
        <>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 300}}>
            <WordPop words={['1', '2', '3', '4', '5']} fontSize={230} startAt={20} />
          </AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 90}}>
            <WordPop words={['Muito', 'bem!']} fontSize={150} startAt={4} />
          </AbsoluteFill>
          <div style={{position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'center', gap: 40}}>
            {['duck', 'cat', 'dog', 'frog', 'chick'].map((a, i) => (
              <BouncyAnimal key={a} animal={a} appearAt={10 + i * 8} size={200} idx={i} />
            ))}
          </div>
          <Confetti count={80} />
        </>
      )}
    </AbsoluteFill>
  );
};

export const KidsVideo: React.FC = () => {
  let cursor = 0;
  const starts = data.scenes.map((s) => {
    const start = cursor;
    cursor += s.durationInFrames;
    return start;
  });
  return (
    <AbsoluteFill style={{backgroundColor: '#7ec8f7'}}>
      {data.scenes.map((scene, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={scene.durationInFrames}>
          <Scene scene={scene} index={i} />
          <Audio src={staticFile(scene.audio)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
