import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { cancelAlarm, scheduleAlarm } from '@/lib/alarm'

/** Keeps the focus timer accurate across pages and fires completion once. */
export function useFocusTicker() {
  const focus = useStore(s => s.focus)
  const complete = useStore(s => s.finishIfDue)
  const [remaining, setRemaining] = useState(focus.remaining)

  useEffect(() => {
    if (!focus.running || !focus.endsAt) { setRemaining(focus.remaining); return }
    const tick = () => {
      const r = Math.max(0, Math.round((focus.endsAt! - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) complete()
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [focus.running, focus.endsAt, focus.remaining, complete])

  return { ...focus, remaining, progress: focus.duration ? ((focus.duration - remaining) / focus.duration) * 100 : 0 }
}

/**
 * Mount once (AppShell): arms a Web Worker alarm for the running session so the
 * completion + chime fire on time even when the tab is in the background.
 */
export function useFocusAlarm() {
  const running = useStore(s => s.focus.running)
  const endsAt = useStore(s => s.focus.endsAt)
  const finish = useStore(s => s.finishIfDue)
  useEffect(() => {
    if (!running || !endsAt) { cancelAlarm(); return }
    scheduleAlarm(endsAt, finish)
    const onVisible = () => { if (document.visibilityState === 'visible') finish() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { cancelAlarm(); document.removeEventListener('visibilitychange', onVisible) }
  }, [running, endsAt, finish])
}

export const fmtClock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
