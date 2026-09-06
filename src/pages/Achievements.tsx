import { motion } from 'motion/react'
import { useStore } from '@/store/useStore'
import { achievementDefs } from '@/data/seed'
import { PageHeader } from '@/components/ui/Bits'
import { ProgressBar } from '@/components/ui/Progress'
import { cn, fmtDate, levelFor, levels, streak, fmtMinutes } from '@/lib/utils'

export default function Achievements() {
  const unlocked = useStore(s => s.unlocked)
  const sessions = useStore(s => s.sessions)
  const total = sessions.reduce((a, s) => a + s.minutes, 0)
  const lvl = levelFor(total)
  const st = streak(sessions)
  const count = Object.keys(unlocked).length

  return (
    <div>
      <PageHeader title="Conquistas" sub={`${count} de ${achievementDefs.length} desbloqueadas. Sem pressa: elas chegam com a rotina.`} />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-butter-soft text-4xl">{lvl.current.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Seu nível</p>
              <h2 className="text-2xl font-extrabold">{lvl.current.name}</h2>
              <p className="text-sm text-muted">{fmtMinutes(total)} estudadas no total{lvl.next && ` · faltam ${fmtMinutes(Math.max(0, lvl.next.minHours * 60 - total))} para ${lvl.next.name}`}</p>
            </div>
          </div>
          <ProgressBar value={lvl.pct} className="mt-5" color="bg-butter" height="h-3" />
          <div className="mt-4 flex justify-between">
            {levels.map((l, i) => (
              <div key={l.name} className={cn('flex flex-col items-center gap-1 text-center', i > lvl.index && 'opacity-40')}>
                <span className={cn('grid h-9 w-9 place-items-center rounded-full text-lg', i <= lvl.index ? 'bg-butter-soft' : 'bg-cream-2')}>{l.emoji}</span>
                <span className="hidden text-[10px] font-semibold text-muted sm:block">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card flex flex-col justify-center bg-peach-soft/60 p-6 text-center">
          <p className="text-5xl">🔥</p>
          <p className="mt-2 text-3xl font-extrabold">{st} dias</p>
          <p className="text-sm text-ink-2">{st > 0 ? `Você estudou por ${st} dias seguidos!` : 'Comece hoje uma nova sequência.'}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievementDefs.map((a, i) => {
          const date = unlocked[a.id]
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={cn('card flex items-center gap-4 p-4', !date && 'border-dashed bg-cream-2/40 shadow-none')}>
              <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl', date ? 'bg-butter-soft' : 'bg-cream-2 grayscale opacity-60')}>{a.emoji}</span>
              <div className="min-w-0">
                <p className={cn('font-semibold', !date && 'text-muted')}>{a.title}</p>
                <p className="text-xs text-muted">{a.desc}</p>
                {date ? <p className="mt-1 text-[11px] font-semibold text-sage-ink">Desbloqueada em {fmtDate(date, 'dd/MM/yyyy')}</p> : <p className="mt-1 text-[11px] font-semibold text-muted">Bloqueada</p>}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
