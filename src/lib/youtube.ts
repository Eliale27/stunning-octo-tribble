/**
 * YouTube via the official IFrame Player API (no API key needed for playback).
 * https://developers.google.com/youtube/iframe_api_reference
 *
 * YouTube's terms require the player to stay visible (at least 200x200 px),
 * so the dock never hides it while a YouTube link is loaded.
 */
import type { MusicController } from '@/lib/music'

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  getPlayerState: () => number
  cueVideoById: (id: string) => void
  cuePlaylist: (opts: { list: string; listType: 'playlist' }) => void
  destroy: () => void
}
interface YTNamespace {
  Player: new (el: HTMLElement, opts: {
    width?: string | number; height?: string | number; videoId?: string
    playerVars?: Record<string, string | number>
    events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void; onError?: (e: { data: number }) => void }
  }) => YTPlayer
}
declare global {
  interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void }
}

let apiPromise: Promise<YTNamespace> | null = null
function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    if (window.YT?.Player) { resolve(window.YT); return }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); if (window.YT) resolve(window.YT) }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => { apiPromise = null; reject(new Error('youtube-api-unavailable')) }
    document.body.appendChild(script)
  })
  return apiPromise
}

export const YOUTUBE_HEIGHT = 200
const PLAYING = 1
const BUFFERING = 3

const split = (uri: string) => { const [, kind, id] = uri.split(':'); return { kind, id } }

/** Mounts a YouTube player into `el` and resolves with a provider-neutral controller. */
export async function createYouTubePlayer(
  el: HTMLElement, uri: string,
  on: { ready: () => void; paused: (p: boolean) => void; blocked: () => void },
): Promise<MusicController> {
  const YT = await loadYouTubeApi()
  const { kind, id } = split(uri)
  const player = new YT.Player(el, {
    width: '100%',
    height: YOUTUBE_HEIGHT,
    ...(kind === 'video' ? { videoId: id } : {}),
    playerVars: { playsinline: 1, rel: 0, ...(kind === 'playlist' ? { listType: 'playlist', list: id } : {}) },
    events: {
      onReady: on.ready,
      onStateChange: e => on.paused(e.data !== PLAYING && e.data !== BUFFERING),
      // 101 / 150: the owner does not allow embedding; 100: removed or private
      onError: e => { if ([100, 101, 150].includes(e.data)) on.blocked() },
    },
  })
  return {
    provider: 'youtube',
    togglePlay: () => {
      const s = player.getPlayerState()
      if (s === PLAYING || s === BUFFERING) player.pauseVideo(); else player.playVideo()
    },
    load: next => {
      const n = split(next)
      if (n.kind === 'playlist') player.cuePlaylist({ list: n.id, listType: 'playlist' })
      else player.cueVideoById(n.id)
    },
    destroy: () => player.destroy(),
  }
}
