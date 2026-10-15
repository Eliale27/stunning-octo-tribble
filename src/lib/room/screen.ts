/**
 * Screen sharing to people nearby, peer-to-peer like the voice links but one-way:
 * the sharer always makes the offer and only sends. The shared audio (a tab's or
 * the system's sound, when the browser offers it) travels with the video.
 */

import { gathered, iceConfig, loadIce } from './rtc'

/** `fromSharer` tells which side sent it, since two people can share to each other at once. */
export type ScreenSignal = { to: string; fromSharer: boolean; sdp?: RTCSessionDescriptionInit; ice?: RTCIceCandidateInit }

const CONNECT_TIMEOUT_MS = 10000
const NEW_LINK_GRACE_MS = 5000

interface Link { pc: RTCPeerConnection; pending: RTCIceCandidateInit[]; since: number }

export const canShareScreen = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia

export class ScreenShare {
  /** Links where I send my screen, keyed by viewer id. */
  private out = new Map<string, Link>()
  /** Links where I watch someone's screen, keyed by sharer id. */
  private in = new Map<string, Link>()
  private stream: MediaStream | null = null

  constructor(
    private send: (s: ScreenSignal) => void,
    /** A sharer's stream arrived (or left, with null). */
    private onRemote: (from: string, stream: MediaStream | null) => void,
    /** My share ended, e.g. from the browser's own "Stop sharing" bar. */
    private onEnded: () => void,
    /** A viewer could not be reached directly (usually a network that blocks peer-to-peer). */
    private onFailed: (viewer: string) => void = () => {},
  ) {}

  get sharing() { return !!this.stream }
  get hasAudio() { return !!this.stream?.getAudioTracks().length }

  async start() {
    if (this.stream) return
    void loadIce()
    this.stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 15, max: 30 } },
      // Chrome/Edge offer "share tab audio" (and system audio on Windows); others ignore it
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    })
    this.stream.getVideoTracks()[0]?.addEventListener('ended', () => { this.stop(); this.onEnded() })
  }

  stop() {
    for (const id of [...this.out.keys()]) this.dropOut(id)
    this.stream?.getTracks().forEach(t => t.stop())
    this.stream = null
  }

  /** Send my screen to exactly these viewers. */
  sync(ids: Set<string>) {
    if (!this.stream) return
    const now = Date.now()
    for (const [id, l] of [...this.out]) {
      const stale = l.pc.connectionState !== 'connected' && now - l.since > CONNECT_TIMEOUT_MS
      if (!ids.has(id) || stale) this.dropOut(id)
    }
    for (const id of ids) if (!this.out.has(id)) void this.offer(id)
  }

  /**
   * Stop watching sharers for whom `shouldStop` says so (walked away, stopped sharing).
   * Brand-new links are kept for a moment: the offer can arrive before their "sharing" state does.
   */
  stopWatching(shouldStop: (id: string) => boolean) {
    const now = Date.now()
    for (const [id, l] of [...this.in]) if (now - l.since > NEW_LINK_GRACE_MS && shouldStop(id)) this.dropIn(id)
  }

  async onSignal(from: string, s: ScreenSignal) {
    if (s.fromSharer) {
      if (s.sdp?.type === 'offer') {
        this.dropIn(from)
        const l = this.openIn(from)
        await l.pc.setRemoteDescription(s.sdp)
        for (const c of l.pending.splice(0)) await l.pc.addIceCandidate(c).catch(() => {})
        await l.pc.setLocalDescription(await l.pc.createAnswer())
        await gathered(l.pc)
        this.send({ to: from, fromSharer: false, sdp: l.pc.localDescription!.toJSON() })
      } else if (s.ice) {
        const l = this.in.get(from)
        if (!l) return
        if (l.pc.remoteDescription) await l.pc.addIceCandidate(s.ice).catch(() => {})
        else l.pending.push(s.ice)
      }
      return
    }
    const l = this.out.get(from)
    if (!l) return
    if (s.sdp?.type === 'answer') {
      if (l.pc.signalingState !== 'have-local-offer') return
      await l.pc.setRemoteDescription(s.sdp)
      for (const c of l.pending.splice(0)) await l.pc.addIceCandidate(c).catch(() => {})
    } else if (s.ice) {
      if (l.pc.remoteDescription) await l.pc.addIceCandidate(s.ice).catch(() => {})
      else l.pending.push(s.ice)
    }
  }

  close() {
    this.stop()
    for (const id of [...this.in.keys()]) this.dropIn(id)
  }

  private async offer(id: string) {
    const pc = new RTCPeerConnection(iceConfig())
    const l: Link = { pc, pending: [], since: Date.now() }
    this.out.set(id, l)
    this.stream!.getTracks().forEach(t => pc.addTransceiver(t, { direction: 'sendonly', streams: [this.stream!] }))
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') { this.dropOut(id); this.onFailed(id) } }
    await pc.setLocalDescription(await pc.createOffer())
    await gathered(pc)
    this.send({ to: id, fromSharer: true, sdp: pc.localDescription!.toJSON() })
  }

  private openIn(from: string): Link {
    const pc = new RTCPeerConnection(iceConfig())
    const l: Link = { pc, pending: [], since: Date.now() }
    this.in.set(from, l)
    let stream: MediaStream | null = null
    pc.ontrack = e => {
      stream ??= e.streams[0] ?? new MediaStream()
      if (!stream.getTracks().includes(e.track)) stream.addTrack(e.track)
      this.onRemote(from, stream)
    }
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') this.dropIn(from)
    }
    return l
  }

  private dropOut(id: string) {
    this.out.get(id)?.pc.close()
    this.out.delete(id)
  }

  private dropIn(id: string) {
    const l = this.in.get(id)
    if (!l) return
    l.pc.close()
    this.in.delete(id)
    this.onRemote(id, null)
  }
}
