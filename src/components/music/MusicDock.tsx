import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Music2, Pause, Play } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { providerOf, usePlayer } from '@/lib/music'
import { createSpotifyPlayer } from '@/lib/spotify'
import { createYouTubePlayer } from '@/lib/youtube'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

const providerName = { spotify: 'Spotify', youtube: 'YouTube' } as const

/**
 * Hosts the Spotify or YouTube player for the whole app session (mounted once
 * in AppShell), so the music keeps playing while the user moves between pages.
 * A Spotify player can be collapsed (hidden but alive); a YouTube player always
 * stays visible, as YouTube's terms require.
 */
export function MusicDock() {
  const t = useT()
  const uri = useStore(s => s.settings.musicUri) || ''
  const provider = providerOf(uri)
  const status = usePlayer(s => s.status)
  const paused = usePlayer(s => s.paused)
  const controller = usePlayer(s => s.controller)
  const setPlayer = usePlayer(s => s.set)
  const hostRef = useRef<HTMLDivElement>(null)
  const loadedUri = useRef<string | null>(null)
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768)
  const canCollapse = provider === 'spotify'
  const visible = open || !canCollapse

  // (re)create the player when a link is set or the provider changes
  useEffect(() => {
    const host = hostRef.current
    if (!provider || !host) return
    if (controller && controller.provider === provider) return
    if (controller) { controller.destroy(); host.innerHTML = ''; setPlayer({ controller: null, paused: true }); return }
    // `cancelled`: the effect was torn down before the player existed.
    // `dead`: this player instance was destroyed; its late events are ignored.
    let cancelled = false
    let dead = false
    const el = document.createElement('div')
    host.appendChild(el)
    setPlayer({ status: 'loading', paused: true })
    const on = {
      ready: () => { if (!dead) setPlayer({ status: 'ready' }) },
      paused: (p: boolean) => { if (!dead) setPlayer({ paused: p }) },
      blocked: () => { if (!dead) setPlayer({ status: 'blocked', paused: true }) },
    }
    const create = provider === 'spotify' ? createSpotifyPlayer(el, uri, on) : createYouTubePlayer(el, uri, on)
    create
      .then(player => {
        const c = { ...player, destroy: () => { dead = true; player.destroy() } }
        if (cancelled) { c.destroy(); return }
        loadedUri.current = uri
        setPlayer({ controller: c })
      })
      .catch(() => { if (!cancelled) setPlayer({ status: 'error' }) })
    return () => {
      cancelled = true
      if (el.parentNode === host && !usePlayer.getState().controller) el.remove()
    }
    // uri is read only at creation; switching within a provider is handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, controller, setPlayer])

  // switch link within the same provider / remove
  useEffect(() => {
    if (!controller) return
    if (!provider) {
      controller.destroy()
      loadedUri.current = null
      if (hostRef.current) hostRef.current.innerHTML = ''
      setPlayer({ controller: null, status: 'idle', paused: true })
    } else if (controller.provider === provider && uri !== loadedUri.current) {
      loadedUri.current = uri
      setPlayer({ status: 'ready', paused: true })
      controller.load(uri)
    }
  }, [uri, provider, controller, setPlayer])

  // tear down on logout (AppShell unmount)
  useEffect(() => () => {
    usePlayer.getState().controller?.destroy()
    usePlayer.getState().set({ controller: null, status: 'idle', paused: true })
  }, [])

  if (!provider) return null

  return (
    <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      <div className={cn('w-[300px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-lift transition-opacity',
        visible ? 'opacity-100' : 'pointer-events-none h-0 border-0 opacity-0')} aria-hidden={!visible}>
        <div className="flex h-9 items-center justify-between px-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <Music2 size={12} /> {t('focus.music.dockTitle', { name: providerName[provider] })}
          </p>
          {canCollapse && (
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost h-7 w-7 rounded-full p-0 text-muted" title={t('focus.music.hide')} aria-label={t('focus.music.hide')}><ChevronDown size={15} /></button>
          )}
        </div>
        {status === 'error' && <p className="px-3 pb-3 text-xs text-rose-ink">{t('focus.music.error')}</p>}
        <div ref={hostRef} className="[&>iframe]:block" />
      </div>
      {!visible && (
        <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-lift">
          <button type="button" onClick={() => controller?.togglePlay()} disabled={!controller}
            className="grid h-9 w-9 place-items-center rounded-full bg-sage-soft text-sage-ink transition hover:brightness-95 disabled:opacity-50"
            aria-label={paused ? t('focus.music.play') : t('focus.music.pause')}>
            {paused ? <Play size={15} className="ml-0.5" /> : <Pause size={15} />}
          </button>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost h-9 rounded-full px-3 text-xs" aria-label={t('focus.music.show')}>
            <Music2 size={14} /> {providerName[provider]}
          </button>
        </div>
      )}
    </div>
  )
}
