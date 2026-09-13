import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Plus, Trash2, Link2, FileText, Upload } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useEngine } from '@/lib/hooks'
import { Badge, Button, Card, Confirm, EmptyState, Input, Label, PageHeader, Tabs, Textarea } from '@/components/ui/Bits'
import { toast } from '@/components/ui/Toasts'
import { extractText, fetchPublicUrl } from '@/lib/parsers'
import { timeAgo } from '@/lib/utils'

export default function Jobs() {
  const nav = useNavigate()
  const jobs = useStore((s) => s.jobs)
  const activeJobId = useStore((s) => s.activeJobId)
  const addJob = useStore((s) => s.addJob)
  const deleteJob = useStore((s) => s.deleteJob)
  const setActiveJob = useStore((s) => s.setActiveJob)
  const matches = useStore((s) => s.matches)
  const engine = useEngine()
  const [adding, setAdding] = useState(jobs.length === 0)
  const [tab, setTab] = useState<'paste' | 'url' | 'pdf'>('paste')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [del, setDel] = useState<string | null>(null)

  const analyze = async (raw: string, sourceUrl?: string) => {
    if (raw.trim().length < 60) { toast.error('Please provide a fuller job description.'); return }
    setBusy(true)
    try {
      const analysis = await engine.analyzeJob(raw)
      const job = addJob({ title: analysis.title || 'Untitled role', company: analysis.company || '', rawText: raw, sourceUrl, analysis })
      toast.success('Job analyzed.')
      nav(`/app/jobs/${job.id}`)
    } catch (e) { toast.error((e as Error).message) } finally { setBusy(false) }
  }

  const fromUrl = async () => {
    setBusy(true)
    try {
      const r = await fetchPublicUrl(url.trim())
      await analyze(r.text, url.trim())
    } catch (e) { toast.error(`${(e as Error).message} (URL fetch needs the API server running.)`); setBusy(false) }
  }

  return (
    <div>
      <PageHeader eyebrow="My Jobs" title="Job Analyzer" sub="Paste a job description, upload a PDF or add a public URL. We extract what the company is looking for and what the interviewer is likely to ask."
        action={<Button icon={<Plus className="size-4" />} onClick={() => setAdding((a) => !a)}>Add job</Button>} />

      {adding && (
        <Card className="mb-5 animate-pop">
          <Tabs value={tab} onChange={setTab} items={[{ value: 'paste', label: <span className="flex items-center gap-1.5"><FileText className="size-3.5" /> Paste</span> }, { value: 'url', label: <span className="flex items-center gap-1.5"><Link2 className="size-3.5" /> Public URL</span> }, { value: 'pdf', label: <span className="flex items-center gap-1.5"><Upload className="size-3.5" /> PDF</span> }]} />
          <div className="mt-4">
            {tab === 'paste' && <><Textarea rows={12} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the full job description…" /><div className="flex justify-end mt-3"><Button loading={busy} onClick={() => void analyze(text)}>Analyze job</Button></div></>}
            {tab === 'url' && <><Label>Job posting URL</Label><div className="flex gap-2"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /><Button loading={busy} onClick={() => void fromUrl()}>Fetch & analyze</Button></div><p className="text-xs text-muted mt-2">Fetched through the local API server. Pages behind a login can't be read — paste the text instead.</p></>}
            {tab === 'pdf' && <label className="block rounded-2xl border-2 border-dashed border-line-2 hover:border-accent p-8 text-center cursor-pointer"><input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setBusy(true); try { const { text: t } = await extractText(f); await analyze(t) } catch (err) { toast.error((err as Error).message); setBusy(false) } }} /><Upload className="size-6 mx-auto text-accent" /><div className="font-semibold mt-2">{busy ? 'Analyzing…' : 'Choose a PDF / DOCX / TXT'}</div></label>}
          </div>
        </Card>
      )}

      {!jobs.length ? (!adding && <EmptyState icon={<Briefcase className="size-6" />} title="No jobs yet" action={<Button onClick={() => setAdding(true)}>Add a job</Button>} />) : (
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((j) => {
            const m = Object.entries(matches).find(([k]) => k.endsWith(`:${j.id}`))?.[1]
            return (
              <Card key={j.id} className="hover:shadow-lift transition group">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/app/jobs/${j.id}`} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">{j.id === activeJobId && <Badge tone="accent">Active</Badge>}<Badge>{j.analysis.seniority}</Badge>{m && <Badge tone={m.overall >= 75 ? 'success' : m.overall >= 50 ? 'warn' : 'danger'}>Match {m.overall}%</Badge>}</div>
                    <div className="font-semibold mt-2 truncate">{j.title}</div>
                    <div className="text-xs text-muted">{j.company || 'Company not stated'} · {timeAgo(j.createdAt)}</div>
                  </Link>
                  <div className="flex flex-col items-end gap-2">{j.id !== activeJobId && <Button size="xs" variant="ghost" onClick={() => setActiveJob(j.id)}>Set active</Button>}<button className="text-muted hover:text-danger opacity-0 group-hover:opacity-100" onClick={() => setDel(j.id)}><Trash2 className="size-4" /></button></div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">{j.analysis.skills.slice(0, 6).map((s) => <Badge key={s}>{s}</Badge>)}</div>
              </Card>
            )
          })}
        </div>
      )}
      <Confirm open={Boolean(del)} title="Delete this job?" onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteJob(del); setDel(null) }} />
    </div>
  )
}
