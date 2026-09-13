// JSON schemas for structured outputs. Every object lists all properties as required and
// forbids additional properties, which is what the Messages API structured-output format expects.

const str = { type: 'string' } as const
const num = { type: 'number' } as const
const bool = { type: 'boolean' } as const
const arr = (items: unknown) => ({ type: 'array', items })
const obj = (properties: Record<string, unknown>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
})
const strs = arr(str)

export const KB_SCHEMA = obj({
  name: str,
  headline: str,
  summary: str,
  location: str,
  experiences: arr(obj({
    company: str, role: str, period: str, location: str, remote: bool,
    responsibilities: strs, projects: strs, results: strs, tools: strs,
  })),
  education: arr(obj({
    institution: str, degree: str, field: str, period: str,
    kind: { type: 'string', enum: ['degree', 'postgraduate', 'course', 'certification'] },
  })),
  skills: obj({
    hard: strs, soft: strs, technologies: strs, tools: strs,
    languages: arr(obj({ language: str, level: str })),
  }),
  projects: arr(obj({
    name: str, description: str,
    kind: { type: 'string', enum: ['professional', 'personal', 'freelance', 'remote'] },
    tools: strs, results: strs,
  })),
})

export const JOB_SCHEMA = obj({
  title: str, company: str, seniority: str,
  responsibilities: strs, mustHave: strs, niceToHave: strs, skills: strs, softSkills: strs,
  languages: strs, keywords: strs, competencies: strs, companyWants: strs, likelyQuestions: strs,
})

export const COMPANY_SCHEMA = obj({
  overview: str, products: strs, industry: str, values: strs, culture: strs,
  roleExpectations: strs, likelyTopics: strs, potentialQuestions: strs, whyWorkHere: str,
})

export const MATCH_ENRICH_SCHEMA = obj({
  strongMatches: arr(obj({ label: str, evidence: str })),
  gaps: strs,
  talkingPoints: arr(obj({ label: str, why: str })),
})

export const QUESTION_TYPES = [
  'tell-me-about-yourself', 'behavioral', 'technical', 'situational', 'experience', 'motivation',
  'salary', 'availability', 'culture-fit', 'problem-solving', 'leadership', 'communication', 'language', 'other',
]

export const QUESTION_ANALYSIS_SCHEMA = obj({
  type: { type: 'string', enum: QUESTION_TYPES },
  intent: str,
  evaluating: strs,
  keyPoints: strs,
  relevantExperience: arr(obj({ experienceId: str, label: str, why: str })),
  star: obj({ situation: str, task: str, action: str, result: str, sourceExperienceId: str }),
  hasStar: bool,
  insufficientInfo: bool,
})

export const FOLLOW_UPS_SCHEMA = obj({ followUps: strs })

export const CHALLENGE_SCHEMA = obj({
  understand: str, approach: str, solution: str, finalAnswer: str, explanation: str,
})

export const MOCK_QUESTION_SCHEMA = obj({
  question: str,
  type: { type: 'string', enum: QUESTION_TYPES },
})

export const MOCK_SCORE_SCHEMA = obj({
  overall: num, relevance: num, clarity: num, structure: num, confidence: num, naturalness: num,
  grammar: num, conciseness: num, examples: num, jobAlignment: num, feedback: str, improvedAnswer: str,
})

export const MOCK_REPORT_SCHEMA = obj({
  overall: num,
  strongest: arr(obj({ question: str, score: num, why: str })),
  weakest: arr(obj({ question: str, score: num, why: str })),
  improvements: strs,
  practiceQuestions: strs,
  summary: str,
})

export const ENGLISH_SCHEMA = obj({
  grammar: num, vocabulary: num, fluency: num, naturalness: num, professionalism: num,
  fillerWords: strs,
  corrections: arr(obj({ original: str, better: str, why: str })),
  naturalVersion: str,
  summary: str,
})
