import { useState } from 'react'
import { Music2, Pause, Play } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { parseMusicLink, providerOf, suggestedMusic, usePlayer } from '@/lib/music'
import { primeAudio } from '@/lib/alarm'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

/** Discreet music row shown with the timer: pick a Spotify or YouTube link, play/pause it. The player itself lives in MusicDock. */
export function MusicControls({ className }: { className?: string }) {
  const t = useT()
  const uri = useStore(s => s.settings.musicUri) || ''
  const update = useStore(s => s.updateSettings)
  const status = usePlayer(s => s.status)
  const paused = usePlayer(s => s.paused)
  const controller = usePlayer(s => s.controller)
  const [editing, setEditing] = useState(false)
  const [link, setLink] = useState('')
  const [invalid, setInvalid] = useState(false)
  const provider = providerOf(uri)
  const ready = !!controller && controller.provider === provider

  const choose = (value: string) => {
    const parsed = parseMusicLink(value)
    if (!parsed) { setInvalid(true); return }
    primeAudio() // keep the end-of-session chime unlocked too
    update({ musicUri: parsed.uri })
    setLink(''); setInvalid(false); setEditing(false)
  }

  const showForm = !provider || editing
  return (
    <div data-tour="music" className={cn('w-full', className)}>
      <p className="label flex items-center gap-1.5"><Music2 size={12} /> {t('focus.music.label')}</p>
      {showForm ? (
        <div>
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); choose(link) }}>
            <input className="input h-10 py-2" value={link} placeholder={t('focus.music.placeholder')} aria-label={t('focus.music.placeholder')} aria-invalid={invalid}
              onChange={e => { setLink(e.target.value); setInvalid(false) }} />
            <button type="submit" className="btn btn-soft h-10 shrink-0 px-3.5" disabled={!link.trim()}>{t('focus.music.use')}</button>
          </form>
          {invalid && <p className="mt-1.5 text-xs text-rose-ink">{t('focus.music.invalid')}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <span>{t('focus.music.or')}</span>
            {suggestedMusic.map(p => (
              <button key={p.key} type="button" onClick={() => choose(p.uri)} className="chip bg-cream-2 text-ink-2 transition hover:bg-beige">
                {p.emoji} {t(`focus.music.suggestions.${p.key}`)}
              </button>
            ))}
            {provider && <button type="button" onClick={() => setEditing(false)} className="ml-auto font-semibold text-ink-2 hover:text-ink">{t('common.actions.cancel')}</button>}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => controller?.togglePlay()} disabled={!ready || status === 'blocked'}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-soft text-sage-ink transition hover:brightness-95 disabled:opacity-50"
              aria-label={paused ? t('focus.music.play') : t('focus.music.pause')}>
              {paused ? <Play size={16} className="ml-0.5" /> : <Pause size={16} />}
            </button>
            <p className="min-w-0 flex-1 truncate text-sm text-ink-2">
              {status === 'error' ? <span className="text-rose-ink">{t('focus.music.error')}</span>
                : status === 'blocked' ? <span className="text-rose-ink">{t('focus.music.blocked')}</span>
                : !ready ? t('focus.music.loading')
                : paused ? t('focus.music.paused') : <span className="font-semibold text-sage-ink">♪ {t('focus.music.playing')}</span>}
            </p>
            <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost h-8 px-2.5 text-xs">{t('focus.music.change')}</button>
            <button type="button" onClick={() => update({ musicUri: '' })} className="btn btn-ghost h-8 px-2.5 text-xs text-muted">{t('focus.music.remove')}</button>
          </div>
          <p className="mt-1.5 text-[11px] text-muted">{provider === 'youtube' ? t('focus.music.hintYouTube') : t('focus.music.hint')}</p>
        </div>
      )}
    </div>
  )
}
