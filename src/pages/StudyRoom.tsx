import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Link2, LogOut, Send, Wifi, FlaskConical } from 'lucide-react'
import { PageHeader } from '@/components/ui/Bits'
import { useStore } from '@/store/useStore'
import { useT, type TFn } from '@/i18n'
import { cn, uid } from '@/lib/utils'
import { fmtClock, useFocusTicker } from '@/lib/useFocusTicker'
import { COLS, ROWS, TILE, findPath, items, spawnPoint, walkable, zones } from '@/lib/room/map'
import { connectRoom, onlineAvailable, type ChatMessage, type Peer, type PeerStatus, type RoomLink } from '@/lib/room/transport'

const EMOJIS = ['🦊', '🐼', '🐸', '🐱', '🐻', '🦉', '🐧', '🐨', '🦄', '🐙']
const COLORS = ['sage', 'sky', 'lilac', 'rose', 'butter', 'peach']
const STEP_MS = 120
const NEAR = 3
const BUBBLE_MS = 6000

/** Avatar look and last room, remembered between visits. */
const useRoomProfile = create<{ emoji: string; color: string; code: string; set: (p: Partial<{ emoji: string; color: string; code: string }>) => void }>()(
  persist(set => ({
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    code: 'geral',
    set: p => set(p),
  }), { name: 'estuda-room' }),
)

/** Which room this tab is in. Survives the remount caused by navigating to the room's URL. */
const useJoined = create<{ code: string | null; set: (code: string | null) => void }>()(set => ({ code: null, set: code => set({ code }) }))

const cleanCode = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32)

export default function StudyRoom() {
  const t = useT()
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const joined = useJoined(s => s.code)
  const setJoined = useJoined(s => s.set)
  const code = cleanCode(urlCode ?? '') || null

  return (
    <div>
      <PageHeader title={t('room.title')} sub={t('room.sub')} />
      {joined && joined === code
        ? <Room code={code} onLeave={() => setJoined(null)} />
        : <Lobby initialCode={code} onJoin={c => { setJoined(c); navigate(`/app/sala/${c}`, { replace: true }) }} />}
    </div>
  )
}

function Lobby({ initialCode, onJoin }: { initialCode: string | null; onJoin: (code: string) => void }) {
  const t = useT()
  const profile = useRoomProfile()
  const name = useStore(s => s.settings.name)
  const updateSettings = useStore(s => s.updateSettings)
  const [code, setCode] = useState(initialCode ?? profile.code)
  const ready = cleanCode(code) && name.trim()

  return (
    <div className="card mx-auto max-w-lg p-6">
      <h2 className="section-title mb-4">{t('room.lobby.heading')}</h2>
      <div className="mb-5 flex items-center gap-4">
        <Avatar emoji={profile.emoji} color={profile.color} size={56} />
        <div className="flex-1">
          <label className="label">{t('room.lobby.name')}</label>
          <input className="input" value={name} maxLength={24} onChange={e => updateSettings({ name: e.target.value })} />
        </div>
      </div>
      <label className="label">{t('room.lobby.avatar')}</label>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {EMOJIS.map(e => (
          <button key={e} onClick={() => profile.set({ emoji: e })}
            className={cn('grid h-10 w-10 place-items-center rounded-xl text-xl transition', profile.emoji === e ? 'bg-beige ring-2 ring-ink/20' : 'hover:bg-cream-2')}>{e}</button>
        ))}
      </div>
      <label className="label">{t('room.lobby.color')}</label>
      <div className="mb-4 flex gap-2">
        {COLORS.map(c => (
          <button key={c} onClick={() => profile.set({ color: c })} aria-label={c}
            className={cn('h-8 w-8 rounded-full transition', profile.color === c && 'ring-2 ring-ink/40 ring-offset-2')}
            style={{ background: `var(--color-${c})` }} />
        ))}
      </div>
      <label className="label">{t('room.lobby.code')}</label>
      <input className="input" value={code} maxLength={32} onChange={e => setCode(e.target.value)} />
      <p className="mt-1.5 text-xs text-muted">{t('room.lobby.codeHint')}</p>
      {!onlineAvailable && <p className="mt-4 rounded-xl bg-butter-soft p-3 text-xs text-butter-ink">{t('room.mode.localHint')}</p>}
      <button className="btn btn-primary mt-5 w-full" disabled={!ready}
        onClick={() => { const c = cleanCode(code); profile.set({ code: c }); onJoin(c) }}>
        {t('room.lobby.join')}
      </button>
    </div>
  )
}

function Avatar({ emoji, color, size = 28, ring }: { emoji: string; color: string; size?: number; ring?: boolean }) {
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-full border-2 border-white shadow-soft', ring && 'ring-2 ring-ink/50')}
      style={{ width: size, height: size, background: `var(--color-${color})`, fontSize: size * 0.55 }}>{emoji}</span>
  )
}

function useMyStatus(): { status: PeerStatus; endsAt?: number } {
  const tk = useFocusTicker()
  if (!tk.running) return { status: 'idle' }
  return { status: tk.mode === 'focus' ? 'focus' : 'break', endsAt: tk.endsAt }
}

/** Re-render every second for the countdowns shown on avatars. */
function useNow() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  return now
}

function statusLabel(t: TFn, p: Pick<Peer, 'status' | 'endsAt'>, now: number) {
  const left = p.endsAt ? Math.max(0, Math.round((p.endsAt - now) / 1000)) : 0
  return p.status === 'idle' ? t('room.status.idle') : `${t(`room.status.${p.status}`)} · ${fmtClock(left)}`
}

const statusDot: Record<PeerStatus, string> = { focus: 'bg-sage-ink', break: 'bg-sky-ink', idle: 'bg-muted' }

function Room({ code, onLeave }: { code: string; onLeave: () => void }) {
  const t = useT()
  const name = useStore(s => s.settings.name)
  const { emoji, color } = useRoomProfile()
  const my = useMyStatus()
  const now = useNow()

  const [id] = useState(uid)
  const [pos, setPos] = useState(spawnPoint)
  const [peers, setPeers] = useState<Record<string, Peer>>({})
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conn, setConn] = useState<'connecting' | 'online' | 'error'>('connecting')
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const link = useRef<RoomLink | null>(null)
  const path = useRef<{ x: number; y: number }[]>([])
  const lastStep = useRef(0)
  const chatEnd = useRef<HTMLDivElement>(null)

  const me: Peer = useMemo(() => ({ id, name: name.trim() || '?', emoji, color, x: pos.x, y: pos.y, status: my.status, endsAt: my.endsAt }),
    [id, name, emoji, color, pos.x, pos.y, my.status, my.endsAt])
  const meRef = useRef(me)
  meRef.current = me

  // connect once per room; later state changes go through update()
  useEffect(() => {
    const l = connectRoom(code, meRef.current, {
      onPeer: p => setPeers(ps => ({ ...ps, [p.id]: p })),
      onLeave: pid => setPeers(ps => { const { [pid]: _, ...rest } = ps; return rest }),
      onChat: m => setMessages(ms => [...ms.slice(-99), m]),
      onStatus: setConn,
    })
    link.current = l
    return () => { l.close(); link.current = null }
  }, [code])

  useEffect(() => { link.current?.update(me) }, [me])
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: 'nearest' }) }, [messages.length])

  const step = useCallback((dx: number, dy: number) => {
    const t0 = Date.now()
    if (t0 - lastStep.current < STEP_MS - 20) return
    lastStep.current = t0
    path.current = []
    setPos(p => (walkable(p.x + dx, p.y + dy) ? { x: p.x + dx, y: p.y + dy } : p))
  }, [])

  // keyboard: arrows / WASD, ignored while typing
  useEffect(() => {
    const keys: Record<string, [number, number]> = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    }
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, [contenteditable="true"]')) return
      const k = keys[e.key.length === 1 ? e.key.toLowerCase() : e.key]
      if (!k) return
      e.preventDefault()
      step(k[0], k[1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  // click-to-walk: follow the queued path one tile per tick
  useEffect(() => {
    const id = setInterval(() => {
      const next = path.current.shift()
      if (next) setPos(next)
    }, STEP_MS)
    return () => clearInterval(id)
  }, [])

  // fit the map to the available width
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1.25, e.contentRect.width / (COLS * TILE))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = Math.floor((e.clientX - r.left) / (TILE * scale)), y = Math.floor((e.clientY - r.top) / (TILE * scale))
    path.current = findPath(pos, { x, y })
  }

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    link.current?.chat({ id: uid(), from: id, name: me.name, text: text.slice(0, 300), at: Date.now() })
    setDraft('')
  }

  const invite = async () => {
    const url = `${location.origin}${location.pathname}#/app/sala/${code}`
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { window.prompt(t('room.invite'), url) }
  }

  const everyone = [me, ...Object.values(peers)]
  const nearby = Object.values(peers).filter(p => Math.abs(p.x - pos.x) + Math.abs(p.y - pos.y) <= NEAR)
  const bubbles = new Map<string, string>()
  for (const m of messages) if (now - m.at < BUBBLE_MS) bubbles.set(m.from, m.text)
  const mode = link.current?.mode ?? (onlineAvailable ? 'online' : 'local')

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={cn('chip', mode === 'online' ? 'bg-sage-soft text-sage-ink' : 'bg-butter-soft text-butter-ink')}
            title={mode === 'local' ? t('room.mode.localHint') : undefined}>
            {mode === 'online' ? <Wifi size={12} /> : <FlaskConical size={12} />}
            {conn === 'connecting' ? t('room.mode.connecting') : conn === 'error' ? t('room.mode.error') : t(`room.mode.${mode}`)}
          </span>
          <span className="chip bg-cream-2 text-ink-2">#{code}</span>
          <span className="chip bg-cream-2 text-ink-2">{t('room.people', { count: everyone.length })}</span>
          <div className="ml-auto flex gap-2">
            <button className="btn btn-soft h-9 px-3" onClick={invite}><Link2 size={15} />{copied ? t('room.copied') : t('room.invite')}</button>
            <button className="btn btn-ghost h-9 px-3" onClick={onLeave}><LogOut size={15} />{t('room.leave')}</button>
          </div>
        </div>

        <div ref={wrap} className="w-full">
          <div className="card overflow-hidden" style={{ width: COLS * TILE * scale, height: ROWS * TILE * scale }}>
            <div className="relative origin-top-left cursor-pointer select-none bg-cream-2"
              style={{ width: COLS * TILE, height: ROWS * TILE, transform: `scale(${scale})` }} onClick={onMapClick}>
              {zones.map(z => (
                <div key={z.label} className={cn('absolute rounded-xl', z.tone)} style={{ left: z.x * TILE, top: z.y * TILE, width: z.w * TILE, height: z.h * TILE }}>
                  <span className="absolute left-2 top-1 text-[10px] font-bold uppercase tracking-wide text-ink-2/60">{t(`room.zones.${z.label}`)}</span>
                </div>
              ))}
              {items.map((it, i) => (
                <div key={i} className={cn('absolute grid place-items-center text-base', it.tone, it.round ? 'rounded-full' : 'rounded-lg', it.tone !== 'bg-transparent' && 'shadow-soft')}
                  style={{ left: it.x * TILE + 2, top: it.y * TILE + 2, width: it.w * TILE - 4, height: it.h * TILE - 4 }}>{it.emoji}</div>
              ))}
              {everyone.map(p => (
                <div key={p.id} className="pointer-events-none absolute left-0 top-0 transition-transform ease-linear"
                  style={{ transform: `translate(${p.x * TILE}px, ${p.y * TILE}px)`, width: TILE, height: TILE, transitionDuration: p.id === id ? `${STEP_MS}ms` : '200ms', zIndex: 10 + p.y }}>
                  {bubbles.has(p.id) && (
                    <div className="absolute bottom-[calc(100%+16px)] left-1/2 w-max max-w-[160px] -translate-x-1/2 animate-pop rounded-xl bg-surface px-2.5 py-1.5 text-[11px] leading-snug shadow-lift">
                      {bubbles.get(p.id)}
                    </div>
                  )}
                  <div className="grid h-full place-items-center">
                    <div className="relative">
                      <Avatar emoji={p.emoji} color={p.color} ring={p.id === id} />
                      <span className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white', statusDot[p.status])} />
                    </div>
                  </div>
                  <span className="absolute left-1/2 top-[calc(100%-2px)] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/75 px-1.5 text-[10px] font-semibold text-cream">
                    {p.id === id ? `${p.name} (${t('room.you')})` : p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">{t('room.help')} {t('room.timerHint')}</p>
          {/* touch d-pad */}
          <div className="grid shrink-0 grid-cols-3 gap-1 md:hidden">
            <span />
            <button className="btn btn-soft h-10 w-10 p-0" onClick={() => step(0, -1)} aria-label="↑"><ArrowUp size={16} /></button>
            <span />
            <button className="btn btn-soft h-10 w-10 p-0" onClick={() => step(-1, 0)} aria-label="←"><ArrowLeft size={16} /></button>
            <button className="btn btn-soft h-10 w-10 p-0" onClick={() => step(0, 1)} aria-label="↓"><ArrowDown size={16} /></button>
            <button className="btn btn-soft h-10 w-10 p-0" onClick={() => step(1, 0)} aria-label="→"><ArrowRight size={16} /></button>
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="card p-4">
          <h3 className="section-title mb-3">{t('room.nearby')}</h3>
          <PeerRow p={me} now={now} you={t('room.you')} />
          {nearby.map(p => <PeerRow key={p.id} p={p} now={now} />)}
          {nearby.length === 0 && <p className="mt-2 text-xs text-muted">{t('room.nobodyNearby')}</p>}
        </div>
        <div className="card flex min-h-[280px] flex-1 flex-col p-4">
          <h3 className="section-title mb-3">{t('room.chat')}</h3>
          <div className="max-h-72 flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
            {messages.length === 0 && <p className="text-xs text-muted">{t('room.chatEmpty')}</p>}
            {messages.map(m => (
              <p key={m.id} className="break-words"><span className="font-bold">{m.name}</span> <span className="text-ink-2">{m.text}</span></p>
            ))}
            <div ref={chatEnd} />
          </div>
          <form onSubmit={sendChat} className="mt-3 flex gap-2">
            <input className="input" value={draft} maxLength={300} onChange={e => setDraft(e.target.value)} placeholder={t('room.chatPlaceholder')} />
            <button className="btn btn-primary px-3" aria-label={t('room.send')}><Send size={15} /></button>
          </form>
        </div>
      </aside>
    </div>
  )
}

function PeerRow({ p, now, you }: { p: Peer; now: number; you?: string }) {
  const t = useT()
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Avatar emoji={p.emoji} color={p.color} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{p.name}{you && <span className="font-normal text-muted"> ({you})</span>}</p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[p.status])} />{statusLabel(t, p, now)}
        </p>
      </div>
    </div>
  )
}
