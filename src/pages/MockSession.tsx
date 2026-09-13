import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send, SkipForward, Flag, Languages, RotateCcw } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useEngine, useInterviewContext } from '@/lib/hooks'
import { Badge, Button, Card, PageHeader, ScoreRing, Bar, SectionTitle, Textarea, Spinner } from '@/components/ui/Bits'
import { toast } from '@/components/ui/Toasts'
import { QUESTION_TYPE_LABELS, type EnglishFeedback, type MockTurn } from '@/lib/types'
import { uid, wordCount } from '@/lib/utils'
import { labelDim } from '@/lib/stats'

const TOTAL = 8

export default function MockSessionPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const session = useStore((s) => s.mockSessions.find((m) => m.id === id))
  const updateMock = useStore((s) => s.updateMock)
  const engine = useEngine()
  const ctx = useInterviewContext(session)
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState<'question' | 'score' | 'report' | null>(null)
  const [english, setEnglish] = useState<Record<string, EnglishFeedback>>({})
  const started = useRef(false)

  const turns = session?.turns ?? []
  const current = turns.find((t) => !t.answer)
  const scored = turns.filter((t) => t.score)

  const nextQuestion = async () => {
    if (!session) return
    setBusy('question')
    try {
      const q = await engine.nextMockQuestion(ctx, session.category, session.turns)
      const turn: MockTurn = { id: uid('mt'), question: q.question, type: q.type }
      updateMock(session.id, (m) => ({ turns: [...m.turns, turn] }))
    } catch (e) { toast.error((e as Error).message) } finally { setBusy(null) }
  }

  useEffect(() => {
    if (session && session.status === 'active' && !session.turns.length && !started.current) { started.current = true; void nextQuestion() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])
  useEffect(() => { if (!session) nav('/app/mock', { replace: true }) }, [session, nav])
  if (!session) return null

  const submit = async () => {
    if (!current || answer.trim().length < 5) return
    setBusy('score')
    const text = answer.trim()
    setAnswer('')
    try {
      const [score, eng] = await Promise.all([
        engine.scoreMockAnswer(ctx, current.question, text, Boolean(session.englishCoach)),
        session.englishCoach ? engine.englishCoach(text, current.question).catch(() => undefined) : Promise.resolve(undefined),
      ])
      if (eng) setEnglish((e) => ({ ...e, [current.id]: eng }))
      updateMock(session.id, (m) => ({ turns: m.turns.map((t) => (t.id === current.id ? { ...t, answer: text, score, answeredAt: Date.now() } : t)) }))
      if (turns.length < TOTAL) await nextQuestion()
    } catch (e) { toast.error((e as Error).message); setAnswer(text) } finally { setBusy(null) }
  }

  const skip = async () => {
    if (!current) return
    updateMock(session.id, (m) => ({ turns: m.turns.filter((t) => t.id !== current.id) }))
    await nextQuestion()
  }

  const finish = async () => {
    setBusy('report')
    try {
      const report = await engine.mockReport(ctx, session.turns.filter((t) => t.score))
      updateMock(session.id, { report, status: 'completed', turns: session.turns.filter((t) => t.answer) })
      toast.success('Performance report ready.')
    } catch (e) { toast.error((e as Error).message) } finally { setBusy(null) }
  }

  const restart = () => { updateMock(session.id, { turns: [], report: undefined, status: 'active' }); started.current = false; void nextQuestion() }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2"><Link to="/app/mock" className="btn-base size-9 hover:bg-surface-2"><ArrowLeft className="size-4" /></Link><span className="text-xs text-muted">Mock interviews</span></div>
      <PageHeader eyebrow={<span className="flex items-center gap-2">{session.category}{session.englishCoach && <Badge tone="accent"><Languages className="size-3" /> English coach</Badge>}</span>} title={session.title}
        sub={session.status === 'completed' ? 'Completed — review your report below.' : `Question ${Math.min(turns.length, TOTAL)} of ~${TOTAL}. Answer as you would speak.`}
        action={session.status === 'active' ? <Button variant="secondary" icon={<Flag className="size-4" />} loading={busy === 'report'} disabled={!scored.length} onClick={finish}>Finish & get report</Button> : <Button variant="secondary" icon={<RotateCcw className="size-4" />} onClick={restart}>Practice again</Button>} />

      {session.status === 'completed' && session.report && (
        <Card className="mb-5 animate-pop">
          <SectionTitle sub={session.report.summary}>Interview Performance Report</SectionTitle>
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <ScoreRing value={session.report.overall} size={120} stroke={10} label="Overall score" />
            <div className="grid gap-4 md:grid-cols-2">
              <div><div className="label-caps mb-2 text-success">Strongest answers</div>{session.report.strongest.map((s, i) => <div key={i} className="text-sm mb-2"><b>{s.score}</b> · {s.question}<div className="text-xs text-muted">{s.why}</div></div>)}</div>
              <div><div className="label-caps mb-2 text-warn">Weakest answers</div>{session.report.weakest.map((s, i) => <div key={i} className="text-sm mb-2"><b>{s.score}</b> · {s.question}<div className="text-xs text-muted">{s.why}</div></div>)}</div>
              <div><div className="label-caps mb-2">Recommended improvements</div><ul className="text-sm space-y-1">{session.report.improvements.map((x, i) => <li key={i}>• {x}</li>)}</ul></div>
              <div><div className="label-caps mb-2">Questions to practice</div><ul className="text-sm space-y-1">{session.report.practiceQuestions.map((x, i) => <li key={i}>{i + 1}. {x}</li>)}</ul></div>
            </div>
          </div>
        </Card>
      )}

      {session.status === 'active' && (
        <Card className="mb-5">
          {current ? (
            <>
              <div className="flex items-center justify-between gap-2 mb-2"><div className="label-caps">Interviewer</div><Badge tone="accent">{QUESTION_TYPE_LABELS[current.type]}</Badge></div>
              <div className="text-lg font-semibold leading-snug">{current.question}</div>
              <Textarea className="mt-4" rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer as you would say it…" disabled={busy === 'score'} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') void submit() }} />
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <span className="text-xs text-muted">{wordCount(answer)} words · aim for 80–200 · Ctrl+Enter to submit</span>
                <div className="flex gap-2"><Button variant="ghost" size="sm" icon={<SkipForward className="size-4" />} onClick={skip} disabled={Boolean(busy)}>Skip</Button><Button size="sm" icon={<Send className="size-4" />} loading={busy === 'score'} disabled={answer.trim().length < 5} onClick={submit}>Submit answer</Button></div>
              </div>
            </>
          ) : <div className="flex items-center gap-2 text-sm text-muted py-6 justify-center"><Spinner /> {busy === 'question' ? 'The interviewer is thinking of the next question…' : 'Preparing…'}</div>}
        </Card>
      )}

      {scored.length > 0 && (
        <div className="space-y-3">
          <div className="label-caps">Scored answers</div>
          {[...scored].reverse().map((t) => (
            <Card key={t.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1"><Badge tone="accent">{QUESTION_TYPE_LABELS[t.type]}</Badge><div className="font-semibold mt-1.5">{t.question}</div><p className="text-sm text-ink-2 mt-2 whitespace-pre-wrap">{t.answer}</p></div>
                <ScoreRing value={t.score!.overall} size={64} />
              </div>
              <div className="grid sm:grid-cols-3 gap-x-6 gap-y-2 mt-4">
                {(['relevance', 'clarity', 'structure', 'confidence', 'naturalness', 'grammar', 'conciseness', 'examples', 'jobAlignment'] as const).map((d) => <Bar key={d} label={labelDim(d)} value={t.score![d]} />)}
              </div>
              <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm"><div className="label-caps mb-1">Feedback</div>{t.score!.feedback}</div>
              {t.score!.improvedAnswer && <div className="mt-2 rounded-xl bg-success-soft/60 p-3 text-sm"><div className="label-caps mb-1 text-success">Improved answer</div>{t.score!.improvedAnswer}</div>}
              {english[t.id] && <EnglishCard fb={english[t.id]} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function EnglishCard({ fb }: { fb: EnglishFeedback }) {
  return (
    <div className="mt-3 rounded-xl border border-line p-3">
      <div className="label-caps mb-2 flex items-center gap-1.5"><Languages className="size-3.5" /> English coach</div>
      <div className="grid sm:grid-cols-5 gap-3">{([['Grammar', fb.grammar], ['Vocabulary', fb.vocabulary], ['Fluency', fb.fluency], ['Naturalness', fb.naturalness], ['Professional', fb.professionalism]] as const).map(([l, v]) => <ScoreRing key={l} value={v} size={52} stroke={5} label={l} />)}</div>
      {fb.fillerWords.length > 0 && <div className="mt-3 text-xs"><span className="label-caps">Filler words:</span> {fb.fillerWords.join(', ')}</div>}
      {fb.corrections.length > 0 && <ul className="mt-2 text-sm space-y-1">{fb.corrections.map((c, i) => <li key={i}><span className="line-through text-muted">{c.original}</span> → <b>{c.better}</b> <span className="text-muted text-xs">— {c.why}</span></li>)}</ul>}
      <div className="mt-3 text-sm"><div className="label-caps mb-1">More natural version</div>{fb.naturalVersion}</div>
      <p className="text-xs text-muted mt-2">{fb.summary}</p>
    </div>
  )
}
