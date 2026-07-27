import React from 'react';
import {Composition} from 'remotion';
import {BookVideo} from './BookVideo';
import data from '../public/video-data.json';

export const FPS = 30;

export const Root: React.FC = () => {
  const totalFrames = data.scenes.reduce((acc, s) => acc + s.durationInFrames, 0);
  return (
    <Composition
      id="BookVideo"
      component={BookVideo}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
