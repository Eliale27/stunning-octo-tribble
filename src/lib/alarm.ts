/**
 * End-of-session alert: a soft two-note chime synthesised with the Web Audio API
 * (no audio files), plus a Web Worker timer so the alert still fires on time
 * when the tab is in the background and the page's own timers are throttled.
 */

let ctx: AudioContext | null = null

/** Create/resume the AudioContext. Must be called from a user gesture at least once. */
export function primeAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch { /* audio unavailable */ }
}

// Any first interaction unlocks audio so the chime can play later, even in a background tab.
if (typeof window !== 'undefined') {
  const unlock = () => primeAudio()
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock, { passive: true })
}

/** Play a gentle bell: two sine partials per note, ~1.8 s total. volume 0..1 */
export function playChime(volume = 0.7) {
  primeAudio()
  if (!ctx || volume <= 0) return
  const t0 = ctx.currentTime + 0.02
  const master = ctx.createGain()
  master.gain.value = Math.min(1, Math.max(0, volume)) * 0.5
  master.connect(ctx.destination)

  const note = (freq: number, at: number, dur: number, level: number) => {
    const partials: Array<[number, number]> = [[1, 1], [2.01, 0.28], [2.98, 0.08]]
    partials.forEach(([ratio, amp]) => {
      const osc = ctx!.createOscillator()
      const g = ctx!.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq * ratio
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(level * amp, at + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
      osc.connect(g).connect(master)
      osc.start(at)
      osc.stop(at + dur + 0.05)
    })
  }
  note(1046.5, t0, 1.3, 0.8)        // C6
  note(1318.5, t0 + 0.28, 1.5, 0.7) // E6
}

/* ---------- background-safe alarm ---------- */
let worker: Worker | null = null
let onDue: (() => void) | null = null

function getWorker() {
  if (worker) return worker
  const src = `let t=null;onmessage=e=>{clearTimeout(t);t=null;if(e.data&&e.data.endsAt){t=setTimeout(()=>postMessage('due'),Math.max(0,e.data.endsAt-Date.now()))}}`
  worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'application/javascript' })))
  worker.onmessage = () => onDue?.()
  return worker
}

/** Fire `cb` at `endsAt` (epoch ms) even if the tab is hidden. Replaces any previous alarm. */
export function scheduleAlarm(endsAt: number, cb: () => void) {
  onDue = cb
  try { getWorker().postMessage({ endsAt }) } catch { /* fall back to the page ticker */ }
}

export function cancelAlarm() {
  onDue = null
  try { worker?.postMessage({}) } catch { /* ignore */ }
}
