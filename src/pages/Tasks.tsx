import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useStore } from '@/store/useStore'
import { PageHeader, Segmented, Select, EmptyState } from '@/components/ui/Bits'
import { Modal } from '@/components/ui/Modal'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskRow } from '@/components/tasks/TaskRow'
import type { Task } from '@/lib/types'

type Filter = 'todas' | 'hoje' | 'proximas' | 'concluidas'

const group = (t: Task) => {
  if (!t.date) return 'Sem data'
  const d = differenceInCalendarDays(parseISO(t.date), new Date())
  if (d < 0) return 'Atrasadas'
  if (d === 0) return 'Hoje'
  if (d === 1) return 'Amanhã'
  if (d < 7) return 'Esta semana'
  return 'Depois'
}
const order = ['Atrasadas', 'Hoje', 'Amanhã', 'Esta semana', 'Depois', 'Sem data']

export function TaskList({ tasks }: { tasks: Task[] }) {
  const grouped = useMemo(() => {
    const m = new Map<string, Task[]>()
    tasks.forEach(t => { const g = t.status === 'done' ? 'Concluídas' : group(t); m.set(g, [...(m.get(g) ?? []), t]) })
    return [...order, 'Concluídas'].filter(k => m.has(k)).map(k => [k, m.get(k)!] as const)
  }, [tasks])
  if (tasks.length === 0) return <EmptyState emoji="🌤️" title="Nada por aqui" desc="Crie uma tarefa e dê o primeiro passo do dia." />
  return (
    <div className="space-y-6">
      {grouped.map(([label, list]) => (
        <section key={label}>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            {label} <span className="rounded-full bg-cream-2 px-1.5 py-0.5 text-[10px]">{list.length}</span>
          </h3>
          <div className="space-y-2">{list.map(t => <TaskRow key={t.id} task={t} />)}</div>
        </section>
      ))}
    </div>
  )
}

export default function Tasks() {
  const tasks = useStore(s => s.tasks)
  const subjects = useStore(s => s.subjects)
  const addTask = useStore(s => s.addTask)
  const [filter, setFilter] = useState<Filter>('todas')
  const [subject, setSubject] = useState('')
  const [open, setOpen] = useState(false)

  const visible = tasks.filter(t => {
    if (subject && t.subjectId !== subject) return false
    const g = group(t)
    if (filter === 'hoje') return t.status !== 'done' && (g === 'Hoje' || g === 'Atrasadas')
    if (filter === 'proximas') return t.status !== 'done' && (g === 'Amanhã' || g === 'Esta semana' || g === 'Depois')
    if (filter === 'concluidas') return t.status === 'done'
    return true
  })
  const pending = tasks.filter(t => t.status !== 'done').length

  return (
    <div>
      <PageHeader title="Tarefas" sub={`${pending} pendentes · ${tasks.length - pending} concluídas`}
        action={<button onClick={() => setOpen(true)} className="btn btn-primary"><Plus size={16} /> Nova tarefa</button>} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented value={filter} onChange={setFilter} options={[{ value: 'todas', label: 'Todas' }, { value: 'hoje', label: 'Hoje' }, { value: 'proximas', label: 'Próximas' }, { value: 'concluidas', label: 'Concluídas' }]} />
        <Select className="w-auto min-w-[160px]" value={subject} onChange={setSubject} placeholder="Todas as matérias" options={subjects.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }))} />
      </div>
      <TaskList tasks={visible} />
      <Modal open={open} onClose={() => setOpen(false)} title="Nova tarefa">
        <TaskForm onSubmit={d => { addTask(d); setOpen(false) }} />
      </Modal>
    </div>
  )
}
