import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import {
  COLORS,
  ERAS,
  INTRO_DURATION,
  OUTRO_DURATION,
  SCENE_DURATION,
  TOTAL_DURATION,
} from "./constants";
import { EraScene } from "./EraScene";
import { Intro } from "./Intro";
import { Outro } from "./Outro";

const TimelineBar: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = (frame / TOTAL_DURATION) * 100;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 50,
        left: 140,
        right: 140,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(254, 243, 199, 0.25)",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          borderRadius: 3,
          backgroundColor: COLORS.gold,
        }}
      />
    </div>
  );
};

export const ChinaHistory: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Sequence durationInFrames={INTRO_DURATION}>
        <Intro />
      </Sequence>
      {ERAS.map((era, index) => (
        <Sequence
          key={era.title}
          from={INTRO_DURATION + index * SCENE_DURATION}
          durationInFrames={SCENE_DURATION}
        >
          <EraScene era={era} />
        </Sequence>
      ))}
      <Sequence
        from={INTRO_DURATION + ERAS.length * SCENE_DURATION}
        durationInFrames={OUTRO_DURATION}
      >
        <Outro />
      </Sequence>
      <TimelineBar />
    </AbsoluteFill>
  );
};
