/**
 * Real-time link for the study room. Two interchangeable transports:
 *  - online: Supabase Realtime (presence + broadcast), used when the public
 *    project URL and anon key are set at build time (VITE_SUPABASE_*);
 *  - local: BroadcastChannel, which only reaches other tabs of the same
 *    browser. Handy for testing the room without any account.
 * Neither stores anything: a room is just whoever is connected right now.
 */

export type PeerStatus = 'focus' | 'break' | 'idle'
/** Availability the person picks by hand; 'dnd' also silences waves. */
export type Availability = 'available' | 'busy' | 'dnd'

export interface Peer {
  id: string
  name: string
  emoji: string
  color: string
  x: number
  y: number
  status: PeerStatus
  /** Epoch ms when the peer's current focus/break ends, if running. */
  endsAt?: number
  avail: Availability
  dancing?: boolean
  /** Microphone on: joins voice with nearby people who also have it on. */
  voice?: boolean
  /** Sharing their screen with people nearby. */
  sharing?: boolean
}

/** Chat with `near` set is only shown to people within a few tiles of that spot. */
export interface ChatMessage { id: string; from: string; name: string; text: string; at: number; near?: { x: number; y: number } }

/** One-off happenings in the room. Everything is ephemeral: nothing is stored. */
export type RoomEvent =
  | ({ t: 'chat' } & ChatMessage)
  | { t: 'wave'; id: string; from: string; name: string; to: string; at: number }
  | { t: 'react'; id: string; from: string; emoji: string; at: number }
  | { t: 'gong'; id: string; from: string; name: string; reason?: string; at: number }
  | { t: 'confetti'; id: string; from: string; at: number }
  /** WebRTC signalling for proximity voice, addressed to one peer. */
  | { t: 'rtc'; id: string; from: string; to: string; at: number; sdp?: RTCSessionDescriptionInit; ice?: RTCIceCandidateInit; ch?: 'screen'; fromSharer?: boolean }

export interface RoomHandlers {
  onPeer: (p: Peer) => void
  onLeave: (id: string) => void
  onEvent: (e: RoomEvent) => void
  onStatus?: (s: 'connecting' | 'online' | 'error') => void
}

export interface RoomLink {
  mode: 'online' | 'local'
  /** Send my latest state (position, status). Cheap to call often. */
  update: (p: Peer) => void
  /** Send an event to everyone, including myself. */
  emit: (e: RoomEvent) => void
  close: () => void
}

// Eliale's Supabase project. The publishable key is meant to ship in browser code:
// it only allows what the project allows, and the room uses Realtime channels, no tables.
// Build-time env vars override these (e.g. a fork pointing at its own project).
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://cygwwydfobezakfvxqca.supabase.co'
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_vyDu01CtQvrKM0P35T8nAg_r668t4HG'

/** VITE_ROOM_LOCAL=1 forces the local test mode, e.g. for testing without network. */
export const onlineAvailable = !!(SUPABASE_URL && SUPABASE_KEY) && import.meta.env.VITE_ROOM_LOCAL !== '1'

export function connectRoom(roomId: string, me: Peer, h: RoomHandlers): RoomLink {
  return onlineAvailable ? connectSupabase(roomId, me, h) : connectLocal(roomId, me, h)
}

// ---------------------------------------------------------------- local

const HEARTBEAT_MS = 3000
const STALE_MS = 10000

type LocalMsg =
  | { t: 'state'; p: Peer; hello?: boolean }
  | { t: 'bye'; id: string }
  | { t: 'evt'; e: RoomEvent }

function connectLocal(roomId: string, me: Peer, h: RoomHandlers): RoomLink {
  const ch = new BroadcastChannel(`estuda-room:${roomId}`)
  let mine = me
  const seen = new Map<string, number>()
  const post = (m: LocalMsg) => ch.postMessage(m)

  ch.onmessage = (e: MessageEvent<LocalMsg>) => {
    const m = e.data
    if (m.t === 'state') {
      if (m.p.id === mine.id) return
      seen.set(m.p.id, Date.now())
      h.onPeer(m.p)
      if (m.hello) post({ t: 'state', p: mine }) // let the newcomer see me at once
    } else if (m.t === 'bye') {
      seen.delete(m.id); h.onLeave(m.id)
    } else if (m.t === 'evt') {
      h.onEvent(m.e)
    }
  }

  const beat = setInterval(() => {
    post({ t: 'state', p: mine })
    const now = Date.now()
    for (const [id, at] of seen) if (now - at > STALE_MS) { seen.delete(id); h.onLeave(id) }
  }, HEARTBEAT_MS)

  const bye = () => post({ t: 'bye', id: mine.id })
  window.addEventListener('pagehide', bye)
  post({ t: 'state', p: mine, hello: true })
  h.onStatus?.('online')

  return {
    mode: 'local',
    update: p => { mine = p; post({ t: 'state', p }) },
    emit: e => { post({ t: 'evt', e }); h.onEvent(e) },
    close: () => { bye(); clearInterval(beat); window.removeEventListener('pagehide', bye); ch.close() },
  }
}

// ---------------------------------------------------------------- online

/** Presence updates are rate limited, so moves go out as broadcasts and presence is synced after a pause. */
const PRESENCE_DEBOUNCE_MS = 600

function connectSupabase(roomId: string, me: Peer, h: RoomHandlers): RoomLink {
  let mine = me
  let closed = false
  let send: ((event: string, payload: unknown) => void) | null = null
  let track: ((p: Peer) => void) | null = null
  let cleanup: (() => void) | null = null
  let trackTimer: ReturnType<typeof setTimeout> | undefined
  h.onStatus?.('connecting')

  import('@supabase/supabase-js').then(({ createClient }) => {
    if (closed) return
    const client = createClient(SUPABASE_URL!, SUPABASE_KEY!, { auth: { persistSession: false } })
    const channel = client.channel(`estuda-room:${roomId}`, {
      config: { presence: { key: mine.id }, broadcast: { self: false } },
    })
    const present = new Set<string>()

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<Peer>()
        const now = new Set<string>()
        for (const [key, metas] of Object.entries(state)) {
          const p = metas[metas.length - 1]
          if (!p || key === mine.id) continue
          now.add(key)
          h.onPeer(p as unknown as Peer)
        }
        for (const id of present) if (!now.has(id)) h.onLeave(id)
        present.clear(); now.forEach(id => present.add(id))
      })
      .on('broadcast', { event: 'state' }, ({ payload }) => { const p = payload as Peer; if (present.has(p.id)) h.onPeer(p) })
      .on('broadcast', { event: 'evt' }, ({ payload }) => h.onEvent(payload as RoomEvent))
      .subscribe(status => {
        if (status === 'SUBSCRIBED') { h.onStatus?.('online'); channel.track(mine) }
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') h.onStatus?.('error')
      })

    send = (event, payload) => { channel.send({ type: 'broadcast', event, payload }) }
    track = p => { channel.track(p) }
    cleanup = () => { channel.untrack(); client.removeChannel(channel) }
  }).catch(() => h.onStatus?.('error'))

  return {
    mode: 'online',
    update: p => {
      mine = p
      send?.('state', p)
      clearTimeout(trackTimer)
      trackTimer = setTimeout(() => track?.(mine), PRESENCE_DEBOUNCE_MS)
    },
    emit: e => { send?.('evt', e); h.onEvent(e) },
    close: () => { closed = true; clearTimeout(trackTimer); cleanup?.() },
  }
}
