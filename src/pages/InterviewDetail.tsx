import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MonitorSmartphone, ShieldAlert, Minimize2, Maximize2, ClipboardList } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { CopilotPanel } from '@/components/copilot/CopilotPanel'
import { Badge, Button, Card, Input, Label, Textarea } from '@/components/ui/Bits'
import { openCopilotWindow } from '@/lib/copilotWindow'
import { toast } from '@/components/ui/Toasts'

export default function InterviewDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const interview = useStore((s) => s.interviews.find((i) => i.id === id))
  const job = useStore((s) => s.jobs.find((j) => j.id === interview?.jobId))
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const updateInterview = useStore((s) => s.updateInterview)
  const [compact, setCompact] = useState(settings.compactMode)
  const [notes, setNotes] = useState(false)

  useEffect(() => { if (!interview) nav('/app/interviews', { replace: true }) }, [interview, nav])
  if (!interview) return null

  const openWindow = () => {
    const w = openCopilotWindow(interview.id, compact)
    if (!w) toast.error('Your browser blocked the popup. Allow popups for this site to open the Copilot window.')
    else toast.success('Copilot opened in a separate window. Move it to another display if you have one.')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-4rem)] -mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/app/interviews" className="btn-base size-9 hover:bg-surface-2"><ArrowLeft className="size-4" /></Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><Badge tone={interview.mode === 'copilot' ? 'accent' : 'violet'}>{interview.mode === 'copilot' ? 'Copilot' : 'Practice'}</Badge><Input value={interview.title} onChange={(e) => updateInterview(interview.id, { title: e.target.value })} className="h-8 py-1 font-semibold bg-transparent border-transparent hover:border-line max-w-xs" /></div>
            <div className="text-xs text-muted truncate pl-0.5">{job ? `${job.title}${job.company ? ` · ${job.company}` : ''}` : 'No job linked — answers use your active resume only'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="ghost" icon={<ClipboardList className="size-4" />} onClick={() => setNotes((n) => !n)}>Notes</Button>
          <Button size="sm" variant="secondary" icon={compact ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />} onClick={() => { setCompact((c) => !c); setSettings({ compactMode: !compact }) }}>{compact ? 'Full view' : 'Ultra compact'}</Button>
          <Button size="sm" icon={<ExternalLink className="size-4" />} onClick={openWindow}>Open Copilot window</Button>
        </div>
      </div>

      {!settings.screenSharingAcknowledged && (
        <Card className="mb-3 py-3 px-4 bg-warn-soft border-transparent flex flex-wrap items-center gap-3 text-sm">
          <ShieldAlert className="size-4 text-warn shrink-0" />
          <div className="flex-1 min-w-[240px]"><b>Screen Sharing Compatibility.</b> Keep the Copilot in a separate application window or display when your interview platform and interview rules allow AI assistance. The Copilot never embeds into the video-call window.</div>
          <Button size="xs" variant="secondary" onClick={() => setSettings({ screenSharingAcknowledged: true })}>Got it</Button>
        </Card>
      )}

      <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_300px] gap-3">
        <div className="card overflow-hidden min-h-0"><CopilotPanel interviewId={interview.id} compact={compact} onToggleCompact={() => setCompact((c) => !c)} /></div>
        <div className="hidden lg:flex flex-col gap-3 min-h-0 overflow-y-auto">
          <Card className="p-4">
            <div className="label-caps mb-2 flex items-center gap-1.5"><MonitorSmartphone className="size-3.5" /> Separate Copilot workspace</div>
            <p className="text-xs text-muted">Recommended setup: your video call on one screen, the Copilot window on another. The window is resizable, movable and can be minimized and restored — the interview context is kept.</p>
            <Button size="sm" className="mt-3 w-full" variant="soft" onClick={openWindow} icon={<ExternalLink className="size-3.5" />}>Open in new window</Button>
          </Card>
          {notes && (
            <Card className="p-4"><Label>Interview notes</Label>
              <Textarea rows={4} placeholder="Strengths noticed…" value={interview.strengths.join('\n')} onChange={(e) => updateInterview(interview.id, { strengths: e.target.value.split('\n') })} />
              <Textarea rows={4} className="mt-2" placeholder="Weak points to work on…" value={interview.weaknesses.join('\n')} onChange={(e) => updateInterview(interview.id, { weaknesses: e.target.value.split('\n') })} />
            </Card>
          )}
          {job && (
            <Card className="p-4">
              <div className="label-caps mb-2">Likely questions</div>
              <div className="flex flex-col gap-1">{job.analysis.likelyQuestions.slice(0, 8).map((q) => <div key={q} className="text-xs text-ink-2 rounded-lg bg-surface-2 px-2 py-1.5">{q}</div>)}</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
