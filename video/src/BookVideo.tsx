import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import data from '../public/video-data.json';

const XFADE = 15; // frames de crossfade entre cenas

const KenBurnsImage: React.FC<{
  src: string;
  duration: number;
  index: number;
}> = ({src, duration, index}) => {
  const frame = useCurrentFrame();
  const zoomIn = index % 2 === 0;
  const scale = interpolate(
    frame,
    [0, duration],
    zoomIn ? [1.02, 1.14] : [1.14, 1.02],
    {extrapolateRight: 'clamp'}
  );
  const drift = interpolate(frame, [0, duration], [0, index % 3 === 0 ? -30 : 30], {
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [0, XFADE], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{opacity, backgroundColor: '#0d0a12'}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateX(${drift}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const TitleOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, 100, 130], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background:
          'linear-gradient(to bottom, rgba(13,10,18,0.25), rgba(13,10,18,0.75))',
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: '#f5ead8',
          textAlign: 'center',
          padding: 60,
        }}
      >
        <div style={{fontSize: 34, letterSpacing: 8, textTransform: 'uppercase', opacity: 0.85}}>
          {data.subtitle}
        </div>
        <div style={{fontSize: 110, fontWeight: 'bold', marginTop: 24, textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>
          {data.title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const BookVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const total = data.scenes.reduce((acc, s) => acc + s.durationInFrames, 0);
  const fadeOut = interpolate(frame, [total - 45, total - 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let cursor = 0;
  const starts = data.scenes.map((s) => {
    const start = cursor;
    cursor += s.durationInFrames;
    return start;
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0d0a12'}}>
      {data.scenes.map((scene, i) => (
        <Sequence
          key={`img-${i}`}
          from={Math.max(0, starts[i] - XFADE)}
          durationInFrames={scene.durationInFrames + XFADE}
        >
          <KenBurnsImage
            src={scene.image}
            duration={scene.durationInFrames + XFADE}
            index={i}
          />
        </Sequence>
      ))}
      {data.scenes.map((scene, i) => (
        <Sequence key={`aud-${i}`} from={starts[i]} durationInFrames={scene.durationInFrames}>
          <Audio src={staticFile(scene.audio)} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={140}>
        <TitleOverlay />
      </Sequence>
      <AbsoluteFill style={{backgroundColor: '#000', opacity: fadeOut, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
