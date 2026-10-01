import { Volume2, VolumeX, Play } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { playChime } from '@/lib/alarm'
import { cn } from '@/lib/utils'

/** Toggle + volume + preview for the end-of-session chime. Shared by Settings and Focus. */
export function AlertSoundControl({ compact = false }: { compact?: boolean }) {
  const soundEnabled = useStore(s => s.settings.soundEnabled)
  const volume = useStore(s => s.settings.alertVolume)
  const update = useStore(s => s.updateSettings)
  const pct = Math.round(volume * 100)
  return (
    <div className={cn('flex items-center gap-2', compact ? 'text-xs' : 'text-sm')}>
      <button type="button" onClick={() => update({ soundEnabled: !soundEnabled })}
        className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg transition', soundEnabled ? 'bg-sage-soft text-sage-ink' : 'bg-cream-2 text-muted')}
        aria-pressed={soundEnabled} title={soundEnabled ? 'Desligar som' : 'Ligar som'}>
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
      <input type="range" min={0} max={100} value={pct} disabled={!soundEnabled}
        onChange={e => update({ alertVolume: +e.target.value / 100 })}
        className="min-w-[96px] flex-1 accent-sage disabled:opacity-40" aria-label="Volume do alerta" />
      <span className={cn('w-9 shrink-0 text-right tabular-nums', soundEnabled ? 'text-muted' : 'text-line-2')}>{soundEnabled ? `${pct}%` : 'off'}</span>
      <button type="button" onClick={() => playChime(volume)} disabled={!soundEnabled}
        className="btn btn-soft h-9 shrink-0 px-2.5 text-xs" title="Ouvir o som">
        <Play size={13} /> Testar
      </button>
    </div>
  )
}
