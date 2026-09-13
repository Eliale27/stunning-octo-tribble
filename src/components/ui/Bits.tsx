import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn, scoreTone } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
type Size = 'xs' | 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-2 shadow-[0_8px_20px_-10px_var(--accent)]',
  secondary: 'bg-surface border border-line text-ink hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2',
  danger: 'bg-danger-soft text-danger hover:brightness-95',
  soft: 'bg-accent-soft text-accent-ink hover:brightness-95',
}
const sizes: Record<Size, string> = { xs: 'h-7 px-2.5 text-xs rounded-lg', sm: 'h-8 px-3 text-xs', md: 'h-10 px-4', lg: 'h-12 px-6 text-base' }

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean; icon?: ReactNode }>(
  ({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...rest }, ref) => (
    <button ref={ref} className={cn('btn-base', variants[variant], sizes[size], className)} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

export function Card({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card p-5', className)} {...rest}>{children}</div>
}

export function SectionTitle({ children, sub, action }: { children: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{children}</h2>
        {sub && <p className="text-sm text-muted mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({ title, sub, action, eyebrow }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6 animate-fade-up">
      <div>
        {eyebrow && <div className="label-caps mb-1.5">{eyebrow}</div>}
        <h1 className="text-2xl md:text-[28px] font-bold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-muted mt-1 max-w-2xl">{sub}</p>}
      </div>
      {action && <div className="flex gap-2 flex-wrap">{action}</div>}
    </div>
  )
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'violet'; className?: string }) {
  const tones = {
    neutral: 'bg-surface-2 text-ink-2 border-line', accent: 'bg-accent-soft text-accent-ink border-transparent',
    success: 'bg-success-soft text-success border-transparent', warn: 'bg-warn-soft text-warn border-transparent',
    danger: 'bg-danger-soft text-danger border-transparent', violet: 'bg-violet-soft text-violet border-transparent',
  }
  return <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap', tones[tone], className)}>{children}</span>
}

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return <div className="flex items-baseline justify-between mb-1.5"><span className="label-caps">{children}</span>{hint && <span className="text-[11px] text-muted">{hint}</span>}</div>
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...rest }, ref) => (
  <input ref={ref} className={cn('input-base', className)} {...rest} />
))
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...rest }, ref) => (
  <textarea ref={ref} className={cn('input-base resize-y min-h-[96px] leading-relaxed', className)} {...rest} />
))
Textarea.displayName = 'Textarea'

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('input-base appearance-none pr-8 bg-[length:16px] bg-[right_10px_center] bg-no-repeat', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7188' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...rest}>{children}</select>
}

export function Tabs<T extends string>({ value, onChange, items, size = 'md' }: { value: T; onChange: (v: T) => void; items: { value: T; label: ReactNode }[]; size?: 'sm' | 'md' }) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-xl bg-surface-2 border border-line p-0.5', size === 'sm' && 'rounded-lg')}>
      {items.map((it) => (
        <button key={it.value} onClick={() => onChange(it.value)}
          className={cn('rounded-[9px] font-semibold transition whitespace-nowrap', size === 'sm' ? 'px-2.5 h-7 text-xs' : 'px-3.5 h-8 text-sm',
            value === it.value ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink')}>{it.label}</button>
      ))}
    </div>
  )
}

export function ScoreRing({ value, size = 72, label, stroke = 7 }: { value: number; size?: number; label?: ReactNode; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const tone = scoreTone(value)
  const color = tone === 'success' ? 'var(--success)' : tone === 'warn' ? 'var(--warn)' : 'var(--danger)'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c - (c * Math.max(0, Math.min(100, value))) / 100} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold tabular-nums" style={{ fontSize: size * 0.26 }}>{Math.round(value)}</div>
      </div>
      {label && <div className="label-caps text-center">{label}</div>}
    </div>
  )
}

export function Bar({ value, label, tone }: { value: number; label: ReactNode; tone?: 'success' | 'warn' | 'danger' | 'accent' }) {
  const t = tone ?? scoreTone(value)
  const color = t === 'success' ? 'bg-success' : t === 'warn' ? 'bg-warn' : t === 'danger' ? 'bg-danger' : 'bg-accent'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-ink-2 font-medium">{label}</span><span className="tabular-nums text-muted">{Math.round(value)}%</span></div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden"><div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} /></div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-lg bg-surface-2 animate-pulse-soft', className)} />
}

export function EmptyState({ icon, title, sub, action }: { icon?: ReactNode; title: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card p-10 text-center flex flex-col items-center gap-3 border-dashed">
      {icon && <div className="size-12 rounded-2xl bg-accent-soft text-accent-ink flex items-center justify-center">{icon}</div>}
      <div className="font-semibold">{title}</div>
      {sub && <p className="text-sm text-muted max-w-md">{sub}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Chips({ items, tone = 'neutral', max }: { items: string[]; tone?: 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'violet'; max?: number }) {
  const list = max ? items.slice(0, max) : items
  if (!list.length) return <span className="text-xs text-muted">—</span>
  return <div className="flex flex-wrap gap-1.5">{list.map((s, i) => <Badge key={`${s}-${i}`} tone={tone}>{s}</Badge>)}{max && items.length > max && <Badge>+{items.length - max}</Badge>}</div>
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-block font-mono text-[10.5px] px-1.5 py-0.5 rounded-md border border-line-2 bg-surface-2 text-ink-2 shadow-[inset_0_-1px_0_var(--line-2)]">{children}</kbd>
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin text-muted', className)} />
}

// Minimal, safe Markdown renderer for model output (code blocks, inline code, bold, lists, headings, paragraphs).
function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function inline(s: string) {
  return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,])/g, '$1<em>$2</em>')
}
export function renderMarkdown(md: string): string {
  const out: string[] = []
  const lines = md.replace(/\r/g, '').split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`)
      continue
    }
    if (/^#{1,3}\s/.test(line)) { out.push(`<h3>${inline(line.replace(/^#+\s/, ''))}</h3>`); i++; continue }
    if (/^\s*[-*]\s/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) buf.push(`<li>${inline(lines[i++].replace(/^\s*[-*]\s/, ''))}</li>`)
      out.push(`<ul>${buf.join('')}</ul>`)
      continue
    }
    if (/^\s*\d+[.)]\s/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^\s*\d+[.)]\s/.test(lines[i])) buf.push(`<li>${inline(lines[i++].replace(/^\s*\d+[.)]\s/, ''))}</li>`)
      out.push(`<ol>${buf.join('')}</ol>`)
      continue
    }
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[i + 1])) {
      const rows: string[] = []
      const header = line.split('|').map((c) => c.trim()).filter(Boolean)
      rows.push(`<tr>${header.map((h) => `<th>${inline(h)}</th>`).join('')}</tr>`)
      i += 2
      while (i < lines.length && lines[i].includes('|')) rows.push(`<tr>${lines[i++].split('|').map((c) => c.trim()).filter(Boolean).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
      out.push(`<table>${rows.join('')}</table>`)
      continue
    }
    if (!line.trim()) { i++; continue }
    const buf: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,3}\s|\s*[-*]\s|\s*\d+[.)]\s)/.test(lines[i])) buf.push(lines[i++])
    out.push(`<p>${inline(buf.join(' '))}</p>`)
  }
  return out.join('')
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  return <div className={cn('prose-answer text-sm leading-relaxed text-ink-2', className)} dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
}

export function Confirm({ open, title, body, onCancel, onConfirm, confirmLabel = 'Delete' }: { open: boolean; title: string; body?: ReactNode; onCancel: () => void; onConfirm: () => void; confirmLabel?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="card p-6 w-full max-w-md animate-pop" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-lg">{title}</h3>
        {body && <div className="text-sm text-muted mt-2">{body}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
