import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { useStore, goalProgress } from '@/store/useStore'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { Checkbox } from '@/components/ui/Checkbox'
import { SubjectChip, Stat } from '@/components/ui/Bits'
import { dailyQuote, fmtMinutes, greeting, lastNDays, minutesOn, streak, todayISO, reviewInfo, colorClasses, cn, levelFor } from '@/lib/utils'
import { format, isToday } from 'date-fns'
import { useT, useLang } from '@/i18n'

export default function Dashboard() {
  const settings = useStore(s => s.settings)
  const sessions = useStore(s => s.sessions)
  const tasks = useStore(s => s.tasks)
  const subjects = useStore(s => s.subjects)
  const goals = useStore(s => s.goals)
  const toggleTask = useStore(s => s.toggleTask)
  const t = useT()
  const { dfLocale } = useLang()

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
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{format(today, t('common.fmt.weekdayDayMonth'), { locale: dfLocale })}</p>
          <h1 className="page-title mt-1">{greeting(settings.name, t)}</h1>
          <p className="page-sub">{t('dashboard.tagline')}</p>
        </div>
        <Link to="/app/foco" className="btn btn-primary"><Play size={16} /> {t('dashboard.startFocus')}</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat icon="📚" label={t('dashboard.stats.studiesToday')} value={sessionsToday} hint={t('dashboard.stats.session', { count: sessionsToday })} tone="bg-sky-soft" />
        <Stat icon="⏱️" label={t('dashboard.stats.timeStudied')} value={fmtMinutes(minutesToday)} hint={t('dashboard.stats.today')} tone="bg-sage-soft" />
        <Stat icon="🎯" label={t('dashboard.stats.dailyGoal')} value={fmtMinutes(settings.dailyGoalMinutes)} hint={t('dashboard.stats.pctDone', { pct })} tone="bg-butter-soft" />
        <Stat icon="🔥" label={t('dashboard.stats.streak')} value={t('common.streakDays', { count: st })} hint={t('dashboard.stats.inARow')} tone="bg-peach-soft" />
        <Stat icon="✅" label={t('dashboard.stats.tasks')} value={`${doneToday}/${todayTasks.length}`} hint={t('dashboard.stats.doneToday')} tone="bg-lilac-soft" className="col-span-2 md:col-span-1" />
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
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t('dashboard.progress.ofGoal')}</p>
              </div>
            </ProgressRing>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold">{t('dashboard.progress.title')}</h2>
              <p className="mt-1 text-muted">
                {pct >= 100 ? t('dashboard.progress.goalDone')
                  : t('dashboard.progress.closer', { pct })}
              </p>
              <div className="mt-4">
                <ProgressBar value={pct} height="h-3" />
                <div className="mt-2 flex justify-between text-xs text-muted">
                  <span>{t('dashboard.progress.studied', { time: fmtMinutes(minutesToday) })}</span>
                  <span>{t('dashboard.progress.remaining', { time: fmtMinutes(Math.max(0, settings.dailyGoalMinutes - minutesToday)) })}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="chip bg-cream-2 text-ink-2">{lvl.current.emoji} {t(lvl.current.nameKey)}</span>
                {lvl.next && <span className="chip bg-cream-2 text-muted">{t('dashboard.progress.toNext', { pct: Math.round(lvl.pct), emoji: lvl.next.emoji, name: t(lvl.next.nameKey) })}</span>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div className="card flex flex-col justify-between bg-butter-soft/60 p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface/70"><Sparkles size={18} className="text-butter-ink" /></div>
          <div>
            <p className="mt-6 text-lg font-bold leading-snug text-ink">“{dailyQuote(t)}”</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-butter-ink/80">{t('dashboard.quote.label')}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's tasks */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">{t('dashboard.tasks.title')}</h2>
            <Link to="/app/tarefas" className="text-sm font-semibold text-muted hover:text-ink">{t('dashboard.tasks.seeAll')} <ArrowRight size={14} className="inline" /></Link>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-muted">{t('dashboard.tasks.empty')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {todayTasks.map(task => (
                <li key={task.id} className="flex items-center gap-3 py-3">
                  <Checkbox checked={task.status === 'done'} onChange={() => toggleTask(task.id)} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm font-medium transition', task.status === 'done' && 'text-muted line-through')}>{task.title}</p>
                    {task.subtasks.length > 0 && <p className="text-xs text-muted">{t('dashboard.tasks.subtasks', { done: task.subtasks.filter(s => s.done).length, total: task.subtasks.length })}</p>}
                  </div>
                  <SubjectChip id={task.subjectId} size="xs" className="hidden sm:inline-flex" />
                  {task.estimate && <span className="text-xs text-muted">{fmtMinutes(task.estimate)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* This week */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">{t('dashboard.week.title')}</h2>
            <Link to="/app/progresso" className="text-sm font-semibold text-muted hover:text-ink">{t('dashboard.week.details')}</Link>
          </div>
          <div className="flex h-32 items-end justify-between gap-2">
            {week.map(({ d, m }, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-lg bg-cream-2">
                  <motion.div className={cn('w-full rounded-lg', isToday(d) ? 'bg-sage' : 'bg-sage-soft')}
                    initial={{ height: 0 }} animate={{ height: `${(m / maxWeek) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.6 }} title={fmtMinutes(m)} />
                </div>
                <span className={cn('text-[11px] font-semibold', isToday(d) ? 'text-ink' : 'text-muted')}>{format(d, 'EEEEE', { locale: dfLocale }).toUpperCase()}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">{t('dashboard.week.last7', { time: fmtMinutes(week.reduce((a, w) => a + w.m, 0)) })}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Review due */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">{t('dashboard.review.title')}</h2>
            <Link to="/app/revisao" className="text-sm font-semibold text-muted hover:text-ink">{t('dashboard.review.action')} <ArrowRight size={14} className="inline" /></Link>
          </div>
          {dueTopics.length === 0 ? <p className="text-sm text-muted">{t('dashboard.review.empty')}</p> : (
            <ul className="space-y-2">
              {dueTopics.map(({ s, t: topic, info }) => (
                <li key={topic.id} className="flex items-center gap-3 rounded-xl bg-cream-2 px-3 py-2.5">
                  <span className={cn('grid h-8 w-8 place-items-center rounded-lg text-base', colorClasses[s.color].soft)}>{s.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{topic.name}</p>
                    <p className="text-xs text-muted">{s.name} · {t('dashboard.review.studiedAgo', { count: info!.daysSince })}</p>
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
            <h2 className="section-title">{t('dashboard.goals.title')}</h2>
            <Link to="/app/planejamento?tab=metas" className="text-sm font-semibold text-muted hover:text-ink">{t('dashboard.goals.manage')}</Link>
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
