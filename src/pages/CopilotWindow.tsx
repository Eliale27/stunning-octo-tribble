import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CopilotPanel } from '@/components/copilot/CopilotPanel'
import { useStore } from '@/store/useStore'
import { useTheme } from '@/lib/hooks'
import { minimizeCopilot } from '@/lib/copilotWindow'
import { Logo } from '@/components/Logo'
import { EngineBadge } from '@/components/layout/AppShell'

/** Standalone Copilot window: minimal chrome, own route, shares context through the persisted store. */
export default function CopilotWindow() {
  useTheme()
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const defaultCompact = useStore((s) => s.settings.compactMode)
  const [compact, setCompact] = useState(params.get('compact') === '1' || defaultCompact)
  const interview = useStore((s) => s.interviews.find((i) => i.id === id))

  useEffect(() => { document.title = compact ? 'Copilot' : `Copilot — ${interview?.title ?? 'InterviewPilot'}` }, [compact, interview?.title])
  useEffect(() => { setParams(compact ? { compact: '1' } : {}, { replace: true }) }, [compact, setParams])

  return (
    <div className="h-screen flex flex-col bg-bg">
      {!compact && (
        <div className="flex items-center justify-between px-3 h-9 border-b border-line bg-surface text-xs">
          <Logo compact /><EngineBadge />
        </div>
      )}
      <div className="flex-1 min-h-0 bg-surface">
        <CopilotPanel interviewId={id} compact={compact} standalone onToggleCompact={() => setCompact((c) => !c)} onMinimize={minimizeCopilot} />
      </div>
    </div>
  )
}
