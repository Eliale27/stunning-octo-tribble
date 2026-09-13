import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic2, Plus, Trash2, Languages } from 'lucide-react'
import { useStore, selectActiveJob, selectActiveResume } from '@/store/useStore'
import { Badge, Button, Card, Confirm, EmptyState, Label, PageHeader, Select, Input } from '@/components/ui/Bits'
import type { MockCategory } from '@/lib/types'
import { timeAgo } from '@/lib/utils'

const CATS: { value: MockCategory; label: string; d: string }[] = [
  { value: 'mixed', label: 'Full simulation', d: 'Mixed HR, behavioral, technical and hiring-manager questions.' },
  { value: 'behavioral', label: 'Behavioral', d: 'STAR stories: conflict, failure, ownership, teamwork.' },
  { value: 'technical', label: 'Technical', d: 'Tools, concepts and problem solving for this role.' },
  { value: 'hr', label: 'HR / Recruiter', d: 'Motivation, salary, availability, culture fit.' },
  { value: 'hiring-manager', label: 'Hiring Manager', d: 'Impact, priorities, first 30 days.' },
  { value: 'english', label: 'English Interview Coach', d: 'International interview in English with language feedback.' },
]

export default function MockInterviews() {
  const nav = useNavigate()
  const sessions = useStore((s) => s.mockSessions)
  const jobs = useStore((s) => s.jobs)
  const resumes = useStore((s) => s.resumes)
  const activeJob = useStore(selectActiveJob)
  const activeResume = useStore(selectActiveResume)
  const addMock = useStore((s) => s.addMock)
  const deleteMock = useStore((s) => s.deleteMock)
  const [category, setCategory] = useState<MockCategory>('mixed')
  const [jobId, setJobId] = useState(activeJob?.id ?? '')
  const [resumeId, setResumeId] = useState(activeResume?.id ?? '')
  const [title, setTitle] = useState('')
  const [english, setEnglish] = useState(false)
  const [del, setDel] = useState<string | null>(null)

  const start = () => {
    const job = jobs.find((j) => j.id === jobId)
    const s = addMock({ title: title.trim() || `${CATS.find((c) => c.value === category)?.label}${job ? ` — ${job.title}` : ''}`, category, jobId: jobId || undefined, resumeId: resumeId || undefined, englishCoach: english || category === 'english' })
    nav(`/app/mock/${s.id}`)
  }

  return (
    <div>
      <PageHeader eyebrow="Mock Interviews" title="Practice with an AI interviewer" sub="One question at a time. Every answer gets a 0–100 score with feedback; at the end you get an Interview Performance Report." />
      <Card className="mb-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATS.map((c) => (
            <button key={c.value} onClick={() => setCategory(c.value)} className={`text-left rounded-2xl border p-4 transition ${category === c.value ? 'border-accent bg-accent-soft/50' : 'border-line hover:bg-surface-2'}`}>
              <div className="font-semibold text-sm flex items-center gap-2">{c.value === 'english' && <Languages className="size-4 text-accent" />}{c.label}</div><div className="text-xs text-muted mt-1">{c.d}</div>
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <div><Label>Title (optional)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Round 2 rehearsal" /></div>
          <div><Label>Job</Label><Select value={jobId} onChange={(e) => setJobId(e.target.value)}><option value="">No job (generic)</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}{j.company ? ` — ${j.company}` : ''}</option>)}</Select></div>
          <div><Label>Resume</Label><Select value={resumeId} onChange={(e) => setResumeId(e.target.value)}><option value="">Active resume</option>{resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={english || category === 'english'} disabled={category === 'english'} onChange={(e) => setEnglish(e.target.checked)} /> Add English coach feedback to every answer</label>
          <Button icon={<Mic2 className="size-4" />} onClick={start}>Start mock interview</Button>
        </div>
      </Card>

      {!sessions.length ? <EmptyState icon={<Plus className="size-6" />} title="No mock interviews yet" sub="Start one above — it takes about 10 minutes." /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {sessions.map((s) => (
            <Card key={s.id} className="group hover:shadow-lift transition">
              <div className="flex items-start justify-between gap-3">
                <Link to={`/app/mock/${s.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap"><Badge tone={s.status === 'completed' ? 'success' : 'accent'}>{s.status === 'completed' ? `Score ${s.report?.overall ?? '—'}` : 'In progress'}</Badge><Badge>{CATS.find((c) => c.value === s.category)?.label}</Badge><span className="text-xs text-muted">{timeAgo(s.updatedAt)}</span></div>
                  <div className="font-semibold mt-2 truncate">{s.title}</div>
                  <div className="text-xs text-muted">{s.turns.filter((t) => t.score).length} answers scored</div>
                </Link>
                <button className="text-muted hover:text-danger opacity-0 group-hover:opacity-100" onClick={() => setDel(s.id)}><Trash2 className="size-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Confirm open={Boolean(del)} title="Delete this mock interview?" onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteMock(del); setDel(null) }} />
    </div>
  )
}
