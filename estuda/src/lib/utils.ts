import type { PastelColor, Priority, Session, Topic } from './types'
import {
  differenceInCalendarDays, format, isSameDay, parseISO, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, isWithinInterval, subDays, addDays, getDayOfYear,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

export const fmtMinutes = (m: number) => {
  const h = Math.floor(m / 60)
  const mm = Math.round(m % 60)
  if (h === 0) return `${mm}min`
  if (mm === 0) return `${h}h`
  return `${h}h${String(mm).padStart(2, '0')}`
}

export const fmtDate = (iso: string, f = "d 'de' MMM") => format(parseISO(iso), f, { locale: ptBR })

export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

export const relativeDay = (iso: string) => {
  const d = parseISO(iso)
  const diff = differenceInCalendarDays(d, new Date())
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff === -1) return 'Ontem'
  if (diff < 0) return `há ${Math.abs(diff)} dias`
  if (diff < 7) return format(d, 'EEEE', { locale: ptBR })
  return format(d, "d 'de' MMM", { locale: ptBR })
}

export const greeting = (name: string) => {
  const h = new Date().getHours()
  const g = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return `${g}, ${name} 👋`
}

/* ---------- colors ---------- */
export const colorClasses: Record<PastelColor, { bg: string; soft: string; text: string; ring: string; hex: string; dot: string }> = {
  sky:    { bg: 'bg-sky',    soft: 'bg-sky-soft',    text: 'text-sky-ink',    ring: 'ring-sky/40',    hex: '#A9C4E0', dot: 'bg-sky' },
  butter: { bg: 'bg-butter', soft: 'bg-butter-soft', text: 'text-butter-ink', ring: 'ring-butter/40', hex: '#F2DC9B', dot: 'bg-butter' },
  sage:   { bg: 'bg-sage',   soft: 'bg-sage-soft',   text: 'text-sage-ink',   ring: 'ring-sage/40',   hex: '#A9C4A0', dot: 'bg-sage' },
  rose:   { bg: 'bg-rose',   soft: 'bg-rose-soft',   text: 'text-rose-ink',   ring: 'ring-rose/40',   hex: '#EFB8C4', dot: 'bg-rose' },
  lilac:  { bg: 'bg-lilac',  soft: 'bg-lilac-soft',  text: 'text-lilac-ink',  ring: 'ring-lilac/40',  hex: '#C5B8E0', dot: 'bg-lilac' },
  peach:  { bg: 'bg-peach',  soft: 'bg-peach-soft',  text: 'text-peach-ink',  ring: 'ring-peach/40',  hex: '#F4C9A8', dot: 'bg-peach' },
}
export const pastelColors: PastelColor[] = ['sky', 'butter', 'sage', 'rose', 'lilac', 'peach']

export const priorityMeta: Record<Priority, { label: string; cls: string; icon: string }> = {
  alta:  { label: 'Alta',  cls: 'bg-rose-soft text-rose-ink',     icon: '⭐' },
  media: { label: 'Média', cls: 'bg-butter-soft text-butter-ink', icon: '◐' },
  baixa: { label: 'Baixa', cls: 'bg-sage-soft text-sage-ink',     icon: '○' },
}

/* ---------- quotes ---------- */
export const quotes = [
  'Não precisa estudar perfeitamente. Precisa continuar.',
  'Seu futuro está sendo construído nas pequenas sessões de hoje.',
  '30 minutos hoje são melhores que zero.',
  'Consistência vence intensidade.',
  'Aprender é lento até o dia em que deixa de ser.',
  'O que você revisa hoje, lembra amanhã.',
  'Foque na próxima sessão, não em todo o caminho.',
  'Cada tópico concluído é um peso a menos.',
  'Você não precisa de motivação. Precisa de um começo.',
  'Estudar cansado ainda é estudar. Só ajuste o ritmo.',
  'Progresso invisível ainda é progresso.',
  'Comece pequeno. Termine o que começou.',
  'A dúvida de hoje é a resposta de amanhã.',
  'Descansar também faz parte do plano.',
]
export const dailyQuote = () => quotes[getDayOfYear(new Date()) % quotes.length]

/* ---------- levels ---------- */
export const levels = [
  { name: 'Começando', emoji: '🌱', minHours: 0 },
  { name: 'Criando ritmo', emoji: '🌿', minHours: 10 },
  { name: 'Consistente', emoji: '🌳', minHours: 40 },
  { name: 'Avançado', emoji: '⭐', minHours: 100 },
  { name: 'Mestre', emoji: '🏆', minHours: 250 },
]
export const levelFor = (totalMinutes: number) => {
  const hours = totalMinutes / 60
  let idx = 0
  levels.forEach((l, i) => { if (hours >= l.minHours) idx = i })
  const current = levels[idx]
  const next = levels[idx + 1]
  const pct = next ? Math.min(100, ((hours - current.minHours) / (next.minHours - current.minHours)) * 100) : 100
  return { index: idx, current, next, pct }
}

/* ---------- sessions & stats ---------- */
export const sessionsOn = (sessions: Session[], day: Date) => sessions.filter(s => isSameDay(parseISO(s.date), day))
export const minutesOn = (sessions: Session[], day: Date) => sessionsOn(sessions, day).reduce((a, s) => a + s.minutes, 0)

export const minutesBetween = (sessions: Session[], start: Date, end: Date) =>
  sessions.filter(s => isWithinInterval(parseISO(s.date), { start, end })).reduce((a, s) => a + s.minutes, 0)

export const questionsBetween = (sessions: Session[], start: Date, end: Date) =>
  sessions.filter(s => isWithinInterval(parseISO(s.date), { start, end })).reduce((a, s) => a + (s.questions ?? 0), 0)

export const weekRange = (d = new Date()) => ({ start: startOfWeek(d, { weekStartsOn: 1 }), end: endOfWeek(d, { weekStartsOn: 1 }) })
export const monthRange = (d = new Date()) => ({ start: startOfMonth(d), end: endOfMonth(d) })

export const streak = (sessions: Session[]) => {
  let count = 0
  let day = new Date()
  // today may not have a session yet; streak counts from yesterday if not
  if (minutesOn(sessions, day) === 0) day = subDays(day, 1)
  while (minutesOn(sessions, day) > 0) { count++; day = subDays(day, 1) }
  return count
}

export const daysStudied = (sessions: Session[]) => {
  const set = new Set(sessions.map(s => s.date.slice(0, 10)))
  return set.size
}

export const lastNDays = (n: number) => Array.from({ length: n }, (_, i) => subDays(new Date(), n - 1 - i))
export const nextNDays = (n: number) => Array.from({ length: n }, (_, i) => addDays(new Date(), i))

/* ---------- spaced repetition ---------- */
export const reviewIntervals = [1, 3, 7, 14, 30, 60] // days between reviews per stage

export type ReviewBucket = 'today' | 'soon' | 'mastered'
export const reviewInfo = (t: Topic) => {
  const base = t.lastReviewed ?? t.lastSession
  if (!base) return null
  const interval = reviewIntervals[Math.min(t.reviewStage, reviewIntervals.length - 1)]
  const due = addDays(parseISO(base), interval)
  const daysUntil = differenceInCalendarDays(due, new Date())
  const daysSince = differenceInCalendarDays(new Date(), parseISO(base))
  let bucket: ReviewBucket = 'soon'
  if (daysUntil <= 0) bucket = 'today'
  else if (t.reviewStage >= 4 && daysUntil > 7) bucket = 'mastered'
  else if (daysUntil > 7) bucket = 'mastered'
  return { due, daysUntil, daysSince, bucket, interval }
}

export const accuracy = (t: { questions: number; correct: number }) => t.questions ? Math.round((t.correct / t.questions) * 100) : 0

export const clamp = (n: number, a = 0, b = 100) => Math.max(a, Math.min(b, n))
