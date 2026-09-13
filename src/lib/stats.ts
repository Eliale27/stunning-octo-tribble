import type { CandidateKnowledgeBase, Interview, JobAnalysis, MatchResult, MockSession } from './types'


export interface Stats {
  interviewsPracticed: number
  questionsAnswered: number
  averageScore: number
  strongest: string[]
  toImprove: string[]
  readiness: number
  readinessNote: string
  dimensionAverages: Record<string, number>
  scoreHistory: { label: string; score: number; when: number }[]
}

const DIMS = ['relevance', 'clarity', 'structure', 'confidence', 'naturalness', 'grammar', 'conciseness', 'examples', 'jobAlignment'] as const

export function computeStats(interviews: Interview[], mocks: MockSession[], kb?: CandidateKnowledgeBase, job?: JobAnalysis, match?: MatchResult): Stats {
  const scoredTurns = mocks.flatMap((m) => m.turns.filter((t) => t.score).map((t) => ({ ...t, when: m.updatedAt })))
  const questionsAnswered = interviews.reduce((a, i) => a + i.turns.filter((t) => t.status === 'done').length, 0) + scoredTurns.length
  const averageScore = scoredTurns.length ? Math.round(scoredTurns.reduce((a, t) => a + t.score!.overall, 0) / scoredTurns.length) : 0
  const dimensionAverages = Object.fromEntries(DIMS.map((d) => [d, scoredTurns.length ? Math.round(scoredTurns.reduce((a, t) => a + t.score![d], 0) / scoredTurns.length) : 0])) as Record<string, number>
  const strongDims = DIMS.filter((d) => dimensionAverages[d] >= 75).map(labelDim)
  const weakDims = DIMS.filter((d) => scoredTurns.length && dimensionAverages[d] < 65).map(labelDim)
  const strongest = unique([...(match?.strongMatches.map((m) => m.label) ?? []), ...strongDims, ...(kb?.skills.technologies.slice(0, 4) ?? [])]).slice(0, 10)
  const toImprove = unique([...(match?.gaps ?? []), ...weakDims, ...(job && !match ? job.skills.slice(0, 3) : [])]).slice(0, 10)
  const readiness = Math.round(
    (kb ? 20 : 0) + (job ? 15 : 0) + (match ? Math.min(20, match.overall * 0.2) : 0) + Math.min(20, mocks.length * 7) + (averageScore ? Math.min(25, averageScore * 0.25) : 0),
  )
  const readinessNote = readiness < 30 ? 'Upload a resume and add a job to start.' : readiness < 60 ? 'Practice a mock interview to raise it.' : readiness < 80 ? 'Good shape — polish weak spots.' : 'You are ready. Keep it sharp.'
  const scoreHistory = mocks.filter((m) => m.report || m.turns.some((t) => t.score)).sort((a, b) => a.createdAt - b.createdAt).map((m) => {
    const s = m.turns.filter((t) => t.score)
    return { label: m.title, score: m.report?.overall ?? Math.round(s.reduce((a, t) => a + t.score!.overall, 0) / Math.max(1, s.length)), when: m.createdAt }
  })
  return { interviewsPracticed: mocks.length + interviews.length, questionsAnswered, averageScore, strongest, toImprove, readiness, readinessNote, dimensionAverages, scoreHistory }
}

function unique(items: string[]): string[] {
  const seen = new Set<string>()
  return items.filter((x) => { const k = x.toLowerCase().trim(); if (seen.has(k)) return false; seen.add(k); return true })
}

export function labelDim(d: string) {
  return d === 'jobAlignment' ? 'Job alignment' : d.charAt(0).toUpperCase() + d.slice(1)
}
