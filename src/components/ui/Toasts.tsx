import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'

export function fireConfetti(big = false) {
  const colors = ['#A9C4A0', '#A9C4E0', '#C5B8E0', '#EFB8C4', '#F2DC9B']
  confetti({ particleCount: big ? 90 : 40, spread: big ? 80 : 55, startVelocity: 28, gravity: 0.9, scalar: 0.9, ticks: 160, origin: { y: 0.3 }, colors })
}

export function Toasts() {
  const toasts = useStore(s => s.toasts)
  const dismiss = useStore(s => s.dismissToast)
  const seen = useRef(new Set<string>())
  useEffect(() => {
    toasts.forEach(t => {
      if (t.confetti && !seen.current.has(t.id)) { seen.current.add(t.id); fireConfetti(true) }
    })
  }, [toasts])
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} layout
            initial={{ opacity: 0, y: -12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface/95 p-4 shadow-lift backdrop-blur"
            onClick={() => dismiss(t.id)}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-butter-soft text-xl">{t.emoji ?? '✨'}</div>
            <div className="min-w-0">
              <p className="text-sm font-bold">{t.title}</p>
              {t.desc && <p className="text-xs text-muted">{t.desc}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
