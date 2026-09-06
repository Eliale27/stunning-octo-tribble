import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { useStore, subjectProgress } from '@/store/useStore'
import { ProgressBar } from '@/components/ui/Progress'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/Bits'
import { cn, colorClasses, fmtMinutes, pastelColors } from '@/lib/utils'
import type { PastelColor } from '@/lib/types'

const emojis = ['📐', '🏛️', '🧬', '✍️', '🌍', '⚗️', '🔬', '💻', '🎨', '🎵', '📖', '⚖️', '🧮', '🌱', '🧠']

export function SubjectForm({ onSubmit, initial }: { onSubmit: (v: { name: string; emoji: string; color: PastelColor; goalDate?: string }) => void; initial?: { name: string; emoji: string; color: PastelColor; goalDate?: string } }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '📖')
  const [color, setColor] = useState<PastelColor>(initial?.color ?? 'sky')
  const [goalDate, setGoalDate] = useState(initial?.goalDate ?? '')
  return (
    <form onSubmit={e => { e.preventDefault(); if (name.trim()) onSubmit({ name: name.trim(), emoji, color, goalDate: goalDate || undefined }) }} className="space-y-4">
      <div>
        <label className="label">Nome</label>
        <input autoFocus className="input" placeholder="Ex.: Química" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">Ícone</label>
        <div className="flex flex-wrap gap-1.5">
          {emojis.map(e => (
            <button type="button" key={e} onClick={() => setEmoji(e)} className={cn('grid h-9 w-9 place-items-center rounded-lg text-lg transition', emoji === e ? 'bg-beige ring-2 ring-sage/50' : 'bg-cream-2 hover:bg-beige')}>{e}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Cor</label>
        <div className="flex gap-2">
          {pastelColors.map(c => (
            <button type="button" key={c} onClick={() => setColor(c)} aria-label={c}
              className={cn('h-8 w-8 rounded-full transition', colorClasses[c].bg, color === c && 'ring-2 ring-ink/50 ring-offset-2 ring-offset-surface')} />
          ))}
        </div>
      </div>
      <div>
        <label className="label">Concluir até (opcional)</label>
        <input type="date" className="input" value={goalDate} onChange={e => setGoalDate(e.target.value)} />
      </div>
      <button className="btn btn-primary w-full">{initial ? 'Salvar' : 'Criar matéria'}</button>
    </form>
  )
}

export default function Subjects() {
  const subjects = useStore(s => s.subjects)
  const addSubject = useStore(s => s.addSubject)
  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader title="Minhas matérias" sub="Cada matéria tem seu espaço, sua cor e seus tópicos."
        action={<button onClick={() => setOpen(true)} className="btn btn-primary"><Plus size={16} /> Nova matéria</button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s, i) => {
          const c = colorClasses[s.color]
          const pct = subjectProgress(s)
          const minutes = s.topics.reduce((a, t) => a + t.minutes, 0)
          const done = s.topics.filter(t => t.status === 'done').length
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/app/materias/${s.id}`} className="card card-hover block overflow-hidden">
                <div className={cn('h-2', c.bg)} />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <span className={cn('grid h-12 w-12 place-items-center rounded-2xl text-2xl', c.soft)}>{s.emoji}</span>
                    <span className={cn('chip', c.soft, c.text)}>{pct}%</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{s.name}</h3>
                  <p className="text-sm text-muted">{done}/{s.topics.length} tópicos · {fmtMinutes(minutes)}</p>
                  <ProgressBar value={pct} color={c.bg} className="mt-4" height="h-2" />
                </div>
              </Link>
            </motion.div>
          )
        })}
        <button onClick={() => setOpen(true)} className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-2 text-muted transition hover:border-sage hover:text-ink">
          <Plus size={22} />
          <span className="mt-2 text-sm font-semibold">Adicionar matéria</span>
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova matéria">
        <SubjectForm onSubmit={v => { addSubject(v); setOpen(false) }} />
      </Modal>
    </div>
  )
}
