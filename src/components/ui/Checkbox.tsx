import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export function Checkbox({ checked, onChange, size = 20, className }:
  { checked: boolean; onChange: () => void; size?: number; className?: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={(e) => { e.stopPropagation(); onChange() }}
      className={cn('grid shrink-0 place-items-center rounded-md border-[1.5px] transition-all duration-200',
        checked ? 'border-sage bg-sage' : 'border-line-2 bg-surface hover:border-sage', className)}
      style={{ width: size, height: size }}>
      <motion.svg viewBox="0 0 24 24" width={size * 0.65} height={size * 0.65} fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
        initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={{ duration: 0.25 }}>
        <motion.path d="M5 12.5l4.5 4.5L19 7" initial={false} animate={{ pathLength: checked ? 1 : 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} />
      </motion.svg>
    </button>
  )
}
