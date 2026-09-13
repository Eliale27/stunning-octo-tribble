import { create } from 'zustand'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { uid } from '@/lib/utils'

interface Toast { id: string; kind: 'success' | 'error' | 'info'; text: string }
interface ToastState { toasts: Toast[]; push: (kind: Toast['kind'], text: string) => void; dismiss: (id: string) => void }

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, text) => {
    const id = uid('t')
    set((s) => ({ toasts: [...s.toasts, { id, kind, text }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), kind === 'error' ? 7000 : 3500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (t: string) => useToasts.getState().push('success', t),
  error: (t: string) => useToasts.getState().push('error', t),
  info: (t: string) => useToasts.getState().push('info', t),
}

export function Toasts() {
  const { toasts, dismiss } = useToasts()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
            className="card px-3.5 py-3 flex items-start gap-2.5 text-sm shadow-lift">
            {t.kind === 'success' ? <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" /> : t.kind === 'error' ? <AlertTriangle className="size-4 text-danger shrink-0 mt-0.5" /> : <Info className="size-4 text-accent shrink-0 mt-0.5" />}
            <span className="flex-1 text-ink-2">{t.text}</span>
            <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink"><X className="size-4" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
