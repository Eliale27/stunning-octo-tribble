import { useRef, useState } from 'react'
import { Upload, FileText, Trash2, Plus, X, Save, RefreshCw, ShieldCheck } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useEngine } from '@/lib/hooks'
import { extractText } from '@/lib/parsers'
import { Button, Card, Confirm, EmptyState, Input, Label, PageHeader, SectionTitle, Select, Tabs, Textarea, Badge } from '@/components/ui/Bits'
import { toast } from '@/components/ui/Toasts'
import type { CandidateKnowledgeBase, Experience, EducationItem, ProjectItem } from '@/lib/types'
import { uid, formatDate } from '@/lib/utils'

export default function ResumePage() {
  const resumes = useStore((s) => s.resumes)
  const activeId = useStore((s) => s.activeResumeId)
  const addResume = useStore((s) => s.addResume)
  const updateResume = useStore((s) => s.updateResume)
  const deleteResume = useStore((s) => s.deleteResume)
  const setActive = useStore((s) => s.setActiveResume)
  const engine = useEngine()
  const resume = resumes.find((r) => r.id === activeId) ?? resumes[0]
  const [tab, setTab] = useState<'upload' | 'paste'>('upload')
  const [pasted, setPasted] = useState('')
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(resumes.length === 0)
  const [del, setDel] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const analyze = async (text: string, name: string, source: 'pdf' | 'docx' | 'txt' | 'paste') => {
    if (text.trim().length < 80) { toast.error('That looks too short to be a resume.'); return }
    setBusy(true)
    try {
      const kb = await engine.analyzeResume(text)
      addResume({ name, rawText: text, kb, source })
      setAdding(false); setPasted('')
      toast.success('Resume analyzed — review and edit your knowledge base below.')
    } catch (e) { toast.error(`Could not analyze: ${(e as Error).message}`) } finally { setBusy(false) }
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setBusy(true)
    try {
      const { text, source } = await extractText(f)
      await analyze(text, f.name.replace(/\.[^.]+$/, ''), source)
    } catch (e) { toast.error((e as Error).message); setBusy(false) }
  }

  const reanalyze = async () => {
    if (!resume) return
    setBusy(true)
    try { updateResume(resume.id, { kb: await engine.analyzeResume(resume.rawText) }); toast.success('Knowledge base rebuilt.') } catch (e) { toast.error((e as Error).message) } finally { setBusy(false) }
  }

  return (
    <div>
      <PageHeader eyebrow="My Resume" title="Candidate Knowledge Base" sub="Your resume becomes structured knowledge the AI answers from. Review everything — the AI never invents experiences, so what's here is what it can use."
        action={<>{resumes.length > 0 && <Button variant="secondary" icon={<Plus className="size-4" />} onClick={() => setAdding((a) => !a)}>Add resume</Button>}{resume && <Button variant="secondary" loading={busy} icon={<RefreshCw className="size-4" />} onClick={reanalyze}>Re-analyze</Button>}</>} />

      {adding && (
        <Card className="mb-5 animate-pop">
          <div className="flex items-center justify-between mb-4"><Tabs value={tab} onChange={setTab} items={[{ value: 'upload', label: 'Upload file' }, { value: 'paste', label: 'Paste text' }]} />{resumes.length > 0 && <button onClick={() => setAdding(false)} className="text-muted hover:text-ink"><X className="size-4" /></button>}</div>
          {tab === 'upload' ? (
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void onFile(e.dataTransfer.files[0]) }} onClick={() => fileRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-line-2 hover:border-accent hover:bg-accent-soft/40 transition cursor-pointer p-10 text-center">
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,application/pdf" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
              <Upload className="size-8 mx-auto text-accent" />
              <div className="font-semibold mt-3">{busy ? 'Analyzing…' : 'Drop your resume here or click to browse'}</div>
              <div className="text-sm text-muted mt-1">PDF, DOCX or TXT · parsed locally in your browser</div>
            </div>
          ) : (
            <div>
              <Textarea rows={12} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Paste your full resume text…" />
              <div className="flex justify-end mt-3"><Button loading={busy} onClick={() => void analyze(pasted, 'Pasted resume', 'paste')}>Analyze resume</Button></div>
            </div>
          )}
          <p className="text-xs text-muted mt-3 flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Resumes are confidential: stored only in this browser and sent to the model solely to generate your answers.</p>
        </Card>
      )}

      {!resume ? (!adding && <EmptyState icon={<FileText className="size-6" />} title="No resume yet" action={<Button onClick={() => setAdding(true)}>Add your resume</Button>} />) : (
        <>
          {resumes.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">{resumes.map((r) => <button key={r.id} onClick={() => setActive(r.id)} className={`rounded-xl border px-3 py-1.5 text-sm font-medium ${r.id === resume.id ? 'bg-accent-soft border-transparent text-accent-ink' : 'border-line hover:bg-surface-2'}`}>{r.name}</button>)}</div>
          )}
          <KBEditor key={resume.id} kb={resume.kb} meta={<span>{resume.name} · {resume.source.toUpperCase()} · updated {formatDate(resume.updatedAt)}</span>} onSave={(kb) => { updateResume(resume.id, { kb }); toast.success('Knowledge base saved.') }} onDelete={() => setDel(true)} />
          <Confirm open={del} title="Delete this resume?" body="The raw text and the knowledge base will be removed from this device. Interviews linked to it will fall back to your active resume." onCancel={() => setDel(false)} onConfirm={() => { deleteResume(resume.id); setDel(false); toast.success('Resume deleted.') }} />
        </>
      )}
    </div>
  )
}

function ListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea rows={Math.min(6, Math.max(2, items.length + 1))} value={items.join('\n')} placeholder={placeholder ?? 'One item per line'} onChange={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} />
    </div>
  )
}

function KBEditor({ kb: initial, onSave, onDelete, meta }: { kb: CandidateKnowledgeBase; onSave: (kb: CandidateKnowledgeBase) => void; onDelete: () => void; meta: React.ReactNode }) {
  const [kb, setKb] = useState(initial)
  const [dirty, setDirty] = useState(false)
  const set = (patch: Partial<CandidateKnowledgeBase>) => { setKb((k) => ({ ...k, ...patch })); setDirty(true) }
  const setExp = (id: string, patch: Partial<Experience>) => set({ experiences: kb.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)) })
  const setEdu = (id: string, patch: Partial<EducationItem>) => set({ education: kb.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) })
  const setPrj = (id: string, patch: Partial<ProjectItem>) => set({ projects: kb.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  const skills = (k: keyof CandidateKnowledgeBase['skills'], v: string[]) => set({ skills: { ...kb.skills, [k]: v } })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 sticky top-14 lg:top-0 z-20 bg-bg/90 backdrop-blur py-2">
        <div className="text-xs text-muted">{meta}</div>
        <div className="flex gap-2"><Button variant="danger" size="sm" icon={<Trash2 className="size-4" />} onClick={onDelete}>Delete resume</Button><Button size="sm" icon={<Save className="size-4" />} disabled={!dirty} onClick={() => { onSave(kb); setDirty(false) }}>Save changes</Button></div>
      </div>

      <Card>
        <SectionTitle>Profile</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>Name</Label><Input value={kb.name ?? ''} onChange={(e) => set({ name: e.target.value })} /></div>
          <div><Label>Headline</Label><Input value={kb.headline ?? ''} onChange={(e) => set({ headline: e.target.value })} placeholder="e.g. Customer Support Specialist" /></div>
          <div><Label>Location</Label><Input value={kb.location ?? ''} onChange={(e) => set({ location: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Summary</Label><Textarea rows={3} value={kb.summary ?? ''} onChange={(e) => set({ summary: e.target.value })} /></div>
        </div>
      </Card>

      <Card>
        <SectionTitle sub="Companies, roles, responsibilities, projects, results and tools." action={<Button size="sm" variant="secondary" icon={<Plus className="size-4" />} onClick={() => set({ experiences: [...kb.experiences, { id: uid('exp'), company: '', role: '', responsibilities: [], projects: [], results: [], tools: [] }] })}>Add</Button>}>Professional experience</SectionTitle>
        <div className="space-y-4">
          {kb.experiences.map((e) => (
            <div key={e.id} className="rounded-2xl border border-line p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div><Label>Role</Label><Input value={e.role} onChange={(ev) => setExp(e.id, { role: ev.target.value })} /></div>
                <div><Label>Company</Label><Input value={e.company} onChange={(ev) => setExp(e.id, { company: ev.target.value })} /></div>
                <div><Label>Period</Label><Input value={e.period ?? ''} onChange={(ev) => setExp(e.id, { period: ev.target.value })} placeholder="2022 – Present" /></div>
                <div className="flex items-end gap-2"><label className="flex items-center gap-2 text-sm h-10"><input type="checkbox" checked={Boolean(e.remote)} onChange={(ev) => setExp(e.id, { remote: ev.target.checked })} /> Remote</label><button className="ml-auto text-muted hover:text-danger h-10" onClick={() => set({ experiences: kb.experiences.filter((x) => x.id !== e.id) })}><Trash2 className="size-4" /></button></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 mt-3">
                <ListEditor label="Responsibilities" items={e.responsibilities} onChange={(v) => setExp(e.id, { responsibilities: v })} />
                <ListEditor label="Projects" items={e.projects} onChange={(v) => setExp(e.id, { projects: v })} />
                <ListEditor label="Results" items={e.results} onChange={(v) => setExp(e.id, { results: v })} placeholder="Outcomes and metrics stated in your resume" />
                <ListEditor label="Tools" items={e.tools} onChange={(v) => setExp(e.id, { tools: v })} />
              </div>
            </div>
          ))}
          {!kb.experiences.length && <p className="text-sm text-muted">No experience extracted — add it manually.</p>}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle action={<Button size="sm" variant="secondary" icon={<Plus className="size-4" />} onClick={() => set({ education: [...kb.education, { id: uid('edu'), institution: '', degree: '', kind: 'degree' }] })}>Add</Button>}>Education & certifications</SectionTitle>
          <div className="space-y-3">
            {kb.education.map((e) => (
              <div key={e.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <div><Label>Degree / course</Label><Input value={e.degree} onChange={(ev) => setEdu(e.id, { degree: ev.target.value })} /></div>
                <div><Label>Institution</Label><Input value={e.institution} onChange={(ev) => setEdu(e.id, { institution: ev.target.value })} /></div>
                <button className="text-muted hover:text-danger h-10" onClick={() => set({ education: kb.education.filter((x) => x.id !== e.id) })}><Trash2 className="size-4" /></button>
                <div className="col-span-3 grid grid-cols-2 gap-2"><Select value={e.kind} onChange={(ev) => setEdu(e.id, { kind: ev.target.value as EducationItem['kind'] })}><option value="degree">Degree</option><option value="postgraduate">Postgraduate</option><option value="course">Course</option><option value="certification">Certification</option></Select><Input value={e.period ?? ''} placeholder="Period" onChange={(ev) => setEdu(e.id, { period: ev.target.value })} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle>Skills</SectionTitle>
          <div className="grid gap-3">
            <ListEditor label="Hard skills" items={kb.skills.hard} onChange={(v) => skills('hard', v)} />
            <ListEditor label="Technologies" items={kb.skills.technologies} onChange={(v) => skills('technologies', v)} />
            <ListEditor label="Tools" items={kb.skills.tools} onChange={(v) => skills('tools', v)} />
            <ListEditor label="Soft skills" items={kb.skills.soft} onChange={(v) => skills('soft', v)} />
            <div><Label hint="language: level">Languages</Label><Textarea rows={2} value={kb.skills.languages.map((l) => `${l.language}: ${l.level}`).join('\n')} onChange={(e) => skills('languages', e.target.value.split('\n').filter(Boolean).map((l) => { const [language, ...lv] = l.split(':'); return { language: language.trim(), level: lv.join(':').trim() || 'Stated' } }) as never)} /></div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle action={<Button size="sm" variant="secondary" icon={<Plus className="size-4" />} onClick={() => set({ projects: [...kb.projects, { id: uid('prj'), name: '', description: '', kind: 'professional', tools: [], results: [] }] })}>Add</Button>}>Projects</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {kb.projects.map((p) => (
            <div key={p.id} className="rounded-2xl border border-line p-4 space-y-2">
              <div className="flex gap-2"><Input value={p.name} placeholder="Project name" onChange={(e) => setPrj(p.id, { name: e.target.value })} /><Select value={p.kind} onChange={(e) => setPrj(p.id, { kind: e.target.value as ProjectItem['kind'] })} className="w-36"><option value="professional">Professional</option><option value="personal">Personal</option><option value="freelance">Freelance</option><option value="remote">Remote</option></Select><button className="text-muted hover:text-danger" onClick={() => set({ projects: kb.projects.filter((x) => x.id !== p.id) })}><Trash2 className="size-4" /></button></div>
              <Textarea rows={2} value={p.description} placeholder="What it was and what you did" onChange={(e) => setPrj(p.id, { description: e.target.value })} />
              <div className="flex flex-wrap gap-1">{p.tools.map((t) => <Badge key={t}>{t}</Badge>)}</div>
            </div>
          ))}
          {!kb.projects.length && <p className="text-sm text-muted">No projects listed.</p>}
        </div>
      </Card>
    </div>
  )
}
