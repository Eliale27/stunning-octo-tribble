import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "./constants";

export const Outro: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 200 } });
  const creditsOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #7f1d1d 0%, #1c1917 75%)",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 150, transform: `scale(${scale})` }}>🐉</div>
      <h1
        style={{
          color: COLORS.gold,
          fontSize: 96,
          margin: "40px 0 0 0",
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        4.000 anos de história
      </h1>
      <p
        style={{
          color: COLORS.cream,
          fontSize: 38,
          marginTop: 34,
          opacity: creditsOpacity,
        }}
      >
        Feito com Remotion
      </p>
    </AbsoluteFill>
  );
};
