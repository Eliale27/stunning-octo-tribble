import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ChinaHistoryProps } from "./calculate-metadata";
import {
  AUDIO_START_FRAMES,
  COLORS,
  ERAS,
  defaultSegmentDuration,
} from "./constants";
import { EraScene } from "./EraScene";
import { Intro } from "./Intro";
import { NARRATION, audioFileFor } from "./narration";
import { Outro } from "./Outro";

const TimelineBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = (frame / durationInFrames) * 100;

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

export const ChinaHistory: React.FC<ChinaHistoryProps> = ({ segments }) => {
  const resolved =
    segments ??
    NARRATION.map((_, index) => ({
      durationInFrames: defaultSegmentDuration(index),
      hasAudio: false,
    }));

  let start = 0;
  const starts = resolved.map((segment) => {
    const current = start;
    start += segment.durationInFrames;
    return current;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      {resolved.map((segment, index) => {
        const content =
          index === 0 ? (
            <Intro durationInFrames={segment.durationInFrames} />
          ) : index === resolved.length - 1 ? (
            <Outro durationInFrames={segment.durationInFrames} />
          ) : (
            <EraScene
              era={ERAS[index - 1]}
              durationInFrames={segment.durationInFrames}
            />
          );

        return (
          <Sequence
            key={NARRATION[index].id}
            from={starts[index]}
            durationInFrames={segment.durationInFrames}
          >
            {content}
            {segment.hasAudio ? (
              <Sequence from={AUDIO_START_FRAMES}>
                <Audio src={staticFile(audioFileFor(NARRATION[index].id))} />
              </Sequence>
            ) : null}
          </Sequence>
        );
      })}
      <TimelineBar />
    </AbsoluteFill>
  );
};
