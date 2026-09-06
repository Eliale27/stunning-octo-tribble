import { colorClasses, cn } from '@/lib/utils'
import type { PastelColor } from '@/lib/types'
import { useStore } from '@/store/useStore'

export function SubjectChip({ id, className, size = 'sm' }: { id?: string; className?: string; size?: 'sm' | 'xs' }) {
  const subject = useStore(s => s.subjects.find(x => x.id === id))
  if (!subject) return null
  const c = colorClasses[subject.color]
  return (
    <span className={cn('chip', c.soft, c.text, size === 'xs' && 'px-2 py-0.5 text-[11px]', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />{subject.name}
    </span>
  )
}

export function ColorDot({ color, className }: { color: PastelColor; className?: string }) {
  return <span className={cn('inline-block h-2.5 w-2.5 rounded-full', colorClasses[color].dot, className)} />
}

export function PageHeader({ title, sub, action }: { title: React.ReactNode; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

export function EmptyState({ emoji, title, desc, action }: { emoji: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-cream-2 text-3xl">{emoji}</div>
      <p className="font-bold">{title}</p>
      {desc && <p className="mt-1 max-w-xs text-sm text-muted">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Stat({ icon, label, value, hint, tone = 'bg-cream-2', className }:
  { icon: string; label: string; value: React.ReactNode; hint?: string; tone?: string; className?: string }) {
  return (
    <div className={cn('card card-hover p-4', className)}>
      <div className={cn('mb-3 grid h-9 w-9 place-items-center rounded-xl text-lg', tone)}>{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Select<T extends string>({ value, onChange, options, className, placeholder }:
  { value: T | ''; onChange: (v: T) => void; options: Array<{ value: T; label: string }>; className?: string; placeholder?: string }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as T)} className={cn('input appearance-none pr-8', className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238A867C' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right .75rem center' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function Segmented<T extends string>({ value, onChange, options, className }:
  { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: React.ReactNode }>; className?: string }) {
  return (
    <div className={cn('inline-flex max-w-full overflow-x-auto rounded-xl bg-beige p-1', className)}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={cn('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all', value === o.value ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
