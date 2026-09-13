import { cn } from '@/lib/utils'

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="size-8 rounded-xl bg-ink dark:bg-surface-2 border border-line flex items-center justify-center shrink-0">
        <svg viewBox="0 0 64 64" className="size-5"><path d="M18 44 32 16l14 28-14-8z" fill="#6E8BFF" /></svg>
      </div>
      {!compact && <div className="leading-none"><div className="font-bold tracking-tight">InterviewPilot</div><div className="text-[10px] font-semibold tracking-[0.18em] text-muted">AI</div></div>}
    </div>
  )
}
