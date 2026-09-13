import { useEffect } from 'react'
import type { ShortcutMap } from './types'

/** Normalize a KeyboardEvent to a "Ctrl+Shift+S" style string. */
export function eventToCombo(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  let key = e.key
  if (key === ' ') key = 'Space'
  else if (key === '8' && e.shiftKey) key = '*'
  else if (key.length === 1) key = key.toUpperCase()
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) parts.push(key)
  return parts.join('+')
}

export function normalizeCombo(c: string): string {
  return c.split('+').map((p) => p.trim()).map((p) => (p.length === 1 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1))).join('+')
}

export type ShortcutHandlers = Partial<Record<keyof ShortcutMap, () => void>>

/**
 * Registers app-scoped keyboard shortcuts on the current window only.
 * Shortcuts are never global system hooks — they only fire while the InterviewPilot window is focused.
 */
export function useShortcuts(map: ShortcutMap, handlers: ShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const lookup = new Map<string, keyof ShortcutMap>()
    for (const [name, combo] of Object.entries(map) as [keyof ShortcutMap, string][]) lookup.set(normalizeCombo(combo), name)
    const onKey = (e: KeyboardEvent) => {
      const combo = eventToCombo(e)
      const action = lookup.get(combo)
      if (!action) return
      const target = e.target as HTMLElement | null
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      // Plain Escape inside a text field should keep its native meaning; combos with Ctrl are always app shortcuts.
      if (typing && !e.ctrlKey && !e.metaKey && action !== 'minimize') return
      const fn = handlers[action]
      if (!fn) return
      e.preventDefault()
      fn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [map, handlers, enabled])
}
