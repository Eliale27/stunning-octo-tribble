export function uid(prefix = 'id'): string {
  const rnd = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)
  return `${prefix}_${rnd}`
}

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return formatDate(ts)
}

export function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s
}

export function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0
}

export function splitLines(s: string): string[] {
  return s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

export function scoreTone(n: number): 'success' | 'warn' | 'danger' {
  return n >= 75 ? 'success' : n >= 50 ? 'warn' : 'danger'
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export function dataUrlToBase64(dataUrl: string): { mediaType: string; data: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,(.*)$/s)
  if (!m) throw new Error('Invalid data URL')
  return { mediaType: m[1], data: m[2] }
}

export function download(filename: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
