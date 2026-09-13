/**
 * Separate Copilot Workspace: the Copilot runs in its own browser window (or a detached desktop window when
 * packaged), never as an overlay on the interview platform. The user can move it to another monitor, resize
 * it, minimize it and restore it. Context is shared through localStorage (see the store's storage listener).
 */
const WINDOW_NAME = 'interviewpilot-copilot'
let ref: Window | null = null

export function copilotUrl(interviewId: string, compact: boolean): string {
  const base = `${location.origin}${location.pathname}`
  return `${base}#/copilot/${interviewId}${compact ? '?compact=1' : ''}`
}

export function openCopilotWindow(interviewId: string, compact: boolean): Window | null {
  const width = compact ? 420 : 520
  const height = compact ? 560 : 760
  const left = Math.max(0, (screen.availWidth ?? 1280) - width - 24)
  const top = 60
  const features = `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no`
  if (ref && !ref.closed) {
    ref.location.hash = `#/copilot/${interviewId}${compact ? '?compact=1' : ''}`
    ref.focus()
    return ref
  }
  ref = window.open(copilotUrl(interviewId, compact), WINDOW_NAME, features)
  return ref
}

export function isCopilotWindow(): boolean {
  return window.name === WINDOW_NAME || location.hash.startsWith('#/copilot/')
}

export function focusMainWindow() {
  if (window.opener && !window.opener.closed) window.opener.focus()
}

/** Best-effort "minimize": browsers cannot minimize programmatically, so we blur and hand focus back to the main window. */
export function minimizeCopilot() {
  try { window.blur() } catch { /* ignore */ }
  focusMainWindow()
}
