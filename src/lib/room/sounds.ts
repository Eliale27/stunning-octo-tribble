/** Small synthesised sounds for the study room (no audio files). */

let ctx: AudioContext | null = null

function audio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch { return null }
  return ctx
}

function tone(freq: number, at: number, dur: number, level: number, type: OscillatorType = 'sine') {
  const c = audio()
  if (!c) return
  const t0 = c.currentTime + at
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(level, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

/** Soft "pop" for a new chat message. */
export const playBlip = () => tone(880, 0, 0.12, 0.06)

/** Two quick notes for a wave. */
export function playWave() { tone(660, 0, 0.18, 0.08); tone(990, 0.12, 0.25, 0.08) }

/** A gong: low fundamental with inharmonic partials and a long decay. */
export function playGong() {
  for (const [ratio, level] of [[1, 0.22], [1.48, 0.1], [2.17, 0.07], [2.9, 0.04]] as const) tone(110 * ratio, 0, 3.2, level)
}
