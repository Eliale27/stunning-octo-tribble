import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export function ProgressBar({ value, className, color = 'bg-sage', track = 'bg-beige', height = 'h-2.5' }:
  { value: number; className?: string; color?: string; track?: string; height?: string }) {
  return (
    <div className={cn('w-full overflow-hidden rounded-full', track, height, className)}>
      <motion.div
        className={cn('h-full rounded-full', color)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  )
}

export function ProgressRing({ value, size = 140, stroke = 12, color = '#A9C4A0', track = '#F1EBDF', children, className }:
  { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode; className?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('relative inline-grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * v) / 100 }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
