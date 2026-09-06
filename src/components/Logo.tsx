import { useId } from 'react'
import { cn } from '@/lib/utils'

export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  const id = useId()
  const gid = `estuda-g${id.replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn('shrink-0', className)} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B9D0B0" />
          <stop offset="1" stopColor="#A9C4E0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${gid})`} />
      {/* open book / E monogram */}
      <path d="M18 20h28a3 3 0 0 1 0 6H24v5h17a3 3 0 0 1 0 6H24v5h22a3 3 0 0 1 0 6H18z" fill="#FBF9F4" />
      <circle cx="47" cy="17" r="4" fill="#F2DC9B" />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={32} />
      {!compact && <span className="text-xl font-extrabold tracking-tight text-ink">estuda<span className="text-sage">.</span></span>}
    </div>
  )
}
