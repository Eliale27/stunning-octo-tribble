import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, MessagesSquare, Trash2, Sparkles, GraduationCap } from 'lucide-react'
import { useStore, selectActiveJob, selectActiveResume } from '@/store/useStore'
import { Button, Card, Confirm, EmptyState, Input, Label, PageHeader, Select, Badge, Tabs } from '@/components/ui/Bits'
import { timeAgo } from '@/lib/utils'

export default function Interviews() {
  const nav = useNavigate()
  const interviews = useStore((s) => s.interviews)
  const jobs = useStore((s) => s.jobs)
  const resumes = useStore((s) => s.resumes)
  const companies = useStore((s) => s.companies)
  const addInterview = useStore((s) => s.addInterview)
  const deleteInterview = useStore((s) => s.deleteInterview)
  const activeJob = useStore(selectActiveJob)
  const activeResume = useStore(selectActiveResume)
  const [creating, setCreating] = useState(false)
  const [mode, setMode] = useState<'copilot' | 'practice'>('copilot')
  const [title, setTitle] = useState('')
  const [jobId, setJobId] = useState(activeJob?.id ?? '')
  const [resumeId, setResumeId] = useState(activeResume?.id ?? '')
  const [companyId, setCompanyId] = useState('')
  const [del, setDel] = useState<string | null>(null)

  const create = () => {
    const job = jobs.find((j) => j.id === jobId)
    const i = addInterview({ title: title.trim() || (job ? `${job.title}${job.company ? ` — ${job.company}` : ''}` : 'Interview'), mode, jobId: jobId || undefined, resumeId: resumeId || undefined, companyId: companyId || undefined })
    nav(`/app/interviews/${i.id}`)
  }

  return (
    <div>
      <PageHeader eyebrow="Interviews" title="Interview memory" sub="Each interview keeps its own context: company, job, resume, questions, answers and feedback. Come back anytime to continue practicing."
        action={<Button onClick={() => setCreating((c) => !c)} icon={<Plus className="size-4" />}>New interview</Button>} />

      {creating && (
        <Card className="mb-5 animate-pop">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Label>Mode</Label><Tabs value={mode} onChange={setMode} items={[{ value: 'copilot', label: <span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> Interview Copilot</span> }, { value: 'practice', label: <span className="flex items-center gap-1.5"><GraduationCap className="size-3.5" /> Practice</span> }]} />
              <p className="text-xs text-muted mt-2">{mode === 'copilot' ? 'Real-time assistance during interviews where AI use is permitted by the process. Opens in a separate Copilot window.' : 'Analyze questions and rehearse answers at your own pace.'}</p></div>
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Final round — Acme Corp" /></div>
            <div><Label>Job</Label><Select value={jobId} onChange={(e) => setJobId(e.target.value)}><option value="">No job selected</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}{j.company ? ` — ${j.company}` : ''}</option>)}</Select></div>
            <div><Label>Resume</Label><Select value={resumeId} onChange={(e) => setResumeId(e.target.value)}><option value="">Active resume</option>{resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></div>
            <div><Label>Company research</Label><Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}><option value="">Auto-detect from job</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
          </div>
          <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button><Button onClick={create}>Create</Button></div>
        </Card>
      )}

      {!interviews.length ? (
        <EmptyState icon={<MessagesSquare className="size-6" />} title="No interviews yet" sub="Create one to start the Copilot or practice with context from your resume and the job." action={<Button onClick={() => setCreating(true)} icon={<Plus className="size-4" />}>New interview</Button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {interviews.map((i) => {
            const job = jobs.find((j) => j.id === i.jobId)
            return (
              <Card key={i.id} className="hover:shadow-lift transition group">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/app/interviews/${i.id}`} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><Badge tone={i.mode === 'copilot' ? 'accent' : 'violet'}>{i.mode === 'copilot' ? 'Copilot' : 'Practice'}</Badge><span className="text-xs text-muted">{timeAgo(i.updatedAt)}</span></div>
                    <div className="font-semibold mt-2 truncate">{i.title}</div>
                    <div className="text-xs text-muted mt-0.5">{job ? `${job.title}${job.company ? ` · ${job.company}` : ''}` : 'No job linked'} · {i.turns.length} question{i.turns.length === 1 ? '' : 's'}</div>
                  </Link>
                  <button className="text-muted hover:text-danger opacity-0 group-hover:opacity-100" onClick={() => setDel(i.id)}><Trash2 className="size-4" /></button>
                </div>
                {i.turns.length > 0 && <div className="mt-3 text-xs text-ink-2 line-clamp-2">Last: {i.turns[i.turns.length - 1].question}</div>}
              </Card>
            )
          })}
        </div>
      )}
      <Confirm open={Boolean(del)} title="Delete this interview?" body="Questions, answers and feedback for this interview will be permanently removed from this device." onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteInterview(del); setDel(null) }} />
    </div>
  )
}
