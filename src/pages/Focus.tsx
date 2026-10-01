import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, RotateCcw, SkipForward, Coffee } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { fmtClock, useFocusTicker } from '@/lib/useFocusTicker'
import { ProgressRing } from '@/components/ui/Progress'
import { Select } from '@/components/ui/Bits'
import { cn, fmtMinutes, minutesOn } from '@/lib/utils'
import { AlertSoundControl } from '@/components/ui/AlertSoundControl'
import { useT } from '@/i18n'

const presets = [15, 25, 45, 50, 60]
const PHRASE_COUNT = 4 // entries in focus.phrases

export default function Focus() {
  const t = useT()
  const tk = useFocusTicker()
  const { startFocus, pauseFocus, resumeFocus, resetFocus, completeFocus, setFocusDuration, updateSettings } = useStore()
  const settings = useStore(s => s.settings)
  const subjects = useStore(s => s.subjects)
  const sessions = useStore(s => s.sessions)
  const [subjectId, setSubjectId] = useState(tk.subjectId ?? '')
  const [topicId, setTopicId] = useState(tk.topicId ?? '')
  const [phrase, setPhrase] = useState(0)
  const subject = subjects.find(s => s.id === subjectId)
  const isFocus = tk.mode === 'focus'
  const idle = !tk.running && tk.remaining === tk.duration
  const minutesToday = minutesOn(sessions, new Date())

  useEffect(() => { setSubjectId(tk.subjectId ?? ''); setTopicId(tk.topicId ?? '') }, [tk.subjectId, tk.topicId])
  useEffect(() => {
    if (!tk.running) return
    const id = setInterval(() => setPhrase(p => (p + 1) % PHRASE_COUNT), 20000)
    return () => clearInterval(id)
  }, [tk.running])

  const start = () => startFocus({ subjectId: subjectId || undefined, topicId: topicId || undefined, minutes: tk.duration / 60 })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="page-title">{t('focus.title')}</h1>
        <p className="page-sub">{t('focus.sub')}</p>
      </div>

      <motion.div layout data-tour="timer" className={cn('card relative overflow-hidden p-6 sm:p-10 transition-colors duration-700', isFocus ? 'bg-surface' : 'bg-sky-soft/40')}>
        <div className={cn('pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl transition-colors duration-700', isFocus ? 'bg-sage-soft/70' : 'bg-sky-soft')} />
        <div className={cn('pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full blur-3xl transition-colors duration-700', isFocus ? 'bg-butter-soft/60' : 'bg-lilac-soft/70')} />

        <div className="relative flex flex-col items-center">
          <span className={cn('chip mb-6', isFocus ? 'bg-sage-soft text-sage-ink' : 'bg-sky-soft text-sky-ink')}>
            {isFocus ? t('focus.modeFocus') : t('focus.modeBreak')}
          </span>

          <motion.div animate={tk.running ? { scale: [1, 1.015, 1] } : { scale: 1 }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
            <ProgressRing value={tk.progress} size={260} stroke={14} color={isFocus ? '#A9C4A0' : '#A9C4E0'} track="rgba(43,42,40,0.06)">
              <div className="text-center">
                <p className="text-6xl font-extrabold tabular-nums tracking-tight sm:text-7xl">{fmtClock(tk.remaining)}</p>
                <p className="mt-1 text-sm text-muted">{tk.running ? (isFocus ? t('focus.state.focusing') : t('focus.state.resting')) : idle ? t('focus.state.ready') : t('focus.state.paused')}</p>
              </div>
            </ProgressRing>
          </motion.div>

          <div className="mt-6 h-6 text-center">
            <AnimatePresence mode="wait">
              {tk.running && isFocus && (
                <motion.p key={phrase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-sm font-medium text-ink-2">
                  {t(`focus.phrases.${phrase}`)}
                </motion.p>
              )}
              {!tk.running && isFocus && subject && <p className="text-sm text-muted">{subject.emoji} {subject.name}{topicId && ` · ${subject.topics.find(x => x.id === topicId)?.name}`}</p>}
              {!isFocus && <p className="text-sm text-muted">{t('focus.breakHint')}</p>}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => resetFocus()} className="btn btn-ghost h-12 w-12 rounded-full p-0" title={t('focus.restart')}><RotateCcw size={18} /></button>
            {tk.running ? (
              <button onClick={pauseFocus} className="btn btn-primary h-16 w-16 rounded-full p-0 text-cream shadow-lift" aria-label={t('focus.pause')}><Pause size={26} /></button>
            ) : (
              <button onClick={idle ? start : resumeFocus} className={cn('btn h-16 w-16 rounded-full p-0 shadow-lift', isFocus ? 'btn-sage' : 'bg-sky text-white')} aria-label={t('focus.start')}><Play size={26} className="ml-0.5" /></button>
            )}
            <button onClick={completeFocus} className="btn btn-ghost h-12 w-12 rounded-full p-0" title={isFocus ? t('focus.finishNow') : t('focus.skipBreak')}>{isFocus ? <SkipForward size={18} /> : <Coffee size={18} />}</button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {idle && isFocus && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 space-y-4">
            <div className="card p-5">
              <p className="label">{t('focus.duration')}</p>
              <div className="flex flex-wrap gap-2">
                {presets.map(m => (
                  <button key={m} onClick={() => { setFocusDuration(m); updateSettings({ focusMinutes: m }) }}
                    className={cn('btn h-10 min-w-[64px] px-3', tk.duration / 60 === m ? 'btn-primary' : 'btn-soft')}>{t('focus.presetMin', { n: m })}</button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">{t('focus.breakInfo', { n: settings.breakMinutes })}</p>
              <div className="mt-4 border-t border-line pt-4">
                <p className="label">{t('focus.alertSound')}</p>
                <AlertSoundControl compact />
              </div>
            </div>
            <div className="card grid gap-3 p-5 sm:grid-cols-2">
              <div><label className="label">{t('focus.subject')}</label>
                <Select value={subjectId} onChange={v => { setSubjectId(v); setTopicId('') }} placeholder={t('focus.freeSession')} options={subjects.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }))} /></div>
              <div><label className="label">{t('focus.topic')}</label>
                <Select value={topicId} onChange={setTopicId} placeholder={t('focus.noTopic')} options={(subject?.topics ?? []).map(tp => ({ value: tp.id, label: tp.name }))} /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <MiniStat label={t('focus.stats.sessionsToday')} value={String(tk.completedToday)} />
        <MiniStat label={t('focus.stats.timeToday')} value={fmtMinutes(minutesToday)} />
        <MiniStat label={t('focus.stats.dailyGoal')} value={`${Math.min(100, Math.round((minutesToday / settings.dailyGoalMinutes) * 100))}%`} />
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
