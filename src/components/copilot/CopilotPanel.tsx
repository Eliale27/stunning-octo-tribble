import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Sparkles, ChevronDown, ChevronUp, Wand2, Minimize2, Maximize2, Copy, Check, Square, Trash2 } from 'lucide-react'
import { useCopilot } from './useCopilot'
import { useStore } from '@/store/useStore'
import { useShortcuts } from '@/lib/shortcuts'
import { Badge, Button, Kbd, Skeleton, Spinner } from '@/components/ui/Bits'
import { QUESTION_TYPE_LABELS, type AnswerSet, type InterviewTurn, type RefineAction } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toasts'

interface Props {
  interviewId: string
  compact: boolean
  onToggleCompact?: () => void
  onMinimize?: () => void
  standalone?: boolean
}

const REFINES: { action: RefineAction; label: string; key: 'shorter' | 'natural' | 'professional' | 'star' | null }[] = [
  { action: 'shorter', label: 'Shorter', key: 'shorter' },
  { action: 'natural', label: 'More Natural', key: 'natural' },
  { action: 'confident', label: 'More Confident', key: null },
  { action: 'professional', label: 'More Professional', key: 'professional' },
  { action: 'star', label: 'Use STAR', key: 'star' },
  { action: 'regenerate', label: 'Regenerate', key: null },
]

export function CopilotPanel({ interviewId, compact, onToggleCompact, onMinimize, standalone }: Props) {
  const { interview, ask, refine, setActive, busy, refining, stop } = useCopilot(interviewId)
  const shortcuts = useStore((s) => s.settings.shortcuts)
  const deleteTurn = useStore((s) => s.deleteTurn)
  const [question, setQuestion] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const turns = interview?.turns ?? []
  const last = turns[turns.length - 1]

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, [turns.length, last?.answers?.natural?.length, last?.analysis])

  const submit = () => {
    if (!question.trim() || busy) return
    void ask(question)
    setQuestion('')
  }

  const handlers = useMemo(() => ({
    generate: submit,
    shorter: () => last && void refine(last, 'shorter'),
    natural: () => last && void refine(last, 'natural'),
    professional: () => last && void refine(last, 'professional'),
    star: () => last && void refine(last, 'star'),
    minimize: () => onMinimize?.(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [last, question, busy, refine, onMinimize])
  useShortcuts(shortcuts, handlers)

  if (!interview) return <div className="p-6 text-sm text-muted">Interview not found.</div>

  return (
    <div className={cn('flex flex-col h-full min-h-0', compact ? 'text-[13px]' : '')}>
      {/* header */}
      <div className={cn('flex items-center justify-between gap-2 border-b border-line', compact ? 'px-3 py-2' : 'px-4 py-3')}>
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Sparkles className="size-4 text-accent shrink-0" /><span className="font-semibold truncate">{compact ? 'Copilot' : interview.title}</span>{busy && <Spinner />}</div>
          {!compact && <div className="text-[11px] text-muted truncate">{interview.mode === 'copilot' ? 'Interview Copilot — use only where AI assistance is permitted' : 'Practice mode'}</div>}
        </div>
        <div className="flex items-center gap-1">
          {busy && <Button size="xs" variant="ghost" onClick={stop} icon={<Square className="size-3" />}>Stop</Button>}
          {onToggleCompact && <button className="btn-base size-7 hover:bg-surface-2 text-muted" title={compact ? 'Full view' : 'Ultra compact mode'} onClick={onToggleCompact}>{compact ? <Maximize2 className="size-3.5" /> : <Minimize2 className="size-3.5" />}</button>}
          {onMinimize && <button className="btn-base size-7 hover:bg-surface-2 text-muted" title="Minimize (Esc)" onClick={onMinimize}><ChevronDown className="size-4" /></button>}
        </div>
      </div>

      {/* turns */}
      <div ref={listRef} className={cn('flex-1 min-h-0 overflow-y-auto', compact ? 'px-3 py-2 space-y-3' : 'px-4 py-4 space-y-5')}>
        {!turns.length && (
          <div className={cn('text-center text-muted', compact ? 'py-6 text-xs' : 'py-14 text-sm')}>
            <Sparkles className="size-6 mx-auto mb-2 text-accent" />
            Type or paste the interviewer's question. Key points appear first, then the suggested answer.
          </div>
        )}
        {(compact ? turns.slice(-1) : turns).map((t) => (
          <TurnCard key={t.id} turn={t} compact={compact} refining={refining === t.id}
            onRefine={(a) => void refine(t, a)} onActive={(k) => setActive(t.id, k)}
            onDelete={() => deleteTurn(interview.id, t.id)} onAskFollowUp={(q) => { setQuestion(q); inputRef.current?.focus() }} />
        ))}
      </div>

      {/* input */}
      <div className={cn('border-t border-line bg-surface', compact ? 'p-2' : 'p-3')}>
        <div className="relative">
          <textarea ref={inputRef} value={question} onChange={(e) => setQuestion(e.target.value)} rows={compact ? 2 : 3}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); submit() } }}
            placeholder={compact ? 'Interviewer question…' : 'What did the interviewer ask? (Enter to generate, Shift+Enter for a new line)'}
            className="input-base pr-12 resize-none" autoFocus={standalone} />
          <button onClick={submit} disabled={busy || !question.trim()} className="absolute right-2 bottom-2 btn-base size-8 bg-accent text-white hover:bg-accent-2 disabled:opacity-40" title="Generate answer (Ctrl+Enter)"><Send className="size-4" /></button>
        </div>
        {!compact && <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-muted"><span><Kbd>{shortcuts.generate}</Kbd> generate</span><span><Kbd>{shortcuts.shorter}</Kbd> shorter</span><span><Kbd>{shortcuts.natural}</Kbd> natural</span><span><Kbd>{shortcuts.professional}</Kbd> professional</span><span><Kbd>{shortcuts.star}</Kbd> STAR</span>{onMinimize && <span><Kbd>{shortcuts.minimize}</Kbd> minimize</span>}</div>}
      </div>
    </div>
  )
}

function TurnCard({ turn, compact, refining, onRefine, onActive, onDelete, onAskFollowUp }: {
  turn: InterviewTurn; compact: boolean; refining: boolean; onRefine: (a: RefineAction) => void; onActive: (k: keyof AnswerSet) => void; onDelete: () => void; onAskFollowUp: (q: string) => void
}) {
  const [showIntent, setShowIntent] = useState(!compact)
  const [copied, setCopied] = useState(false)
  const key = turn.activeAnswer ?? 'natural'
  const a = turn.analysis
  const answers = turn.answers
  const text = answers?.[key] || answers?.natural || answers?.quick || ''
  const streaming = turn.status === 'analyzing' || turn.status === 'answering'

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200) } catch { toast.error('Clipboard blocked') }
  }

  return (
    <div className={cn('rounded-2xl border border-line bg-surface animate-fade-up', compact ? 'p-3' : 'p-4')}>
      {/* QUESTION */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="label-caps mb-1">Question</div>
          <div className={cn('font-semibold leading-snug', compact ? 'text-[13px]' : 'text-[15px]')}>{turn.question}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {a && <Badge tone="accent">{QUESTION_TYPE_LABELS[a.type]}</Badge>}
          {!compact && <button className="text-muted hover:text-danger" onClick={onDelete} title="Remove"><Trash2 className="size-3.5" /></button>}
        </div>
      </div>

      {/* KEY POINTS (fast path) */}
      <div className="mt-3">
        <div className="label-caps mb-1 flex items-center gap-2">Key points {turn.status === 'analyzing' && <Spinner className="size-3" />}</div>
        {a ? (
          <ul className={cn('grid gap-1', compact ? 'text-[12.5px]' : 'text-sm')}>
            {a.keyPoints.map((k, i) => <li key={i} className="flex gap-2"><span className="text-accent mt-[3px]">▸</span><span className="text-ink-2">{k}</span></li>)}
          </ul>
        ) : <div className="space-y-1.5"><Skeleton className="h-3.5 w-3/4" /><Skeleton className="h-3.5 w-1/2" /></div>}
      </div>

      {/* INTENT + RELEVANT EXPERIENCE (hidden in compact by default) */}
      {a && !compact && (
        <div className="mt-3">
          <button onClick={() => setShowIntent((s) => !s)} className="label-caps flex items-center gap-1 hover:text-ink">What the interviewer really wants {showIntent ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}</button>
          {showIntent && (
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2 p-3">
                <div className="label-caps mb-1">Interviewer intent</div>
                <p className="text-sm text-ink-2">{a.intent}</p>
                <div className="label-caps mt-2 mb-1">Evaluating</div>
                <div className="flex flex-wrap gap-1">{a.evaluating.map((e) => <Badge key={e} tone="violet">{e}</Badge>)}</div>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <div className="label-caps mb-1">Relevant experience</div>
                {a.relevantExperience.length ? a.relevantExperience.map((r, i) => <div key={i} className="text-sm mb-1.5"><span className="font-medium">{r.label}</span><span className="text-muted"> — {r.why}</span></div>) : <p className="text-sm text-muted">No matching experience found in your profile.</p>}
                {a.star && (
                  <div className="mt-2 text-xs text-ink-2 space-y-0.5">
                    <div><b>S</b> {a.star.situation}</div><div><b>T</b> {a.star.task}</div><div><b>A</b> {a.star.action}</div><div><b>R</b> {a.star.result}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {a?.insufficientInfo && <div className="mt-2 text-xs text-warn">Your profile may not contain enough information for this question — the answer will say so instead of inventing details.</div>}

      {/* ANSWER */}
      <div className="mt-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="label-caps flex items-center gap-2">Suggested answer {turn.status === 'answering' && <Spinner className="size-3" />}</div>
          <div className="inline-flex rounded-lg bg-surface-2 border border-line p-0.5">
            {(['quick', 'natural', 'strong'] as const).map((k) => (
              <button key={k} onClick={() => onActive(k)} className={cn('px-2 h-6 rounded-md text-[11px] font-semibold capitalize', key === k ? 'bg-surface shadow-soft text-ink' : 'text-muted hover:text-ink')}>{k}</button>
            ))}
          </div>
        </div>
        {text ? (
          <p className={cn('leading-relaxed text-ink whitespace-pre-wrap', compact ? 'text-[13px]' : 'text-[15px]', refining && 'opacity-70')}>{text}{streaming && !answers?.[key] ? '' : ''}{(streaming || refining) && <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 align-middle animate-pulse-soft" />}</p>
        ) : turn.status === 'error' ? <p className="text-sm text-danger">{turn.error}</p> : <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-2/3" /></div>}
        {answers && turn.status === 'done' && (
          <div className={cn('flex flex-wrap items-center gap-1.5', compact ? 'mt-2' : 'mt-3')}>
            {REFINES.map((r) => (
              <Button key={r.action} size="xs" variant="secondary" disabled={refining} onClick={() => onRefine(r.action)} icon={r.action === 'regenerate' ? <Wand2 className="size-3" /> : undefined}>{r.label}</Button>
            ))}
            <Button size="xs" variant="ghost" onClick={copy} icon={copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}>{copied ? 'Copied' : 'Copy'}</Button>
          </div>
        )}
      </div>

      {/* FOLLOW-UPS */}
      {turn.followUps && turn.followUps.length > 0 && (
        <div className="mt-3">
          <div className="label-caps mb-1">Possible follow-up</div>
          <div className="flex flex-col gap-1">
            {turn.followUps.slice(0, compact ? 3 : 5).map((f, i) => (
              <button key={i} onClick={() => onAskFollowUp(f)} className={cn('text-left rounded-lg px-2.5 py-1.5 bg-surface-2 hover:bg-accent-soft hover:text-accent-ink text-ink-2 transition', compact ? 'text-[12px]' : 'text-[13px]')}>{i + 1}. {f}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
