import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Target } from 'lucide-react'
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import {
  addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, subMonths,
} from 'date-fns'
import { useStore, goalProgress } from '@/store/useStore'
import { PageHeader, Segmented, Select, SubjectChip } from '@/components/ui/Bits'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/Progress'
import { Checkbox } from '@/components/ui/Checkbox'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskRow } from '@/components/tasks/TaskRow'
import { TaskList } from './Tasks'
import { cn, colorClasses, fmtMinutes, priorityMeta, todayISO, fmtDate } from '@/lib/utils'
import type { Goal, GoalPeriod, GoalUnit, Task, TaskStatus } from '@/lib/types'
import { useT, useLang } from '@/i18n'

type View = 'calendario' | 'lista' | 'kanban' | 'semana' | 'metas'

/* ---------- draggable card ---------- */
function DragCard({ task, overlay = false }: { task: Task; overlay?: boolean }) {
  const subject = useStore(s => s.subjects.find(x => x.id === task.subjectId))
  const toggle = useStore(s => s.toggleTask)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, data: task })
  const c = subject ? colorClasses[subject.color] : null
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      className={cn('cursor-grab touch-none rounded-xl border border-line bg-surface p-3 text-sm shadow-soft transition active:cursor-grabbing',
        isDragging && !overlay && 'opacity-30', overlay && 'rotate-2 shadow-lift')}>
      <div className="flex items-start gap-2">
        <Checkbox size={17} checked={task.status === 'done'} onChange={() => toggle(task.id)} className="mt-0.5" />
        <p className={cn('flex-1 font-medium leading-snug', task.status === 'done' && 'text-muted line-through')}>{task.title}</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {subject && <span className={cn('chip px-2 py-0.5 text-[10px]', c!.soft, c!.text)}>{subject.emoji} {subject.name}</span>}
        <span className={cn('chip px-1.5 py-0.5 text-[10px]', priorityMeta[task.priority].cls)}>{priorityMeta[task.priority].icon}</span>
        {task.estimate && <span className="text-[10px] text-muted">{fmtMinutes(task.estimate)}</span>}
      </div>
    </div>
  )
}

function Column({ id, title, sub, tasks, accent, onAdd }: { id: string; title: React.ReactNode; sub?: string; tasks: Task[]; accent?: string; onAdd?: () => void }) {
  const t = useT()
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={cn('flex min-h-[110px] w-full flex-col rounded-2xl lg:min-h-[220px] border border-line bg-cream-2/50 p-2.5 transition', isOver && 'bg-sage-soft/50 ring-2 ring-sage/40')}>
      <div className="mb-2 flex items-center justify-between px-1.5 pt-1">
        <div>
          <p className={cn('text-xs font-bold uppercase tracking-wider', accent ?? 'text-muted')}>{title}</p>
          {sub && <p className="text-[11px] text-muted">{sub}</p>}
        </div>
        <span className="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-bold text-muted">{tasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {tasks.map(t => <DragCard key={t.id} task={t} />)}
        {onAdd && <button onClick={onAdd} className="mt-auto flex items-center justify-center gap-1 rounded-xl border border-dashed border-line-2 py-2 text-xs font-semibold text-muted hover:border-sage hover:text-ink"><Plus size={13} /> {t('common.actions.add')}</button>}
      </div>
    </div>
  )
}

function useDnd(onDrop: (taskId: string, target: string) => void) {
  const [active, setActive] = useState<Task | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }))
  const onDragEnd = (e: DragEndEvent) => { setActive(null); if (e.over) onDrop(String(e.active.id), String(e.over.id)) }
  return { active, sensors, onDragEnd, onDragStart: (e: { active: { data: { current?: unknown } } }) => setActive(e.active.data.current as Task) }
}

/* ---------- Kanban ---------- */
function Kanban({ onAdd }: { onAdd: (p: Partial<Task>) => void }) {
  const t = useT()
  const tasks = useStore(s => s.tasks)
  const move = useStore(s => s.moveTask)
  const dnd = useDnd((id, target) => move(id, target as TaskStatus))
  const cols: Array<{ id: TaskStatus; title: string; accent: string }> = [
    { id: 'todo', title: t('common.status.todo'), accent: 'text-muted' }, { id: 'doing', title: t('common.status.in_progress'), accent: 'text-sky-ink' }, { id: 'done', title: t('common.status.done'), accent: 'text-sage-ink' },
  ]
  return (
    <DndContext sensors={dnd.sensors} onDragStart={dnd.onDragStart} onDragEnd={dnd.onDragEnd}>
      <div className="grid gap-3 md:grid-cols-3">
        {cols.map(c => <Column key={c.id} id={c.id} title={c.title} accent={c.accent} tasks={tasks.filter(t => t.status === c.id)} onAdd={() => onAdd({ status: c.id })} />)}
      </div>
      <DragOverlay>{dnd.active && <DragCard task={dnd.active} overlay />}</DragOverlay>
    </DndContext>
  )
}

/* ---------- Week ---------- */
function Week({ onAdd }: { onAdd: (p: Partial<Task>) => void }) {
  const t = useT()
  const { dfLocale } = useLang()
  const tasks = useStore(s => s.tasks)
  const update = useStore(s => s.updateTask)
  const [offset, setOffset] = useState(0)
  const start = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), offset * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const dnd = useDnd((id, target) => update(id, { date: target }))
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setOffset(o => o - 1)} className="btn btn-ghost h-9 w-9 p-0"><ChevronLeft size={18} /></button>
        <p className="text-sm font-bold">{format(start, t('common.fmt.dayMonth'), { locale: dfLocale })} — {format(addDays(start, 6), t('common.fmt.dayMonth'), { locale: dfLocale })}{offset !== 0 && <button onClick={() => setOffset(0)} className="ml-2 text-xs font-semibold text-muted underline">{t('planner.week.today')}</button>}</p>
        <button onClick={() => setOffset(o => o + 1)} className="btn btn-ghost h-9 w-9 p-0"><ChevronRight size={18} /></button>
      </div>
      <DndContext sensors={dnd.sensors} onDragStart={dnd.onDragStart} onDragEnd={dnd.onDragEnd}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
          {days.map(d => {
            const iso = format(d, 'yyyy-MM-dd')
            return <Column key={iso} id={iso} title={<span className={cn(isToday(d) && 'text-sage-ink')}>{format(d, 'EEE', { locale: dfLocale })}</span>} sub={format(d, t('planner.fmt.weekDaySub'), { locale: dfLocale })}
              tasks={tasks.filter(t => t.date === iso)} onAdd={() => onAdd({ date: iso })} />
          })}
        </div>
        <DragOverlay>{dnd.active && <DragCard task={dnd.active} overlay />}</DragOverlay>
      </DndContext>
      <p className="mt-3 text-xs text-muted">{t('planner.week.hint')}</p>
    </div>
  )
}

/* ---------- Calendar ---------- */
function Calendar({ onAdd }: { onAdd: (p: Partial<Task>) => void }) {
  const t = useT()
  const { dfLocale } = useLang()
  const tasks = useStore(s => s.tasks)
  const subjects = useStore(s => s.subjects)
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(todayISO())
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }), [month])
  const dayTasks = tasks.filter(t => t.date === selected)
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card p-4 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => setMonth(m => subMonths(m, 1))} className="btn btn-ghost h-9 w-9 p-0"><ChevronLeft size={18} /></button>
          <p className="text-base font-bold capitalize">{format(month, t('common.fmt.monthYear'), { locale: dfLocale })}</p>
          <button onClick={() => setMonth(m => addMonths(m, 1))} className="btn btn-ghost h-9 w-9 p-0"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-muted">
          {[0, 1, 2, 3, 4, 5, 6].map(i => <div key={i} className="py-1">{t(`planner.calendar.weekdays.${i}`)}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(d => {
            const iso = format(d, 'yyyy-MM-dd')
            const list = tasks.filter(t => t.date === iso)
            const sel = iso === selected
            return (
              <button key={iso} onClick={() => setSelected(iso)}
                className={cn('flex aspect-square flex-col items-center justify-start rounded-xl p-1 text-sm transition sm:aspect-[5/4]',
                  !isSameMonth(d, month) && 'text-line-2', sel ? 'bg-ink text-cream' : 'hover:bg-cream-2', isToday(d) && !sel && 'bg-sage-soft font-bold')}>
                <span className="mt-1">{format(d, 'd')}</span>
                <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                  {list.slice(0, 4).map(t => {
                    const s = subjects.find(x => x.id === t.subjectId)
                    return <span key={t.id} className={cn('h-1.5 w-1.5 rounded-full', s ? colorClasses[s.color].dot : 'bg-line-2', sel && 'ring-1 ring-cream/60')} />
                  })}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold capitalize">{isSameDay(parseISO(selected), new Date()) ? t('common.relative.today') : fmtDate(selected, t('planner.fmt.selectedDay'), dfLocale)}</p>
          <button onClick={() => onAdd({ date: selected })} className="btn btn-soft h-8 px-2.5 text-xs"><Plus size={13} /> {t('planner.calendar.task')}</button>
        </div>
        {dayTasks.length === 0 ? <p className="text-sm text-muted">{t('planner.calendar.empty')}</p> : (
          <div className="space-y-2">{dayTasks.map(t => <TaskRow key={t.id} task={t} compact />)}</div>
        )}
      </div>
    </div>
  )
}

/* ---------- Goals ---------- */
const periodColor: Record<GoalPeriod, string> = { daily: 'bg-sky', weekly: 'bg-lilac', monthly: 'bg-rose' }

function GoalForm({ onSubmit }: { onSubmit: (g: Omit<Goal, 'id'>) => void }) {
  const t = useT()
  const subjects = useStore(s => s.subjects)
  const [title, setTitle] = useState('')
  const [period, setPeriod] = useState<GoalPeriod>('daily')
  const [unit, setUnit] = useState<GoalUnit>('minutes')
  const [target, setTarget] = useState(60)
  const [subjectId, setSubjectId] = useState('')
  const [deadline, setDeadline] = useState('')
  const suggestion = unit === 'minutes' ? t(`planner.goals.suggestion.minutes.${period}`, { amount: fmtMinutes(target) })
    : unit === 'questions' ? t(`planner.goals.suggestion.questions.${period}`, { n: target })
    : unit === 'topics' ? (subjectId ? t('planner.goals.suggestion.topicsOf', { n: target, subject: subjects.find(s => s.id === subjectId)?.name }) : t('planner.goals.suggestion.topics', { n: target }))
    : t('planner.goals.suggestion.sessions', { n: target })
  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSubmit({ title: title.trim() || suggestion, period, unit, target, subjectId: subjectId || undefined, deadline: deadline || undefined }) }}>
      <div><label className="label">{t('planner.goals.form.title')}</label><input className="input" placeholder={suggestion} value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">{t('planner.goals.form.period')}</label><Select value={period} onChange={setPeriod} options={[{ value: 'daily', label: t('planner.goals.period.daily') }, { value: 'weekly', label: t('planner.goals.period.weekly') }, { value: 'monthly', label: t('planner.goals.period.monthly') }]} /></div>
        <div><label className="label">{t('planner.goals.form.measureIn')}</label><Select value={unit} onChange={setUnit} options={[{ value: 'minutes', label: t('planner.goals.unitOptions.minutes') }, { value: 'questions', label: t('planner.goals.unitOptions.questions') }, { value: 'sessions', label: t('planner.goals.unitOptions.sessions') }, { value: 'topics', label: t('planner.goals.unitOptions.topics') }]} /></div>
        <div><label className="label">{t('planner.goals.form.target')}</label><input type="number" min={1} className="input" value={target} onChange={e => setTarget(+e.target.value)} /></div>
        <div><label className="label">{t('planner.goals.form.subject')}</label><Select value={subjectId} onChange={setSubjectId} placeholder={t('planner.goals.form.allSubjects')} options={subjects.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }))} /></div>
        <div className="col-span-2"><label className="label">{t('planner.goals.form.deadline')}</label><input type="date" className="input" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
      </div>
      <button className="btn btn-primary w-full">{t('planner.goals.create')}</button>
    </form>
  )
}

function Goals() {
  const t = useT()
  const { dfLocale } = useLang()
  const goals = useStore(s => s.goals)
  const sessions = useStore(s => s.sessions)
  const subjects = useStore(s => s.subjects)
  const { addGoal, removeGoal } = useStore()
  const [open, setOpen] = useState(false)
  const byPeriod = (p: GoalPeriod) => goals.filter(g => g.period === p)
  return (
    <div>
      <div className="mb-4 flex justify-end"><button onClick={() => setOpen(true)} className="btn btn-primary"><Target size={15} /> {t('planner.goals.newGoal')}</button></div>
      <div className="grid gap-4 md:grid-cols-3">
        {(['daily', 'weekly', 'monthly'] as GoalPeriod[]).map(p => (
          <div key={p} className="card p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted"><span className={cn('h-2 w-2 rounded-full', periodColor[p])} /> {t(`planner.goals.heading.${p}`)}</p>
            {byPeriod(p).length === 0 && <p className="text-sm text-muted">{t(`planner.goals.empty.${p}`)}</p>}
            <ul className="space-y-4">
              {byPeriod(p).map(g => {
                const pr = goalProgress(g, sessions, subjects)
                return (
                  <motion.li key={g.id} layout className="group">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{pr.pct >= 100 && '✅ '}{g.title}</p>
                        <p className="text-xs text-muted">{t('planner.goals.progress', { current: g.unit === 'minutes' ? fmtMinutes(pr.current) : pr.current, target: g.unit === 'minutes' ? fmtMinutes(g.target) : `${g.target} ${t(`planner.goals.units.${g.unit}`)}` })}{g.deadline && t('planner.goals.until', { date: fmtDate(g.deadline, t('planner.fmt.deadline'), dfLocale) })}</p>
                      </div>
                      <button onClick={() => removeGoal(g.id)} className="text-muted opacity-0 transition hover:text-rose-ink group-hover:opacity-100"><Trash2 size={14} /></button>
                    </div>
                    <ProgressBar value={pr.pct} color={pr.pct >= 100 ? 'bg-sage' : periodColor[p]} height="h-2" />
                  </motion.li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={t('planner.goals.newGoal')}><GoalForm onSubmit={g => { addGoal(g); setOpen(false) }} /></Modal>
    </div>
  )
}

/* ---------- Page ---------- */
export default function Planner() {
  const t = useT()
  const [params, setParams] = useSearchParams()
  const view = (params.get('tab') as View) || 'semana'
  const setView = (v: View) => setParams({ tab: v })
  const tasks = useStore(s => s.tasks)
  const addTask = useStore(s => s.addTask)
  const [draft, setDraft] = useState<Partial<Task> | null>(null)

  return (
    <div>
      <PageHeader tourId="planner" title={t('planner.title')} sub={t('planner.sub')}
        action={<button onClick={() => setDraft({})} className="btn btn-primary"><Plus size={16} /> {t('planner.newTask')}</button>} />
      <div className="mb-5 overflow-x-auto">
        <Segmented value={view} onChange={setView} options={[
          { value: 'calendario', label: t('planner.views.calendario') }, { value: 'lista', label: t('planner.views.lista') }, { value: 'kanban', label: t('planner.views.kanban') }, { value: 'semana', label: t('planner.views.semana') }, { value: 'metas', label: t('planner.views.metas') },
        ]} />
      </div>
      {view === 'calendario' && <Calendar onAdd={setDraft} />}
      {view === 'lista' && <TaskList tasks={tasks} />}
      {view === 'kanban' && <Kanban onAdd={setDraft} />}
      {view === 'semana' && <Week onAdd={setDraft} />}
      {view === 'metas' && <Goals />}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={t('planner.newTask')}>
        {draft && <TaskForm initial={draft} onSubmit={d => { addTask({ ...d, status: draft.status ?? d.status }); setDraft(null) }} />}
      </Modal>
      <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted">
        <SubjectLegend />
      </div>
    </div>
  )
}

function SubjectLegend() {
  const subjects = useStore(s => s.subjects)
  return <>{subjects.map(s => <SubjectChip key={s.id} id={s.id} size="xs" />)}</>
}
