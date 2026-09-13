import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { useStore, goalProgress } from '@/store/useStore'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { Checkbox } from '@/components/ui/Checkbox'
import { SubjectChip, Stat } from '@/components/ui/Bits'
import { dailyQuote, fmtMinutes, greeting, lastNDays, minutesOn, streak, todayISO, reviewInfo, colorClasses, cn, levelFor } from '@/lib/utils'
import { format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const settings = useStore(s => s.settings)
  const sessions = useStore(s => s.sessions)
  const tasks = useStore(s => s.tasks)
  const subjects = useStore(s => s.subjects)
  const goals = useStore(s => s.goals)
  const toggleTask = useStore(s => s.toggleTask)

  const today = new Date()
  const minutesToday = minutesOn(sessions, today)
  const sessionsToday = sessions.filter(s => isToday(new Date(s.date))).length
  const pct = Math.min(100, Math.round((minutesToday / settings.dailyGoalMinutes) * 100))
  const st = streak(sessions)
  const todayTasks = tasks.filter(t => t.date === todayISO())
  const doneToday = todayTasks.filter(t => t.status === 'done').length
  const total = sessions.reduce((a, s) => a + s.minutes, 0)
  const lvl = levelFor(total)

  const dueTopics = subjects.flatMap(s => s.topics.map(t => ({ s, t, info: reviewInfo(t) }))).filter(x => x.info?.bucket === 'today').slice(0, 3)
  const week = lastNDays(7).map(d => ({ d, m: minutesOn(sessions, d) }))
  const maxWeek = Math.max(...week.map(w => w.m), 60)

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
          <h1 className="page-title mt-1">{greeting(settings.name)}</h1>
          <p className="page-sub">Pequenos passos todos os dias levam você mais longe.</p>
        </div>
        <Link to="/app/foco" className="btn btn-primary"><Play size={16} /> Iniciar sessão de foco</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat icon="📚" label="Estudos de hoje" value={sessionsToday} hint={sessionsToday === 1 ? 'sessão' : 'sessões'} tone="bg-sky-soft" />
        <Stat icon="⏱️" label="Tempo estudado" value={fmtMinutes(minutesToday)} hint="hoje" tone="bg-sage-soft" />
        <Stat icon="🎯" label="Meta diária" value={fmtMinutes(settings.dailyGoalMinutes)} hint={`${pct}% concluído`} tone="bg-butter-soft" />
        <Stat icon="🔥" label="Sequência" value={`${st} dias`} hint="seguidos" tone="bg-peach-soft" />
        <Stat icon="✅" label="Tarefas" value={`${doneToday}/${todayTasks.length}`} hint="concluídas hoje" tone="bg-lilac-soft" className="col-span-2 md:col-span-1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress card */}
        <motion.div className="card relative overflow-hidden p-6 lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sage-soft/70 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-sky-soft/70 blur-2xl" />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={pct} size={150} stroke={13}>
              <div className="text-center">
                <p className="text-3xl font-extrabold tracking-tight">{pct}%</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">da meta</p>
              </div>
            </ProgressRing>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold">Seu progresso hoje</h2>
              <p className="mt-1 text-muted">
                {pct >= 100 ? 'Meta do dia concluída. Descanse com orgulho. 🌿'
                  : `Você está ${pct}% mais perto da sua meta de hoje.`}
              </p>
              <div className="mt-4">
                <ProgressBar value={pct} height="h-3" />
                <div className="mt-2 flex justify-between text-xs text-muted">
                  <span>{fmtMinutes(minutesToday)} estudados</span>
                  <span>faltam {fmtMinutes(Math.max(0, settings.dailyGoalMinutes - minutesToday))}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="chip bg-cream-2 text-ink-2">{lvl.current.emoji} {lvl.current.name}</span>
                {lvl.next && <span className="chip bg-cream-2 text-muted">{Math.round(lvl.pct)}% para {lvl.next.emoji} {lvl.next.name}</span>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div className="card flex flex-col justify-between bg-butter-soft/60 p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface/70"><Sparkles size={18} className="text-butter-ink" /></div>
          <div>
            <p className="mt-6 text-lg font-bold leading-snug text-ink">“{dailyQuote()}”</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-butter-ink/80">Motivação de hoje</p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's tasks */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Tarefas de hoje</h2>
            <Link to="/app/tarefas" className="text-sm font-semibold text-muted hover:text-ink">Ver todas <ArrowRight size={14} className="inline" /></Link>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma tarefa para hoje. Que tal planejar a próxima sessão?</p>
          ) : (
            <ul className="divide-y divide-line">
              {todayTasks.map(t => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <Checkbox checked={t.status === 'done'} onChange={() => toggleTask(t.id)} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm font-medium transition', t.status === 'done' && 'text-muted line-through')}>{t.title}</p>
                    {t.subtasks.length > 0 && <p className="text-xs text-muted">{t.subtasks.filter(s => s.done).length}/{t.subtasks.length} subtarefas</p>}
                  </div>
                  <SubjectChip id={t.subjectId} size="xs" className="hidden sm:inline-flex" />
                  {t.estimate && <span className="text-xs text-muted">{fmtMinutes(t.estimate)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* This week */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Esta semana</h2>
            <Link to="/app/progresso" className="text-sm font-semibold text-muted hover:text-ink">Detalhes</Link>
          </div>
          <div className="flex h-32 items-end justify-between gap-2">
            {week.map(({ d, m }, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-lg bg-cream-2">
                  <motion.div className={cn('w-full rounded-lg', isToday(d) ? 'bg-sage' : 'bg-sage-soft')}
                    initial={{ height: 0 }} animate={{ height: `${(m / maxWeek) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6 }} title={fmtMinutes(m)} />
                </div>
                <span className={cn('text-[11px] font-semibold', isToday(d) ? 'text-ink' : 'text-muted')}>{format(d, 'EEEEE', { locale: ptBR }).toUpperCase()}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">{fmtMinutes(week.reduce((a, w) => a + w.m, 0))} nos últimos 7 dias</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Review due */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Para revisar hoje</h2>
            <Link to="/app/revisao" className="text-sm font-semibold text-muted hover:text-ink">Revisar <ArrowRight size={14} className="inline" /></Link>
          </div>
          {dueTopics.length === 0 ? <p className="text-sm text-muted">Nada pendente. Sua memória agradece. 🧠</p> : (
            <ul className="space-y-2">
              {dueTopics.map(({ s, t, info }) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-cream-2 px-3 py-2.5">
                  <span className={cn('grid h-8 w-8 place-items-center rounded-lg text-base', colorClasses[s.color].soft)}>{s.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted">{s.name} · estudado há {info!.daysSince} {info!.daysSince === 1 ? 'dia' : 'dias'}</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-rose" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Goals */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Metas</h2>
            <Link to="/app/planejamento?tab=metas" className="text-sm font-semibold text-muted hover:text-ink">Gerenciar</Link>
          </div>
          <ul className="space-y-4">
            {goals.slice(0, 3).map(g => {
              const p = goalProgress(g, sessions, subjects)
              return (
                <li key={g.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-xs font-semibold text-muted">{p.pct}%</span>
                  </div>
                  <ProgressBar value={p.pct} color={p.pct >= 100 ? 'bg-sage' : g.period === 'daily' ? 'bg-sky' : g.period === 'weekly' ? 'bg-lilac' : 'bg-rose'} height="h-2" />
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
