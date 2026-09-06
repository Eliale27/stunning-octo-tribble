import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, RotateCcw, SkipForward, Coffee } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { fmtClock, useFocusTicker } from '@/lib/useFocusTicker'
import { ProgressRing } from '@/components/ui/Progress'
import { Select } from '@/components/ui/Bits'
import { cn, fmtMinutes, minutesOn } from '@/lib/utils'

const presets = [15, 25, 45, 50, 60]
const focusPhrases = [
  'Você consegue. Continue focado. 🌱',
  'Um passo de cada vez. Você está avançando.',
  'Respire. O único lugar para estar agora é aqui.',
  'A sessão de hoje é o resultado de amanhã.',
]

export default function Focus() {
  const t = useFocusTicker()
  const { startFocus, pauseFocus, resumeFocus, resetFocus, completeFocus, setFocusDuration, updateSettings } = useStore()
  const settings = useStore(s => s.settings)
  const subjects = useStore(s => s.subjects)
  const sessions = useStore(s => s.sessions)
  const [subjectId, setSubjectId] = useState(t.subjectId ?? '')
  const [topicId, setTopicId] = useState(t.topicId ?? '')
  const [phrase, setPhrase] = useState(0)
  const subject = subjects.find(s => s.id === subjectId)
  const isFocus = t.mode === 'focus'
  const idle = !t.running && t.remaining === t.duration
  const minutesToday = minutesOn(sessions, new Date())

  useEffect(() => { setSubjectId(t.subjectId ?? ''); setTopicId(t.topicId ?? '') }, [t.subjectId, t.topicId])
  useEffect(() => {
    if (!t.running) return
    const id = setInterval(() => setPhrase(p => (p + 1) % focusPhrases.length), 20000)
    return () => clearInterval(id)
  }, [t.running])

  const start = () => startFocus({ subjectId: subjectId || undefined, topicId: topicId || undefined, minutes: t.duration / 60 })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="page-title">Foco</h1>
        <p className="page-sub">Uma sessão de cada vez. O resto pode esperar.</p>
      </div>

      <motion.div layout className={cn('card relative overflow-hidden p-6 sm:p-10 transition-colors duration-700', isFocus ? 'bg-surface' : 'bg-sky-soft/40')}>
        <div className={cn('pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl transition-colors duration-700', isFocus ? 'bg-sage-soft/70' : 'bg-sky-soft')} />
        <div className={cn('pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full blur-3xl transition-colors duration-700', isFocus ? 'bg-butter-soft/60' : 'bg-lilac-soft/70')} />

        <div className="relative flex flex-col items-center">
          <span className={cn('chip mb-6', isFocus ? 'bg-sage-soft text-sage-ink' : 'bg-sky-soft text-sky-ink')}>
            {isFocus ? '🌱 Sessão de foco' : '☕ Pausa'}
          </span>

          <motion.div animate={t.running ? { scale: [1, 1.015, 1] } : { scale: 1 }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
            <ProgressRing value={t.progress} size={260} stroke={14} color={isFocus ? '#A9C4A0' : '#A9C4E0'} track="rgba(43,42,40,0.06)">
              <div className="text-center">
                <p className="text-6xl font-extrabold tabular-nums tracking-tight sm:text-7xl">{fmtClock(t.remaining)}</p>
                <p className="mt-1 text-sm text-muted">{t.running ? (isFocus ? 'em foco' : 'descansando') : idle ? 'pronto para começar' : 'pausado'}</p>
              </div>
            </ProgressRing>
          </motion.div>

          <div className="mt-6 h-6 text-center">
            <AnimatePresence mode="wait">
              {t.running && isFocus && (
                <motion.p key={phrase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-sm font-medium text-ink-2">
                  {focusPhrases[phrase]}
                </motion.p>
              )}
              {!t.running && isFocus && subject && <p className="text-sm text-muted">{subject.emoji} {subject.name}{topicId && ` · ${subject.topics.find(x => x.id === topicId)?.name}`}</p>}
              {!isFocus && <p className="text-sm text-muted">Levante, beba água, alongue. Você mereceu.</p>}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => resetFocus()} className="btn btn-ghost h-12 w-12 rounded-full p-0" title="Reiniciar"><RotateCcw size={18} /></button>
            {t.running ? (
              <button onClick={pauseFocus} className="btn btn-primary h-16 w-16 rounded-full p-0 text-cream shadow-lift" aria-label="Pausar"><Pause size={26} /></button>
            ) : (
              <button onClick={idle ? start : resumeFocus} className={cn('btn h-16 w-16 rounded-full p-0 shadow-lift', isFocus ? 'btn-sage' : 'bg-sky text-white')} aria-label="Iniciar"><Play size={26} className="ml-0.5" /></button>
            )}
            <button onClick={completeFocus} className="btn btn-ghost h-12 w-12 rounded-full p-0" title={isFocus ? 'Concluir agora' : 'Pular pausa'}>{isFocus ? <SkipForward size={18} /> : <Coffee size={18} />}</button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {idle && isFocus && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 space-y-4">
            <div className="card p-5">
              <p className="label">Duração</p>
              <div className="flex flex-wrap gap-2">
                {presets.map(m => (
                  <button key={m} onClick={() => { setFocusDuration(m); updateSettings({ focusMinutes: m }) }}
                    className={cn('btn h-10 min-w-[64px] px-3', t.duration / 60 === m ? 'btn-primary' : 'btn-soft')}>{m} min</button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Pausa de {settings.breakMinutes} min entre sessões · ajuste em Configurações</p>
            </div>
            <div className="card grid gap-3 p-5 sm:grid-cols-2">
              <div><label className="label">Matéria</label>
                <Select value={subjectId} onChange={v => { setSubjectId(v); setTopicId('') }} placeholder="Sessão livre" options={subjects.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }))} /></div>
              <div><label className="label">Tópico</label>
                <Select value={topicId} onChange={setTopicId} placeholder="Nenhum" options={(subject?.topics ?? []).map(tp => ({ value: tp.id, label: tp.name }))} /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <MiniStat label="Sessões hoje" value={String(t.completedToday)} />
        <MiniStat label="Tempo hoje" value={fmtMinutes(minutesToday)} />
        <MiniStat label="Meta diária" value={`${Math.min(100, Math.round((minutesToday / settings.dailyGoalMinutes) * 100))}%`} />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
    </div>
  )
}
