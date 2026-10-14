import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Music2, Pause, Play } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { loadIframeApi, usePlayer } from '@/lib/spotify'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

/**
 * Hosts the Spotify embed for the whole app session (mounted once in AppShell),
 * so the music keeps playing while the user moves between pages. Collapsing
 * only hides it visually; the iframe stays alive.
 */
export function MusicDock() {
  const t = useT()
  const uri = useStore(s => s.settings.musicUri)
  const status = usePlayer(s => s.status)
  const paused = usePlayer(s => s.paused)
  const controller = usePlayer(s => s.controller)
  const setPlayer = usePlayer(s => s.set)
  const hostRef = useRef<HTMLDivElement>(null)
  const loadedUri = useRef<string | null>(null)
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768)

  // create the embed the first time a link is set
  useEffect(() => {
    const host = hostRef.current
    if (!uri || controller || !host) return
    let cancelled = false
    const el = document.createElement('div')
    host.appendChild(el)
    setPlayer({ status: 'loading' })
    loadIframeApi()
      .then(api => {
        if (cancelled) return
        api.createController(el, { uri, width: '100%', height: 80 }, c => {
          if (cancelled) { c.destroy(); return }
          loadedUri.current = uri
          c.addListener('ready', () => setPlayer({ status: 'ready' }))
          c.addListener('playback_update', e => setPlayer({ paused: !!e.data.isPaused }))
          setPlayer({ controller: c })
        })
      })
      .catch(() => { if (!cancelled) setPlayer({ status: 'error' }) })
    return () => {
      cancelled = true
      if (el.parentNode === host && !usePlayer.getState().controller) el.remove()
    }
  }, [uri, controller, setPlayer])

  // switch playlist / remove
  useEffect(() => {
    if (!controller) return
    if (!uri) {
      controller.destroy()
      loadedUri.current = null
      if (hostRef.current) hostRef.current.innerHTML = ''
      setPlayer({ controller: null, status: 'idle', paused: true })
    } else if (uri !== loadedUri.current) {
      loadedUri.current = uri
      controller.loadUri(uri)
    }
  }, [uri, controller, setPlayer])

  // tear down on logout (AppShell unmount)
  useEffect(() => () => {
    usePlayer.getState().controller?.destroy()
    usePlayer.getState().set({ controller: null, status: 'idle', paused: true })
  }, [])

  if (!uri) return null

  return (
    <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      <div className={cn('w-[300px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-lift transition-opacity',
        open ? 'opacity-100' : 'pointer-events-none h-0 border-0 opacity-0')} aria-hidden={!open}>
        <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted"><Music2 size={12} /> {t('focus.music.dockTitle')}</p>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost h-7 w-7 rounded-full p-0 text-muted" title={t('focus.music.hide')} aria-label={t('focus.music.hide')}><ChevronDown size={15} /></button>
        </div>
        {status === 'error' && <p className="px-3 pb-3 text-xs text-rose-ink">{t('focus.music.error')}</p>}
        <div ref={hostRef} className="[&>iframe]:block" />
      </div>
      {!open && (
        <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-lift">
          <button type="button" onClick={() => controller?.togglePlay()} disabled={!controller}
            className="grid h-9 w-9 place-items-center rounded-full bg-sage-soft text-sage-ink transition hover:brightness-95 disabled:opacity-50"
            aria-label={paused ? t('focus.music.play') : t('focus.music.pause')}>
            {paused ? <Play size={15} className="ml-0.5" /> : <Pause size={15} />}
          </button>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost h-9 rounded-full px-3 text-xs" aria-label={t('focus.music.show')}>
            <Music2 size={14} /> Spotify
          </button>
        </div>
      )}
    </div>
  )
}
