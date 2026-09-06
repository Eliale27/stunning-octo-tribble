import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Select } from '@/components/ui/Bits'
import { uid } from '@/lib/utils'
import type { Priority, Subtask, Task } from '@/lib/types'

export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'status'> & { status?: Task['status'] }

const categories = ['Estudo', 'Exercícios', 'Revisão', 'Resumo', 'Aula', 'Redação', 'Simulado', 'Organização', 'Leitura']

export function TaskForm({ initial, onSubmit, submitLabel = 'Criar tarefa' }:
  { initial?: Partial<Task>; onSubmit: (d: TaskDraft) => void; submitLabel?: string }) {
  const subjects = useStore(s => s.subjects)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [estimate, setEstimate] = useState(initial?.estimate ?? 30)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [subtasks, setSubtasks] = useState<Subtask[]>(initial?.subtasks ?? [])
  const [newSub, setNewSub] = useState('')

  const addSub = () => { if (newSub.trim()) { setSubtasks([...subtasks, { id: uid(), title: newSub.trim(), done: false }]); setNewSub('') } }

  return (
    <form className="space-y-4" onSubmit={e => {
      e.preventDefault()
      if (!title.trim()) return
      onSubmit({ title: title.trim(), subjectId: subjectId || undefined, date: date || undefined, priority, category: category || undefined, estimate: estimate || undefined, notes: notes || undefined, subtasks, status: initial?.status })
    }}>
      <div>
        <label className="label">☐ Nome</label>
        <input autoFocus className="input" placeholder="Ex.: Estudar Revolução Francesa" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">📚 Matéria</label>
          <Select value={subjectId} onChange={setSubjectId} placeholder="Nenhuma" options={subjects.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }))} /></div>
        <div><label className="label">📅 Data</label><input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div><label className="label">⭐ Prioridade</label>
          <Select value={priority} onChange={setPriority} options={[{ value: 'alta', label: 'Alta' }, { value: 'media', label: 'Média' }, { value: 'baixa', label: 'Baixa' }]} /></div>
        <div><label className="label">🏷️ Categoria</label>
          <Select value={category} onChange={setCategory} placeholder="Nenhuma" options={categories.map(c => ({ value: c, label: c }))} /></div>
        <div className="col-span-2"><label className="label">⏱️ Tempo estimado (min)</label><input type="number" min={5} step={5} className="input" value={estimate} onChange={e => setEstimate(+e.target.value)} /></div>
      </div>
      <div>
        <label className="label">📝 Observações</label>
        <textarea className="input min-h-[72px] resize-y" placeholder="Detalhes, links, lembretes…" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <div>
        <label className="label">Subtarefas</label>
        <ul className="mb-2 space-y-1">
          {subtasks.map(s => (
            <li key={s.id} className="flex items-center gap-2 rounded-lg bg-cream-2 px-3 py-1.5 text-sm">
              <span className="text-muted">├──</span><span className="flex-1">{s.title}</span>
              <button type="button" onClick={() => setSubtasks(subtasks.filter(x => x.id !== s.id))} className="text-muted hover:text-ink"><X size={14} /></button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input className="input" placeholder="Adicionar subtarefa…" value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSub() } }} />
          <button type="button" onClick={addSub} className="btn btn-soft px-3"><Plus size={16} /></button>
        </div>
      </div>
      <button className="btn btn-primary w-full">{submitLabel}</button>
    </form>
  )
}
