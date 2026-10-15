/** Shared WebRTC bits for voice and screen sharing. */

const STUN: RTCIceServer = { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }

/**
 * Optional TURN relay, for networks that block direct peer-to-peer links (many mobile
 * carriers and Wi-Fi routers do). Points at a Metered credentials URL
 * (https://<app>.metered.live/api/v1/turn/credentials?apiKey=...), whose key only
 * hands out short-lived relay credentials. Without it only direct links are tried.
 */
const TURN_CREDENTIALS_URL = (import.meta.env.VITE_TURN_CREDENTIALS_URL as string | undefined) || ''

let current: RTCConfiguration = { iceServers: [STUN] }
let loading: Promise<void> | null = null

/** The best configuration known right now; call `loadIce` early so it includes the relay. */
export const iceConfig = () => current

export const hasRelay = () => !!current.iceServers?.some(s => [s.urls].flat().some(u => u.startsWith('turn')))

export function loadIce(): Promise<void> {
  if (!TURN_CREDENTIALS_URL) return Promise.resolve()
  loading ??= fetch(TURN_CREDENTIALS_URL)
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((servers: RTCIceServer[]) => { if (Array.isArray(servers) && servers.length) current = { iceServers: [STUN, ...servers] } })
    .catch(() => { loading = null }) // try again next time
  return loading
}

/**
 * Wait until the connection has found its network candidates (or a short timeout),
 * so the offer/answer can carry them all in one message instead of a burst of small
 * ones that the realtime service may rate-limit.
 */
export function gathered(pc: RTCPeerConnection, timeoutMs = 3000): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise(resolve => {
    const done = () => { pc.removeEventListener('icegatheringstatechange', check); clearTimeout(timer); resolve() }
    const check = () => { if (pc.iceGatheringState === 'complete') done() }
    const timer = setTimeout(done, timeoutMs)
    pc.addEventListener('icegatheringstatechange', check)
  })
}
