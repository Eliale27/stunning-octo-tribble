import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '@/store/useStore'
import { tourSteps } from '@/lib/tour'
import { cn } from '@/lib/utils'

type Rect = { top: number; left: number; width: number; height: number }
const PAD = 8          // spotlight padding around the target
const GAP = 14         // distance between target and card
const CARD_W = 320

/** Guided tour overlay: spotlight + message card. Mount once inside AppShell. */
export function Tour() {
  const active = useStore(s => s.tour.active)
  const step = useStore(s => s.tour.step)
  const next = useStore(s => s.nextTourStep)
  const end = useStore(s => s.endTour)
  const navigate = useNavigate()
  const location = useLocation()
  const [rect, setRect] = useState<Rect | null>(null)
  const [ready, setReady] = useState(false)
  const [cardH, setCardH] = useState(180)
  const [vw, setVw] = useState(() => window.innerWidth)
  const cardRef = useRef<HTMLDivElement>(null)
  const returnTo = useRef<string | null>(null)
  const current = active ? tourSteps[step] : undefined
  const last = step === tourSteps.length - 1

  // remember where the user was, and go back there when the tour ends
  useEffect(() => {
    if (active) { if (returnTo.current === null) returnTo.current = location.pathname }
    else if (returnTo.current !== null) { navigate(returnTo.current); returnTo.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // open the page the step points at
  useEffect(() => {
    if (current?.route && location.pathname !== current.route) navigate(current.route)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step])

  // find the target (pages load lazily, so keep looking for a moment) and track its position
  useEffect(() => {
    if (!current) return
    setReady(false); setRect(null)
    let cancelled = false
    let el: Element | null = null
    const deadline = Date.now() + 2500
    const measure = () => {
      if (!el || cancelled) return
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    const find = () => {
      if (cancelled) return
      el = document.querySelector(`[data-tour="${current.target}"]`)
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        setTimeout(() => { measure(); setReady(true) }, 320)
      } else if (Date.now() < deadline) setTimeout(find, 100)
      else setReady(true)
    }
    find()
    const onChange = () => { measure(); setVw(window.innerWidth) }
    const iv = setInterval(measure, 250)
    window.addEventListener('resize', onChange)
    window.addEventListener('scroll', onChange, true)
    return () => {
      cancelled = true; clearInterval(iv)
      window.removeEventListener('resize', onChange); window.removeEventListener('scroll', onChange, true)
    }
  }, [current, location.pathname])

  useLayoutEffect(() => { if (cardRef.current) setCardH(cardRef.current.offsetHeight) }, [ready, step, rect?.width])

  // keyboard: Esc skips, Enter / → advances
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') end()
      else if (e.key === 'Enter' || e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, next, end])

  if (!current) return null

  const vh = window.innerHeight
  const mobile = vw < 640
  const W = mobile ? vw - 32 : CARD_W
  const spot = rect ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 } : null
  let cardStyle: React.CSSProperties
  let arrow: 'up' | 'down' | null = null
  if (spot) {
    const fitsBelow = spot.top + spot.height + GAP + cardH < vh - 16
    const fitsAbove = spot.top - GAP - cardH > 16
    const left = Math.min(Math.max(16, spot.left + spot.width / 2 - W / 2), vw - W - 16)
    if (fitsBelow || fitsAbove) {
      cardStyle = { top: fitsBelow ? spot.top + spot.height + GAP : spot.top - GAP - cardH, left, width: W }
      arrow = fitsBelow ? 'up' : 'down'
    } else {
      // target fills the screen: pin the card to the bottom edge
      cardStyle = { left, width: W, bottom: mobile ? 'calc(88px + env(safe-area-inset-bottom))' : 24 }
    }
  } else {
    cardStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: W }
  }
  const arrowLeft = spot ? Math.min(Math.max(20, spot.left + spot.width / 2 - (cardStyle.left as number)), W - 20) : 0

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Tour guiado">
      {/* dim everything except the target */}
      {spot ? (
        <div className="absolute rounded-2xl transition-all duration-300 ease-out"
          style={{ ...spot, boxShadow: '0 0 0 9999px rgba(43,42,40,0.5)' }} />
      ) : (
        <div className="absolute inset-0 bg-ink/50" />
      )}

      <AnimatePresence mode="wait">
        {ready && (
          <div key={step} ref={cardRef} className="absolute" style={cardStyle}>
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.2 }}>
            <div className="relative rounded-2xl border border-line bg-surface p-5 shadow-lift">
              {arrow && (
                <span className={cn('absolute h-3.5 w-3.5 rotate-45 border-line bg-surface', arrow === 'up' ? '-top-[7px] border-l border-t' : '-bottom-[7px] border-b border-r')}
                  style={{ left: arrowLeft - 7 }} />
              )}
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-butter-soft text-xl">{current.emoji}</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{current.title}</p>
                  <p className="mt-0.5 text-sm text-ink-2">{current.text}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5" aria-label={`Passo ${step + 1} de ${tourSteps.length}`}>
                  {tourSteps.map((_, i) => <span key={i} className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-4 bg-sage' : 'w-1.5 bg-line-2')} />)}
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={end} className="btn btn-ghost h-9 px-3 text-xs">Pular</button>
                  <button type="button" onClick={next} className="btn btn-primary h-9 px-3.5 text-xs" autoFocus>{last ? 'Concluir' : 'Próximo'}</button>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
