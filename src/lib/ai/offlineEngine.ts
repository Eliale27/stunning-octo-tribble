import type {
  CandidateKnowledgeBase, JobAnalysis, MatchResult, QuestionAnalysis, AnswerSet, RefineAction, ChallengeKind,
  ChallengeSolution, MockCategory, MockTurn, MockScore, MockReport, EnglishFeedback, QuestionType, Experience, EducationItem,
} from '@/lib/types'
import type { AIEngine, AnswerStreamUpdate, CompanyDraft } from './engine'
import type { InterviewContext } from './context'
import { classifyQuestion, EVALUATING, FOLLOW_UPS, INTENT, QUESTION_BANK } from '@/lib/questionBank'
import { displayTerm, findTerms, keywordFrequency, LANGUAGE_TERMS, normalize, similarity, SOFT_TERMS, TECH_TERMS, tokenSet } from '@/lib/skills'
import { clamp, splitLines, uid, unique, wordCount } from '@/lib/utils'
import { CHALLENGE_KIND_HINTS } from './prompts'

export const INSUFFICIENT = "I don't have enough information from your profile to answer this accurately."

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * OfflineEngine: a deterministic, heuristic implementation that works without any model.
 * It never invents facts — every sentence it produces is assembled from the candidate's own knowledge base.
 * Quality is intentionally lower than the Claude engine; it exists for privacy-first demos, offline use and tests.
 */
export class OfflineEngine implements AIEngine {
  readonly name = 'offline'

  // ---------- Resume ----------
  async analyzeResume(text: string): Promise<CandidateKnowledgeBase> {
    await sleep(150)
    const lines = splitLines(text)
    const sections = splitSections(lines)
    const kb: CandidateKnowledgeBase = {
      name: guessName(lines), headline: guessHeadline(lines), summary: sections.summary.join(' ').slice(0, 600), location: guessLocation(lines),
      experiences: parseExperiences(sections.experience),
      education: parseEducation(sections.education, 'degree').concat(parseEducation(sections.certifications, 'certification')),
      skills: {
        hard: unique(findTerms(text, TECH_TERMS).filter((t) => !isTool(t))).map(displayTerm).slice(0, 25),
        soft: unique(findTerms(text, SOFT_TERMS)).map(displayTerm).slice(0, 15),
        technologies: unique(findTerms(text, TECH_TERMS).filter((t) => !isTool(t))).map(displayTerm).slice(0, 25),
        tools: unique(findTerms(text, TECH_TERMS).filter(isTool)).map(displayTerm).slice(0, 20),
        languages: parseLanguages(text, sections.languages),
      },
      projects: parseProjects(sections.projects),
    }
    return kb
  }

  // ---------- Job ----------
  async analyzeJob(text: string): Promise<JobAnalysis> {
    await sleep(150)
    const lines = splitLines(text)
    const title = lines.find((l) => l.length < 80 && !/^https?:/.test(l)) ?? 'Role'
    const lower = text.toLowerCase()
    const seniority = /\b(principal|staff)\b/.test(lower) ? 'principal/staff' : /\blead\b|head of/.test(lower) ? 'lead' : /\bsenior\b|sr\.|\b[5-9]\+? years/.test(lower) ? 'senior' : /\bjunior\b|entry[- ]level|\bintern/.test(lower) ? 'junior' : /\bmid\b|[2-4]\+? years/.test(lower) ? 'mid-level' : 'unspecified'
    const sec = splitJobSections(lines)
    const skills = unique(findTerms(text, TECH_TERMS)).map(displayTerm)
    const softSkills = unique(findTerms(text, SOFT_TERMS))
    const languages = unique(findTerms(text, LANGUAGE_TERMS)).map(cap)
    const keywords = unique([...skills, ...softSkills.slice(0, 5), ...keywordFrequency(text, 12)]).slice(0, 25)
    const companyMatch = text.match(/\b([A-Z][\w&.-]+(?: [A-Z][\w&.-]+){0,2}) (?:is|are) (?:looking|hiring|seeking|searching|growing)/)
      ?? text.match(/\b(?:at|join|about) ([A-Z][\w&.-]+(?: [A-Z][\w&.-]+){0,2})(?=[\s,.!]|$)/i)
    const responsibilities = sec.responsibilities.length ? sec.responsibilities : bulletLike(lines).slice(0, 8)
    const mustHave = sec.mustHave.length ? sec.mustHave : bulletLike(lines).slice(8, 16)
    const competencies = unique([
      ...softSkills.map(cap).slice(0, 4),
      ...(skills.length ? ['Technical proficiency'] : []),
      ...(/remote|distributed|async/.test(lower) ? ['Remote collaboration'] : []),
      ...(/customer|client/.test(lower) ? ['Customer focus'] : []),
      ...(/detail|accura|quality/.test(lower) ? ['Attention to detail'] : []),
      'Communication', 'Ownership',
    ]).slice(0, 8)
    const companyWants = unique([
      ...(seniority !== 'unspecified' ? [`A ${seniority} professional who can operate with autonomy`] : []),
      ...skills.slice(0, 3).map((s) => `Hands-on experience with ${s}`),
      ...responsibilities.slice(0, 2).map((r) => `Someone who can ${lowerFirst(r)}`),
      ...(languages.length ? [`Professional communication in ${languages.join(' and ')}`] : []),
      ...(/remote/.test(lower) ? ['Comfort working remotely with a distributed team'] : []),
    ]).slice(0, 8)
    const likelyQuestions = unique([
      'Tell me about yourself and why this role interests you.',
      ...skills.slice(0, 2).map((s) => `Describe a project where you used ${s}. What was your role and the outcome?`),
      ...responsibilities.slice(0, 2).map((r) => `How have you handled “${lowerFirst(r)}” in a previous role?`),
      'Tell me about a time you solved a difficult problem under pressure.',
      ...(competencies.includes('Attention to detail') ? ['How do you make sure your work is accurate when tasks are repetitive?'] : []),
      ...(/remote/.test(lower) ? ['How do you stay organized and communicate when working remotely?'] : []),
      'Why do you want to work for this company?',
      'What are your salary expectations and availability?',
    ]).slice(0, 12)
    return {
      title, company: companyMatch?.[1] ?? '', seniority, responsibilities, mustHave, niceToHave: sec.niceToHave,
      skills, softSkills: softSkills.map(cap), languages, keywords, competencies, companyWants, likelyQuestions,
    }
  }

  // ---------- Company ----------
  async researchCompany(name: string, sourceText: string | undefined, ctx: InterviewContext): Promise<CompanyDraft> {
    await sleep(150)
    const src = sourceText?.trim()
    const sentences = src ? src.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((s) => s.length > 40) : []
    const lower = (src ?? '').toLowerCase()
    const industry = pickIndustry(lower)
    const values = unique(['innovation', 'customer', 'integrity', 'ownership', 'transparency', 'diversity', 'excellence', 'collaboration', 'trust', 'impact', 'sustainability']
      .filter((v) => lower.includes(v)).map(cap))
    const culture = unique([
      ...(/remote|distributed/.test(lower) ? ['Remote-friendly / distributed team'] : []),
      ...(/async/.test(lower) ? ['Async-first communication'] : []),
      ...(/fast[- ]paced|startup|scale/.test(lower) ? ['Fast-paced, growth-stage environment'] : []),
      ...(/learning|growth|development/.test(lower) ? ['Invests in learning and development'] : []),
    ])
    const products = unique(sentences.filter((s) => /product|platform|service|solution|app/i.test(s)).slice(0, 3).map((s) => s.slice(0, 140)))
    const overview = sentences.length
      ? sentences.slice(0, 3).join(' ')
      : `No public source text was provided for ${name}. In offline mode InterviewPilot does not guess company facts. Paste text from the company's website or connect an AI model to generate a researched overview.`
    const job = ctx.job
    const kb = ctx.kb
    const roleExpectations = job ? job.companyWants.slice(0, 5) : []
    const likelyTopics = unique([...(job?.competencies ?? []), ...(industry !== 'Unknown' ? [`${industry} domain knowledge`] : []), 'Motivation for joining', 'Remote collaboration'].slice(0, 8))
    const potentialQuestions = unique([`Why do you want to work at ${name}?`, `What do you know about ${name}?`, ...(job?.likelyQuestions.slice(0, 4) ?? [])])
    const skillsOverlap = job && kb ? job.skills.filter((s) => normalize(kbFlat(kb)).includes(normalize(s))).slice(0, 3) : []
    const exp = kb?.experiences[0]
    const whyWorkHere = kb
      ? `I'm drawn to ${name} because ${job ? `the ${job.title} role` : 'this role'} lines up closely with what I've been doing${exp ? ` as ${exp.role} at ${exp.company}` : ''}${skillsOverlap.length ? `, especially my work with ${listJoin(skillsOverlap)}` : ''}.${values.length ? ` The emphasis on ${listJoin(values.slice(0, 2).map((v) => v.toLowerCase()))} matches how I like to work.` : ''} I want to keep growing in a team where I can contribute from day one${job?.responsibilities[0] ? ` on things like ${lowerFirst(job.responsibilities[0])}` : ''}.`
      : INSUFFICIENT
    return { overview, products, industry, values, culture, roleExpectations, likelyTopics, potentialQuestions, whyWorkHere }
  }

  async enrichMatch(_ctx: InterviewContext, base: MatchResult): Promise<MatchResult> {
    return base
  }

  // ---------- Question analysis ----------
  async analyzeQuestion(ctx: InterviewContext, question: string): Promise<QuestionAnalysis> {
    await sleep(120)
    const type = classifyQuestion(question)
    const kb = ctx.kb
    const relevant = kb ? rankExperiences(kb, question, ctx).slice(0, 3) : []
    const insufficientInfo = !kb || (relevant.length === 0 && !['salary', 'availability', 'motivation', 'culture-fit'].includes(type))
    const top = relevant[0]?.e
    const keyPoints = buildKeyPoints(type, ctx, top)
    const star = top && ['behavioral', 'problem-solving', 'situational', 'leadership', 'experience', 'communication'].includes(type) ? buildStar(top, question) : undefined
    return {
      type, intent: INTENT[type], evaluating: EVALUATING[type], keyPoints,
      relevantExperience: relevant.map(({ e, why }) => ({ experienceId: e.id, label: `${e.role} at ${e.company}`, why })),
      star, insufficientInfo,
    }
  }

  async generateAnswers(ctx: InterviewContext, question: string, analysis: QuestionAnalysis | undefined, onUpdate: (u: AnswerStreamUpdate) => void) {
    const a = analysis ?? (await this.analyzeQuestion(ctx, question))
    const answers = composeAnswers(ctx, question, a)
    const followUps = FOLLOW_UPS[a.type]
    // Simulate progressive delivery so the UI behaves like the streaming engine.
    const partial: Partial<AnswerSet> = {}
    for (const key of ['quick', 'natural', 'strong'] as const) {
      const words = answers[key].split(' ')
      let acc = ''
      for (let i = 0; i < words.length; i += 6) {
        acc += (i ? ' ' : '') + words.slice(i, i + 6).join(' ')
        partial[key] = acc
        onUpdate({ answers: { ...partial }, followUps: [], section: key })
        await sleep(18)
      }
    }
    onUpdate({ answers, followUps, section: 'followUps' })
    return { answers, followUps }
  }

  async refineAnswer(ctx: InterviewContext, question: string, answer: string, action: RefineAction, onDelta: (p: string) => void): Promise<string> {
    await sleep(100)
    let out = answer
    switch (action) {
      case 'shorter': out = shorten(answer); break
      case 'natural': out = naturalize(answer); break
      case 'confident': out = confident(answer); break
      case 'professional': out = professional(answer); break
      case 'star': {
        const a = await this.analyzeQuestion(ctx, question)
        out = a.star ? starToProse(a.star, ctx) : answer
        break
      }
      case 'regenerate': {
        const a = await this.analyzeQuestion(ctx, question)
        const alt = { ...a, relevantExperience: [...a.relevantExperience.slice(1), ...a.relevantExperience.slice(0, 1)] }
        const kb = ctx.kb
        const altExp = kb?.experiences.find((e) => e.id === alt.relevantExperience[0]?.experienceId)
        out = composeAnswers(ctx, question, { ...alt, star: altExp ? buildStar(altExp, question) : a.star }).natural
        break
      }
    }
    onDelta(out)
    return out
  }

  async predictFollowUps(_ctx: InterviewContext, question: string): Promise<string[]> {
    return FOLLOW_UPS[classifyQuestion(question)]
  }

  // ---------- Challenge ----------
  async solveChallenge(kind: ChallengeKind, prompt: string): Promise<ChallengeSolution> {
    await sleep(150)
    const arithmetic = kind === 'math' ? tryArithmetic(prompt) : null
    if (arithmetic) {
      return {
        understand: `Compute the expression: ${arithmetic.expr}`,
        approach: 'Apply operator precedence (parentheses, then multiplication/division, then addition/subtraction) from left to right.',
        solution: `${arithmetic.expr} = ${arithmetic.value}`,
        finalAnswer: String(arithmetic.value),
        explanation: 'Evaluate inner parentheses first, then multiply/divide, then add/subtract, moving left to right.',
      }
    }
    return {
      understand: prompt ? `The exercise asks: ${prompt.slice(0, 400)}` : 'The exercise was provided as an image. Offline mode cannot read images.',
      approach: CHALLENGE_KIND_HINTS[kind],
      solution: 'Offline mode does not compute solutions for this kind of exercise. Connect an AI model (Settings → AI engine) to get a full worked solution.',
      finalAnswer: 'Not available in offline mode.',
      explanation: 'The offline engine only handles simple arithmetic. Everything else needs a connected model so the answer is actually correct rather than guessed.',
    }
  }

  // ---------- Mock interview ----------
  async nextMockQuestion(ctx: InterviewContext, category: MockCategory, previous: MockTurn[]): Promise<{ question: string; type: QuestionType }> {
    await sleep(120)
    const pools = category === 'mixed'
      ? [...QUESTION_BANK.hr.slice(0, 3), ...QUESTION_BANK.behavioral, ...QUESTION_BANK.technical, ...QUESTION_BANK['hiring-manager']]
      : QUESTION_BANK[category]
    const asked = new Set(previous.map((p) => p.question))
    const jobQs = (ctx.job?.likelyQuestions ?? []).map((q) => ({ q, type: classifyQuestion(q) }))
    const candidates = [...pools, ...jobQs].filter((c) => !asked.has(c.q))
    const pick = candidates[previous.length % Math.max(candidates.length, 1)] ?? { q: 'Is there anything else you would like to add?', type: 'other' as QuestionType }
    return { question: pick.q, type: pick.type }
  }

  async scoreMockAnswer(ctx: InterviewContext, question: string, answer: string, english: boolean): Promise<MockScore> {
    await sleep(150)
    const words = wordCount(answer)
    const lower = answer.toLowerCase()
    const fillers = countFillers(lower)
    const hasNumbers = /\d/.test(answer)
    const starHits = ['situation', 'task', 'when', 'so i', 'i decided', 'as a result', 'result', 'outcome', 'learned', 'because', 'first', 'then', 'finally'].filter((w) => lower.includes(w)).length
    const jobKw = ctx.job ? ctx.job.keywords.filter((k) => lower.includes(normalize(k))).length : 0
    const kbHits = ctx.kb ? ctx.kb.experiences.filter((e) => lower.includes(normalize(e.company)) || lower.includes(normalize(e.role))).length : 0
    const relevance = clamp(45 + similarity(question, answer) * 80 + jobKw * 5)
    const clarity = clamp(words < 20 ? 40 : words > 260 ? 60 : 70 + Math.min(starHits, 4) * 5 - fillers * 3)
    const structure = clamp(40 + Math.min(starHits, 6) * 9)
    const confidence = clamp(70 - (lower.match(/\b(maybe|i think|kind of|sort of|i guess|probably)\b/g)?.length ?? 0) * 8 + (/\bi (led|owned|delivered|built|achieved|improved)\b/.test(lower) ? 12 : 0))
    const naturalness = clamp(65 + (/\b(i'm|i've|we've|that's|it's)\b/.test(lower) ? 8 : 0) - Math.max(0, fillers - 2) * 4)
    const grammar = clamp(85 - (lower.match(/\b(i has|he don't|she don't|peoples|informations|more better|years experience)\b/g)?.length ?? 0) * 10 - (english ? fillers * 2 : 0))
    const conciseness = clamp(words < 30 ? 55 : words <= 160 ? 90 : words <= 240 ? 75 : 55)
    const examples = clamp(35 + kbHits * 20 + (hasNumbers ? 15 : 0) + (starHits >= 3 ? 15 : 0))
    const jobAlignment = clamp(45 + jobKw * 8 + (ctx.job && lower.includes(normalize(ctx.job.title.split(' ')[0] ?? '')) ? 8 : 0))
    const overall = Math.round((relevance + clarity + structure + confidence + naturalness + grammar + conciseness + examples + jobAlignment) / 9)
    const tips: string[] = []
    if (words < 30) tips.push('Your answer is very short — add one concrete example with the outcome.')
    if (words > 240) tips.push('Trim it: aim for 60–90 seconds spoken (about 120–200 words).')
    if (structure < 60) tips.push('Structure it: situation → what you did → the result.')
    if (!hasNumbers) tips.push('Quantify the result if your resume supports a number (time saved, volume handled, accuracy).')
    if (fillers > 2) tips.push(`Reduce filler words (${fillers} detected): pause instead of saying “um” or “like”.`)
    if (jobKw === 0 && ctx.job) tips.push(`Connect the answer to the role — mention how it relates to ${ctx.job.title}.`)
    if (!tips.length) tips.push('Solid answer: specific, structured and relevant. Keep the same pattern for the next questions.')
    return {
      overall, relevance, clarity, structure, confidence, naturalness, grammar, conciseness, examples, jobAlignment,
      feedback: tips.join(' '),
      improvedAnswer: professional(naturalize(answer.replace(/\b(um+|uh+|like,|you know,|basically,)\s*/gi, ''))),
    }
  }

  async mockReport(_ctx: InterviewContext, turns: MockTurn[]): Promise<MockReport> {
    await sleep(120)
    const scored = turns.filter((t) => t.score)
    const overall = scored.length ? Math.round(scored.reduce((a, t) => a + t.score!.overall, 0) / scored.length) : 0
    const sorted = [...scored].sort((a, b) => b.score!.overall - a.score!.overall)
    const dims = ['relevance', 'clarity', 'structure', 'confidence', 'naturalness', 'grammar', 'conciseness', 'examples', 'jobAlignment'] as const
    const avg = Object.fromEntries(dims.map((d) => [d, scored.length ? scored.reduce((a, t) => a + t.score![d], 0) / scored.length : 0])) as Record<typeof dims[number], number>
    const weakDims = dims.filter((d) => avg[d] < 65).sort((a, b) => avg[a] - avg[b])
    const improvements = unique([
      ...weakDims.slice(0, 3).map((d) => IMPROVE[d]),
      ...(overall < 70 ? ['Prepare 5–6 STAR stories from your resume that can be reused across behavioral questions.'] : []),
      'Practice answering out loud and time yourself: 60–90 seconds per answer.',
    ])
    const practiceQuestions = unique([
      ...sorted.slice(-2).map((t) => t.question),
      ...QUESTION_BANK.behavioral.slice(0, 3).map((q) => q.q),
    ]).slice(0, 5)
    return {
      overall,
      strongest: sorted.slice(0, 3).map((t) => ({ question: t.question, score: t.score!.overall, why: bestDim(t.score!) })),
      weakest: sorted.slice(-3).reverse().map((t) => ({ question: t.question, score: t.score!.overall, why: worstDim(t.score!) })),
      improvements, practiceQuestions,
      summary: `You answered ${scored.length} question${scored.length === 1 ? '' : 's'} with an average score of ${overall}. ${overall >= 75 ? 'You are in good shape — polish delivery and keep answers tight.' : overall >= 55 ? 'You have solid material; focus on structure and concrete outcomes.' : 'Focus on preparing specific examples from your resume and structuring each answer clearly.'}`,
    }
  }

  async englishCoach(text: string): Promise<EnglishFeedback> {
    await sleep(120)
    const lower = text.toLowerCase()
    const fillerWords = FILLERS.filter((f) => new RegExp(`\\b${f.replace(' ', '\\s')}\\b`).test(lower))
    const corrections = GRAMMAR_RULES.filter((r) => r.re.test(text)).map((r) => ({ original: text.match(r.re)?.[0] ?? '', better: r.better, why: r.why }))
    const words = wordCount(text)
    const grammar = clamp(88 - corrections.length * 12)
    const vocabulary = clamp(60 + Math.min(unique(lower.split(/\W+/)).length / Math.max(words, 1), 0.8) * 40)
    const fluency = clamp(80 - fillerWords.length * 6 - (words < 25 ? 15 : 0))
    const naturalness = clamp(70 + (/\b(i'm|i've|that's|it's|we're)\b/.test(lower) ? 8 : 0) - fillerWords.length * 4)
    const professionalism = clamp(75 - (/\b(gonna|wanna|stuff|things like that|whatever)\b/.test(lower) ? 15 : 0) + (/\b(responsible for|collaborated|delivered|ensured|stakeholders)\b/.test(lower) ? 10 : 0))
    let natural = text
    for (const r of GRAMMAR_RULES) natural = natural.replace(r.re, r.better)
    natural = natural.replace(/\b(um+|uh+|like,|you know,|basically,|actually,)\s*/gi, '').replace(/\s{2,}/g, ' ').trim()
    return {
      grammar, vocabulary, fluency, naturalness, professionalism, fillerWords, corrections,
      naturalVersion: natural,
      summary: `${corrections.length ? `Fix ${corrections.length} grammar point${corrections.length > 1 ? 's' : ''} above. ` : 'No common grammar errors detected. '}${fillerWords.length ? `Replace filler words (${fillerWords.join(', ')}) with short pauses. ` : ''}Practice saying the natural version out loud twice to lock in the rhythm.`,
    }
  }
}

// ======================= helpers =======================

const FILLERS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'kind of', 'sort of', 'i mean']
function countFillers(lower: string): number {
  return FILLERS.reduce((a, f) => a + (lower.match(new RegExp(`\\b${f.replace(' ', '\\s')}\\b`, 'g'))?.length ?? 0), 0)
}

const GRAMMAR_RULES: { re: RegExp; better: string; why: string }[] = [
  { re: /\byears experience\b/i, better: 'years of experience', why: '“Experience” needs the preposition “of” after a quantity.' },
  { re: /\bI has\b/, better: 'I have', why: 'First person singular takes “have”.' },
  { re: /\b(he|she|it) don't\b/i, better: '$1 doesn\'t', why: 'Third person singular uses “doesn’t”.' },
  { re: /\binformations\b/i, better: 'information', why: '“Information” is uncountable.' },
  { re: /\bpeoples\b/i, better: 'people', why: '“People” is already plural.' },
  { re: /\bmore better\b/i, better: 'better', why: '“Better” is already comparative.' },
  { re: /\bI am agree\b/i, better: 'I agree', why: '“Agree” is a verb; no “am” needed.' },
  { re: /\bresponsible of\b/i, better: 'responsible for', why: 'The correct collocation is “responsible for”.' },
  { re: /\bdepend of\b/i, better: 'depend on', why: 'The correct preposition is “on”.' },
  { re: /\bin the last (year|month|week)\b/i, better: 'over the past $1', why: 'More natural phrasing for a recent period.' },
]

const IMPROVE: Record<string, string> = {
  relevance: 'Answer the question that was asked: open with the direct answer, then support it.',
  clarity: 'Use shorter sentences and one idea per sentence; avoid nested clauses.',
  structure: 'Use STAR (Situation, Task, Action, Result) for every story question.',
  confidence: 'Remove hedges (“maybe”, “I think”) and own your results with “I led / I delivered”.',
  naturalness: 'Use contractions and conversational connectors; avoid reading a script.',
  grammar: 'Review tense consistency (past for stories) and prepositions (“responsible for”, “years of experience”).',
  conciseness: 'Cap answers at ~90 seconds; cut background that does not support the point.',
  examples: 'Bring one concrete example from your resume to every answer, with a measurable outcome when true.',
  jobAlignment: 'End each answer by linking it to what this role needs.',
}

function bestDim(s: MockScore): string {
  const dims = ['relevance', 'clarity', 'structure', 'confidence', 'naturalness', 'grammar', 'conciseness', 'examples', 'jobAlignment'] as const
  const d = dims.reduce((a, b) => (s[b] > s[a] ? b : a))
  return `Strong ${labelDim(d)} (${s[d]})`
}
function worstDim(s: MockScore): string {
  const dims = ['relevance', 'clarity', 'structure', 'confidence', 'naturalness', 'grammar', 'conciseness', 'examples', 'jobAlignment'] as const
  const d = dims.reduce((a, b) => (s[b] < s[a] ? b : a))
  return `Weak ${labelDim(d)} (${s[d]})`
}
function labelDim(d: string) { return d === 'jobAlignment' ? 'job alignment' : d }

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
function lowerFirst(s: string) { return s.charAt(0).toLowerCase() + s.slice(1) }
function listJoin(items: string[]) { return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` }
function isTool(t: string) { return ['git', 'jira', 'confluence', 'notion', 'figma', 'slack', 'trello', 'asana', 'salesforce', 'hubspot', 'zendesk', 'intercom', 'sap', 'power bi', 'tableau', 'looker', 'excel', 'google sheets', 'airtable', 'quickbooks', 'docker', 'kubernetes', 'jenkins', 'github actions', 'gitlab', 'google analytics'].includes(t) }
function kbFlat(kb: CandidateKnowledgeBase) {
  return [...kb.skills.hard, ...kb.skills.technologies, ...kb.skills.tools, ...kb.experiences.flatMap((e) => [...e.tools, ...e.responsibilities])].join(' ')
}

// ----- resume parsing -----

const HEADINGS: Record<string, RegExp> = {
  experience: /^(work|professional)?\s*(experience|employment|history|career)\b/i,
  education: /^(education|academic|formação|educação)\b/i,
  skills: /^(skills|technical skills|core competencies|competências|habilidades|technologies|tools)\b/i,
  projects: /^(projects|selected projects|projetos|freelance)\b/i,
  certifications: /^(certifications?|certificates?|licenses?|courses?|training|certificações|cursos)\b/i,
  languages: /^(languages?|idiomas)\b/i,
  summary: /^(summary|profile|about( me)?|objective|professional summary|resumo|perfil)\b/i,
}

function splitSections(lines: string[]) {
  const out: Record<string, string[]> = { summary: [], experience: [], education: [], skills: [], projects: [], certifications: [], languages: [], other: [] }
  let current = 'other'
  for (const line of lines) {
    const clean = line.replace(/[:\-–—_]+$/, '').trim()
    const heading = clean.length < 40 ? Object.entries(HEADINGS).find(([, re]) => re.test(clean)) : undefined
    if (heading) { current = heading[0]; continue }
    out[current].push(line)
  }
  // If nothing was labeled "experience", treat the "other" block after the header as experience.
  if (!out.experience.length && out.other.length > 4) out.experience = out.other.slice(3)
  return out
}

const DATE_RE = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|present|current|now|atual)/i

function parseExperiences(lines: string[]): Experience[] {
  const exps: Experience[] = []
  let cur: Experience | null = null
  for (const raw of lines) {
    const line = raw.replace(/^[•\-*▪◦]\s*/, '')
    const isBullet = /^[•\-*▪◦]/.test(raw) || (cur !== null && raw.length > 60)
    const date = line.match(DATE_RE)
    const looksHeader = !isBullet && line.length < 110 && (date !== null || /\b(at|@|\||—|–)\b/.test(line) || /^[A-Z][\w&.'-]+(?: [A-Z][\w&.'-]+)*\s*[,|–—-]/.test(line))
    if (looksHeader && (date || !cur || cur.responsibilities.length > 0)) {
      if (cur) exps.push(cur)
      const withoutDate = line.replace(DATE_RE, '').replace(/\(?\b(remote|remoto|home office|hybrid|híbrido|on-?site|freelance|contract|full-?time|part-?time)\b\)?/gi, ' ').replace(/[|()]/g, ' ').replace(/\s*[,|–—-]\s*$/, '').replace(/\s{2,}/g, ' ').trim()
      const parts = withoutDate.split(/\s+(?:at|@)\s+|\s*[|–—]\s*|\s*,\s*/).map((p) => p.trim()).filter(Boolean)
      const [a = 'Role', b = ''] = parts
      const roleFirst = /engineer|developer|manager|analyst|designer|specialist|assistant|lead|consultant|coordinator|director|intern|support|representative|agent|officer|associate|scientist|writer|translator|teacher|annotator|editor|founder|owner/i.test(a)
      cur = {
        id: uid('exp'), role: roleFirst ? a : b || a, company: roleFirst ? b || 'Company' : a, period: date?.[0],
        remote: /remote|remoto|home office/i.test(line), responsibilities: [], projects: [], results: [], tools: [],
      }
      continue
    }
    if (!cur) continue
    const text = line.trim()
    if (!text) continue
    const tools = findTerms(text, TECH_TERMS)
    cur.tools = unique([...cur.tools, ...tools.map(displayTerm)])
    if (/\d+%|\d+x|increase|reduc|improv|grew|saved|deliver|achiev|cut|boost/i.test(text)) cur.results.push(text)
    else if (/project|built|launched|migrat|implement|developed|created/i.test(text)) cur.projects.push(text)
    else cur.responsibilities.push(text)
  }
  if (cur) exps.push(cur)
  return exps.filter((e) => e.company || e.responsibilities.length).slice(0, 12)
}

function parseEducation(lines: string[], kind: EducationItem['kind']): EducationItem[] {
  return lines.filter((l) => l.length > 6).slice(0, 10).map((l) => {
    const date = l.match(DATE_RE)?.[0] ?? l.match(/\b(19|20)\d{2}\b/)?.[0]
    const parts = l.replace(DATE_RE, '').split(/\s*[|–—,-]\s*|\s+at\s+|\s+@\s+/).map((p) => p.trim()).filter(Boolean)
    const degree = parts.find((p) => /bachelor|master|mba|phd|b\.?sc|m\.?sc|degree|diploma|graduat|certif|course|bootcamp|licen|tecn/i.test(p)) ?? parts[0] ?? l
    const institution = parts.find((p) => p !== degree && /universi|college|institute|school|academy|faculdade|escola|coursera|udemy|google|aws|microsoft|cisco|hubspot/i.test(p)) ?? parts.find((p) => p !== degree) ?? ''
    const k: EducationItem['kind'] = /certif|aws|google|microsoft|cisco|hubspot|udemy|coursera|bootcamp|course/i.test(l) ? 'certification' : /master|mba|phd|postgrad|pós|especializa/i.test(l) ? 'postgraduate' : kind
    return { id: uid('edu'), institution, degree, period: date, kind: k }
  })
}

function parseProjects(lines: string[]) {
  const out: CandidateKnowledgeBase['projects'] = []
  for (const l of lines) {
    if (l.length < 8) continue
    const [name, ...rest] = l.split(/\s*[:–—-]\s*/)
    out.push({
      id: uid('prj'), name: (name ?? l).slice(0, 80), description: rest.join(' — ') || l,
      kind: /freelance/i.test(l) ? 'freelance' : /remote/i.test(l) ? 'remote' : /personal|side|hobby|open source/i.test(l) ? 'personal' : 'professional',
      tools: findTerms(l, TECH_TERMS).map(displayTerm), results: /\d+%|\d+x|users|downloads|revenue/i.test(l) ? [l] : [],
    })
  }
  return out.slice(0, 10)
}

function parseLanguages(text: string, langLines: string[]) {
  const src = (langLines.join(' ') || text).toLowerCase()
  return findTerms(src, LANGUAGE_TERMS).map((lang) => {
    const m = src.match(new RegExp(`${lang}[^a-z]{0,12}(native|fluent|advanced|proficient|intermediate|basic|c2|c1|b2|b1|a2|a1|upper[- ]intermediate|conversational|professional)`, 'i'))
      ?? src.match(new RegExp(`(native|fluent|advanced|proficient|intermediate|basic|c2|c1|b2|b1|a2|a1|conversational|professional)[^a-z]{0,12}${lang}`, 'i'))
    return { language: cap(lang), level: m ? cap(m[1]) : 'Stated in resume' }
  })
}

function guessName(lines: string[]) {
  const first = lines.slice(0, 4).find((l) => /^[A-ZÀ-Ý][a-zà-ÿ'-]+(?: [A-ZÀ-Ý][a-zà-ÿ'-]+){1,3}$/.test(l))
  return first
}
function guessHeadline(lines: string[]) {
  return lines.slice(0, 6).find((l) => l.length < 90 && /engineer|developer|manager|analyst|designer|specialist|assistant|consultant|coordinator|support|representative|scientist|writer|translator|teacher|annotator|editor|marketer|accountant|recruiter/i.test(l) && !DATE_RE.test(l))
}
function guessLocation(lines: string[]) {
  return lines.slice(0, 8).map((l) => l.match(/([A-Z][a-zà-ÿ]+(?: [A-Z][a-zà-ÿ]+)?,\s*(?:[A-Z]{2}|[A-Z][a-zà-ÿ]+))/)?.[1]).find(Boolean)
}

function splitJobSections(lines: string[]) {
  const out = { responsibilities: [] as string[], mustHave: [] as string[], niceToHave: [] as string[] }
  let cur: keyof typeof out | null = null
  for (const raw of lines) {
    const l = raw.replace(/[:\-–—]+$/, '').trim()
    if (l.length < 60) {
      if (/^(what you.?ll do|responsibilities|your role|duties|the role|you will|key responsibilities|what you will be doing|o que você fará|responsabilidades)/i.test(l)) { cur = 'responsibilities'; continue }
      if (/^(nice to have|preferred|bonus|plus|desirable|good to have|diferenciais|desejável)/i.test(l)) { cur = 'niceToHave'; continue }
      if (/^(requirements|qualifications|what we.?re looking for|must have|you have|about you|who you are|what you bring|skills|requisitos|o que buscamos)/i.test(l)) { cur = 'mustHave'; continue }
      if (/^(benefits|perks|about us|about the company|compensation|how to apply|what we offer|benefícios)/i.test(l)) { cur = null; continue }
    }
    if (cur && (/^[•\-*▪◦]/.test(raw) || raw.length > 25)) out[cur].push(raw.replace(/^[•\-*▪◦]\s*/, '').trim())
  }
  return out
}
function bulletLike(lines: string[]) { return lines.filter((l) => /^[•\-*▪◦]/.test(l) || (l.length > 30 && l.length < 200)).map((l) => l.replace(/^[•\-*▪◦]\s*/, '')) }

function pickIndustry(lower: string) {
  const map: [string, RegExp][] = [
    ['Software / SaaS', /saas|software|platform|api|developer/], ['Fintech / Finance', /fintech|payments|bank|finance|invest/], ['E-commerce / Retail', /e-?commerce|marketplace|retail|shop/],
    ['Healthcare', /health|medical|clinic|patient/], ['Education', /education|learning|edtech|students/], ['AI / Data', /artificial intelligence|machine learning|\bai\b|data labeling|annotation/],
    ['Marketing / Media', /marketing|media|advertis|content/], ['Logistics', /logistic|shipping|supply chain/], ['Gaming', /game|gaming/], ['Consulting / Services', /consult|agency|outsourc|bpo/],
  ]
  return map.find(([, re]) => re.test(lower))?.[0] ?? 'Unknown'
}

// ----- answer composition -----

function rankExperiences(kb: CandidateKnowledgeBase, question: string, ctx: InterviewContext) {
  const used = new Set(ctx.memory.flatMap((m) => m.experiencesMentioned))
  const jobText = ctx.job ? [ctx.job.title, ...ctx.job.responsibilities, ...ctx.job.skills].join(' ') : ''
  return kb.experiences
    .map((e) => {
      const text = [e.role, e.company, ...e.responsibilities, ...e.projects, ...e.results, ...e.tools].join(' ')
      const qs = similarity(question, text)
      const js = jobText ? similarity(jobText, text) : 0
      const richness = Math.min(e.results.length * 0.06 + e.responsibilities.length * 0.02, 0.25)
      const penalty = used.has(`${e.role} at ${e.company}`) ? 0.12 : 0
      const score = qs * 1.2 + js * 0.6 + richness - penalty + (kb.experiences.indexOf(e) === 0 ? 0.05 : 0)
      const why = qs > 0.15 ? 'Closest match to the question’s topic' : js > 0.15 ? 'Most aligned with the target role' : e.results.length ? 'Has a concrete, measurable result' : 'Most recent relevant role'
      return { e, score, why }
    })
    .sort((a, b) => b.score - a.score)
}

function buildKeyPoints(type: QuestionType, ctx: InterviewContext, top?: Experience): string[] {
  const kb = ctx.kb
  const job = ctx.job
  const pts: string[] = []
  if (!kb) return ['Add your resume to get personalized key points']
  const skills = job ? job.skills.filter((s) => normalize(kbFlat(kb)).includes(normalize(s))).slice(0, 3) : kb.skills.technologies.slice(0, 3)
  switch (type) {
    case 'tell-me-about-yourself':
      pts.push(kb.headline ? `Now: ${kb.headline}` : top ? `Now: ${top.role} at ${top.company}` : 'Current role in one line')
      if (skills.length) pts.push(`Core strengths: ${skills.join(', ')}`)
      if (top?.results[0]) pts.push(`Proof: ${top.results[0]}`)
      pts.push(job ? `Why here: fit with ${job.title}` : 'Why this role fits next')
      break
    case 'salary':
      pts.push('Give a range, not a single number', 'Anchor on market rate for the role + region', 'Show flexibility for the right fit', 'Redirect to total package if pressed')
      break
    case 'availability':
      pts.push('State a clear start date / notice period', 'Mention time-zone overlap you can offer', 'Confirm remote setup and reliability')
      break
    case 'motivation':
      pts.push(job ? `Specific interest in ${job.title}` : 'Specific interest in the role', ctx.company ? `What you like about ${ctx.company.name}` : 'What attracts you to the company', top ? `Continuity with ${top.role} at ${top.company}` : 'Continuity with your path', 'Growth you expect here')
      break
    default:
      if (top) {
        pts.push(`Use: ${top.role} at ${top.company}`)
        if (top.responsibilities[0]) pts.push(`Context: ${short(top.responsibilities[0])}`)
        if (top.results[0]) pts.push(`Result: ${short(top.results[0])}`)
        if (top.tools.length) pts.push(`Tools: ${top.tools.slice(0, 3).join(', ')}`)
      }
      if (job?.competencies[0]) pts.push(`Show: ${job.competencies.slice(0, 2).join(', ')}`)
  }
  return pts.slice(0, 5)
}

function short(s: string, n = 60) { return s.length > n ? `${s.slice(0, n - 1)}…` : s }

function buildStar(e: Experience, question: string) {
  const primary = e.responsibilities[0]
  // Pick an action that is different from the task: a project first, then the responsibility closest to the question, then the next one.
  const pool = [...e.projects, ...e.responsibilities.filter((r) => r !== primary), ...e.results.filter((r) => !/\d/.test(r))]
  const action = pool.sort((a, b) => similarity(question, b) - similarity(question, a))[0] ?? primary ?? ''
  return {
    situation: `At ${e.company}, as ${e.role}${e.period ? ` (${e.period})` : ''}.`,
    task: primary ? `My main responsibility was to ${verbPhrase(primary)}.` : `My role was ${e.role}.`,
    action: action ? `I ${verbPhrase(action, true)}${e.tools.length ? `, using ${listJoin(e.tools.slice(0, 3))}` : ''}.` : '',
    result: e.results[0] ? e.results[0].replace(/^[•\-*▪◦]\s*/, '').replace(/[.;]?\s*$/, '.') : 'The work was delivered as expected; my resume does not include a specific metric for this, so I would describe the outcome qualitatively.',
    sourceExperienceId: e.id,
  }
}

/** Turns a resume bullet ("Handle 60+ tickets", "Created a knowledge base") into a verb phrase usable after "to" or "I". */
function verbPhrase(bullet: string, past = false): string {
  let b = bullet.replace(/^[•\-*▪◦]\s*/, '').replace(/[.;]\s*$/, '').trim()
  b = b.replace(/^(i|we)\s+/i, '').replace(/^(responsible for|in charge of)\s+/i, '')
  const first = b.split(' ')[0] ?? ''
  const rest = b.slice(first.length)
  const lowerFirstWord = first.toLowerCase()
  if (!past) {
    // infinitive after "to": "handled" → "handle", "handling" → "handle", "handles" → "handle"
    const base = lowerFirstWord.replace(/ies$/, 'y').replace(/(ed|ing)$/, (m) => (m === 'ing' ? 'e' : '')).replace(/s$/, '')
    return `${lowerFirstWord.endsWith('ed') ? (base.endsWith('e') ? base : base) : base}${rest}`.replace(/\bcreate\b/, 'create').replace(/\bimprov\b/, 'improve').replace(/\bresolv\b/, 'resolve').replace(/\bhandl\b/, 'handle').replace(/\bmanag\b/, 'manage').replace(/\bcollaborat\b/, 'collaborate').replace(/\bautomat\b/, 'automate')
  }
  // past tense after "I"
  if (/ed$/.test(lowerFirstWord)) return `${lowerFirstWord}${rest}`
  if (/ing$/.test(lowerFirstWord)) return `${lowerFirstWord.replace(/ing$/, '')}ed${rest}`.replace(/eed\b/, 'ed')
  const irregular: Record<string, string> = { build: 'built', lead: 'led', drive: 'drove', write: 'wrote', run: 'ran', set: 'set', cut: 'cut', grow: 'grew', make: 'made', bring: 'brought', teach: 'taught', do: 'did', win: 'won', deal: 'dealt', keep: 'kept', hold: 'held', give: 'gave', take: 'took', speak: 'spoke', sell: 'sold', get: 'got', meet: 'met', find: 'found' }
  const stem = lowerFirstWord.replace(/s$/, '')
  const past1 = irregular[stem] ?? (stem.endsWith('e') ? `${stem}d` : /[^aeiou]y$/.test(stem) ? `${stem.slice(0, -1)}ied` : `${stem}ed`)
  return `${past1}${rest}`
}

function starToProse(star: NonNullable<QuestionAnalysis['star']>, ctx: InterviewContext) {
  const close = ctx.job ? ` That's the kind of ownership I'd bring to the ${ctx.job.title} role.` : ''
  return `${star.situation} ${star.task} ${star.action} ${star.result}${close}`.replace(/\s{2,}/g, ' ').trim()
}

function composeAnswers(ctx: InterviewContext, question: string, a: QuestionAnalysis): AnswerSet {
  const kb = ctx.kb
  if (!kb || a.insufficientInfo && !['salary', 'availability', 'motivation', 'culture-fit', 'tell-me-about-yourself'].includes(a.type)) {
    const msg = `${INSUFFICIENT} Add the relevant experience to your resume profile and I'll build the answer from it.`
    return { quick: msg, natural: msg, strong: msg }
  }
  const top = kb.experiences.find((e) => e.id === a.relevantExperience[0]?.experienceId) ?? kb.experiences[0]
  const job = ctx.job
  const roleRef = job ? `the ${job.title} role` : 'this role'
  const skills = job ? job.skills.filter((s) => normalize(kbFlat(kb)).includes(normalize(s))).slice(0, 3) : kb.skills.technologies.slice(0, 3)
  let quick = '', natural = '', strong = ''
  switch (a.type) {
    case 'tell-me-about-yourself': {
      const now = kb.headline ?? (top ? `${top.role} at ${top.company}` : 'a professional')
      quick = `I'm ${kb.name ? `${kb.name}, ` : ''}${aOrAn(now)}${skills.length ? ` with hands-on experience in ${listJoin(skills)}` : ''}. ${top?.results[0] ? `Most recently, ${lowerFirst(top.results[0])}.` : ''} I'm looking for ${roleRef} because it matches where I want to grow next.`
      natural = `Sure. I'm currently ${top ? `working as ${top.role} at ${top.company}` : now}${top?.responsibilities[0] ? `, where I ${lowerFirst(top.responsibilities[0])}` : ''}. ${skills.length ? `Day to day I work a lot with ${listJoin(skills)}. ` : ''}${top?.results[0] ? `One thing I'm proud of: ${lowerFirst(top.results[0])}. ` : ''}${kb.experiences[1] ? `Before that I was ${kb.experiences[1].role} at ${kb.experiences[1].company}, which gave me a solid base in ${kb.experiences[1].responsibilities[0] ? lowerFirst(short(kb.experiences[1].responsibilities[0], 70)) : 'the fundamentals'}. ` : ''}What attracts me to ${roleRef} is that it combines exactly those things, and I'd love to bring that experience here.`
      strong = `${natural} ${education(kb)}${job?.companyWants[0] ? ` I know you're looking for ${lowerFirst(job.companyWants[0])}, and that's genuinely where I do my best work.` : ''}`
      break
    }
    case 'salary':
      quick = `Based on the market for ${roleRef} and my experience, I'm targeting a range that reflects the scope of the position, and I'm flexible for the right opportunity. Could you share the budget you have in mind so we can see if we're aligned?`
      natural = `I've done some research on the market rate for ${roleRef}${job?.seniority && job.seniority !== 'unspecified' ? ` at a ${job.seniority} level` : ''}, and I'm looking for something in line with that range. I'm more interested in the overall fit — the team, the scope, and the growth — than in a single number, so I'm open to discussing the full package. Could you share the range you've budgeted for this role?`
      strong = `${natural} ${top ? `In my current role as ${top.role} at ${top.company}, I've taken on ${top.responsibilities[0] ? lowerFirst(short(top.responsibilities[0], 80)) : 'increasing responsibility'}, so I'd expect compensation that reflects that level of ownership.` : ''} That said, I'm confident we can find a number that works for both sides.`
      break
    case 'availability':
      quick = `I can be available quickly — I'd confirm the exact start date once we have an offer. I have a reliable remote setup and can align my hours to overlap with the team's time zone.`
      natural = `I'm available to start soon; I'd just need to confirm my notice period once there's an offer on the table. I've ${kb.experiences.some((e) => e.remote) ? "worked remotely before, so I have a stable setup and a routine for async communication" : "a dedicated home office setup and I'm comfortable with remote collaboration"}, and I can adjust my schedule to guarantee good overlap with your team's core hours.`
      strong = `${natural} ${kb.location ? `I'm based in ${kb.location}, ` : ''}and I'm used to planning my day around clear deliverables, so the team can count on me being responsive during the overlap window and productive outside of it.`
      break
    case 'motivation':
    case 'culture-fit': {
      const co = ctx.company
      quick = `I'm interested in ${roleRef}${co ? ` at ${co.name}` : ''} because it's a direct continuation of what I've been doing${top ? ` as ${top.role} at ${top.company}` : ''}${skills.length ? `, especially with ${listJoin(skills)}` : ''}, and it's the environment where I do my best work.`
      natural = `${quick} ${co?.values.length ? `I also relate to the emphasis on ${listJoin(co.values.slice(0, 2).map((v) => v.toLowerCase()))} — that's how I like to work. ` : ''}${job?.responsibilities[0] ? `The part of the job description about ${lowerFirst(short(job.responsibilities[0], 80))} is exactly what I enjoy most. ` : ''}I'm looking for a place where I can contribute from day one and keep growing.`
      strong = `${natural} ${top?.results[0] ? `For example, ${lowerFirst(top.results[0])} — that's the kind of impact I want to keep having here.` : ''} ${kb.experiences.some((e) => e.remote) ? 'Having worked remotely before, I also know how to stay visible and reliable in a distributed team.' : ''}`.trim()
      break
    }
    case 'technical': {
      const tools = top?.tools.length ? top.tools : kb.skills.technologies
      quick = tools.length ? `In my day-to-day I rely mostly on ${listJoin(tools.slice(0, 3))}${top ? ` — that's what I use at ${top.company}` : ''}. ${top?.responsibilities[0] ? `I use them to ${lowerFirst(top.responsibilities[0])}.` : ''}` : `${INSUFFICIENT} Add the technologies you use to your profile and I'll answer from them.`
      natural = tools.length ? `${quick} ${top?.projects[0] ? `A concrete example: ${lowerFirst(top.projects[0])}. ` : ''}I care a lot about doing things correctly rather than just fast, so I always validate my work before handing it over.${job?.skills[0] ? ` I noticed you use ${job.skills[0]}${skills.includes(job.skills[0]) ? ', which I already work with' : ", which I'd be glad to get deeper into"}.` : ''}` : quick
      strong = tools.length ? `${natural} ${top?.results[0] ? `The result of that approach at ${top.company}: ${lowerFirst(top.results[0])}. ` : ''}${education(kb)}` : quick
      break
    }
    default: {
      if (!top) {
        const msg = `${INSUFFICIENT} Add a relevant experience to your profile and I'll build the answer from it.`
        return { quick: msg, natural: msg, strong: msg }
      }
      const star = a.star ?? buildStar(top, question)
      quick = `A good example is from my time as ${top.role} at ${top.company}: ${star.action ? lowerFirst(star.action) : lowerFirst(star.task)} ${star.result.startsWith('The work') ? '' : `The result: ${lowerFirst(star.result)}`}`.trim()
      natural = `${star.situation} ${star.task} ${star.action} ${star.result} ${job?.competencies[0] ? `I think that shows the kind of ${lowerFirst(job.competencies[0])} that matters in ${roleRef}.` : ''}`.replace(/\s{2,}/g, ' ').trim()
      strong = `${natural} ${top.responsibilities[1] ? `Beyond that, I was also handling ${lowerFirst(short(top.responsibilities[1], 90))}, so I'm used to balancing several priorities. ` : ''}What I learned is to be very deliberate about communication and quality — which is exactly what I'd bring to ${roleRef}.`.replace(/\s{2,}/g, ' ').trim()
    }
  }
  return { quick: quick.trim(), natural: natural.trim(), strong: strong.trim() }
}

function education(kb: CandidateKnowledgeBase) {
  const d = kb.education.find((e) => e.kind === 'degree' || e.kind === 'postgraduate')
  const c = kb.education.filter((e) => e.kind === 'certification')
  const parts: string[] = []
  if (d) parts.push(`I have a ${d.degree}${d.field ? ` in ${d.field}` : ''}${d.institution ? ` from ${d.institution}` : ''}`)
  if (c.length) parts.push(`${d ? 'and ' : 'I hold '}${c.length === 1 ? 'a certification' : `${c.length} certifications`} (${c.slice(0, 2).map((x) => x.degree).join(', ')})`)
  return parts.length ? `${parts.join(' ')}.` : ''
}

function aOrAn(s: string) { return `${/^[aeiou]/i.test(s) ? 'an' : 'a'} ${s}` }

function shorten(s: string) {
  const sentences = s.split(/(?<=[.!?])\s+/)
  return sentences.slice(0, Math.max(2, Math.ceil(sentences.length / 2))).join(' ')
}
function naturalize(s: string) {
  return s.replace(/\bI am\b/g, "I'm").replace(/\bI have\b/g, "I've").replace(/\bI would\b/g, "I'd").replace(/\bthat is\b/g, "that's").replace(/\bit is\b/g, "it's").replace(/\bdo not\b/g, "don't").replace(/\bwe are\b/g, "we're")
}
function confident(s: string) {
  return s.replace(/\b(I think|I believe|maybe|perhaps|kind of|sort of|I guess|probably)\s*/gi, '').replace(/\bI tried to\b/g, 'I').replace(/\bI helped\b/g, 'I drove').replace(/\s{2,}/g, ' ').trim()
}
function professional(s: string) {
  return s.replace(/\bI'm\b/g, 'I am').replace(/\bI've\b/g, 'I have').replace(/\bI'd\b/g, 'I would').replace(/\bdon't\b/g, 'do not').replace(/\bcan't\b/g, 'cannot').replace(/\bgonna\b/g, 'going to').replace(/\bstuff\b/g, 'work').replace(/\ba lot of\b/g, 'a significant amount of')
}

function tryArithmetic(prompt: string): { expr: string; value: number } | null {
  const m = prompt.match(/[-+*/().\d\s%^]{3,}/g)?.map((s) => s.trim()).filter((s) => /\d/.test(s) && /[-+*/^]/.test(s)).sort((a, b) => b.length - a.length)[0]
  if (!m) return null
  const expr = m.replace(/\^/g, '**').replace(/%/g, '/100')
  if (!/^[-+*/().\d\s]+$/.test(expr.replace(/\*\*/g, ''))) return null
  try {
    const value = Function(`"use strict"; return (${expr});`)() as number
    if (typeof value !== 'number' || !Number.isFinite(value)) return null
    return { expr: m, value: Math.round(value * 1e6) / 1e6 }
  } catch {
    return null
  }
}

export { tokenSet }
