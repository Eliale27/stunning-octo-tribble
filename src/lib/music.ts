/**
 * Study music from Spotify or YouTube through their official embedded players.
 * No login and no API keys: the user pastes a link and the provider's player
 * plays it. A single controller lives for the whole app session (MusicDock in
 * the AppShell), so music keeps playing while the user moves between pages.
 *
 * Music URIs stored in settings.musicUri:
 *   spotify:<playlist|album|track|artist|episode|show>:<id>
 *   youtube:<video|playlist>:<id>
 */
import { create } from 'zustand'

export type Provider = 'spotify' | 'youtube'
export interface ParsedMusic { provider: Provider; kind: string; id: string; uri: string }

const SPOTIFY_KINDS = ['playlist', 'album', 'track', 'artist', 'episode', 'show']

function parseSpotify(s: string): ParsedMusic | null {
  const m = /^spotify:(\w+):([A-Za-z0-9]{10,40})$/.exec(s)
    ?? /^(?:https?:\/\/)?open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(\w+)\/([A-Za-z0-9]{10,40})(?:[/?#].*)?$/i.exec(s)
  if (!m) return null
  const kind = m[1].toLowerCase()
  if (!SPOTIFY_KINDS.includes(kind)) return null
  return { provider: 'spotify', kind, id: m[2], uri: `spotify:${kind}:${m[2]}` }
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/
const YT_LIST = /^[A-Za-z0-9_-]{10,64}$/

function parseYouTube(s: string): ParsedMusic | null {
  const uri = /^youtube:(video|playlist):([A-Za-z0-9_-]{10,64})$/.exec(s)
  if (uri) return { provider: 'youtube', kind: uri[1], id: uri[2], uri: s }
  let url: URL
  try { url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`) } catch { return null }
  const host = url.hostname.replace(/^(www|m|music)\./, '')
  if (host !== 'youtube.com' && host !== 'youtu.be' && host !== 'youtube-nocookie.com') return null
  const list = url.searchParams.get('list') ?? ''
  let video = url.searchParams.get('v') ?? ''
  if (host === 'youtu.be') video = url.pathname.slice(1).split('/')[0]
  const path = /^\/(?:shorts|embed|live|v)\/([^/?#]+)/.exec(url.pathname)
  if (path) video = path[1]
  // Auto-generated mixes (RD…) cannot be embedded as playlists; fall back to the video.
  const usableList = YT_LIST.test(list) && !list.startsWith('RD')
  if (usableList) return { provider: 'youtube', kind: 'playlist', id: list, uri: `youtube:playlist:${list}` }
  if (YT_ID.test(video)) return { provider: 'youtube', kind: 'video', id: video, uri: `youtube:video:${video}` }
  return null
}

/** Accepts Spotify and YouTube links (or their URIs); null when it is neither. */
export function parseMusicLink(input: string): ParsedMusic | null {
  const s = input.trim()
  if (!s) return null
  return parseSpotify(s) ?? parseYouTube(s)
}

export const providerOf = (uri: string): Provider | null =>
  uri.startsWith('spotify:') ? 'spotify' : uri.startsWith('youtube:') ? 'youtube' : null

/** Suggestions shown before the user pastes a link. */
export const suggestedMusic = [
  { key: 'deepFocus', uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ', emoji: '🧠' },
  { key: 'lofi', uri: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn', emoji: '🎧' },
  { key: 'lofiGirl', uri: 'youtube:video:jfKfPfyJRdk', emoji: '📺' },
] as const

/** What the dock and the Focus controls need from either provider's player. */
export interface MusicController {
  provider: Provider
  togglePlay: () => void
  load: (uri: string) => void
  destroy: () => void
}

/** Live player state shared by the dock and the Focus page controls (not persisted). */
interface PlayerState {
  status: 'idle' | 'loading' | 'ready' | 'error' | 'blocked'
  paused: boolean
  controller: MusicController | null
  set: (p: Partial<Omit<PlayerState, 'set'>>) => void
}
export const usePlayer = create<PlayerState>(set => ({
  status: 'idle', paused: true, controller: null,
  set: p => set(p),
}))
