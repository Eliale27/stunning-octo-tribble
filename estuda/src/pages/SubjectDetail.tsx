import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Plus, Play, Pencil, Trash2, ChevronDown, ClipboardPlus } from 'lucide-react'
import { useStore, subjectProgress } from '@/store/useStore'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Bits'
import { SubjectForm } from './Subjects'
import { accuracy, cn, colorClasses, fmtDate, fmtMinutes, relativeDay } from '@/lib/utils'
import type { Topic, TopicStatus } from '@/lib/types'

const statusMeta: Record<TopicStatus, { icon: string; label: string; cls: string }> = {
  done: { icon: '✅', label: 'Concluído', cls: 'bg-sage-soft text-sage-ink' },
  in_progress: { icon: '🔄', label: 'Em andamento', cls: 'bg-sky-soft text-sky-ink' },
  todo: { icon: '○', label: 'A fazer', cls: 'bg-cream-2 text-muted' },
  locked: { icon: '🔒', label: 'Bloqueado', cls: 'bg-cream-2 text-muted' },
}

function LogSessionForm({ subjectId, topics, onDone, defaultTopic }: { subjectId: string; topics: Topic[]; onDone: () => void; defaultTopic?: string }) {
  const addSession = useStore(s => s.addSession)
  const [topicId, setTopicId] = useState(defaultTopic ?? topics[0]?.id ?? '')
  const [minutes, setMinutes] = useState(30)
  const [questions, setQuestions] = useState(0)
  const [correct, setCorrect] = useState(0)
  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); addSession({ subjectId, topicId: topicId || undefined, minutes, questions: questions || undefined, correct: correct || undefined }); onDone() }}>
      <div><label className="label">Tópico</label>
        <Select value={topicId} onChange={setTopicId} options={topics.map(t => ({ value: t.id, label: t.name }))} placeholder="Sem tópico" /></div>
      <div><label className="label">Minutos estudados</label><input type="number" min={1} className="input" value={minutes} onChange={e => setMinutes(+e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Questões</label><input type="number" min={0} className="input" value={questions} onChange={e => setQuestions(+e.target.value)} /></div>
        <div><label className="label">Acertos</label><input type="number" min={0} max={questions} className="input" value={correct} onChange={e => setCorrect(Math.min(questions, +e.target.value))} /></div>
      </div>
      <button className="btn btn-primary w-full">Registrar sessão</button>
    </form>
  )
}

export default function SubjectDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const subject = useStore(s => s.subjects.find(x => x.id === id))
  const { addTopic, updateTopic, removeTopic, updateSubject, removeSubject, startFocus } = useStore()
  const [newTopic, setNewTopic] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [logFor, setLogFor] = useState<string | null | undefined>(undefined)

  if (!subject) return <div className="card p-8 text-center text-muted">Matéria não encontrada. <Link to="/app/materias" className="underline">Voltar</Link></div>
  const c = colorClasses[subject.color]
  const pct = subjectProgress(subject)
  const minutes = subject.topics.reduce((a, t) => a + t.minutes, 0)
  const questions = subject.topics.reduce((a, t) => a + t.questions, 0)
  const correct = subject.topics.reduce((a, t) => a + t.correct, 0)

  const cycleStatus = (t: Topic) => {
    const order: TopicStatus[] = ['todo', 'in_progress', 'done', 'locked']
    const next = order[(order.indexOf(t.status) + 1) % order.length]
    updateTopic(subject.id, t.id, { status: next, progress: next === 'done' ? 100 : next === 'todo' || next === 'locked' ? 0 : Math.max(10, Math.min(95, t.progress)) })
  }

  return (
    <div className="space-y-6">
      <Link to="/app/materias" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={15} /> Minhas matérias</Link>

      <div className="card relative overflow-hidden p-6">
        <div className={cn('pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-70 blur-3xl', c.soft)} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProgressRing value={pct} size={120} stroke={11} color={c.hex}>
            <span className="text-2xl font-extrabold">{pct}%</span>
          </ProgressRing>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className={cn('grid h-12 w-12 place-items-center rounded-2xl text-2xl', c.soft)}>{subject.emoji}</span>
              <div>
                <h1 className="page-title">{subject.name}</h1>
                <p className="text-sm text-muted">Progresso da matéria: {pct}%{subject.goalDate && ` · concluir até ${fmtDate(subject.goalDate, 'dd/MM')}`}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="chip bg-cream-2 text-ink-2">⏱️ {fmtMinutes(minutes)}</span>
              <span className="chip bg-cream-2 text-ink-2">📝 {questions} questões</span>
              <span className="chip bg-cream-2 text-ink-2">🎯 {accuracy({ questions, correct })}% de acerto</span>
              <span className="chip bg-cream-2 text-ink-2">📚 {subject.topics.filter(t => t.status === 'done').length}/{subject.topics.length} tópicos</span>
            </div>
          </div>
          <div className="flex gap-2 sm:flex-col">
            <button onClick={() => { startFocus({ subjectId: subject.id, topicId: undefined }); nav('/app/foco') }} className="btn btn-primary"><Play size={15} /> Estudar agora</button>
            <button onClick={() => setLogFor(null)} className="btn btn-soft"><ClipboardPlus size={15} /> Registrar sessão</button>
            <div className="flex gap-1">
              <button onClick={() => setEditOpen(true)} className="btn btn-ghost flex-1"><Pencil size={15} /></button>
              <button onClick={() => { if (confirm('Excluir esta matéria e seus tópicos?')) { removeSubject(subject.id); nav('/app/materias') } }} className="btn btn-ghost flex-1 text-rose-ink"><Trash2 size={15} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">Tópicos</h2>
        <ul className="space-y-2">
          {subject.topics.map(t => {
            const m = statusMeta[t.status]
            const open = expanded === t.id
            return (
              <li key={t.id} className={cn('rounded-xl border border-line transition', open ? 'bg-cream-2/60' : 'bg-surface hover:bg-cream-2/40')}>
                <div className="flex cursor-pointer items-center gap-3 px-4 py-3" onClick={() => setExpanded(open ? null : t.id)}>
                  <button onClick={(e) => { e.stopPropagation(); cycleStatus(t) }} title="Alterar status" className="grid h-8 w-8 place-items-center rounded-lg bg-cream-2 text-base hover:bg-beige">{m.icon}</button>
                  <div className="min-w-0 flex-1">
                    <p className={cn('font-semibold', t.status === 'locked' && 'text-muted')}>{t.name}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <ProgressBar value={t.progress} color={c.bg} height="h-1.5" className="max-w-[180px]" />
                      <span className="text-xs text-muted">{t.progress}%</span>
                    </div>
                  </div>
                  <span className={cn('chip hidden sm:inline-flex', m.cls)}>{m.label}</span>
                  <ChevronDown size={16} className={cn('text-muted transition', open && 'rotate-180')} />
                </div>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-3 border-t border-line px-4 py-4 sm:grid-cols-4">
                        <Metric label="Tempo estudado" value={fmtMinutes(t.minutes)} />
                        <Metric label="Última sessão" value={t.lastSession ? relativeDay(t.lastSession.slice(0, 10)) : '—'} />
                        <Metric label="Questões" value={String(t.questions)} />
                        <Metric label="Taxa de acerto" value={t.questions ? `${accuracy(t)}%` : '—'} />
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
                        <button onClick={() => { startFocus({ subjectId: subject.id, topicId: t.id }); nav('/app/foco') }} className="btn btn-soft h-9 px-3 text-xs"><Play size={13} /> Focar neste tópico</button>
                        <button onClick={() => setLogFor(t.id)} className="btn btn-ghost h-9 px-3 text-xs"><ClipboardPlus size={13} /> Registrar sessão</button>
                        <div className="ml-auto flex items-center gap-2 text-xs text-muted">
                          <label>Progresso</label>
                          <input type="range" min={0} max={100} value={t.progress} onChange={e => updateTopic(subject.id, t.id, { progress: +e.target.value, status: +e.target.value >= 100 ? 'done' : +e.target.value > 0 ? 'in_progress' : t.status })} className="accent-sage" />
                          <button onClick={() => removeTopic(subject.id, t.id)} className="btn btn-ghost h-8 w-8 p-0 text-rose-ink"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
        <form onSubmit={e => { e.preventDefault(); if (newTopic.trim()) { addTopic(subject.id, newTopic.trim()); setNewTopic('') } }} className="mt-3 flex gap-2">
          <input className="input" placeholder="Novo tópico…" value={newTopic} onChange={e => setNewTopic(e.target.value)} />
          <button className="btn btn-soft"><Plus size={16} /></button>
        </form>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar matéria">
        <SubjectForm initial={subject} onSubmit={v => { updateSubject(subject.id, v); setEditOpen(false) }} />
      </Modal>
      <Modal open={logFor !== undefined} onClose={() => setLogFor(undefined)} title="Registrar sessão">
        <LogSessionForm subjectId={subject.id} topics={subject.topics} defaultTopic={logFor ?? undefined} onDone={() => setLogFor(undefined)} />
      </Modal>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  )
}
