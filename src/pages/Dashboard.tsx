import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, FileUser, Briefcase, Mic2, MessagesSquare, Puzzle, Sparkles, CheckCircle2, Circle } from 'lucide-react'
import { useStore, selectActiveJob, selectActiveResume, matchKey } from '@/store/useStore'
import { Button, Card, PageHeader, ScoreRing, Chips, SectionTitle, Badge } from '@/components/ui/Bits'
import { computeStats } from '@/lib/stats'
import { timeAgo } from '@/lib/utils'

export default function Dashboard() {
  const nav = useNavigate()
  const resume = useStore(selectActiveResume)
  const job = useStore(selectActiveJob)
  const interviews = useStore((s) => s.interviews)
  const mocks = useStore((s) => s.mockSessions)
  const matches = useStore((s) => s.matches)
  const addInterview = useStore((s) => s.addInterview)
  const stats = computeStats(interviews, mocks, resume?.kb, job?.analysis, matches[matchKey(resume?.id, job?.id)])
  const match = matches[matchKey(resume?.id, job?.id)]

  const steps = [
    { done: Boolean(resume), label: 'Upload resume', to: '/app/resume' },
    { done: Boolean(job), label: 'Add a job', to: '/app/jobs' },
    { done: Boolean(match), label: 'Review resume ↔ job match', to: job ? `/app/jobs/${job.id}` : '/app/jobs' },
    { done: mocks.length > 0, label: 'Run a mock interview', to: '/app/mock' },
    { done: interviews.length > 0, label: 'Open the Copilot', to: '/app/interviews' },
  ]

  const startCopilot = () => {
    const i = addInterview({ title: job ? `${job.title} — ${job.company || 'Interview'}` : 'Interview', mode: 'copilot', jobId: job?.id, resumeId: resume?.id })
    nav(`/app/interviews/${i.id}`)
  }

  return (
    <div>
      <PageHeader eyebrow="Dashboard" title={resume?.kb.name ? `Welcome back, ${resume.kb.name.split(' ')[0]}` : 'Your interview command center'}
        sub={job ? <>Preparing for <b>{job.title}</b>{job.company ? <> at <b>{job.company}</b></> : null}.</> : 'Upload your resume and add a job to unlock personalized preparation.'}
        action={<><Link to="/app/mock"><Button variant="secondary" icon={<Mic2 className="size-4" />}>Mock interview</Button></Link><Button onClick={startCopilot} icon={<Sparkles className="size-4" />}>Start Copilot</Button></>} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Interviews practiced" value={stats.interviewsPracticed} />
        <Stat label="Questions answered" value={stats.questionsAnswered} />
        <Stat label="Average score" value={stats.averageScore ? `${stats.averageScore}` : '—'} />
        <Card className="flex items-center justify-between"><div><div className="label-caps">Interview readiness</div><div className="text-xs text-muted mt-1 max-w-[150px]">{stats.readinessNote}</div></div><ScoreRing value={stats.readiness} size={64} /></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-4">
        <Card className="lg:col-span-2">
          <SectionTitle sub="The recommended flow — each step unlocks the next.">Preparation flow</SectionTitle>
          <ol className="grid sm:grid-cols-2 gap-2">
            {steps.map((s, i) => (
              <li key={s.label}><Link to={s.to} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 hover:bg-surface-2 transition">
                {s.done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted" />}<span className="text-sm font-medium flex-1">{i + 1}. {s.label}</span><ArrowRight className="size-3.5 text-muted" />
              </Link></li>
            ))}
          </ol>
        </Card>
        <Card>
          <SectionTitle>Resume ↔ Job match</SectionTitle>
          {match ? (
            <div className="flex items-center gap-4"><ScoreRing value={match.overall} size={84} label="Overall" /><div className="text-sm space-y-1 text-ink-2"><div>Experience <b>{match.experience}%</b></div><div>Skills <b>{match.skills}%</b></div><div>Requirements <b>{match.requirements}%</b></div><Link to={job ? `/app/jobs/${job.id}` : '/app/jobs'} className="text-accent-ink text-xs font-semibold">See details →</Link></div></div>
          ) : <p className="text-sm text-muted">{resume && job ? <Link className="text-accent-ink font-semibold" to={`/app/jobs/${job.id}`}>Compute the match →</Link> : 'Add a resume and a job to see your match score.'}</p>}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-4">
        <Card>
          <SectionTitle>Strongest skills</SectionTitle>
          <Chips items={stats.strongest} tone="success" max={10} />
        </Card>
        <Card>
          <SectionTitle>Skills to improve</SectionTitle>
          <Chips items={stats.toImprove} tone="warn" max={10} />
        </Card>
        <Card>
          <SectionTitle>Quick actions</SectionTitle>
          <div className="grid gap-2">
            {[{ to: '/app/resume', i: FileUser, t: resume ? 'Review your knowledge base' : 'Upload your resume' }, { to: '/app/jobs', i: Briefcase, t: 'Analyze a job' }, { to: '/app/challenges', i: Puzzle, t: 'Solve an exercise' }, { to: '/app/interviews', i: MessagesSquare, t: 'Interview memory' }].map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-2 text-sm font-medium"><a.i className="size-4 text-accent" />{a.t}</Link>
            ))}
          </div>
        </Card>
      </div>

      {(interviews.length > 0 || mocks.length > 0) && (
        <Card className="mt-4">
          <SectionTitle>Recent activity</SectionTitle>
          <div className="divide-y divide-line">
            {[...interviews.map((i) => ({ id: i.id, title: i.title, when: i.updatedAt, kind: 'Interview', to: `/app/interviews/${i.id}`, n: `${i.turns.length} questions` })), ...mocks.map((m) => ({ id: m.id, title: m.title, when: m.updatedAt, kind: 'Mock', to: `/app/mock/${m.id}`, n: m.report ? `Score ${m.report.overall}` : `${m.turns.filter((t) => t.score).length} scored` }))]
              .sort((a, b) => b.when - a.when).slice(0, 6).map((r) => (
                <Link key={r.id} to={r.to} className="flex items-center gap-3 py-2.5 text-sm hover:text-accent-ink"><Badge tone={r.kind === 'Mock' ? 'violet' : 'accent'}>{r.kind}</Badge><span className="flex-1 font-medium truncate">{r.title}</span><span className="text-muted text-xs">{r.n}</span><span className="text-muted text-xs">{timeAgo(r.when)}</span></Link>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return <Card><div className="label-caps">{label}</div><div className="text-3xl font-bold tracking-tight mt-1 tabular-nums">{value}</div></Card>
}
