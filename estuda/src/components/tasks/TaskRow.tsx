import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Pencil, Plus, Trash2, GripVertical } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Checkbox } from '@/components/ui/Checkbox'
import { Modal } from '@/components/ui/Modal'
import { SubjectChip } from '@/components/ui/Bits'
import { TaskForm } from './TaskForm'
import { cn, fmtMinutes, priorityMeta, relativeDay } from '@/lib/utils'
import type { Task } from '@/lib/types'

export function TaskRow({ task, compact = false, dragHandle }: { task: Task; compact?: boolean; dragHandle?: React.ReactNode }) {
  const { toggleTask, updateTask, removeTask, addSubtask, toggleSubtask, removeSubtask } = useStore()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(false)
  const [newSub, setNewSub] = useState('')
  const done = task.status === 'done'
  const subDone = task.subtasks.filter(s => s.done).length
  const p = priorityMeta[task.priority]
  const hasDetails = task.subtasks.length > 0 || !!task.notes

  return (
    <div className={cn('rounded-xl border border-line bg-surface transition', done && 'opacity-70')}>
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        {dragHandle ?? null}
        <Checkbox checked={done} onChange={() => toggleTask(task.id)} />
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <p className={cn('truncate text-sm font-medium', done && 'text-muted line-through')}>{task.title}</p>
          {!compact && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
              {task.date && <span>{relativeDay(task.date)}</span>}
              {task.estimate && <span>· {fmtMinutes(task.estimate)}</span>}
              {task.category && <span>· {task.category}</span>}
              {task.subtasks.length > 0 && <span>· {subDone}/{task.subtasks.length}</span>}
            </div>
          )}
        </div>
        <SubjectChip id={task.subjectId} size="xs" className="hidden sm:inline-flex" />
        <span className={cn('chip px-2 py-0.5 text-[11px]', p.cls)} title={`Prioridade ${p.label}`}>{p.icon}<span className="hidden sm:inline"> {p.label}</span></span>
        {hasDetails && <button onClick={() => setOpen(o => !o)} className="text-muted"><ChevronDown size={16} className={cn('transition', open && 'rotate-180')} /></button>}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-line px-4 py-3">
              {task.notes && <p className="mb-3 rounded-lg bg-cream-2 px-3 py-2 text-sm text-ink-2">{task.notes}</p>}
              <ul className="space-y-1">
                {task.subtasks.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-2 py-1 text-sm">
                    <span className="w-6 text-right font-mono text-xs text-muted">{i === task.subtasks.length - 1 ? '└──' : '├──'}</span>
                    <Checkbox size={17} checked={s.done} onChange={() => toggleSubtask(task.id, s.id)} />
                    <span className={cn('flex-1', s.done && 'text-muted line-through')}>{s.title}</span>
                    <button onClick={() => removeSubtask(task.id, s.id)} className="text-muted opacity-0 transition hover:text-rose-ink group-hover:opacity-100"><Trash2 size={13} /></button>
                  </li>
                ))}
              </ul>
              <form onSubmit={e => { e.preventDefault(); if (newSub.trim()) { addSubtask(task.id, newSub.trim()); setNewSub('') } }} className="mt-2 flex gap-2 pl-8">
                <input className="input h-8 px-2.5 py-1 text-xs" placeholder="Nova subtarefa…" value={newSub} onChange={e => setNewSub(e.target.value)} />
                <button className="btn btn-soft h-8 px-2.5"><Plus size={14} /></button>
              </form>
              <div className="mt-3 flex justify-end gap-1">
                <button onClick={() => setEdit(true)} className="btn btn-ghost h-8 px-2.5 text-xs"><Pencil size={13} /> Editar</button>
                <button onClick={() => removeTask(task.id)} className="btn btn-ghost h-8 px-2.5 text-xs text-rose-ink"><Trash2 size={13} /> Excluir</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Modal open={edit} onClose={() => setEdit(false)} title="Editar tarefa">
        <TaskForm initial={task} submitLabel="Salvar" onSubmit={d => { updateTask(task.id, d); setEdit(false) }} />
      </Modal>
    </div>
  )
}

export function DragHandle(props: React.HTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="cursor-grab touch-none text-line-2 hover:text-muted active:cursor-grabbing" aria-label="Arrastar"><GripVertical size={16} /></button>
}
