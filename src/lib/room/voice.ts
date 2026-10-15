/**
 * Proximity voice: a direct (peer-to-peer) WebRTC audio link to each nearby
 * person who also has their microphone on. Signalling rides on the room's
 * event channel, so no media server is needed. Without a TURN relay a small
 * share of networks (strict corporate/mobile NATs) cannot connect directly.
 */

import { gathered, iceConfig, loadIce } from './rtc'

export type VoiceState = 'connecting' | 'connected' | 'failed'

export type Signal = { to: string; sdp?: RTCSessionDescriptionInit; ice?: RTCIceCandidateInit }

interface Link { pc: RTCPeerConnection; audio: HTMLAudioElement; analyser?: AnalyserNode; pending: RTCIceCandidateInit[]; since: number }

/** A link that has not connected by then is dropped so the next sync retries it. */
const CONNECT_TIMEOUT_MS = 10000

export class VoiceMesh {
  private links = new Map<string, Link>()
  private local: MediaStream | null = null
  private ctx: AudioContext | null = null
  private localAnalyser: AnalyserNode | null = null
  /** When a link last failed, to show it for a while instead of silently retrying. */
  private failedAt = new Map<string, number>()
  /** The browser refused to start playback on its own; a click on "turn on sound" fixes it. */
  audioBlocked = false

  constructor(private myId: string, private send: (s: Signal) => void) {}

  get active() { return !!this.local }

  /** Ask for the microphone. Throws if the person refuses. */
  async start() {
    if (this.local) return
    await loadIce()
    this.local = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
    this.localAnalyser = this.analyse(this.local) ?? null
  }

  /** Mute/unmute my microphone without leaving the conversations. */
  setMicEnabled(on: boolean) { this.local?.getAudioTracks().forEach(t => { t.enabled = on }) }

  stop() {
    for (const id of [...this.links.keys()]) this.drop(id)
    this.local?.getTracks().forEach(t => t.stop())
    this.local = null
    this.localAnalyser = null
    this.audioBlocked = false
  }

  /** Retry playback from a click, which browsers always allow. */
  resumeAudio() {
    if (this.ctx?.state === 'suspended') void this.ctx.resume()
    this.audioBlocked = false
    for (const l of this.links.values()) if (l.audio.srcObject) this.play(l.audio)
  }

  /** Keep links only with `ids` (nearby, mic on). The lower id makes the offer, so there is never a clash. */
  sync(ids: Set<string>) {
    if (!this.local) return
    const now = Date.now()
    for (const [id, l] of [...this.links]) {
      const stale = l.pc.connectionState !== 'connected' && now - l.since > CONNECT_TIMEOUT_MS
      if (stale) this.failedAt.set(id, now)
      if (!ids.has(id) || stale) this.drop(id)
    }
    for (const id of [...this.failedAt.keys()]) if (!ids.has(id)) this.failedAt.delete(id)
    for (const id of ids) if (!this.links.has(id) && this.myId < id) void this.call(id)
  }

  /** Louder when closer: 1 next to you, fading towards the edge of the circle. */
  setVolume(id: string, v: number) {
    const l = this.links.get(id)
    if (l) l.audio.volume = Math.max(0, Math.min(1, v))
  }

  async onSignal(from: string, s: Signal) {
    if (!this.local) return
    if (s.sdp?.type === 'offer') {
      this.drop(from) // a fresh offer replaces any half-open link
      const l = this.open(from)
      await l.pc.setRemoteDescription(s.sdp)
      for (const c of l.pending.splice(0)) await l.pc.addIceCandidate(c).catch(() => {})
      await l.pc.setLocalDescription(await l.pc.createAnswer())
      await gathered(l.pc)
      this.send({ to: from, sdp: l.pc.localDescription!.toJSON() })
    } else if (s.sdp?.type === 'answer') {
      const l = this.links.get(from)
      if (l && l.pc.signalingState === 'have-local-offer') {
        await l.pc.setRemoteDescription(s.sdp)
        for (const c of l.pending.splice(0)) await l.pc.addIceCandidate(c).catch(() => {})
      }
    } else if (s.ice) {
      const l = this.links.get(from)
      if (!l) return
      if (l.pc.remoteDescription) await l.pc.addIceCandidate(s.ice).catch(() => {})
      else l.pending.push(s.ice)
    }
  }

  /** Ids currently speaking (mine included), from a simple loudness threshold. */
  speaking(): Set<string> {
    const out = new Set<string>()
    if (this.localAnalyser && loud(this.localAnalyser)) out.add(this.myId)
    for (const [id, l] of this.links) if (l.analyser && loud(l.analyser)) out.add(id)
    return out
  }

  connected(): Set<string> {
    const out = new Set<string>()
    for (const [id, l] of this.links) if (l.pc.connectionState === 'connected') out.add(id)
    return out
  }

  /** Link state with each person I should be talking to. */
  states(): Map<string, VoiceState> {
    const out = new Map<string, VoiceState>()
    for (const [id] of this.failedAt) out.set(id, 'failed')
    for (const [id, l] of this.links) {
      if (l.pc.connectionState === 'connected') { out.set(id, 'connected'); this.failedAt.delete(id) }
      else if (!out.has(id)) out.set(id, 'connecting')
    }
    return out
  }

  private async call(id: string) {
    const l = this.open(id)
    await l.pc.setLocalDescription(await l.pc.createOffer())
    await gathered(l.pc)
    this.send({ to: id, sdp: l.pc.localDescription!.toJSON() })
  }

  private open(id: string): Link {
    const pc = new RTCPeerConnection(iceConfig())
    const audio = document.createElement('audio')
    audio.autoplay = true
    audio.setAttribute('playsinline', '')
    audio.hidden = true
    document.body.appendChild(audio) // some mobile browsers only play media that is in the page
    const l: Link = { pc, audio, pending: [], since: Date.now() }
    this.local!.getTracks().forEach(t => pc.addTrack(t, this.local!))
    pc.ontrack = e => {
      const stream = e.streams[0] ?? new MediaStream([e.track])
      audio.srcObject = stream
      this.play(audio)
      l.analyser = this.analyse(stream)
    }
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') { this.failedAt.set(id, Date.now()); this.drop(id) } }
    this.links.set(id, l)
    return l
  }

  private drop(id: string) {
    const l = this.links.get(id)
    if (!l) return
    l.pc.close()
    l.audio.srcObject = null
    l.audio.remove()
    this.links.delete(id)
  }

  private play(audio: HTMLAudioElement) {
    audio.play().catch(() => { this.audioBlocked = true })
  }

  private analyse(stream: MediaStream): AnalyserNode | undefined {
    try {
      this.ctx ??= new AudioContext()
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      const a = this.ctx.createAnalyser()
      a.fftSize = 512
      this.ctx.createMediaStreamSource(stream).connect(a)
      return a
    } catch { return undefined }
  }
}

const buf = new Uint8Array(512)
function loud(a: AnalyserNode) {
  a.getByteTimeDomainData(buf)
  let sum = 0
  for (let i = 0; i < a.fftSize; i++) { const v = (buf[i] - 128) / 128; sum += v * v }
  return Math.sqrt(sum / a.fftSize) > 0.04
}
