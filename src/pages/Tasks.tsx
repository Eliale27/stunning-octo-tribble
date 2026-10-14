import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useStore } from '@/store/useStore'
import { PageHeader, Segmented, Select, EmptyState } from '@/components/ui/Bits'
import { Modal } from '@/components/ui/Modal'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskRow } from '@/components/tasks/TaskRow'
import type { Task } from '@/lib/types'
import { useT } from '@/i18n'

type Filter = 'todas' | 'hoje' | 'proximas' | 'concluidas'

type Group = 'overdue' | 'today' | 'tomorrow' | 'thisWeek' | 'later' | 'noDate' | 'done'

/** Group id; the label is `t(`tasks.groups.${id}`)`. */
const group = (t: Task): Group => {
  if (!t.date) return 'noDate'
  const d = differenceInCalendarDays(parseISO(t.date), new Date())
  if (d < 0) return 'overdue'
  if (d === 0) return 'today'
  if (d === 1) return 'tomorrow'
  if (d < 7) return 'thisWeek'
  return 'later'
}
const order: Group[] = ['overdue', 'today', 'tomorrow', 'thisWeek', 'later', 'noDate']

export function TaskList({ tasks }: { tasks: Task[] }) {
  const t = useT()
  const grouped = useMemo(() => {
    const m = new Map<Group, Task[]>()
    tasks.forEach(t => { const g = t.status === 'done' ? 'done' : group(t); m.set(g, [...(m.get(g) ?? []), t]) })
    return [...order, 'done' as Group].filter(k => m.has(k)).map(k => [k, m.get(k)!] as const)
  }, [tasks])
  if (tasks.length === 0) return <EmptyState emoji="🌤️" title={t('tasks.empty.title')} desc={t('tasks.empty.desc')} />
  return (
    <div className="space-y-6">
      {grouped.map(([id, list]) => (
        <section key={id}>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            {t(`tasks.groups.${id}`)} <span className="rounded-full bg-cream-2 px-1.5 py-0.5 text-[10px]">{list.length}</span>
          </h3>
          <div className="space-y-2">{list.map(t => <TaskRow key={t.id} task={t} />)}</div>
        </section>
      ))}
    </div>
  )
}

export default function Tasks() {
  const t = useT()
  const tasks = useStore(s => s.tasks)
  const subjects = useStore(s => s.subjects)
  const addTask = useStore(s => s.addTask)
  const [filter, setFilter] = useState<Filter>('todas')
  const [subject, setSubject] = useState('')
  const [open, setOpen] = useState(false)

  const visible = tasks.filter(t => {
    if (subject && t.subjectId !== subject) return false
    const g = group(t)
    if (filter === 'hoje') return t.status !== 'done' && (g === 'today' || g === 'overdue')
    if (filter === 'proximas') return t.status !== 'done' && (g === 'tomorrow' || g === 'thisWeek' || g === 'later')
    if (filter === 'concluidas') return t.status === 'done'
    return true
  })
  const pending = tasks.filter(t => t.status !== 'done').length

  return (
    <div>
      <PageHeader title={t('tasks.title')} sub={`${t('tasks.pendingCount', { count: pending })} · ${t('tasks.doneCount', { count: tasks.length - pending })}`}
        action={<button onClick={() => setOpen(true)} className="btn btn-primary"><Plus size={16} /> {t('tasks.newTask')}</button>} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented value={filter} onChange={setFilter} options={[{ value: 'todas', label: t('tasks.filters.todas') }, { value: 'hoje', label: t('tasks.filters.hoje') }, { value: 'proximas', label: t('tasks.filters.proximas') }, { value: 'concluidas', label: t('tasks.filters.concluidas') }]} />
        <Select className="w-auto min-w-[160px]" value={subject} onChange={setSubject} placeholder={t('tasks.allSubjects')} options={subjects.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }))} />
      </div>
      <TaskList tasks={visible} />
      <Modal open={open} onClose={() => setOpen(false)} title={t('tasks.newTask')}>
        <TaskForm onSubmit={d => { addTask(d); setOpen(false) }} />
      </Modal>
    </div>
  )
}
