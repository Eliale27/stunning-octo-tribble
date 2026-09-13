// ---------- Candidate Knowledge Base (built from the resume) ----------

export interface Experience {
  id: string
  company: string
  role: string
  period?: string
  location?: string
  remote?: boolean
  responsibilities: string[]
  projects: string[]
  results: string[]
  tools: string[]
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  field?: string
  period?: string
  kind: 'degree' | 'postgraduate' | 'course' | 'certification'
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  kind: 'professional' | 'personal' | 'freelance' | 'remote'
  tools: string[]
  results: string[]
}

export interface LanguageSkill {
  language: string
  level: string
}

export interface CandidateKnowledgeBase {
  name?: string
  headline?: string
  summary?: string
  location?: string
  experiences: Experience[]
  education: EducationItem[]
  skills: {
    hard: string[]
    soft: string[]
    technologies: string[]
    tools: string[]
    languages: LanguageSkill[]
  }
  projects: ProjectItem[]
}

export interface Resume {
  id: string
  name: string
  rawText: string
  kb: CandidateKnowledgeBase
  createdAt: number
  updatedAt: number
  source: 'pdf' | 'docx' | 'txt' | 'paste'
}

// ---------- Job intelligence ----------

export interface JobAnalysis {
  title: string
  company?: string
  seniority: string
  responsibilities: string[]
  mustHave: string[]
  niceToHave: string[]
  skills: string[]
  softSkills: string[]
  languages: string[]
  keywords: string[]
  competencies: string[]
  companyWants: string[]
  likelyQuestions: string[]
}

export interface Job {
  id: string
  title: string
  company: string
  rawText: string
  sourceUrl?: string
  analysis: JobAnalysis
  createdAt: number
}

// ---------- Match ----------

export interface MatchResult {
  overall: number
  experience: number
  skills: number
  education: number
  language: number
  requirements: number
  strongMatches: { label: string; evidence: string }[]
  gaps: string[]
  talkingPoints: { label: string; why: string }[]
}

// ---------- Company intelligence ----------

export interface CompanyIntel {
  id: string
  name: string
  sourceUrl?: string
  overview: string
  products: string[]
  industry: string
  values: string[]
  culture: string[]
  roleExpectations: string[]
  likelyTopics: string[]
  potentialQuestions: string[]
  whyWorkHere: string
  createdAt: number
}

// ---------- Interview session (practice + copilot) ----------

export type QuestionType =
  | 'tell-me-about-yourself'
  | 'behavioral'
  | 'technical'
  | 'situational'
  | 'experience'
  | 'motivation'
  | 'salary'
  | 'availability'
  | 'culture-fit'
  | 'problem-solving'
  | 'leadership'
  | 'communication'
  | 'language'
  | 'other'

export interface StarStory {
  situation: string
  task: string
  action: string
  result: string
  sourceExperienceId?: string
}

export interface QuestionAnalysis {
  type: QuestionType
  intent: string
  evaluating: string[]
  keyPoints: string[]
  relevantExperience: { experienceId?: string; label: string; why: string }[]
  star?: StarStory
  insufficientInfo?: boolean
}

export interface AnswerSet {
  quick: string
  natural: string
  strong: string
}

export type RefineAction = 'shorter' | 'natural' | 'confident' | 'professional' | 'star' | 'regenerate'

export interface InterviewTurn {
  id: string
  question: string
  askedAt: number
  analysis?: QuestionAnalysis
  answers?: AnswerSet
  activeAnswer?: keyof AnswerSet
  followUps?: string[]
  status: 'pending' | 'analyzing' | 'answering' | 'done' | 'error'
  error?: string
  notes?: string
}

export interface Interview {
  id: string
  title: string
  mode: 'copilot' | 'practice'
  jobId?: string
  resumeId?: string
  companyId?: string
  turns: InterviewTurn[]
  createdAt: number
  updatedAt: number
  strengths: string[]
  weaknesses: string[]
}

// ---------- Mock interview ----------

export type MockCategory = 'behavioral' | 'technical' | 'hr' | 'hiring-manager' | 'english' | 'mixed'

export interface MockScore {
  overall: number
  relevance: number
  clarity: number
  structure: number
  confidence: number
  naturalness: number
  grammar: number
  conciseness: number
  examples: number
  jobAlignment: number
  feedback: string
  improvedAnswer: string
}

export interface MockTurn {
  id: string
  question: string
  type: QuestionType
  answer?: string
  score?: MockScore
  answeredAt?: number
}

export interface MockReport {
  overall: number
  strongest: { question: string; score: number; why: string }[]
  weakest: { question: string; score: number; why: string }[]
  improvements: string[]
  practiceQuestions: string[]
  summary: string
}

export interface MockSession {
  id: string
  title: string
  category: MockCategory
  jobId?: string
  resumeId?: string
  companyId?: string
  turns: MockTurn[]
  report?: MockReport
  status: 'active' | 'completed'
  createdAt: number
  updatedAt: number
  englishCoach?: boolean
}

// ---------- Challenge solver ----------

export type ChallengeKind =
  | 'math' | 'logic' | 'excel' | 'sql' | 'programming' | 'data-analysis' | 'translation'
  | 'grammar' | 'writing' | 'classification' | 'ai-evaluation' | 'data-annotation'
  | 'prompt-evaluation' | 'case-study' | 'business' | 'other'

export interface ChallengeSolution {
  understand: string
  approach: string
  solution: string
  finalAnswer: string
  explanation: string
}

export interface Challenge {
  id: string
  title: string
  kind: ChallengeKind
  prompt: string
  imageDataUrl?: string
  solution?: ChallengeSolution
  interviewId?: string
  createdAt: number
}

// ---------- English coach ----------

export interface EnglishFeedback {
  grammar: number
  vocabulary: number
  fluency: number
  naturalness: number
  professionalism: number
  fillerWords: string[]
  corrections: { original: string; better: string; why: string }[]
  naturalVersion: string
  summary: string
}

// ---------- Profile & settings ----------

export type CommunicationStyle = 'professional' | 'friendly' | 'confident' | 'analytical' | 'technical' | 'enthusiastic' | 'concise'
export type AnswerLength = 'very-short' | 'short' | 'medium' | 'detailed'
export type PreferredLanguage = 'en' | 'pt' | 'es' | 'it'

export interface CandidateProfile {
  style: CommunicationStyle
  answerLength: AnswerLength
  language: PreferredLanguage
  targetRole?: string
  notes?: string
}

export type AIMode = 'server' | 'browser' | 'offline'

export interface ShortcutMap {
  generate: string
  shorter: string
  natural: string
  professional: string
  star: string
  minimize: string
}

export interface Settings {
  theme: 'system' | 'light' | 'dark'
  aiMode: AIMode
  browserApiKey?: string
  model: string
  fastModel: string
  shortcuts: ShortcutMap
  compactMode: boolean
  copilotAlwaysOnTop: boolean
  screenSharingAcknowledged: boolean
}

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  generate: 'Ctrl+Enter',
  shorter: 'Ctrl+Shift+S',
  natural: 'Ctrl+Shift+N',
  professional: 'Ctrl+Shift+F',
  star: 'Ctrl+Shift+*',
  minimize: 'Escape',
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  aiMode: 'offline',
  model: 'claude-opus-5',
  fastModel: 'claude-opus-5',
  shortcuts: DEFAULT_SHORTCUTS,
  compactMode: false,
  copilotAlwaysOnTop: false,
  screenSharingAcknowledged: false,
}

export const DEFAULT_PROFILE: CandidateProfile = {
  style: 'professional',
  answerLength: 'medium',
  language: 'en',
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'tell-me-about-yourself': 'Tell me about yourself',
  behavioral: 'Behavioral',
  technical: 'Technical',
  situational: 'Situational',
  experience: 'Experience',
  motivation: 'Motivation',
  salary: 'Salary',
  availability: 'Availability',
  'culture-fit': 'Culture fit',
  'problem-solving': 'Problem solving',
  leadership: 'Leadership',
  communication: 'Communication',
  language: 'Language',
  other: 'General',
}

export const CHALLENGE_KIND_LABELS: Record<ChallengeKind, string> = {
  math: 'Math', logic: 'Logical reasoning', excel: 'Excel', sql: 'SQL', programming: 'Programming',
  'data-analysis': 'Data analysis', translation: 'Translation', grammar: 'Grammar', writing: 'Writing',
  classification: 'Classification', 'ai-evaluation': 'AI evaluation', 'data-annotation': 'Data annotation',
  'prompt-evaluation': 'Prompt evaluation', 'case-study': 'Case study', business: 'Business problem', other: 'Other',
}
