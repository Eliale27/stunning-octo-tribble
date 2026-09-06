export type PastelColor = 'sky' | 'butter' | 'sage' | 'rose' | 'lilac' | 'peach'

export type TopicStatus = 'done' | 'in_progress' | 'todo' | 'locked'

export interface Topic {
  id: string
  subjectId: string
  name: string
  status: TopicStatus
  progress: number // 0-100
  minutes: number
  lastSession?: string // ISO date
  questions: number
  correct: number
  /** spaced repetition */
  reviewStage: number // 0..5
  lastReviewed?: string // ISO date
}

export interface Subject {
  id: string
  name: string
  color: PastelColor
  emoji: string
  goalDate?: string
  topics: Topic[]
}

export type Priority = 'alta' | 'media' | 'baixa'
export type TaskStatus = 'todo' | 'doing' | 'done'

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  subjectId?: string
  date?: string // ISO yyyy-mm-dd
  priority: Priority
  category?: string
  estimate?: number // minutes
  notes?: string
  status: TaskStatus
  subtasks: Subtask[]
  createdAt: string
}

export interface Session {
  id: string
  subjectId?: string
  topicId?: string
  date: string // ISO datetime
  minutes: number
  questions?: number
  correct?: number
}

export type GoalPeriod = 'daily' | 'weekly' | 'monthly'
export type GoalUnit = 'minutes' | 'questions' | 'topics' | 'sessions'

export interface Goal {
  id: string
  title: string
  period: GoalPeriod
  target: number
  unit: GoalUnit
  subjectId?: string
  deadline?: string
  /** for goals that are manually tracked */
  manualProgress?: number
}

export interface Note {
  id: string
  title: string
  emoji: string
  subjectId?: string
  content: string // HTML
  updatedAt: string
}

export interface Settings {
  name: string
  dailyGoalMinutes: number
  focusMinutes: number
  breakMinutes: number
  longBreakMinutes: number
  soundEnabled: boolean
  weekStartsMonday: boolean
}

export interface FocusState {
  mode: 'focus' | 'break'
  running: boolean
  endsAt?: number // epoch ms
  remaining: number // seconds (when paused)
  duration: number // seconds
  subjectId?: string
  topicId?: string
  completedToday: number
}
