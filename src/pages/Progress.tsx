import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, subWeeks, subMonths, startOfMonth, endOfMonth, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { useT, useLang } from '@/i18n'
import { useStore } from '@/store/useStore'
import { PageHeader, Segmented, Stat } from '@/components/ui/Bits'
import { ProgressBar } from '@/components/ui/Progress'
import { accuracy, cn, colorClasses, daysStudied, fmtMinutes, lastNDays, minutesBetween, minutesOn, questionsBetween, weekRange, monthRange } from '@/lib/utils'

const tooltipStyle = { borderRadius: 12, border: '1px solid #ECE8DF', boxShadow: '0 8px 24px -12px rgba(43,42,40,.15)', fontSize: 12, fontFamily: 'inherit' }

export default function Progress() {
  const sessions = useStore(s => s.sessions)
  const subjects = useStore(s => s.subjects)
  const [range, setRange] = useState<'semana' | 'mes'>('semana')
  const t = useT()
  const { dfLocale } = useLang()

  const { start, end } = weekRange()
  const prev = weekRange(subWeeks(new Date(), 1))
  const thisWeek = minutesBetween(sessions, start, end)
  const lastWeek = minutesBetween(sessions, prev.start, prev.end)
  const deltaWeek = lastWeek ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0
  const m = monthRange()
  const pm = monthRange(subMonths(new Date(), 1))
  const thisMonth = minutesBetween(sessions, m.start, m.end)
  const lastMonth = minutesBetween(sessions, pm.start, pm.end)
  // compare daily pace so an early-month reading is not misleading
  const elapsedDays = new Date().getDate()
  const lastMonthDays = pm.end.getDate()
  const paceThis = thisMonth / elapsedDays
  const paceLast = lastMonth / lastMonthDays
  const deltaMonth = paceLast ? Math.round(((paceThis - paceLast) / paceLast) * 100) : 0

  const total = sessions.reduce((a, s) => a + s.minutes, 0)
  const days = daysStudied(sessions)
  const avg = days ? Math.round(total / days) : 0
  const questions = sessions.reduce((a, s) => a + (s.questions ?? 0), 0)
  const correct = sessions.reduce((a, s) => a + (s.correct ?? 0), 0)

  const daily = useMemo(() => lastNDays(range === 'semana' ? 14 : 30).map(d => ({ label: format(d, range === 'semana' ? t('common.fmt.weekdayShortDay') : t('common.fmt.dayMonthNumeric'), { locale: dfLocale }), minutos: minutesOn(sessions, d) })), [sessions, range, t, dfLocale])

  const weekly = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const w = addWeeks(new Date(), i - 5)
    const r = { start: startOfWeek(w, { weekStartsOn: 1 }), end: endOfWeek(w, { weekStartsOn: 1 }) }
    return { label: format(r.start, t('common.fmt.dayMonthNumeric'), { locale: dfLocale }), horas: +(minutesBetween(sessions, r.start, r.end) / 60).toFixed(1), questoes: questionsBetween(sessions, r.start, r.end) }
  }), [sessions, t, dfLocale])

  const monthly = useMemo(() => Array.from({ length: 4 }, (_, i) => {
    const d = subMonths(new Date(), 3 - i)
    return { label: format(d, t('common.fmt.monthShort'), { locale: dfLocale }), horas: +(minutesBetween(sessions, startOfMonth(d), endOfMonth(d)) / 60).toFixed(1) }
  }), [sessions, t, dfLocale])

  const bySubject = subjects.map(s => {
    const list = sessions.filter(x => x.subjectId === s.id)
    const q = list.reduce((a, x) => a + (x.questions ?? 0), 0)
    const c = list.reduce((a, x) => a + (x.correct ?? 0), 0)
    return { s, minutes: list.reduce((a, x) => a + x.minutes, 0), questions: q, correct: c, acc: q ? Math.round((c / q) * 100) : null }
  }).sort((a, b) => b.minutes - a.minutes)
  const weakest = [...bySubject].filter(x => x.acc !== null).sort((a, b) => a.acc! - b.acc!).slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader title={t('progress.title')} sub={t('progress.sub')} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sage-soft/70 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('progress.week.label')}</p>
          <p className="mt-1 text-2xl font-extrabold">{t('progress.week.studied', { time: fmtMinutes(thisWeek) })}</p>
          <p className={cn('mt-1 text-sm font-semibold', deltaWeek >= 0 ? 'text-sage-ink' : 'text-rose-ink')}>
            {lastWeek ? t('progress.week.delta', { delta: `${deltaWeek >= 0 ? '+' : ''}${deltaWeek}` }) : t('progress.week.first')}
          </p>
        </div>
        <div className="card relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lilac-soft/70 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t('progress.month.label')}</p>
          <p className="mt-1 text-2xl font-extrabold">{t('progress.month.studied', { time: fmtMinutes(thisMonth) })}</p>
          <p className={cn('mt-1 text-sm font-semibold', deltaMonth >= 0 ? 'text-sage-ink' : 'text-rose-ink')}>
            {lastMonth ? t('progress.month.delta', { delta: `${deltaMonth >= 0 ? '+' : ''}${deltaMonth}` }) : t('progress.month.first')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon="⏱️" label={t('progress.stats.hours')} value={fmtMinutes(total)} hint={t('progress.stats.hoursHint')} tone="bg-sage-soft" />
        <Stat icon="📅" label={t('progress.stats.days')} value={days} hint={t('progress.stats.daysHint')} tone="bg-sky-soft" />
        <Stat icon="📈" label={t('progress.stats.avg')} value={fmtMinutes(avg)} hint={t('progress.stats.avgHint')} tone="bg-lilac-soft" />
        <Stat icon="🎯" label={t('progress.stats.accuracy')} value={`${accuracy({ questions, correct })}%`} hint={t('progress.stats.questions', { count: questions })} tone="bg-butter-soft" />
      </div>

      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">{t('progress.charts.minutesPerDay')}</h2>
          <Segmented value={range} onChange={setRange} options={[{ value: 'semana', label: t('progress.charts.range14') }, { value: 'mes', label: t('progress.charts.range30') }]} />
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ left: -20, right: 0, top: 5 }}>
              <CartesianGrid vertical={false} stroke="#ECE8DF" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A867C' }} axisLine={false} tickLine={false} interval={range === 'semana' ? 1 : 4} />
              <YAxis tick={{ fontSize: 11, fill: '#8A867C' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F6F3EC' }} formatter={(v) => [fmtMinutes(Number(v)), t('progress.charts.studied')]} />
              <Bar dataKey="minutos" fill="#A9C4A0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="section-title mb-4">{t('progress.charts.weekly')}</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ left: -20, right: 0, top: 5 }}>
                <defs><linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#A9C4E0" stopOpacity={0.6} /><stop offset="100%" stopColor="#A9C4E0" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#ECE8DF" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A867C' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8A867C' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [n === 'horas' ? `${v}h` : v, n === 'horas' ? t('progress.charts.hours') : t('progress.charts.questions')]} />
                <Area type="monotone" dataKey="horas" stroke="#7FA3CB" strokeWidth={2.5} fill="url(#gSky)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="section-title mb-4">{t('progress.charts.monthly')}</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ left: -20, right: 0, top: 5 }}>
                <CartesianGrid vertical={false} stroke="#ECE8DF" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A867C' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8A867C' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F6F3EC' }} formatter={(v) => [`${v}h`, t('progress.charts.hours')]} />
                <Bar dataKey="horas" fill="#C5B8E0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="section-title mb-4">{t('progress.subjects.title')}</h2>
          <ul className="space-y-3">
            {bySubject.map(({ s, minutes, questions: q, acc }) => (
              <li key={s.id} className="flex items-center gap-3">
                <span className={cn('grid h-9 w-9 place-items-center rounded-lg text-base', colorClasses[s.color].soft)}>{s.emoji}</span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{s.name}</span><span className="text-muted">{fmtMinutes(minutes)} · {t('progress.stats.questions', { count: q })}{acc !== null && ` · ${acc}%`}</span></div>
                  <ProgressBar value={total ? (minutes / bySubject[0].minutes) * 100 : 0} color={colorClasses[s.color].bg} height="h-2" />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="section-title mb-3">{t('progress.subjects.distribution')}</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bySubject.map(b => ({ name: b.s.name, value: b.minutes }))} dataKey="value" innerRadius={42} outerRadius={64} paddingAngle={3} stroke="none">
                    {bySubject.map(b => <Cell key={b.s.id} fill={colorClasses[b.s.color].hex} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmtMinutes(Number(v)), '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-5">
            <h2 className="section-title mb-1">{t('progress.subjects.attention')}</h2>
            <p className="mb-3 text-xs text-muted">{t('progress.subjects.attentionHint')}</p>
            <ul className="space-y-2">
              {weakest.map(w => (
                <li key={w.s.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span>{w.s.emoji}</span>{w.s.name}</span>
                  <span className={cn('chip', w.acc! < 70 ? 'bg-rose-soft text-rose-ink' : 'bg-butter-soft text-butter-ink')}>{w.acc}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
