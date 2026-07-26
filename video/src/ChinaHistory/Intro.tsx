import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "./constants";

export const Intro: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 200 } });
  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  const lanternFloat = Math.sin(frame / 12) * 18;

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #991b1b 0%, #450a0a 70%)",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 160,
          fontSize: 130,
          transform: `translateY(${lanternFloat}px)`,
        }}
      >
        🏮
      </div>
      <div
        style={{
          position: "absolute",
          right: 160,
          top: 220,
          fontSize: 130,
          transform: `translateY(${-lanternFloat}px)`,
        }}
      >
        🏮
      </div>
      <h1
        style={{
          color: COLORS.gold,
          fontSize: 130,
          margin: 0,
          textAlign: "center",
          transform: `scale(${titleScale})`,
          textShadow: "0 8px 40px rgba(0,0,0,0.5)",
        }}
      >
        A História da China
      </h1>
      <p
        style={{
          color: COLORS.cream,
          fontSize: 48,
          marginTop: 30,
          letterSpacing: 4,
          opacity: subtitleOpacity,
        }}
      >
        4.000 anos em 35 segundos
      </p>
    </AbsoluteFill>
  );
};
