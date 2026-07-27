import {Config} from '@remotion/cli/config';

// Chromium pré-instalado no ambiente remoto (evita novo download)
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(4);
