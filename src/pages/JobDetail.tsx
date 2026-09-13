import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Sparkles, RefreshCw, Mic2, ExternalLink } from 'lucide-react'
import { useStore, selectActiveResume, matchKey } from '@/store/useStore'
import { useEngine, useInterviewContext } from '@/lib/hooks'
import { computeMatch } from '@/lib/match'
import { Badge, Button, Card, Chips, PageHeader, ScoreRing, Bar, SectionTitle } from '@/components/ui/Bits'
import { toast } from '@/components/ui/Toasts'

export default function JobDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const job = useStore((s) => s.jobs.find((j) => j.id === id))
  const resume = useStore(selectActiveResume)
  const matches = useStore((s) => s.matches)
  const setMatch = useStore((s) => s.setMatch)
  const setActiveJob = useStore((s) => s.setActiveJob)
  const addInterview = useStore((s) => s.addInterview)
  const settings = useStore((s) => s.settings)
  const engine = useEngine()
  const ctx = useInterviewContext(job ? { jobId: job.id, resumeId: resume?.id, turns: [] } : undefined)
  const key = matchKey(resume?.id, job?.id)
  const match = matches[key]
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (!job) nav('/app/jobs', { replace: true }) }, [job, nav])
  useEffect(() => {
    if (job && resume && !match) setMatch(resume.id, job.id, computeMatch(resume.kb, job.analysis))
  }, [job, resume, match, setMatch])
  if (!job) return null
  const a = job.analysis

  const enrich = async () => {
    if (!resume) return
    setBusy(true)
    try {
      const base = computeMatch(resume.kb, a)
      const m = settings.aiMode === 'offline' ? base : await engine.enrichMatch(ctx, base)
      setMatch(resume.id, job.id, m)
      toast.success(settings.aiMode === 'offline' ? 'Match recomputed locally.' : 'Match enriched by AI.')
    } catch (e) { toast.error((e as Error).message) } finally { setBusy(false) }
  }

  const start = (mode: 'copilot' | 'practice') => {
    setActiveJob(job.id)
    const i = addInterview({ title: `${job.title}${job.company ? ` — ${job.company}` : ''}`, mode, jobId: job.id, resumeId: resume?.id })
    nav(`/app/interviews/${i.id}`)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2"><Link to="/app/jobs" className="btn-base size-9 hover:bg-surface-2"><ArrowLeft className="size-4" /></Link><span className="text-xs text-muted">Back to jobs</span></div>
      <PageHeader eyebrow={<span className="flex items-center gap-2">{a.seniority}{job.sourceUrl && <a href={job.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent-ink normal-case tracking-normal font-medium"><ExternalLink className="size-3" /> source</a>}</span>} title={job.title} sub={job.company || 'Company not stated in the description'}
        action={<><Link to="/app/mock"><Button variant="secondary" icon={<Mic2 className="size-4" />}>Mock interview</Button></Link><Button variant="secondary" onClick={() => start('practice')}>Practice</Button><Button icon={<Sparkles className="size-4" />} onClick={() => start('copilot')}>Start Copilot</Button></>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle sub={resume ? `Comparing “${resume.name}” with this job.` : 'Upload a resume to compute your match.'} action={resume && <Button size="sm" variant="secondary" loading={busy} icon={<RefreshCw className="size-4" />} onClick={enrich}>{settings.aiMode === 'offline' ? 'Recompute' : 'Enrich with AI'}</Button>}>Resume ↔ Job match</SectionTitle>
          {match ? (
            <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
              <ScoreRing value={match.overall} size={120} stroke={10} label="Overall match" />
              <div className="grid gap-3">
                <Bar label="Experience match" value={match.experience} /><Bar label="Skills match" value={match.skills} /><Bar label="Education match" value={match.education} /><Bar label="Language match" value={match.language} /><Bar label="Requirements match" value={match.requirements} />
              </div>
            </div>
          ) : <p className="text-sm text-muted">No resume on file. <Link className="text-accent-ink font-semibold" to="/app/resume">Add one →</Link></p>}
        </Card>
        <Card>
          <SectionTitle>Recommended talking points</SectionTitle>
          {match?.talkingPoints.length ? <ul className="space-y-2">{match.talkingPoints.map((t, i) => <li key={i} className="text-sm"><div className="font-medium">{t.label}</div><div className="text-muted text-xs">{t.why}</div></li>)}</ul> : <p className="text-sm text-muted">—</p>}
        </Card>
      </div>

      {match && (
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <Card><SectionTitle>Strong matches</SectionTitle>{match.strongMatches.length ? <ul className="space-y-2">{match.strongMatches.map((m, i) => <li key={i} className="text-sm flex gap-2"><Badge tone="success" className="shrink-0 max-w-[40%] truncate">{m.label}</Badge><span className="text-muted text-xs">{m.evidence}</span></li>)}</ul> : <p className="text-sm text-muted">No direct matches detected yet.</p>}</Card>
          <Card><SectionTitle sub="Requirements not found in your resume. Prepare an honest answer or add the experience if you have it.">Potential gaps</SectionTitle><Chips items={match.gaps} tone="warn" /></Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card><SectionTitle>What the company is looking for</SectionTitle><ul className="space-y-1.5">{a.companyWants.map((w, i) => <li key={i} className="text-sm flex gap-2"><span className="text-accent">▸</span>{w}</li>)}</ul></Card>
        <Card><SectionTitle>What the interviewer is likely to ask</SectionTitle><ol className="space-y-1.5">{a.likelyQuestions.map((q, i) => <li key={i} className="text-sm flex gap-2"><span className="text-muted tabular-nums">{i + 1}.</span>{q}</li>)}</ol></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <Card><SectionTitle>Responsibilities</SectionTitle><ul className="space-y-1 text-sm text-ink-2">{a.responsibilities.map((r, i) => <li key={i}>• {r}</li>)}</ul></Card>
        <Card><SectionTitle>Must-have</SectionTitle><ul className="space-y-1 text-sm text-ink-2">{a.mustHave.map((r, i) => <li key={i}>• {r}</li>)}</ul><div className="label-caps mt-4 mb-1">Nice-to-have</div><ul className="space-y-1 text-sm text-muted">{a.niceToHave.map((r, i) => <li key={i}>• {r}</li>)}{!a.niceToHave.length && <li>—</li>}</ul></Card>
        <Card className="space-y-3">
          <div><div className="label-caps mb-1">Skills</div><Chips items={a.skills} tone="accent" /></div>
          <div><div className="label-caps mb-1">Soft skills</div><Chips items={a.softSkills} tone="violet" /></div>
          <div><div className="label-caps mb-1">Languages</div><Chips items={a.languages} /></div>
          <div><div className="label-caps mb-1">Competencies evaluated</div><Chips items={a.competencies} tone="success" /></div>
          <div><div className="label-caps mb-1">Keywords</div><Chips items={a.keywords} max={14} /></div>
        </Card>
      </div>
    </div>
  )
}
