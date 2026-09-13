import { NavLink, useOutlet, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  Home, BookOpen, CalendarDays, CheckSquare, FileText, Timer, RefreshCw, BarChart3, Trophy, Settings,
  PanelLeftClose, PanelLeftOpen, Play, Pause, Menu, X, LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { Logo, LogoMark } from '@/components/Logo'
import { Toasts } from '@/components/ui/Toasts'
import { useStore } from '@/store/useStore'
import { cn, levelFor, streak } from '@/lib/utils'
import { fmtClock, useFocusTicker } from '@/lib/useFocusTicker'

const nav = [
  { to: '/app', label: 'Início', icon: Home, end: true },
  { to: '/app/materias', label: 'Minhas matérias', icon: BookOpen },
  { to: '/app/planejamento', label: 'Planejamento', icon: CalendarDays },
  { to: '/app/tarefas', label: 'Tarefas', icon: CheckSquare },
  { to: '/app/anotacoes', label: 'Anotações', icon: FileText },
  { to: '/app/foco', label: 'Foco', icon: Timer },
  { to: '/app/revisao', label: 'Revisão', icon: RefreshCw },
  { to: '/app/progresso', label: 'Meu progresso', icon: BarChart3 },
  { to: '/app/conquistas', label: 'Conquistas', icon: Trophy },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
]
const mobileNav = [
  { ...nav[0], short: 'Início' }, { ...nav[3], short: 'Tarefas' }, { ...nav[5], short: 'Foco' }, { ...nav[2], short: 'Plano' }, { ...nav[7], short: 'Progresso' },
]

function MiniTimer({ collapsed }: { collapsed: boolean }) {
  const t = useFocusTicker()
  const pause = useStore(s => s.pauseFocus)
  const resume = useStore(s => s.resumeFocus)
  const active = t.running || t.remaining !== t.duration
  if (!active) return null
  return (
    <NavLink to="/app/foco" className={cn('card mx-3 mb-3 flex items-center gap-3 p-3 transition hover:shadow-lift', collapsed && 'mx-2 justify-center p-2')}>
      <div className={cn('relative grid h-9 w-9 place-items-center rounded-full', t.mode === 'focus' ? 'bg-sage-soft' : 'bg-sky-soft')}>
        <span className={cn('absolute inset-0 rounded-full', t.running && 'animate-ping opacity-30', t.mode === 'focus' ? 'bg-sage' : 'bg-sky')} style={{ animationDuration: '2.5s' }} />
        <button onClick={(e) => { e.preventDefault(); t.running ? pause() : resume() }} className="relative z-10 grid h-9 w-9 place-items-center" aria-label={t.running ? 'Pausar' : 'Continuar'}>
          {t.running ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="text-sm font-bold tabular-nums">{fmtClock(t.remaining)}</p>
          <p className="truncate text-[11px] text-muted">{t.mode === 'focus' ? 'Em foco' : 'Pausa'}</p>
        </div>
      )}
    </NavLink>
  )
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const settings = useStore(s => s.settings)
  const sessions = useStore(s => s.sessions)
  const logout = useStore(s => s.logout)
  const total = sessions.reduce((a, s) => a + s.minutes, 0)
  const lvl = levelFor(total)
  const st = streak(sessions)
  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center px-5 pt-5 pb-4', collapsed && 'justify-center px-0')}>
        {collapsed ? <LogoMark size={32} /> : <Logo />}
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} title={collapsed ? item.label : undefined}
            className={({ isActive }) => cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isActive ? 'bg-beige text-ink' : 'text-ink-2 hover:bg-cream-2 hover:text-ink',
              collapsed && 'justify-center px-0',
            )}>
            <item.icon size={18} className="shrink-0 opacity-80 transition group-hover:opacity-100" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <MiniTimer collapsed={collapsed} />
      <div className={cn('border-t border-line p-3', collapsed && 'flex flex-col items-center')}>
        <div className={cn('flex items-center gap-3 rounded-xl p-2', !collapsed && 'hover:bg-cream-2')}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lilac-soft text-sm font-bold text-lilac-ink">
            {settings.name.slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{settings.name}</p>
              <p className="truncate text-[11px] text-muted">{lvl.current.emoji} {lvl.current.name} · 🔥 {st} dias</p>
            </div>
          )}
          {!collapsed && <button onClick={logout} className="btn btn-ghost h-8 w-8 rounded-full p-0 text-muted" title="Sair"><LogOut size={15} /></button>}
        </div>
      </div>
    </div>
  )
}

export default function AppShell() {
  const loggedIn = useStore(s => s.loggedIn)
  const collapsed = useStore(s => s.sidebarCollapsed)
  const toggle = useStore(s => s.toggleSidebar)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()
  useFocusTicker()

  if (!loggedIn) return <Navigate to="/entrar" replace />

  return (
    <div className="min-h-screen bg-cream">
      <Toasts />
      {/* Desktop sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-cream/80 backdrop-blur-md transition-[width] duration-300 md:block', collapsed ? 'w-[76px]' : 'w-[248px]')}>
        <SidebarContent collapsed={collapsed} />
        <button onClick={toggle} className="absolute -right-3 top-6 grid h-6 w-6 place-items-center rounded-full border border-line bg-surface text-muted shadow-soft hover:text-ink"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
          {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/85 px-4 py-3 backdrop-blur-md md:hidden">
        <Logo />
        <button onClick={() => setMobileOpen(true)} className="btn btn-ghost h-10 w-10 rounded-full p-0" aria-label="Abrir menu"><Menu size={20} /></button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/25" onClick={() => setMobileOpen(false)} />
            <motion.div className="absolute inset-y-0 left-0 w-[280px] bg-cream shadow-lift" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
              <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 btn btn-ghost h-9 w-9 rounded-full p-0" aria-label="Fechar"><X size={18} /></button>
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className={cn('min-h-screen pb-24 transition-[padding] duration-300 md:pb-10', collapsed ? 'md:pl-[76px]' : 'md:pl-[248px]')}>
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/90 backdrop-blur-md md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-5">
          {mobileNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition', isActive ? 'text-ink' : 'text-muted')}>
              {({ isActive }) => (
                <>
                  <span className={cn('grid h-8 w-12 place-items-center rounded-full transition', isActive && 'bg-beige')}><item.icon size={19} /></span>
                  {item.short}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
