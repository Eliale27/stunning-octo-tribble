import type {
  CandidateKnowledgeBase, JobAnalysis, MatchResult, QuestionAnalysis, AnswerSet, RefineAction,
  ChallengeKind, ChallengeSolution, MockCategory, MockTurn, MockScore, MockReport, EnglishFeedback, QuestionType,
} from '@/lib/types'
import type { AIContent } from '../../../shared/ai-contract'
import type { AITransport } from './transport'
import type { AIEngine, AnswerStreamUpdate, CompanyDraft } from './engine'
import { parseAnswerStream } from './engine'
import type { InterviewContext } from './context'
import { jobToText, kbToText, languageName, profileToText } from './context'
import * as S from './schemas'
import * as P from './prompts'
import { uid } from '@/lib/utils'

interface Models { model: string; fastModel: string }

type RawKB = Omit<CandidateKnowledgeBase, 'experiences' | 'education' | 'projects'> & {
  experiences: Omit<CandidateKnowledgeBase['experiences'][number], 'id'>[]
  education: Omit<CandidateKnowledgeBase['education'][number], 'id'>[]
  projects: Omit<CandidateKnowledgeBase['projects'][number], 'id'>[]
}

export class LLMEngine implements AIEngine {
  readonly name: string
  constructor(private t: AITransport, private models: Models) {
    this.name = `claude:${t.name}`
  }

  async analyzeResume(text: string, signal?: AbortSignal): Promise<CandidateKnowledgeBase> {
    const raw = await this.t.json<RawKB>({
      system: P.RESUME_SYSTEM, schema: S.KB_SCHEMA, model: this.models.model, effort: 'medium',
      messages: [{ role: 'user', content: `Resume text:\n"""\n${text}\n"""` }],
    }, signal)
    return {
      ...raw,
      experiences: raw.experiences.map((e) => ({ ...e, id: uid('exp') })),
      education: raw.education.map((e) => ({ ...e, id: uid('edu') })),
      projects: raw.projects.map((p) => ({ ...p, id: uid('prj') })),
    }
  }

  analyzeJob(text: string, signal?: AbortSignal): Promise<JobAnalysis> {
    return this.t.json<JobAnalysis>({
      system: P.JOB_SYSTEM, schema: S.JOB_SCHEMA, model: this.models.model, effort: 'medium',
      messages: [{ role: 'user', content: `Job description:\n"""\n${text}\n"""` }],
    }, signal)
  }

  researchCompany(name: string, sourceText: string | undefined, ctx: InterviewContext, signal?: AbortSignal): Promise<CompanyDraft> {
    return this.t.json<CompanyDraft>({
      system: P.companySystem(), schema: S.COMPANY_SCHEMA, model: this.models.model, effort: 'medium',
      messages: [{
        role: 'user',
        content: `Company: ${name}\n\nSource material:\n"""\n${sourceText?.slice(0, 40000) || '(none provided — rely only on well-known public facts, and say when unsure)'}\n"""\n\nCandidate knowledge base:\n${kbToText(ctx.kb)}\n\nTarget job:\n${jobToText(ctx.job)}\n\nWrite the "why work here" answer in ${languageName(ctx.profile.language)}.`,
      }],
    }, signal)
  }

  async enrichMatch(ctx: InterviewContext, base: MatchResult, signal?: AbortSignal): Promise<MatchResult> {
    const r = await this.t.json<Pick<MatchResult, 'strongMatches' | 'gaps' | 'talkingPoints'>>({
      system: P.MATCH_SYSTEM, schema: S.MATCH_ENRICH_SCHEMA, model: this.models.model, effort: 'medium',
      messages: [{ role: 'user', content: `Candidate knowledge base:\n${kbToText(ctx.kb)}\n\nJob analysis:\n${jobToText(ctx.job)}\n\nHeuristic scores computed locally: ${JSON.stringify({ overall: base.overall, experience: base.experience, skills: base.skills, education: base.education, language: base.language, requirements: base.requirements })}` }],
    }, signal)
    return { ...base, ...r }
  }

  async analyzeQuestion(ctx: InterviewContext, question: string, signal?: AbortSignal): Promise<QuestionAnalysis> {
    const r = await this.t.json<QuestionAnalysis & { hasStar: boolean }>({
      system: P.strategistSystem(ctx), schema: S.QUESTION_ANALYSIS_SCHEMA, model: this.models.fastModel, effort: 'low', maxTokens: 2500,
      messages: [{ role: 'user', content: P.questionAnalysisInstruction(question) }],
    }, signal)
    const { hasStar, ...rest } = r
    return { ...rest, star: hasStar ? rest.star : undefined }
  }

  async generateAnswers(ctx: InterviewContext, question: string, analysis: QuestionAnalysis | undefined, onUpdate: (u: AnswerStreamUpdate) => void, signal?: AbortSignal) {
    const hint = analysis ? `type=${analysis.type}; intent=${analysis.intent}; key points=${analysis.keyPoints.join(' | ')}` : undefined
    let acc = ''
    const full = await this.t.streamText({
      system: P.strategistSystem(ctx), model: this.models.model, effort: 'medium', maxTokens: 3000,
      messages: [{ role: 'user', content: P.answersInstruction(question, hint) }],
    }, (d) => { acc += d; onUpdate(parseAnswerStream(acc)) }, signal)
    const parsed = parseAnswerStream(full)
    const answers: AnswerSet = {
      quick: parsed.answers.quick ?? '', natural: parsed.answers.natural ?? '', strong: parsed.answers.strong ?? '',
    }
    if (!answers.quick && !answers.natural && !answers.strong) answers.natural = full.trim()
    return { answers, followUps: parsed.followUps }
  }

  refineAnswer(ctx: InterviewContext, question: string, answer: string, action: RefineAction, onDelta: (p: string) => void, signal?: AbortSignal): Promise<string> {
    let acc = ''
    return this.t.streamText({
      system: P.strategistSystem(ctx), model: this.models.model, effort: 'low', maxTokens: 1500,
      messages: [{ role: 'user', content: P.refineInstruction(question, answer, action) }],
    }, (d) => { acc += d; onDelta(acc) }, signal).then((s) => s.trim())
  }

  async predictFollowUps(ctx: InterviewContext, question: string, answer: string, signal?: AbortSignal): Promise<string[]> {
    const r = await this.t.json<{ followUps: string[] }>({
      system: P.strategistSystem(ctx), schema: S.FOLLOW_UPS_SCHEMA, model: this.models.fastModel, effort: 'low', maxTokens: 600,
      messages: [{ role: 'user', content: P.followUpsInstruction(question, answer) }],
    }, signal)
    return r.followUps.slice(0, 5)
  }

  solveChallenge(kind: ChallengeKind, prompt: string, image: { mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'; data: string } | undefined, signal?: AbortSignal): Promise<ChallengeSolution> {
    const content: AIContent[] = []
    if (image) content.push({ type: 'image', mediaType: image.mediaType, data: image.data })
    content.push({ type: 'text', text: `Exercise (${kind}):\n"""\n${prompt || '(see image)'}\n"""` })
    return this.t.json<ChallengeSolution>({
      system: P.challengeSystem(kind), schema: S.CHALLENGE_SCHEMA, model: this.models.model, effort: 'high', maxTokens: 12000,
      messages: [{ role: 'user', content }],
    }, signal)
  }

  nextMockQuestion(ctx: InterviewContext, category: MockCategory, previous: MockTurn[], signal?: AbortSignal) {
    const history = previous.map((t, i) => `${i + 1}. [${t.type}] ${t.question}${t.answer ? `\n   Candidate: ${t.answer.slice(0, 300)}` : ''}`).join('\n')
    return this.t.json<{ question: string; type: QuestionType }>({
      system: P.mockInterviewerSystem(ctx, category), schema: S.MOCK_QUESTION_SCHEMA, model: this.models.fastModel, effort: 'low', maxTokens: 500,
      messages: [{ role: 'user', content: `Questions asked so far:\n${history || '(none yet — open the interview)'}\n\nAsk the next single question (question #${previous.length + 1} of about 8). Return the question text and its type.` }],
    }, signal)
  }

  scoreMockAnswer(ctx: InterviewContext, question: string, answer: string, english: boolean, signal?: AbortSignal): Promise<MockScore> {
    return this.t.json<MockScore>({
      system: P.mockScoreSystem(ctx, english), schema: S.MOCK_SCORE_SCHEMA, model: this.models.model, effort: 'medium', maxTokens: 3000,
      messages: [{ role: 'user', content: `Question: """${question}"""\n\nCandidate's answer: """${answer}"""\n\nCandidate preferences:\n${profileToText(ctx.profile)}` }],
    }, signal)
  }

  mockReport(ctx: InterviewContext, turns: MockTurn[], signal?: AbortSignal): Promise<MockReport> {
    const body = turns.map((t, i) => `Q${i + 1} [${t.type}]: ${t.question}\nAnswer: ${t.answer ?? '(skipped)'}\nScore: ${t.score ? JSON.stringify({ overall: t.score.overall, relevance: t.score.relevance, structure: t.score.structure, examples: t.score.examples, jobAlignment: t.score.jobAlignment }) : 'n/a'}\nFeedback: ${t.score?.feedback ?? ''}`).join('\n\n')
    return this.t.json<MockReport>({
      system: P.MOCK_REPORT_SYSTEM, schema: S.MOCK_REPORT_SCHEMA, model: this.models.model, effort: 'medium', maxTokens: 3000,
      messages: [{ role: 'user', content: `Target job:\n${jobToText(ctx.job)}\n\nTranscript:\n${body}\n\nWrite the report in ${languageName(ctx.profile.language)}.` }],
    }, signal)
  }

  englishCoach(text: string, question: string | undefined, signal?: AbortSignal): Promise<EnglishFeedback> {
    return this.t.json<EnglishFeedback>({
      system: P.ENGLISH_SYSTEM, schema: S.ENGLISH_SCHEMA, model: this.models.model, effort: 'medium', maxTokens: 3000,
      messages: [{ role: 'user', content: `${question ? `Interview question: """${question}"""\n\n` : ''}Candidate's answer:\n"""${text}"""` }],
    }, signal)
  }
}
