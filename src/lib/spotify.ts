/**
 * Spotify via the official embed player + iFrame API (no login, no keys).
 * https://developer.spotify.com/documentation/embeds/references/iframe-api
 *
 * One controller lives for the whole app session (mounted by MusicDock in the
 * AppShell), so music keeps playing while the user moves between pages.
 */
import { create } from 'zustand'

export type SpotifyKind = 'playlist' | 'album' | 'track' | 'artist' | 'episode' | 'show'
const KINDS: SpotifyKind[] = ['playlist', 'album', 'track', 'artist', 'episode', 'show']

/** Accepts open.spotify.com links (with or without intl-xx, query strings) and spotify:kind:id URIs. */
export function parseSpotifyLink(input: string): { kind: SpotifyKind; id: string; uri: string } | null {
  const s = input.trim()
  const uriMatch = /^spotify:(\w+):([A-Za-z0-9]{10,40})$/.exec(s)
  const urlMatch = /^(?:https?:\/\/)?open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(\w+)\/([A-Za-z0-9]{10,40})(?:[/?#].*)?$/i.exec(s)
  const m = uriMatch ?? urlMatch
  if (!m) return null
  const kind = m[1].toLowerCase() as SpotifyKind
  if (!KINDS.includes(kind)) return null
  return { kind, id: m[2], uri: `spotify:${kind}:${m[2]}` }
}

/** Suggestions shown before the user pastes a link (public Spotify editorial playlists). */
export const suggestedPlaylists = [
  { key: 'deepFocus', uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ', emoji: '🧠' },
  { key: 'lofi', uri: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn', emoji: '🎧' },
] as const

/* ---------- iFrame API ---------- */
export interface EmbedController {
  loadUri: (uri: string) => void
  play: () => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  destroy: () => void
  addListener: (event: string, cb: (e: { data: { isPaused?: boolean; isBuffering?: boolean } }) => void) => void
}
interface IFrameAPI {
  createController: (el: HTMLElement, opts: { uri: string; width?: string | number; height?: string | number }, cb: (c: EmbedController) => void) => void
}
declare global {
  interface Window { onSpotifyIframeApiReady?: (api: IFrameAPI) => void }
}

let apiPromise: Promise<IFrameAPI> | null = null
export function loadIframeApi(): Promise<IFrameAPI> {
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

/** Live player state shared by the dock and the Focus page controls (not persisted). */
interface PlayerState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  paused: boolean
  controller: EmbedController | null
  set: (p: Partial<Omit<PlayerState, 'set'>>) => void
}
export const usePlayer = create<PlayerState>(set => ({
  status: 'idle', paused: true, controller: null,
  set: p => set(p),
}))
