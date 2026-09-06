import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'

/** Keeps the focus timer accurate across pages and fires completion once. */
export function useFocusTicker() {
  const focus = useStore(s => s.focus)
  const complete = useStore(s => s.completeFocus)
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

export const fmtClock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
