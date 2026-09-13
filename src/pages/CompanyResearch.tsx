import { useState } from 'react'
import { Building2, Trash2, Sparkles, Copy } from 'lucide-react'
import { useStore, selectActiveJob, selectActiveResume } from '@/store/useStore'
import { useEngine, useInterviewContext } from '@/lib/hooks'
import { Badge, Button, Card, Chips, Confirm, EmptyState, Input, Label, PageHeader, SectionTitle, Textarea } from '@/components/ui/Bits'
import { toast } from '@/components/ui/Toasts'
import { fetchPublicUrl } from '@/lib/parsers'
import { timeAgo } from '@/lib/utils'

export default function CompanyResearch() {
  const companies = useStore((s) => s.companies)
  const addCompany = useStore((s) => s.addCompany)
  const deleteCompany = useStore((s) => s.deleteCompany)
  const job = useStore(selectActiveJob)
  const resume = useStore(selectActiveResume)
  const engine = useEngine()
  const ctx = useInterviewContext(job ? { jobId: job.id, resumeId: resume?.id, turns: [] } : undefined)
  const [name, setName] = useState(job?.company ?? '')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<string | null>(companies[0]?.id ?? null)
  const [del, setDel] = useState<string | null>(null)

  const research = async () => {
    if (!name.trim()) { toast.error('Enter the company name.'); return }
    setBusy(true)
    try {
      let source = notes.trim()
      if (url.trim()) {
        try { const r = await fetchPublicUrl(url.trim()); source = `${r.title ? `${r.title}\n` : ''}${r.text}\n\n${source}` } catch (e) { toast.info(`Could not fetch the URL (${(e as Error).message}). Continuing with the name and notes.`) }
      }
      const draft = await engine.researchCompany(name.trim(), source || undefined, ctx)
      const c = addCompany({ ...draft, name: name.trim(), sourceUrl: url.trim() || undefined })
      setOpen(c.id); setNotes(''); setUrl('')
      toast.success('Company intelligence ready.')
    } catch (e) { toast.error((e as Error).message) } finally { setBusy(false) }
  }

  return (
    <div>
      <PageHeader eyebrow="Company Research" title="Company Intelligence" sub="Overview, products, values, culture, role expectations, likely topics — and a “Why do you want to work here?” answer grounded in your real profile." />
      <Card className="mb-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>Company name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" /></div>
          <div><Label hint="optional">Public URL (website, careers or about page)</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></div>
          <div className="md:col-span-2"><Label hint="optional">Paste source text (about page, news, job page)</Label><Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you know or copied about the company. The AI only uses this plus well-known public facts — and says when it's unsure." /></div>
        </div>
        <div className="flex justify-end mt-3"><Button loading={busy} icon={<Sparkles className="size-4" />} onClick={research}>Research company</Button></div>
      </Card>

      {!companies.length ? <EmptyState icon={<Building2 className="size-6" />} title="No company research yet" /> : (
        <div className="space-y-3">
          {companies.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <button className="text-left flex-1 min-w-0" onClick={() => setOpen(open === c.id ? null : c.id)}>
                  <div className="flex items-center gap-2 flex-wrap"><Badge>{c.industry}</Badge><span className="text-xs text-muted">{timeAgo(c.createdAt)}</span></div>
                  <div className="font-semibold mt-1.5 text-lg">{c.name}</div>
                </button>
                <button className="text-muted hover:text-danger" onClick={() => setDel(c.id)}><Trash2 className="size-4" /></button>
              </div>
              {open === c.id && (
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2 text-sm text-ink-2 leading-relaxed">{c.overview}</div>
                  <div><SectionTitle>Products</SectionTitle><Chips items={c.products} /></div>
                  <div><SectionTitle>Values</SectionTitle><Chips items={c.values} tone="violet" /></div>
                  <div><SectionTitle>Culture</SectionTitle><Chips items={c.culture} tone="accent" /></div>
                  <div><SectionTitle>Role expectations</SectionTitle><ul className="text-sm space-y-1">{c.roleExpectations.map((r, i) => <li key={i}>• {r}</li>)}{!c.roleExpectations.length && <li className="text-muted">—</li>}</ul></div>
                  <div><SectionTitle>Likely interview topics</SectionTitle><Chips items={c.likelyTopics} tone="success" /></div>
                  <div><SectionTitle>Potential questions</SectionTitle><ul className="text-sm space-y-1">{c.potentialQuestions.map((q, i) => <li key={i}>{i + 1}. {q}</li>)}</ul></div>
                  <div className="lg:col-span-2 rounded-2xl bg-accent-soft/50 border border-accent/20 p-4">
                    <div className="flex items-center justify-between mb-2"><div className="label-caps text-accent-ink">Why do you want to work here?</div><Button size="xs" variant="ghost" icon={<Copy className="size-3" />} onClick={() => { void navigator.clipboard.writeText(c.whyWorkHere); toast.success('Copied') }}>Copy</Button></div>
                    <p className="text-[15px] leading-relaxed">{c.whyWorkHere}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <Confirm open={Boolean(del)} title="Delete this research?" onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteCompany(del); setDel(null) }} />
    </div>
  )
}
