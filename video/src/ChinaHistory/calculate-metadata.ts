import { CalculateMetadataFunction, staticFile } from "remotion";
import {
  AUDIO_START_FRAMES,
  AUDIO_TAIL_FRAMES,
  FPS,
  Segment,
  defaultSegmentDuration,
} from "./constants";
import { getAudioDuration } from "./get-audio-duration";
import { NARRATION, audioFileFor } from "./narration";

export type ChinaHistoryProps = {
  segments: Segment[] | null;
};

// Sizes each segment to fit its narration audio. Segments whose audio has
// not been generated yet fall back to the fixed default duration, so the
// composition also works before running scripts/generate-voiceover.ts.
export const calculateChinaHistoryMetadata: CalculateMetadataFunction<
  ChinaHistoryProps
> = async () => {
  const segments = await Promise.all(
    NARRATION.map(async (segment, index): Promise<Segment> => {
      const fallback = defaultSegmentDuration(index);
      try {
        const seconds = await getAudioDuration(
          staticFile(audioFileFor(segment.id)),
        );
        const frames =
          Math.ceil(seconds * FPS) + AUDIO_START_FRAMES + AUDIO_TAIL_FRAMES;
        return { durationInFrames: Math.max(fallback, frames), hasAudio: true };
      } catch {
        return { durationInFrames: fallback, hasAudio: false };
      }
    }),
  );

  return {
    durationInFrames: segments.reduce(
      (sum, segment) => sum + segment.durationInFrames,
      0,
    ),
    props: { segments },
  };
};
