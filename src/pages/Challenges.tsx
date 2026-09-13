import { useState } from 'react'
import { Puzzle, ImagePlus, X, Trash2, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useEngine } from '@/lib/hooks'
import { Badge, Button, Card, Confirm, Label, Markdown, PageHeader, Select, Textarea, Input, EmptyState } from '@/components/ui/Bits'
import { toast } from '@/components/ui/Toasts'
import { CHALLENGE_KIND_LABELS, type ChallengeKind } from '@/lib/types'
import { dataUrlToBase64, fileToDataUrl, timeAgo } from '@/lib/utils'

export default function Challenges() {
  const challenges = useStore((s) => s.challenges)
  const addChallenge = useStore((s) => s.addChallenge)
  const updateChallenge = useStore((s) => s.updateChallenge)
  const deleteChallenge = useStore((s) => s.deleteChallenge)
  const aiMode = useStore((s) => s.settings.aiMode)
  const engine = useEngine()
  const [kind, setKind] = useState<ChallengeKind>('programming')
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [del, setDel] = useState<string | null>(null)

  const solve = async () => {
    if (!prompt.trim() && !image) { toast.error('Describe the exercise or add an image.'); return }
    setBusy(true)
    try {
      const img = image ? dataUrlToBase64(image) : undefined
      const mediaType = img?.mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | undefined
      const ch = addChallenge({ title: title.trim() || prompt.trim().slice(0, 60) || 'Image exercise', kind, prompt: prompt.trim(), imageDataUrl: image })
      setOpen(ch.id)
      const solution = await engine.solveChallenge(kind, prompt.trim(), img && mediaType ? { mediaType, data: img.data } : undefined)
      updateChallenge(ch.id, { solution })
      setTitle(''); setPrompt(''); setImage(undefined)
    } catch (e) { toast.error((e as Error).message) } finally { setBusy(false) }
  }

  return (
    <div>
      <PageHeader eyebrow="Challenges" title="Interview Challenge Solver" sub="For exercises where AI assistance is permitted. Get UNDERSTAND → APPROACH → SOLUTION → FINAL ANSWER → EXPLANATION so you can explain the reasoning yourself." />
      <Card className="mb-5">
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="space-y-3">
            <div><Label>Exercise type</Label><Select value={kind} onChange={(e) => setKind(e.target.value as ChallengeKind)}>{(Object.keys(CHALLENGE_KIND_LABELS) as ChallengeKind[]).map((k) => <option key={k} value={k}>{CHALLENGE_KIND_LABELS[k]}</option>)}</Select></div>
            <div><Label>Title (optional)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SQL join question" /></div>
            <div><Label>Image (optional)</Label>{image ? <div className="relative"><img src={image} alt="exercise" className="rounded-xl border border-line max-h-40 object-contain w-full bg-surface-2" /><button className="absolute top-1 right-1 btn-base size-6 bg-surface border border-line" onClick={() => setImage(undefined)}><X className="size-3" /></button></div> : <label className="btn-base h-10 w-full border border-dashed border-line-2 hover:border-accent cursor-pointer text-muted text-xs"><ImagePlus className="size-4" /> Add screenshot<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImage(await fileToDataUrl(f)) }} /></label>}</div>
          </div>
          <div className="flex flex-col"><Label>Exercise</Label><Textarea rows={9} className="flex-1" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Paste the exercise text, code, SQL schema, data, or the business case…" />
            <div className="flex items-center justify-between gap-2 mt-3"><span className="text-xs text-muted">{aiMode === 'offline' ? 'Offline engine solves only simple arithmetic — connect an AI model in Settings for full solutions.' : 'Solved by the connected model.'}</span><Button loading={busy} icon={<Sparkles className="size-4" />} onClick={solve}>Solve</Button></div></div>
        </div>
      </Card>

      {!challenges.length ? <EmptyState icon={<Puzzle className="size-6" />} title="No challenges yet" sub="Math, logic, Excel, SQL, programming, data analysis, translation, grammar, writing, classification, AI evaluation, annotation, case studies and more." /> : (
        <div className="space-y-3">
          {challenges.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <button className="text-left min-w-0 flex-1" onClick={() => setOpen(open === c.id ? null : c.id)}>
                  <div className="flex items-center gap-2 flex-wrap"><Badge tone="violet">{CHALLENGE_KIND_LABELS[c.kind]}</Badge><span className="text-xs text-muted">{timeAgo(c.createdAt)}</span>{!c.solution && <Badge tone="warn">Solving…</Badge>}</div>
                  <div className="font-semibold mt-1.5">{c.title}</div>
                </button>
                <button className="text-muted hover:text-danger" onClick={() => setDel(c.id)}><Trash2 className="size-4" /></button>
              </div>
              {open === c.id && (
                <div className="mt-4 space-y-4">
                  {c.prompt && <div className="rounded-xl bg-surface-2 p-3 text-sm whitespace-pre-wrap font-mono text-xs">{c.prompt}</div>}
                  {c.imageDataUrl && <img src={c.imageDataUrl} alt="" className="rounded-xl border border-line max-h-64 object-contain bg-surface-2" />}
                  {c.solution ? (
                    <div className="grid gap-4">
                      {([['UNDERSTAND', c.solution.understand], ['APPROACH', c.solution.approach], ['SOLUTION', c.solution.solution], ['FINAL ANSWER', c.solution.finalAnswer], ['EXPLANATION', c.solution.explanation]] as const).map(([h, body]) => (
                        <div key={h} className={h === 'FINAL ANSWER' ? 'rounded-xl bg-success-soft/60 p-3' : ''}><div className={`label-caps mb-1 ${h === 'FINAL ANSWER' ? 'text-success' : ''}`}>{h}</div><Markdown text={body} /></div>
                      ))}
                    </div>
                  ) : <div className="text-sm text-muted">Working on it…</div>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <Confirm open={Boolean(del)} title="Delete this challenge?" onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteChallenge(del); setDel(null) }} />
    </div>
  )
}
