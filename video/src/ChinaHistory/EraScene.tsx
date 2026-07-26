import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, Era } from "./constants";

export const EraScene: React.FC<{ era: Era; durationInFrames: number }> = ({
  era,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  const titleProgress = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200 },
  });
  const descriptionOpacity = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emojiScale = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12 },
  });
  const emojiFloat = Math.sin(frame / 14) * 14;
  const underlineWidth = interpolate(titleProgress, [0, 1], [0, 180]);

  return (
    <AbsoluteFill
      style={{
        background: era.background,
        opacity: Math.min(fadeIn, fadeOut),
        flexDirection: "row",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ flex: 1.4, paddingLeft: 140, paddingRight: 40 }}>
        <div
          style={{
            color: COLORS.gold,
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: titleProgress,
          }}
        >
          {era.period}
        </div>
        <h1
          style={{
            color: COLORS.cream,
            fontSize: 96,
            lineHeight: 1.05,
            margin: "24px 0 0 0",
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [40, 0])}px)`,
          }}
        >
          {era.title}
        </h1>
        <div
          style={{
            width: underlineWidth,
            height: 8,
            borderRadius: 4,
            backgroundColor: COLORS.goldDark,
            margin: "28px 0",
          }}
        />
        <p
          style={{
            color: COLORS.cream,
            fontSize: 42,
            lineHeight: 1.45,
            maxWidth: 900,
            margin: 0,
            opacity: descriptionOpacity,
          }}
        >
          {era.description}
        </p>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 280,
            transform: `scale(${emojiScale}) translateY(${emojiFloat}px)`,
          }}
        >
          {era.emoji}
        </div>
      </div>
    </AbsoluteFill>
  );
};
