import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutDashboard, MessagesSquare, Mic2, FileUser, Briefcase, Puzzle, BarChart3, Building2, Settings as SettingsIcon, Menu, X, Sun, Moon, Monitor, Sparkles, WifiOff, Globe, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Bits'

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/interviews', label: 'Interviews', icon: MessagesSquare },
  { to: '/app/mock', label: 'Mock Interviews', icon: Mic2 },
  { to: '/app/resume', label: 'My Resume', icon: FileUser },
  { to: '/app/jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/app/challenges', label: 'Challenges', icon: Puzzle },
  { to: '/app/performance', label: 'Performance', icon: BarChart3 },
  { to: '/app/company', label: 'Company Research', icon: Building2 },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

export function EngineBadge() {
  const mode = useStore((s) => s.settings.aiMode)
  const key = useStore((s) => s.settings.browserApiKey)
  if (mode === 'server') return <Badge tone="success"><ShieldCheck className="size-3" /> Server AI</Badge>
  if (mode === 'browser' && key) return <Badge tone="accent"><Globe className="size-3" /> Browser AI</Badge>
  return <Badge tone="warn"><WifiOff className="size-3" /> Offline engine</Badge>
}

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const theme = useStore((s) => s.settings.theme)
  const setSettings = useStore((s) => s.setSettings)
  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  return (
    <button onClick={() => setSettings({ theme: next })} title={`Theme: ${theme}`}
      className={cn('btn-base h-8 text-muted hover:text-ink hover:bg-surface-2', compact ? 'w-8' : 'px-2.5 text-xs')}>
      <Icon className="size-4" />{!compact && <span className="capitalize">{theme}</span>}
    </button>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  const resumes = useStore((s) => s.resumes.length)

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 h-10 text-sm font-medium transition', isActive ? 'bg-accent-soft text-accent-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}>
          <Icon className="size-4" /> {label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r border-line bg-surface/60 backdrop-blur px-4 py-5 sticky top-0 h-screen">
        <Link to="/" className="px-2"><Logo /></Link>
        <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
        <div className="mt-4 flex flex-col gap-3">
          {!resumes && (
            <Link to="/app/resume" className="card p-3 text-xs bg-accent-soft border-transparent text-accent-ink flex items-start gap-2">
              <Sparkles className="size-4 shrink-0 mt-0.5" /><span>Upload your resume to unlock personalized answers.</span>
            </Link>
          )}
          <div className="flex items-center justify-between"><EngineBadge /><ThemeToggle compact /></div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-line bg-surface/80 backdrop-blur">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-2"><EngineBadge /><button className="btn-base size-9 hover:bg-surface-2" onClick={() => setOpen((o) => !o)}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
        </header>
        {open && <div className="lg:hidden fixed inset-0 top-14 z-30 bg-bg/95 backdrop-blur p-4">{nav}<div className="mt-4"><ThemeToggle /></div></div>}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1280px] w-full mx-auto"><Outlet /></main>
      </div>
    </div>
  )
}
