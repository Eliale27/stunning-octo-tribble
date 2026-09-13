import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useStore, selectActiveJob, selectActiveResume, matchKey } from '@/store/useStore'
import { computeStats, labelDim } from '@/lib/stats'
import { Card, Chips, EmptyState, PageHeader, ScoreRing, SectionTitle, Bar } from '@/components/ui/Bits'

export default function Performance() {
  const interviews = useStore((s) => s.interviews)
  const mocks = useStore((s) => s.mockSessions)
  const resume = useStore(selectActiveResume)
  const job = useStore(selectActiveJob)
  const matches = useStore((s) => s.matches)
  const stats = computeStats(interviews, mocks, resume?.kb, job?.analysis, matches[matchKey(resume?.id, job?.id)])
  const radar = Object.entries(stats.dimensionAverages).map(([k, v]) => ({ dim: labelDim(k), value: v }))
  const hasScores = mocks.some((m) => m.turns.some((t) => t.score))

  return (
    <div>
      <PageHeader eyebrow="Performance" title="Interview analytics" sub="Scores across mock interviews, your strongest dimensions and what to practice next." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-4">
        <Card><div className="label-caps">Interviews practiced</div><div className="text-3xl font-bold mt-1">{stats.interviewsPracticed}</div></Card>
        <Card><div className="label-caps">Questions answered</div><div className="text-3xl font-bold mt-1">{stats.questionsAnswered}</div></Card>
        <Card><div className="label-caps">Average score</div><div className="text-3xl font-bold mt-1">{stats.averageScore || '—'}</div></Card>
        <Card className="flex items-center justify-between"><div><div className="label-caps">Readiness</div><div className="text-xs text-muted mt-1">{stats.readinessNote}</div></div><ScoreRing value={stats.readiness} size={60} /></Card>
      </div>
      {!hasScores ? <EmptyState icon={<BarChart3 className="size-6" />} title="No scored answers yet" sub="Run a mock interview to see your performance breakdown." action={<Link to="/app/mock" className="btn-base bg-accent text-white h-10 px-4">Start a mock interview</Link>} /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><SectionTitle>Skill profile</SectionTitle>
            <div className="h-72"><ResponsiveContainer><RadarChart data={radar} outerRadius="75%"><PolarGrid stroke="var(--line-2)" /><PolarAngleAxis dataKey="dim" tick={{ fill: 'var(--muted)', fontSize: 11 }} /><Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} /></RadarChart></ResponsiveContainer></div>
          </Card>
          <Card><SectionTitle>Score over time</SectionTitle>
            <div className="h-72"><ResponsiveContainer><LineChart data={stats.scoreHistory.map((s, i) => ({ ...s, n: `#${i + 1}` }))}><CartesianGrid stroke="var(--line)" vertical={false} /><XAxis dataKey="n" tick={{ fill: 'var(--muted)', fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} width={28} /><Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }} labelFormatter={(_, p) => (p?.[0]?.payload as { label?: string })?.label ?? ''} /><Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--accent)' }} /></LineChart></ResponsiveContainer></div>
          </Card>
          <Card><SectionTitle>Dimension averages</SectionTitle><div className="grid gap-2">{radar.map((r) => <Bar key={r.dim} label={r.dim} value={r.value} />)}</div></Card>
          <div className="grid gap-4">
            <Card><SectionTitle>Strongest skills</SectionTitle><Chips items={stats.strongest} tone="success" /></Card>
            <Card><SectionTitle>Skills to improve</SectionTitle><Chips items={stats.toImprove} tone="warn" /></Card>
          </div>
        </div>
      )}
    </div>
  )
}
