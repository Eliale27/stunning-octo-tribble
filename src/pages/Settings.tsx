import { useEffect, useState } from 'react'
import { ShieldCheck, Trash2, KeyRound, Server, WifiOff, Globe, Download, MonitorSmartphone, Keyboard } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { checkServerHealth } from '@/lib/ai'
import { Badge, Button, Card, Confirm, Input, Label, PageHeader, SectionTitle, Select, Textarea, Kbd } from '@/components/ui/Bits'
import { toast } from '@/components/ui/Toasts'
import { DEFAULT_SHORTCUTS, type AIMode, type AnswerLength, type CommunicationStyle, type PreferredLanguage, type ShortcutMap } from '@/lib/types'
import { eventToCombo } from '@/lib/shortcuts'
import { download } from '@/lib/utils'

const MODELS = ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5', 'claude-fable-5-1']

export default function Settings() {
  const s = useStore()
  const [health, setHealth] = useState<{ configured: boolean; ok: boolean; model: string } | null>(null)
  const [confirm, setConfirm] = useState<'resume' | 'interviews' | 'profile' | 'all' | null>(null)
  const [recording, setRecording] = useState<keyof ShortcutMap | null>(null)

  useEffect(() => { void checkServerHealth().then(setHealth) }, [s.settings.aiMode])

  useEffect(() => {
    if (!recording) return
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return
      s.setSettings({ shortcuts: { ...s.settings.shortcuts, [recording]: eventToCombo(e) } })
      setRecording(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [recording, s])

  const exportData = () => {
    const { resumes, jobs, companies, interviews, mockSessions, challenges, profile } = useStore.getState()
    download(`interviewpilot-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ resumes, jobs, companies, interviews, mockSessions, challenges, profile }, null, 2))
  }

  const doDelete = () => {
    if (confirm === 'resume') { s.resumes.forEach((r) => s.deleteResume(r.id)); toast.success('All resumes deleted.') }
    if (confirm === 'interviews') { s.interviews.forEach((i) => s.deleteInterview(i.id)); s.mockSessions.forEach((m) => s.deleteMock(m.id)); toast.success('All interviews deleted.') }
    if (confirm === 'profile') { s.deleteProfile(); toast.success('Candidate profile reset.') }
    if (confirm === 'all') { s.deleteAllData(); toast.success('All data deleted from this device.') }
    setConfirm(null)
  }

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Settings" sub="Candidate profile, AI engine, keyboard shortcuts, appearance and privacy." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle sub="Shapes how every answer is written.">Candidate profile</SectionTitle>
          <div className="grid gap-4">
            <div><Label>Communication style</Label><Select value={s.profile.style} onChange={(e) => s.setProfile({ style: e.target.value as CommunicationStyle })}>{['professional', 'friendly', 'confident', 'analytical', 'technical', 'enthusiastic', 'concise'].map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}</Select></div>
            <div><Label>Answer length</Label><Select value={s.profile.answerLength} onChange={(e) => s.setProfile({ answerLength: e.target.value as AnswerLength })}><option value="very-short">Very short</option><option value="short">Short</option><option value="medium">Medium</option><option value="detailed">Detailed</option></Select></div>
            <div><Label>Preferred language</Label><Select value={s.profile.language} onChange={(e) => s.setProfile({ language: e.target.value as PreferredLanguage })}><option value="en">English</option><option value="pt">Portuguese</option><option value="es">Spanish</option><option value="it">Italian</option></Select></div>
            <div><Label>Target role</Label><Input value={s.profile.targetRole ?? ''} onChange={(e) => s.setProfile({ targetRole: e.target.value })} placeholder="e.g. Remote Customer Success Manager" /></div>
            <div><Label hint="optional">Notes for the AI</Label><Textarea rows={3} value={s.profile.notes ?? ''} onChange={(e) => s.setProfile({ notes: e.target.value })} placeholder="Constraints or preferences (e.g. don't mention my current salary, emphasize remote experience)…" /></div>
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Where your prompts are processed. Architecture supports multiple models.">AI engine</SectionTitle>
          <div className="grid gap-2">
            {([
              { v: 'server', i: Server, t: 'Server proxy (recommended)', d: 'The app calls a local API server that holds the Anthropic key. Nothing else stores your data.', badge: health?.configured ? <Badge tone="success">Connected · {health.model}</Badge> : health?.ok ? <Badge tone="warn">Server up, key missing</Badge> : <Badge tone="danger">Server not reachable</Badge> },
              { v: 'browser', i: Globe, t: 'Browser (bring your own key)', d: 'Calls Anthropic directly from this browser. The key is stored only in this browser\'s local storage.', badge: s.settings.browserApiKey ? <Badge tone="success">Key set</Badge> : <Badge>No key</Badge> },
              { v: 'offline', i: WifiOff, t: 'Offline engine', d: 'Heuristic engine with no model: private, instant, lower quality. Never invents facts.', badge: <Badge tone="warn">No model</Badge> },
            ] as { v: AIMode; i: typeof Server; t: string; d: string; badge: React.ReactNode }[]).map((o) => (
              <button key={o.v} onClick={() => s.setSettings({ aiMode: o.v })} className={`text-left rounded-2xl border p-3 flex gap-3 transition ${s.settings.aiMode === o.v ? 'border-accent bg-accent-soft/40' : 'border-line hover:bg-surface-2'}`}>
                <o.i className="size-4 mt-0.5 text-accent shrink-0" /><div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-2"><span className="font-semibold text-sm">{o.t}</span>{o.badge}</div><div className="text-xs text-muted mt-0.5">{o.d}</div></div>
              </button>
            ))}
          </div>
          {s.settings.aiMode === 'browser' && <div className="mt-3"><Label>Anthropic API key</Label><div className="flex gap-2"><Input type="password" value={s.settings.browserApiKey ?? ''} onChange={(e) => s.setSettings({ browserApiKey: e.target.value })} placeholder="sk-ant-…" /><Button variant="secondary" icon={<KeyRound className="size-4" />} onClick={() => { s.setSettings({ browserApiKey: undefined }); toast.success('Key removed') }}>Clear</Button></div></div>}
          {s.settings.aiMode === 'server' && !health?.configured && <p className="text-xs text-muted mt-3">Run <code className="font-mono">npm run dev</code> with <code className="font-mono">ANTHROPIC_API_KEY</code> in <code className="font-mono">.env</code> (see .env.example).</p>}
          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            <div><Label>Main model</Label><Select value={s.settings.model} onChange={(e) => s.setSettings({ model: e.target.value })}>{MODELS.map((m) => <option key={m} value={m}>{m}</option>)}</Select></div>
            <div><Label hint="key points, follow-ups">Fast model</Label><Select value={s.settings.fastModel} onChange={(e) => s.setSettings({ fastModel: e.target.value })}>{MODELS.map((m) => <option key={m} value={m}>{m}</option>)}</Select></div>
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Shortcuts work only while an InterviewPilot window is focused. Click a shortcut and press the new keys."><span className="flex items-center gap-2"><Keyboard className="size-4" /> Keyboard shortcuts</span></SectionTitle>
          <div className="grid gap-2">
            {([['generate', 'Generate answer'], ['shorter', 'Short answer'], ['natural', 'More natural'], ['professional', 'More professional'], ['star', 'STAR answer'], ['minimize', 'Minimize Copilot']] as [keyof ShortcutMap, string][]).map(([k, l]) => (
              <div key={k} className="flex items-center justify-between gap-3 text-sm"><span>{l}</span><button onClick={() => setRecording(k)} className={`rounded-lg border px-2 py-1 ${recording === k ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2'}`}>{recording === k ? <span className="text-xs text-accent-ink">Press keys…</span> : <Kbd>{s.settings.shortcuts[k]}</Kbd>}</button></div>
            ))}
          </div>
          <Button size="sm" variant="ghost" className="mt-3" onClick={() => s.setSettings({ shortcuts: DEFAULT_SHORTCUTS })}>Reset to defaults</Button>
        </Card>

        <Card>
          <SectionTitle><span className="flex items-center gap-2"><MonitorSmartphone className="size-4" /> Copilot window & appearance</span></SectionTitle>
          <div className="grid gap-3">
            <div><Label>Theme</Label><Select value={s.settings.theme} onChange={(e) => s.setSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></Select></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.settings.compactMode} onChange={(e) => s.setSettings({ compactMode: e.target.checked })} /> Open the Copilot in Ultra Compact mode by default</label>
            <div className="rounded-xl bg-surface-2 p-3 text-xs text-muted">
              <div className="label-caps mb-1">Screen Sharing Compatibility</div>
              Keep the Copilot in a separate application window or display when your interview platform and interview rules allow AI assistance. InterviewPilot works as a <b>Separate Copilot Workspace</b>: it never embeds into the video-conference window and includes no mechanisms to bypass proctoring, anti-cheating or monitoring software, or to hide AI use where it is prohibited.
              <label className="flex items-center gap-2 mt-2 text-ink-2"><input type="checkbox" checked={s.settings.screenSharingAcknowledged} onChange={(e) => s.setSettings({ screenSharingAcknowledged: e.target.checked })} /> I understand and will use the Copilot only where permitted.</label>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle sub="Resumes and interviews are confidential data."><span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Privacy & data</span></SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-sm text-ink-2 space-y-2">
              <p><b>Where data lives.</b> Everything (resume knowledge base, jobs, company research, interviews, mock sessions, challenges, profile, settings) is stored in this browser's local storage on this device. There is no account and no cloud database in this MVP.</p>
              <p><b>How it's processed.</b> When you generate answers, the relevant context (your knowledge base, the job, the company research, the question and earlier turns) is sent to the model provider you selected: through your own API server (server mode), directly from the browser with your key (browser mode), or not at all (offline engine). The API server is stateless and logs nothing.</p>
              <p><b>Files.</b> PDF and DOCX parsing happens locally in the browser; the file itself is never uploaded.</p>
              <Button size="sm" variant="secondary" icon={<Download className="size-4" />} onClick={exportData}>Export my data (JSON)</Button>
            </div>
            <div className="grid gap-2">
              <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirm('resume')} disabled={!s.resumes.length}>Delete Resume{s.resumes.length > 1 ? 's' : ''}</Button>
              <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirm('interviews')} disabled={!s.interviews.length && !s.mockSessions.length}>Delete Interviews</Button>
              <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirm('profile')}>Delete Candidate Profile</Button>
              <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirm('all')}>Delete All Data</Button>
            </div>
          </div>
        </Card>
      </div>
      <Confirm open={Boolean(confirm)} title={confirm === 'all' ? 'Delete all data?' : confirm === 'resume' ? 'Delete all resumes?' : confirm === 'interviews' ? 'Delete all interviews and mock sessions?' : 'Reset the candidate profile?'} body="This removes the data from this device immediately and cannot be undone." onCancel={() => setConfirm(null)} onConfirm={doDelete} />
    </div>
  )
}
