import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { formatISO, subDays } from 'date-fns'
import type { FocusState, Goal, Note, Session, Settings, Subject, Subtask, Task, TaskStatus, Topic } from '@/lib/types'
import { achievementDefs, seedGoals, seedNotes, seedSessions, seedSettings, seedSubjects, seedTasks, type AchievementId } from '@/data/seed'
import { streak, uid, weekRange, minutesBetween, questionsBetween } from '@/lib/utils'

export interface Toast { id: string; title: string; desc?: string; emoji?: string; confetti?: boolean }

interface State {
  loggedIn: boolean
  settings: Settings
  subjects: Subject[]
  tasks: Task[]
  sessions: Session[]
  goals: Goal[]
  notes: Note[]
  unlocked: Partial<Record<AchievementId, string>>
  focus: FocusState
  toasts: Toast[]
  sidebarCollapsed: boolean

  // auth
  login: (name?: string) => void
  logout: () => void

  // settings
  updateSettings: (p: Partial<Settings>) => void
  toggleSidebar: () => void

  // subjects & topics
  addSubject: (s: Omit<Subject, 'id' | 'topics'>) => string
  updateSubject: (id: string, p: Partial<Subject>) => void
  removeSubject: (id: string) => void
  addTopic: (subjectId: string, name: string) => void
  updateTopic: (subjectId: string, topicId: string, p: Partial<Topic>) => void
  removeTopic: (subjectId: string, topicId: string) => void

  // tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'subtasks' | 'status'> & { subtasks?: Subtask[]; status?: TaskStatus }) => void
  updateTask: (id: string, p: Partial<Task>) => void
  toggleTask: (id: string) => void
  moveTask: (id: string, status: TaskStatus) => void
  removeTask: (id: string) => void
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subId: string) => void
  removeSubtask: (taskId: string, subId: string) => void

  // sessions
  addSession: (s: Omit<Session, 'id' | 'date'> & { date?: string }) => void

  // goals
  addGoal: (g: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, p: Partial<Goal>) => void
  removeGoal: (id: string) => void

  // notes
  addNote: (n?: Partial<Note>) => string
  updateNote: (id: string, p: Partial<Note>) => void
  removeNote: (id: string) => void

  // review
  markReviewed: (subjectId: string, topicId: string, result: 'easy' | 'ok' | 'hard') => void

  // focus
  startFocus: (opts?: { subjectId?: string; topicId?: string; minutes?: number }) => void
  pauseFocus: () => void
  resumeFocus: () => void
  resetFocus: (mode?: 'focus' | 'break') => void
  completeFocus: () => void
  setFocusDuration: (minutes: number) => void

  // gamification
  checkAchievements: () => void
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void

  resetDemo: () => void
}

const seedUnlocked = (): Partial<Record<AchievementId, string>> => ({
  'first-session': formatISO(subDays(new Date(), 33)),
  'hours-10': formatISO(subDays(new Date(), 22)),
  'streak-7': formatISO(subDays(new Date(), 5)),
  'questions-100': formatISO(subDays(new Date(), 14)),
  'weekly-goal': formatISO(subDays(new Date(), 8)),
  'early-bird': formatISO(subDays(new Date(), 17)),
})

const initialFocus = (minutes: number): FocusState => ({
  mode: 'focus', running: false, remaining: minutes * 60, duration: minutes * 60, completedToday: 2,
})

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      loggedIn: false,
      settings: seedSettings,
      subjects: seedSubjects,
      tasks: seedTasks,
      sessions: seedSessions,
      goals: seedGoals,
      notes: seedNotes,
      unlocked: seedUnlocked(),
      focus: initialFocus(seedSettings.focusMinutes),
      toasts: [],
      sidebarCollapsed: false,

      login: (name) => set(s => ({ loggedIn: true, settings: name ? { ...s.settings, name } : s.settings })),
      logout: () => set({ loggedIn: false }),

      updateSettings: (p) => set(s => ({ settings: { ...s.settings, ...p } })),
      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      addSubject: (sub) => {
        const id = uid()
        set(s => ({ subjects: [...s.subjects, { ...sub, id, topics: [] }] }))
        return id
      },
      updateSubject: (id, p) => set(s => ({ subjects: s.subjects.map(x => x.id === id ? { ...x, ...p } : x) })),
      removeSubject: (id) => set(s => ({ subjects: s.subjects.filter(x => x.id !== id) })),
      addTopic: (subjectId, name) => set(s => ({
        subjects: s.subjects.map(x => x.id === subjectId ? {
          ...x, topics: [...x.topics, { id: uid(), subjectId, name, status: 'todo', progress: 0, minutes: 0, questions: 0, correct: 0, reviewStage: 0 }],
        } : x),
      })),
      updateTopic: (subjectId, topicId, p) => set(s => ({
        subjects: s.subjects.map(x => x.id === subjectId ? { ...x, topics: x.topics.map(t => t.id === topicId ? { ...t, ...p } : t) } : x),
      })),
      removeTopic: (subjectId, topicId) => set(s => ({
        subjects: s.subjects.map(x => x.id === subjectId ? { ...x, topics: x.topics.filter(t => t.id !== topicId) } : x),
      })),

      addTask: (t) => set(s => ({
        tasks: [{ ...t, id: uid(), createdAt: formatISO(new Date()), subtasks: t.subtasks ?? [], status: t.status ?? 'todo' }, ...s.tasks],
      })),
      updateTask: (id, p) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...p } : t) })),
      toggleTask: (id) => {
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t) }))
        get().checkAchievements()
      },
      moveTask: (id, status) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, status } : t) })),
      removeTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      addSubtask: (taskId, title) => set(s => ({
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: uid(), title, done: false }] } : t),
      })),
      toggleSubtask: (taskId, subId) => set(s => ({
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(st => st.id === subId ? { ...st, done: !st.done } : st) } : t),
      })),
      removeSubtask: (taskId, subId) => set(s => ({
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.filter(st => st.id !== subId) } : t),
      })),

      addSession: (sess) => {
        const date = sess.date ?? formatISO(new Date())
        set(s => ({
          sessions: [...s.sessions, { ...sess, id: uid(), date }],
          subjects: s.subjects.map(x => x.id === sess.subjectId ? {
            ...x,
            topics: x.topics.map(t => t.id === sess.topicId ? {
              ...t,
              minutes: t.minutes + sess.minutes,
              questions: t.questions + (sess.questions ?? 0),
              correct: t.correct + (sess.correct ?? 0),
              lastSession: date,
              status: t.status === 'locked' || t.status === 'todo' ? 'in_progress' : t.status,
              progress: t.status === 'done' ? 100 : Math.min(95, t.progress + Math.round(sess.minutes / 6)),
            } : t),
          } : x),
        }))
        get().checkAchievements()
      },

      addGoal: (g) => set(s => ({ goals: [...s.goals, { ...g, id: uid() }] })),
      updateGoal: (id, p) => set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...p } : g) })),
      removeGoal: (id) => set(s => ({ goals: s.goals.filter(g => g.id !== id) })),

      addNote: (n) => {
        const id = uid()
        set(s => ({
          notes: [{ id, title: 'Sem título', emoji: '📝', content: '', updatedAt: formatISO(new Date()), ...n }, ...s.notes],
        }))
        get().checkAchievements()
        return id
      },
      updateNote: (id, p) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...p, updatedAt: formatISO(new Date()) } : n) })),
      removeNote: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),

      markReviewed: (subjectId, topicId, result) => {
        set(s => ({
          subjects: s.subjects.map(x => x.id === subjectId ? {
            ...x,
            topics: x.topics.map(t => t.id === topicId ? {
              ...t,
              lastReviewed: formatISO(new Date()),
              reviewStage: result === 'hard' ? Math.max(0, t.reviewStage - 1) : result === 'ok' ? t.reviewStage + 1 : Math.min(5, t.reviewStage + 2),
            } : t),
          } : x),
        }))
        get().checkAchievements()
      },

      startFocus: (opts) => set(s => {
        const minutes = opts?.minutes ?? s.focus.duration / 60
        return { focus: { ...s.focus, mode: 'focus', running: true, duration: minutes * 60, remaining: minutes * 60, endsAt: Date.now() + minutes * 60 * 1000, subjectId: opts?.subjectId ?? s.focus.subjectId, topicId: opts?.topicId ?? s.focus.topicId } }
      }),
      pauseFocus: () => set(s => ({
        focus: { ...s.focus, running: false, remaining: s.focus.endsAt ? Math.max(0, Math.round((s.focus.endsAt - Date.now()) / 1000)) : s.focus.remaining, endsAt: undefined },
      })),
      resumeFocus: () => set(s => ({ focus: { ...s.focus, running: true, endsAt: Date.now() + s.focus.remaining * 1000 } })),
      resetFocus: (mode) => set(s => {
        const m = mode ?? s.focus.mode
        const dur = m === 'focus' ? s.settings.focusMinutes * 60 : s.settings.breakMinutes * 60
        return { focus: { ...s.focus, mode: m, running: false, endsAt: undefined, duration: dur, remaining: dur } }
      }),
      setFocusDuration: (minutes) => set(s => ({ focus: { ...s.focus, running: false, endsAt: undefined, duration: minutes * 60, remaining: minutes * 60 } })),
      completeFocus: () => {
        const { focus, settings } = get()
        if (focus.mode === 'focus') {
          get().addSession({ subjectId: focus.subjectId, topicId: focus.topicId, minutes: Math.round(focus.duration / 60) })
          const dur = settings.breakMinutes * 60
          set(s => ({ focus: { ...s.focus, mode: 'break', running: false, endsAt: undefined, duration: dur, remaining: dur, completedToday: s.focus.completedToday + 1 } }))
          get().pushToast({ title: 'Mais uma sessão concluída! 🎉', desc: `${Math.round(focus.duration / 60)} minutos registrados. Hora de uma pausa.`, emoji: '⏱️' })
        } else {
          const dur = settings.focusMinutes * 60
          set(s => ({ focus: { ...s.focus, mode: 'focus', running: false, endsAt: undefined, duration: dur, remaining: dur } }))
          get().pushToast({ title: 'Pausa concluída', desc: 'Pronto para a próxima sessão?', emoji: '🌱' })
        }
      },

      checkAchievements: () => {
        const s = get()
        const total = s.sessions.reduce((a, x) => a + x.minutes, 0)
        const questions = s.sessions.reduce((a, x) => a + (x.questions ?? 0), 0)
        const st = streak(s.sessions)
        const { start, end } = weekRange()
        const weeklyGoalDone = s.goals.some(g => g.period === 'weekly' && (
          (g.unit === 'minutes' && minutesBetween(s.sessions, start, end) >= g.target) ||
          (g.unit === 'questions' && questionsBetween(s.sessions, start, end) >= g.target)))
        const should: Record<AchievementId, boolean> = {
          'first-session': s.sessions.length > 0,
          'streak-7': st >= 7,
          'hours-10': total >= 600,
          'questions-100': questions >= 100,
          'weekly-goal': weeklyGoalDone,
          'streak-30': st >= 30,
          'hours-50': total >= 3000,
          'topic-master': s.subjects.some(x => x.topics.some(t => t.reviewStage >= 5)),
          'notes-5': s.notes.length >= 5,
          'early-bird': s.sessions.some(x => new Date(x.date).getHours() < 8),
        }
        const newly = (Object.keys(should) as AchievementId[]).filter(id => should[id] && !s.unlocked[id])
        if (newly.length) {
          const now = formatISO(new Date())
          set(x => ({ unlocked: { ...x.unlocked, ...Object.fromEntries(newly.map(id => [id, now])) } }))
          newly.forEach(id => {
            const def = achievementDefs.find(d => d.id === id)!
            get().pushToast({ title: 'Conquista desbloqueada', desc: def.title, emoji: def.emoji, confetti: true })
          })
        }
      },
      pushToast: (t) => {
        const id = uid()
        set(s => ({ toasts: [...s.toasts, { ...t, id }] }))
        setTimeout(() => get().dismissToast(id), 5000)
      },
      dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

      resetDemo: () => set({
        settings: seedSettings, subjects: seedSubjects, tasks: seedTasks, sessions: seedSessions, goals: seedGoals,
        notes: seedNotes, unlocked: seedUnlocked(), focus: initialFocus(seedSettings.focusMinutes), toasts: [],
      }),
    }),
    {
      name: 'estuda-v1',
      partialize: (s) => ({
        loggedIn: s.loggedIn, settings: s.settings, subjects: s.subjects, tasks: s.tasks, sessions: s.sessions,
        goals: s.goals, notes: s.notes, unlocked: s.unlocked, focus: s.focus, sidebarCollapsed: s.sidebarCollapsed,
      }),
    },
  ),
)

/* ---------- derived selectors ---------- */
export const useSubject = (id?: string) => useStore(s => s.subjects.find(x => x.id === id))
export const subjectProgress = (s: Subject) => s.topics.length ? Math.round(s.topics.reduce((a, t) => a + t.progress, 0) / s.topics.length) : 0
export const goalProgress = (g: Goal, sessions: Session[], subjects: Subject[]) => {
  const now = new Date()
  const range = g.period === 'daily'
    ? { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59) }
    : g.period === 'weekly' ? weekRange(now)
    : { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) }
  const inRange = sessions.filter(x => { const d = new Date(x.date); return d >= range.start && d <= range.end && (!g.subjectId || x.subjectId === g.subjectId) })
  let current = g.manualProgress ?? 0
  if (g.unit === 'minutes') current = inRange.reduce((a, x) => a + x.minutes, 0)
  else if (g.unit === 'questions') current = inRange.reduce((a, x) => a + (x.questions ?? 0), 0)
  else if (g.unit === 'sessions') current = inRange.length
  else if (g.unit === 'topics') {
    const subj = subjects.find(x => x.id === g.subjectId)
    current = subj ? subj.topics.filter(t => t.status === 'done').length : g.manualProgress ?? 0
  }
  return { current, pct: Math.min(100, Math.round((current / g.target) * 100)) }
}
