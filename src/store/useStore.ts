import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Resume, Job, CompanyIntel, Interview, InterviewTurn, MockSession, Challenge, CandidateProfile, Settings, MatchResult,
} from '@/lib/types'
import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from '@/lib/types'
import { uid } from '@/lib/utils'

export interface StoreState {
  resumes: Resume[]
  activeResumeId?: string
  jobs: Job[]
  activeJobId?: string
  companies: CompanyIntel[]
  interviews: Interview[]
  mockSessions: MockSession[]
  challenges: Challenge[]
  matches: Record<string, MatchResult> // key: `${resumeId}:${jobId}`
  profile: CandidateProfile
  settings: Settings
  onboarded: boolean

  // resumes
  addResume: (r: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => Resume
  updateResume: (id: string, patch: Partial<Resume>) => void
  deleteResume: (id: string) => void
  setActiveResume: (id?: string) => void
  // jobs
  addJob: (j: Omit<Job, 'id' | 'createdAt'>) => Job
  updateJob: (id: string, patch: Partial<Job>) => void
  deleteJob: (id: string) => void
  setActiveJob: (id?: string) => void
  // companies
  addCompany: (c: Omit<CompanyIntel, 'id' | 'createdAt'>) => CompanyIntel
  updateCompany: (id: string, patch: Partial<CompanyIntel>) => void
  deleteCompany: (id: string) => void
  // matches
  setMatch: (resumeId: string, jobId: string, m: MatchResult) => void
  // interviews
  addInterview: (i: Omit<Interview, 'id' | 'createdAt' | 'updatedAt' | 'turns' | 'strengths' | 'weaknesses'>) => Interview
  updateInterview: (id: string, patch: Partial<Interview>) => void
  deleteInterview: (id: string) => void
  addTurn: (interviewId: string, question: string) => InterviewTurn
  updateTurn: (interviewId: string, turnId: string, patch: Partial<InterviewTurn>) => void
  deleteTurn: (interviewId: string, turnId: string) => void
  // mock
  addMock: (m: Omit<MockSession, 'id' | 'createdAt' | 'updatedAt' | 'turns' | 'status'>) => MockSession
  updateMock: (id: string, patch: Partial<MockSession> | ((m: MockSession) => Partial<MockSession>)) => void
  deleteMock: (id: string) => void
  // challenges
  addChallenge: (c: Omit<Challenge, 'id' | 'createdAt'>) => Challenge
  updateChallenge: (id: string, patch: Partial<Challenge>) => void
  deleteChallenge: (id: string) => void
  // profile / settings
  setProfile: (p: Partial<CandidateProfile>) => void
  setSettings: (s: Partial<Settings>) => void
  setOnboarded: (v: boolean) => void
  // privacy
  deleteProfile: () => void
  deleteAllData: () => void
}

const initialData = {
  resumes: [] as Resume[], activeResumeId: undefined as string | undefined,
  jobs: [] as Job[], activeJobId: undefined as string | undefined,
  companies: [] as CompanyIntel[], interviews: [] as Interview[], mockSessions: [] as MockSession[],
  challenges: [] as Challenge[], matches: {} as Record<string, MatchResult>,
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialData,
      profile: DEFAULT_PROFILE,
      settings: DEFAULT_SETTINGS,
      onboarded: false,

      addResume: (r) => {
        const resume: Resume = { ...r, id: uid('res'), createdAt: Date.now(), updatedAt: Date.now() }
        set((s) => ({ resumes: [resume, ...s.resumes], activeResumeId: resume.id }))
        return resume
      },
      updateResume: (id, patch) => set((s) => ({ resumes: s.resumes.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r)) })),
      deleteResume: (id) => set((s) => ({
        resumes: s.resumes.filter((r) => r.id !== id),
        activeResumeId: s.activeResumeId === id ? s.resumes.find((r) => r.id !== id)?.id : s.activeResumeId,
        matches: Object.fromEntries(Object.entries(s.matches).filter(([k]) => !k.startsWith(`${id}:`))),
      })),
      setActiveResume: (id) => set({ activeResumeId: id }),

      addJob: (j) => {
        const job: Job = { ...j, id: uid('job'), createdAt: Date.now() }
        set((s) => ({ jobs: [job, ...s.jobs], activeJobId: job.id }))
        return job
      },
      updateJob: (id, patch) => set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) })),
      deleteJob: (id) => set((s) => ({
        jobs: s.jobs.filter((j) => j.id !== id),
        activeJobId: s.activeJobId === id ? s.jobs.find((j) => j.id !== id)?.id : s.activeJobId,
        matches: Object.fromEntries(Object.entries(s.matches).filter(([k]) => !k.endsWith(`:${id}`))),
      })),
      setActiveJob: (id) => set({ activeJobId: id }),

      addCompany: (c) => {
        const company: CompanyIntel = { ...c, id: uid('co'), createdAt: Date.now() }
        set((s) => ({ companies: [company, ...s.companies] }))
        return company
      },
      updateCompany: (id, patch) => set((s) => ({ companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCompany: (id) => set((s) => ({ companies: s.companies.filter((c) => c.id !== id) })),

      setMatch: (resumeId, jobId, m) => set((s) => ({ matches: { ...s.matches, [`${resumeId}:${jobId}`]: m } })),

      addInterview: (i) => {
        const interview: Interview = { ...i, id: uid('int'), turns: [], strengths: [], weaknesses: [], createdAt: Date.now(), updatedAt: Date.now() }
        set((s) => ({ interviews: [interview, ...s.interviews] }))
        return interview
      },
      updateInterview: (id, patch) => set((s) => ({ interviews: s.interviews.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i)) })),
      deleteInterview: (id) => set((s) => ({ interviews: s.interviews.filter((i) => i.id !== id) })),
      addTurn: (interviewId, question) => {
        const turn: InterviewTurn = { id: uid('turn'), question, askedAt: Date.now(), status: 'pending' }
        set((s) => ({ interviews: s.interviews.map((i) => (i.id === interviewId ? { ...i, turns: [...i.turns, turn], updatedAt: Date.now() } : i)) }))
        return turn
      },
      updateTurn: (interviewId, turnId, patch) => set((s) => ({
        interviews: s.interviews.map((i) => (i.id === interviewId
          ? { ...i, updatedAt: Date.now(), turns: i.turns.map((t) => (t.id === turnId ? { ...t, ...patch } : t)) }
          : i)),
      })),
      deleteTurn: (interviewId, turnId) => set((s) => ({
        interviews: s.interviews.map((i) => (i.id === interviewId ? { ...i, turns: i.turns.filter((t) => t.id !== turnId) } : i)),
      })),

      addMock: (m) => {
        const session: MockSession = { ...m, id: uid('mock'), turns: [], status: 'active', createdAt: Date.now(), updatedAt: Date.now() }
        set((s) => ({ mockSessions: [session, ...s.mockSessions] }))
        return session
      },
      updateMock: (id, patch) => set((s) => ({
        mockSessions: s.mockSessions.map((m) => (m.id === id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch), updatedAt: Date.now() } : m)),
      })),
      deleteMock: (id) => set((s) => ({ mockSessions: s.mockSessions.filter((m) => m.id !== id) })),

      addChallenge: (c) => {
        const ch: Challenge = { ...c, id: uid('ch'), createdAt: Date.now() }
        set((s) => ({ challenges: [ch, ...s.challenges] }))
        return ch
      },
      updateChallenge: (id, patch) => set((s) => ({ challenges: s.challenges.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteChallenge: (id) => set((s) => ({ challenges: s.challenges.filter((c) => c.id !== id) })),

      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      setOnboarded: (v) => set({ onboarded: v }),

      deleteProfile: () => set({ profile: DEFAULT_PROFILE }),
      deleteAllData: () => {
        set({ ...initialData, profile: DEFAULT_PROFILE, settings: { ...DEFAULT_SETTINGS, theme: get().settings.theme }, onboarded: false })
      },
    }),
    {
      name: 'interviewpilot-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        resumes: s.resumes, activeResumeId: s.activeResumeId, jobs: s.jobs, activeJobId: s.activeJobId, companies: s.companies,
        interviews: s.interviews, mockSessions: s.mockSessions, challenges: s.challenges, matches: s.matches,
        profile: s.profile, settings: s.settings, onboarded: s.onboarded,
      }),
    },
  ),
)

// Keep multiple windows (main app + Copilot window) in sync through localStorage events.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'interviewpilot-v1') void useStore.persist.rehydrate()
  })
}

// ---------- selectors ----------

export const selectActiveResume = (s: StoreState) => s.resumes.find((r) => r.id === s.activeResumeId) ?? s.resumes[0]
export const selectActiveJob = (s: StoreState) => s.jobs.find((j) => j.id === s.activeJobId) ?? s.jobs[0]

export function matchKey(resumeId?: string, jobId?: string) {
  return resumeId && jobId ? `${resumeId}:${jobId}` : ''
}
