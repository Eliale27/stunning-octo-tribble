/**
 * Spotify via the official embed player + iFrame API (no login, no keys).
 * https://developer.spotify.com/documentation/embeds/references/iframe-api
 */
import type { MusicController } from '@/lib/music'

interface EmbedController {
  loadUri: (uri: string) => void
  togglePlay: () => void
  destroy: () => void
  addListener: (event: string, cb: (e: { data: { isPaused?: boolean } }) => void) => void
}
interface IFrameAPI {
  createController: (el: HTMLElement, opts: { uri: string; width?: string | number; height?: string | number }, cb: (c: EmbedController) => void) => void
}
declare global {
  interface Window { onSpotifyIframeApiReady?: (api: IFrameAPI) => void }
}

let apiPromise: Promise<IFrameAPI> | null = null
function loadIframeApi(): Promise<IFrameAPI> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = api => resolve(api)
    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    script.onerror = () => { apiPromise = null; reject(new Error('spotify-api-unavailable')) }
    document.body.appendChild(script)
  })
  return apiPromise
}

export const SPOTIFY_HEIGHT = 80

/** Mounts a Spotify embed into `el` and resolves with a provider-neutral controller. */
export async function createSpotifyPlayer(
  el: HTMLElement, uri: string,
  on: { ready: () => void; paused: (p: boolean) => void },
): Promise<MusicController> {
  const api = await loadIframeApi()
  return new Promise(resolve => {
    api.createController(el, { uri, width: '100%', height: SPOTIFY_HEIGHT }, c => {
      c.addListener('ready', on.ready)
      c.addListener('playback_update', e => on.paused(!!e.data.isPaused))
      resolve({ provider: 'spotify', togglePlay: () => c.togglePlay(), load: u => c.loadUri(u), destroy: () => c.destroy() })
    })
  })
}
