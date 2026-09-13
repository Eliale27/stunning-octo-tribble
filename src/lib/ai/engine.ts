import type {
  CandidateKnowledgeBase, JobAnalysis, CompanyIntel, MatchResult, QuestionAnalysis, AnswerSet,
  RefineAction, ChallengeKind, ChallengeSolution, MockCategory, MockTurn, MockScore, MockReport,
  EnglishFeedback, QuestionType,
} from '@/lib/types'
import type { InterviewContext } from './context'

export type CompanyDraft = Omit<CompanyIntel, 'id' | 'createdAt' | 'name' | 'sourceUrl'>

export interface AnswerStreamUpdate {
  answers: Partial<AnswerSet>
  followUps: string[]
  /** Which section is currently streaming. */
  section: 'quick' | 'natural' | 'strong' | 'followUps' | null
}

/** The engine is the product-level AI API. Implementations: LLMEngine (Claude) and OfflineEngine (heuristics). */
export interface AIEngine {
  readonly name: string
  analyzeResume(text: string, signal?: AbortSignal): Promise<CandidateKnowledgeBase>
  analyzeJob(text: string, signal?: AbortSignal): Promise<JobAnalysis>
  researchCompany(name: string, sourceText: string | undefined, ctx: InterviewContext, signal?: AbortSignal): Promise<CompanyDraft>
  enrichMatch(ctx: InterviewContext, base: MatchResult, signal?: AbortSignal): Promise<MatchResult>
  analyzeQuestion(ctx: InterviewContext, question: string, signal?: AbortSignal): Promise<QuestionAnalysis>
  generateAnswers(ctx: InterviewContext, question: string, analysis: QuestionAnalysis | undefined, onUpdate: (u: AnswerStreamUpdate) => void, signal?: AbortSignal): Promise<{ answers: AnswerSet; followUps: string[] }>
  refineAnswer(ctx: InterviewContext, question: string, answer: string, action: RefineAction, onDelta: (partial: string) => void, signal?: AbortSignal): Promise<string>
  predictFollowUps(ctx: InterviewContext, question: string, answer: string, signal?: AbortSignal): Promise<string[]>
  solveChallenge(kind: ChallengeKind, prompt: string, image: { mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'; data: string } | undefined, signal?: AbortSignal): Promise<ChallengeSolution>
  nextMockQuestion(ctx: InterviewContext, category: MockCategory, previous: MockTurn[], signal?: AbortSignal): Promise<{ question: string; type: QuestionType }>
  scoreMockAnswer(ctx: InterviewContext, question: string, answer: string, english: boolean, signal?: AbortSignal): Promise<MockScore>
  mockReport(ctx: InterviewContext, turns: MockTurn[], signal?: AbortSignal): Promise<MockReport>
  englishCoach(text: string, question: string | undefined, signal?: AbortSignal): Promise<EnglishFeedback>
}

/** Parses the "### QUICK / ### NATURAL / ### STRONG / ### FOLLOW-UPS" streaming format progressively. */
export function parseAnswerStream(text: string): AnswerStreamUpdate {
  const sections: { key: AnswerStreamUpdate['section']; re: RegExp }[] = [
    { key: 'quick', re: /###\s*QUICK[^\n]*\n?/i },
    { key: 'natural', re: /###\s*NATURAL[^\n]*\n?/i },
    { key: 'strong', re: /###\s*STRONG[^\n]*\n?/i },
    { key: 'followUps', re: /###\s*FOLLOW[- ]?UPS?[^\n]*\n?/i },
  ]
  const positions = sections.map((s) => {
    const m = text.match(s.re)
    return m && m.index !== undefined ? { key: s.key, start: m.index, bodyStart: m.index + m[0].length } : null
  })
  const out: AnswerStreamUpdate = { answers: {}, followUps: [], section: null }
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i]
    if (!p) continue
    const next = positions.slice(i + 1).find(Boolean)
    const body = text.slice(p.bodyStart, next ? next.start : undefined).trim()
    if (p.key === 'followUps') {
      out.followUps = body.split('\n').map((l) => l.replace(/^[-*\d.)\s]+/, '').trim()).filter(Boolean)
    } else if (p.key) {
      out.answers[p.key] = body
    }
    if (!next) out.section = p.key
  }
  return out
}
