import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import confetti from 'canvas-confetti'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Ban, Bell, BellOff, Mic, MicOff, Headphones, Link2, LogOut, Send, Undo2, Wifi, FlaskConical } from 'lucide-react'
import { PageHeader, Segmented } from '@/components/ui/Bits'
import { useStore } from '@/store/useStore'
import { useT, type TFn } from '@/i18n'
import { cn, uid } from '@/lib/utils'
import { fmtClock, useFocusTicker } from '@/lib/useFocusTicker'
import { COLS, ROWS, TILE, findPath, items, spawnPoint, walkable, zones } from '@/lib/room/map'
import { connectRoom, onlineAvailable, type Availability, type ChatMessage, type Peer, type PeerStatus, type RoomEvent, type RoomLink } from '@/lib/room/transport'
import { playBlip, playGong, playWave } from '@/lib/room/sounds'
import { VoiceMesh } from '@/lib/room/voice'

const EMOJIS = ['🦊', '🐼', '🐸', '🐱', '🐻', '🦉', '🐧', '🐨', '🦄', '🐙']
const COLORS = ['sage', 'sky', 'lilac', 'rose', 'butter', 'peach']
const STEP_MS = 120
const NEAR = 3
const BUBBLE_MS = 6000
const REACTION_MS = 2500
const REACTIONS = ['👍', '❤️', '😂', '🎉', '🔥', '👏']

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

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

/** Manual availability wins over the timer; otherwise show focus/break with time left. */
function statusLabel(t: TFn, p: Pick<Peer, 'status' | 'endsAt' | 'avail'>, now: number) {
  if (p.avail !== 'available') return t(`room.avail.${p.avail}`)
  const left = p.endsAt ? Math.max(0, Math.round((p.endsAt - now) / 1000)) : 0
  return p.status === 'idle' ? t('room.status.idle') : `${t(`room.status.${p.status}`)} · ${fmtClock(left)}`
}

function dotClass(p: Pick<Peer, 'status' | 'avail'>) {
  if (p.avail === 'dnd') return 'bg-rose-ink'
  if (p.avail === 'busy') return 'bg-butter-ink'
  return { focus: 'bg-sage-ink', break: 'bg-sky-ink', idle: 'bg-sage' }[p.status]
}

const near = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= NEAR
const AVAILS: Availability[] = ['available', 'busy', 'dnd']

function fireConfetti() {
  confetti({ particleCount: 120, spread: 100, startVelocity: 32, ticks: 200, origin: { y: 0.35 }, colors: ['#A9C4A0', '#A9C4E0', '#C5B8E0', '#EFB8C4', '#F2DC9B'] })
}

function Room({ code, onLeave }: { code: string; onLeave: () => void }) {
  const t = useT()
  const name = useStore(s => s.settings.name)
  const pushToast = useStore(s => s.pushToast)
  const unlocked = useStore(s => s.unlocked)
  const { emoji, color } = useRoomProfile()
  const my = useMyStatus()
  const now = useNow()

  const [id] = useState(uid)
  const [pos, setPos] = useState(spawnPoint)
  const [avail, setAvail] = useState<Availability>('available')
  const [dancing, setDancing] = useState(false)
  const [peers, setPeers] = useState<Record<string, Peer>>({})
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<{ id: string; from: string; emoji: string; at: number }[]>([])
  const [blocked, setBlocked] = useState<Set<string>>(new Set())
  const [muted, setMuted] = useState(false)
  const [tab, setTab] = useState<'room' | 'near'>('room')
  const [conn, setConn] = useState<'connecting' | 'online' | 'error'>('connecting')
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [speaking, setSpeaking] = useState<Set<string>>(new Set())
  const [talkingWith, setTalkingWith] = useState<Set<string>>(new Set())
  const voice = useRef<VoiceMesh | null>(null)
  const link = useRef<RoomLink | null>(null)
  const path = useRef<{ x: number; y: number }[]>([])
  const lastStep = useRef(0)
  const chatEnd = useRef<HTMLDivElement>(null)

  const me: Peer = useMemo(() => ({
    id, name: name.trim() || '?', emoji, color, x: pos.x, y: pos.y, status: my.status, endsAt: my.endsAt, avail, dancing, voice: voiceOn,
  }), [id, name, emoji, color, pos.x, pos.y, my.status, my.endsAt, avail, dancing, voiceOn])
  const meRef = useRef(me)
  meRef.current = me
  // event handlers read the latest settings through refs so the connection is opened only once
  const live = useRef({ blocked, muted, t })
  live.current = { blocked, muted, t }

  const onEvent = useCallback((e: RoomEvent) => {
    const { blocked, muted, t } = live.current
    const self = e.from === meRef.current.id
    if (blocked.has(e.from)) return
    switch (e.t) {
      case 'chat': {
        // near-chat only reaches people standing close to where it was said
        if (e.near && !self && !near(e.near, meRef.current)) return
        setMessages(ms => [...ms.slice(-199), e])
        if (!self && !muted) playBlip()
        break
      }
      case 'wave':
        if (e.to !== meRef.current.id || meRef.current.avail === 'dnd') return
        if (!muted) playWave()
        pushToast({ title: t('room.waved', { name: e.name }), emoji: '👋' })
        break
      case 'react':
        setReactions(rs => [...rs.filter(r => Date.now() - r.at < REACTION_MS), { id: e.id, from: e.from, emoji: e.emoji, at: Date.now() }])
        break
      case 'gong':
        if (!muted) playGong()
        fireConfetti()
        pushToast({ title: t('room.gonged', { name: self ? t('room.youCap') : e.name }), desc: e.reason, emoji: '🔔' })
        break
      case 'confetti':
        fireConfetti()
        break
      case 'rtc':
        if (e.to === meRef.current.id) void voice.current?.onSignal(e.from, e).catch(() => {})
        break
    }
  }, [pushToast])

  // connect once per room; later state changes go through update()
  useEffect(() => {
    const l = connectRoom(code, meRef.current, {
      onPeer: p => setPeers(ps => ({ ...ps, [p.id]: p })),
      onLeave: pid => setPeers(ps => { const { [pid]: _, ...rest } = ps; return rest }),
      onEvent,
      onStatus: setConn,
    })
    link.current = l
    return () => { l.close(); link.current = null }
  }, [code, onEvent])

  useEffect(() => { link.current?.update(me) }, [me])

  // ---- proximity voice
  const toggleVoice = async () => {
    if (voiceOn) { voice.current?.stop(); setVoiceOn(false); return }
    const v = voice.current ?? new VoiceMesh(id, sig => {
      link.current?.emit({ t: 'rtc', id: uid(), from: id, at: Date.now(), ...sig })
    })
    voice.current = v
    try {
      await v.start()
      v.setMicEnabled(true)
      setMicOn(true)
      setVoiceOn(true)
    } catch {
      pushToast({ title: t('room.voice.denied'), emoji: '🎙️' })
    }
  }
  const toggleMic = () => { voice.current?.setMicEnabled(!micOn); setMicOn(m => !m) }
  useEffect(() => () => voice.current?.stop(), [])

  // talk to whoever is inside my circle with voice on; louder when closer
  useEffect(() => {
    const v = voice.current
    if (!v || !voiceOn) return
    const ids = new Set<string>()
    for (const p of Object.values(peers)) {
      if (!p.voice || blocked.has(p.id) || !near(p, pos)) continue
      ids.add(p.id)
      const d = Math.abs(p.x - pos.x) + Math.abs(p.y - pos.y)
      v.setVolume(p.id, 1 - Math.max(0, d - 1) * 0.25)
    }
    v.sync(ids)
  }, [peers, pos, voiceOn, blocked])

  // who is talking (green ring) and who I am connected to
  useEffect(() => {
    if (!voiceOn) { setSpeaking(new Set()); setTalkingWith(new Set()); return }
    const same = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every(x => b.has(x))
    const iv = setInterval(() => {
      const v = voice.current
      if (!v) return
      const s = v.speaking(), c = v.connected()
      setSpeaking(prev => (same(prev, s) ? prev : s))
      setTalkingWith(prev => (same(prev, c) ? prev : c))
    }, 200)
    return () => clearInterval(iv)
  }, [voiceOn])
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: 'nearest' }) }, [messages.length, tab])

  const emit = useCallback((e: DistributiveOmit<RoomEvent, 'id' | 'from' | 'at'>) => {
    link.current?.emit({ ...e, id: uid(), from: meRef.current.id, at: Date.now() } as RoomEvent)
  }, [])

  // ring the gong for everyone when I unlock an achievement while in the room
  const seenUnlocked = useRef(new Set(Object.keys(unlocked)))
  useEffect(() => {
    for (const a of Object.keys(unlocked)) {
      if (seenUnlocked.current.has(a)) continue
      seenUnlocked.current.add(a)
      emit({ t: 'gong', name: meRef.current.name, reason: t(`common.achievements.${a}.title`) })
    }
  }, [unlocked, emit, t])

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
      if (el.closest('input, textarea, select, [contenteditable="true"]')) return
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
    emit({ t: 'chat', name: me.name, text: text.slice(0, 300), near: tab === 'near' ? { x: pos.x, y: pos.y } : undefined })
    setDraft('')
  }

  const invite = async () => {
    const url = `${location.origin}${location.pathname}#/app/sala/${code}`
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { window.prompt(t('room.invite'), url) }
  }

  const toggleBlock = (pid: string) => setBlocked(b => { const n = new Set(b); if (n.has(pid)) n.delete(pid); else n.add(pid); return n })

  const others = Object.values(peers)
  const everyone = [me, ...others]
  const sortedOthers = [...others].sort((a, b) => Number(near(b, pos)) - Number(near(a, pos)) || a.name.localeCompare(b.name))
  const bubbles = new Map<string, string>()
  if (!muted) for (const m of messages) if (now - m.at < BUBBLE_MS) bubbles.set(m.from, m.text)
  const floating = reactions.filter(r => now - r.at < REACTION_MS)
  const shown = messages.filter(m => (tab === 'near' ? !!m.near : !m.near))
  const unreadNear = tab === 'room' && messages.some(m => m.near && m.from !== id && now - m.at < BUBBLE_MS)
  const mode = link.current?.mode ?? (onlineAvailable ? 'online' : 'local')

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
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
              {/* hearing range around me */}
              <div className="pointer-events-none absolute rounded-full border-2 border-dashed border-ink/10 transition-transform ease-linear"
                style={{ width: (NEAR * 2 + 1) * TILE, height: (NEAR * 2 + 1) * TILE, left: 0, top: 0, transitionDuration: `${STEP_MS}ms`,
                  transform: `translate(${(pos.x - NEAR) * TILE}px, ${(pos.y - NEAR) * TILE}px)` }} />
              {items.map((it, i) => (
                <div key={i} className={cn('absolute grid place-items-center text-base', it.tone, it.round ? 'rounded-full' : 'rounded-lg', it.tone !== 'bg-transparent' && 'shadow-soft')}
                  style={{ left: it.x * TILE + 2, top: it.y * TILE + 2, width: it.w * TILE - 4, height: it.h * TILE - 4 }}>{it.emoji}</div>
              ))}
              {everyone.map(p => (
                <div key={p.id} className="pointer-events-none absolute left-0 top-0 transition-transform ease-linear"
                  style={{ transform: `translate(${p.x * TILE}px, ${p.y * TILE}px)`, width: TILE, height: TILE, transitionDuration: p.id === id ? `${STEP_MS}ms` : '200ms', zIndex: 10 + p.y }}>
                  {bubbles.has(p.id) && !blocked.has(p.id) && (
                    <div className="absolute bottom-[calc(100%+16px)] left-1/2 w-max max-w-[160px] -translate-x-1/2 animate-pop rounded-xl bg-surface px-2.5 py-1.5 text-[11px] leading-snug shadow-lift">
                      {bubbles.get(p.id)}
                    </div>
                  )}
                  {floating.filter(r => r.from === p.id).map(r => (
                    <span key={r.id} className="room-float absolute left-1/2 top-0 -translate-x-1/2 text-xl">{r.emoji}</span>
                  ))}
                  <div className="grid h-full place-items-center">
                    <div className={cn('relative rounded-full', p.dancing && 'room-dance', speaking.has(p.id) && 'ring-4 ring-sage-ink/60')}>
                      <Avatar emoji={p.emoji} color={p.color} ring={p.id === id} />
                      <span className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white', dotClass(p))} />
                    </div>
                  </div>
                  <span className="absolute left-1/2 top-[calc(100%-2px)] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/75 px-1.5 text-[10px] font-semibold text-cream">
                    {p.avail === 'dnd' && '🔕 '}{p.voice && '🎙️ '}{p.id === id ? `${p.name} (${t('room.you')})` : p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* my actions */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {REACTIONS.map(r => (
            <button key={r} className="btn btn-ghost h-9 w-9 p-0 text-lg" onClick={() => emit({ t: 'react', emoji: r })} title={t('room.react')}>{r}</button>
          ))}
          <span className="mx-1 h-6 w-px bg-line" />
          <button className={cn('btn h-9 px-3', voiceOn ? 'btn-sage' : 'btn-primary')} onClick={toggleVoice}>
            <Headphones size={15} />{voiceOn ? t('room.voice.leave') : t('room.voice.join')}
          </button>
          {voiceOn && (
            <button className={cn('btn h-9 w-9 p-0', micOn ? 'btn-soft' : 'bg-rose-soft text-rose-ink')} onClick={toggleMic}
              title={micOn ? t('room.voice.mute') : t('room.voice.unmute')}>
              {micOn ? <Mic size={15} /> : <MicOff size={15} />}
            </button>
          )}
          <span className="mx-1 h-6 w-px bg-line" />
          <button className={cn('btn h-9 px-3', dancing ? 'btn-sage' : 'btn-soft')} onClick={() => setDancing(d => !d)}>💃 {t('room.dance')}</button>
          <button className="btn btn-soft h-9 px-3" onClick={() => emit({ t: 'confetti' })}>🎊 {t('room.confetti')}</button>
          <button className="btn btn-soft h-9 px-3" onClick={() => emit({ t: 'gong', name: me.name })}>🔔 {t('room.gong')}</button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">{voiceOn ? t('room.voice.hint') : `${t('room.help')} ${t('room.timerHint')}`}</p>
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
          <PeerRow p={me} now={now} you={t('room.you')} />
          <div className="mt-2">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-beige p-1">
              {AVAILS.map(a => (
                <button key={a} onClick={() => setAvail(a)}
                  className={cn('rounded-lg px-1 py-1.5 text-xs font-semibold transition-all', avail === a ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink')}>
                  {t(`room.avail.${a}`)}
                </button>
              ))}
            </div>
          </div>
          <h3 className="section-title mb-1 mt-4">{t('room.inRoom')}</h3>
          {sortedOthers.length === 0 && <p className="text-xs text-muted">{t('room.alone')}</p>}
          <div className="max-h-56 overflow-y-auto">
            {sortedOthers.map(p => (
              <PeerRow key={p.id} p={p} now={now} isNear={near(p, pos)} blocked={blocked.has(p.id)} talking={talkingWith.has(p.id)}
                onWave={p.avail === 'dnd' || blocked.has(p.id) ? undefined : () => emit({ t: 'wave', name: me.name, to: p.id })}
                onBlock={() => toggleBlock(p.id)} />
            ))}
          </div>
        </div>
        <div className="card flex min-h-[300px] flex-1 flex-col p-4">
          <div className="mb-3 flex items-center gap-2">
            <Segmented value={tab} onChange={setTab} className="flex-1"
              options={[{ value: 'room', label: t('room.chatRoom') }, { value: 'near', label: `${t('room.chatNear')}${unreadNear ? ' •' : ''}` }]} />
            <button className="btn btn-ghost h-9 w-9 p-0 text-muted" onClick={() => setMuted(m => !m)} title={muted ? t('room.unmute') : t('room.mute')}>
              {muted ? <BellOff size={16} /> : <Bell size={16} />}
            </button>
          </div>
          {tab === 'near' && <p className="mb-2 text-[11px] text-muted">{t('room.nearHint')}</p>}
          <div className="max-h-72 flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
            {shown.length === 0 && <p className="text-xs text-muted">{t('room.chatEmpty')}</p>}
            {shown.map(m => (
              <p key={m.id} className="break-words"><span className="font-bold">{m.name}</span> <span className="text-ink-2">{m.text}</span></p>
            ))}
            <div ref={chatEnd} />
          </div>
          <form onSubmit={sendChat} className="mt-3 flex gap-2">
            <input className="input" value={draft} maxLength={300} onChange={e => setDraft(e.target.value)}
              placeholder={tab === 'near' ? t('room.chatNearPlaceholder') : t('room.chatPlaceholder')} />
            <button className="btn btn-primary px-3" aria-label={t('room.send')}><Send size={15} /></button>
          </form>
        </div>
      </aside>
    </div>
  )
}

function PeerRow({ p, now, you, isNear, blocked, talking, onWave, onBlock }:
  { p: Peer; now: number; you?: string; isNear?: boolean; blocked?: boolean; talking?: boolean; onWave?: () => void; onBlock?: () => void }) {
  const t = useT()
  return (
    <div className={cn('group flex items-center gap-2.5 py-1.5', blocked && 'opacity-50')}>
      <Avatar emoji={p.emoji} color={p.color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {p.name}{you && <span className="font-normal text-muted"> ({you})</span>}
          {isNear && <span className="chip ml-1.5 bg-sage-soft px-1.5 py-0 text-[10px] text-sage-ink">{t('room.near')}</span>}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className={cn('h-1.5 w-1.5 rounded-full', dotClass(p))} />{blocked ? t('room.blocked') : statusLabel(t, p, now)}
          {talking && <span className="font-semibold text-sky-ink">· 🔊 {t('room.voice.talking')}</span>}
        </p>
      </div>
      {onBlock && (
        <div className="flex shrink-0 gap-0.5">
          {onWave && <button className="btn btn-ghost h-8 w-8 p-0" onClick={onWave} title={t('room.wave')}>👋</button>}
          <button className="btn btn-ghost h-8 w-8 p-0 text-muted" onClick={onBlock} title={blocked ? t('room.unblock') : t('room.block')}>
            {blocked ? <Undo2 size={14} /> : <Ban size={14} />}
          </button>
        </div>
      )}
    </div>
  )
}
