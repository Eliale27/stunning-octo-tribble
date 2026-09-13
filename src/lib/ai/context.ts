import type {
  CandidateKnowledgeBase, CandidateProfile, CompanyIntel, JobAnalysis, InterviewTurn,
} from '@/lib/types'

export interface MemoryItem {
  question: string
  answerSummary: string
  experiencesMentioned: string[]
  skillsMentioned: string[]
}

export interface InterviewContext {
  kb?: CandidateKnowledgeBase
  job?: JobAnalysis
  company?: CompanyIntel
  profile: CandidateProfile
  memory: MemoryItem[]
}

const LANGUAGE_NAMES: Record<CandidateProfile['language'], string> = {
  en: 'English', pt: 'Portuguese', es: 'Spanish', it: 'Italian',
}

export function languageName(code: CandidateProfile['language']) {
  return LANGUAGE_NAMES[code]
}

export function kbToText(kb?: CandidateKnowledgeBase): string {
  if (!kb) return '(no resume on file)'
  const lines: string[] = []
  if (kb.name) lines.push(`Name: ${kb.name}`)
  if (kb.headline) lines.push(`Headline: ${kb.headline}`)
  if (kb.location) lines.push(`Location: ${kb.location}`)
  if (kb.summary) lines.push(`Summary: ${kb.summary}`)
  if (kb.experiences.length) {
    lines.push('\nPROFESSIONAL EXPERIENCE')
    for (const e of kb.experiences) {
      lines.push(`- [${e.id}] ${e.role} at ${e.company}${e.period ? ` (${e.period})` : ''}${e.remote ? ' — remote' : ''}`)
      if (e.responsibilities.length) lines.push(`  Responsibilities: ${e.responsibilities.join('; ')}`)
      if (e.projects.length) lines.push(`  Projects: ${e.projects.join('; ')}`)
      if (e.results.length) lines.push(`  Results: ${e.results.join('; ')}`)
      if (e.tools.length) lines.push(`  Tools: ${e.tools.join(', ')}`)
    }
  }
  if (kb.projects.length) {
    lines.push('\nPROJECTS')
    for (const p of kb.projects) {
      lines.push(`- [${p.id}] ${p.name} (${p.kind}): ${p.description}${p.tools.length ? ` — tools: ${p.tools.join(', ')}` : ''}${p.results.length ? ` — results: ${p.results.join('; ')}` : ''}`)
    }
  }
  if (kb.education.length) {
    lines.push('\nEDUCATION & CERTIFICATIONS')
    for (const ed of kb.education) lines.push(`- ${ed.degree}${ed.field ? ` in ${ed.field}` : ''}, ${ed.institution}${ed.period ? ` (${ed.period})` : ''} [${ed.kind}]`)
  }
  const s = kb.skills
  lines.push('\nSKILLS')
  if (s.hard.length) lines.push(`Hard skills: ${s.hard.join(', ')}`)
  if (s.technologies.length) lines.push(`Technologies: ${s.technologies.join(', ')}`)
  if (s.tools.length) lines.push(`Tools: ${s.tools.join(', ')}`)
  if (s.soft.length) lines.push(`Soft skills: ${s.soft.join(', ')}`)
  if (s.languages.length) lines.push(`Languages: ${s.languages.map((l) => `${l.language} (${l.level})`).join(', ')}`)
  return lines.join('\n')
}

export function jobToText(job?: JobAnalysis): string {
  if (!job) return '(no job on file)'
  const l = [
    `Title: ${job.title}${job.company ? ` at ${job.company}` : ''}`,
    `Seniority: ${job.seniority}`,
    `Responsibilities: ${job.responsibilities.join('; ')}`,
    `Must-have requirements: ${job.mustHave.join('; ')}`,
    `Nice-to-have: ${job.niceToHave.join('; ')}`,
    `Skills: ${job.skills.join(', ')}`,
    `Soft skills: ${job.softSkills.join(', ')}`,
    `Languages: ${job.languages.join(', ')}`,
    `Competencies evaluated: ${job.competencies.join(', ')}`,
    `What the company is looking for: ${job.companyWants.join('; ')}`,
  ]
  return l.join('\n')
}

export function companyToText(c?: CompanyIntel): string {
  if (!c) return '(no company research on file)'
  return [
    `Company: ${c.name}`,
    `Overview: ${c.overview}`,
    `Industry: ${c.industry}`,
    `Products: ${c.products.join(', ')}`,
    `Values: ${c.values.join(', ')}`,
    `Culture: ${c.culture.join(', ')}`,
    `Role expectations: ${c.roleExpectations.join('; ')}`,
  ].join('\n')
}

export function profileToText(p: CandidateProfile): string {
  const len: Record<CandidateProfile['answerLength'], string> = {
    'very-short': '1–2 sentences', short: '2–3 sentences', medium: '30–60 seconds spoken (80–150 words)', detailed: '60–120 seconds spoken (150–260 words)',
  }
  return [
    `Communication style: ${p.style}`,
    `Preferred answer length: ${p.answerLength} (${len[p.answerLength]})`,
    `Answer language: ${languageName(p.language)}`,
    p.targetRole ? `Target role: ${p.targetRole}` : '',
    p.notes ? `Candidate notes: ${p.notes}` : '',
  ].filter(Boolean).join('\n')
}

export function memoryToText(memory: MemoryItem[]): string {
  if (!memory.length) return '(this is the first question of the interview)'
  return memory.slice(-8).map((m, i) =>
    `${i + 1}. Q: ${m.question}\n   A (summary): ${m.answerSummary}\n   Experiences mentioned: ${m.experiencesMentioned.join(', ') || '—'}; Skills mentioned: ${m.skillsMentioned.join(', ') || '—'}`,
  ).join('\n')
}

export function turnsToMemory(turns: InterviewTurn[]): MemoryItem[] {
  return turns
    .filter((t) => t.answers)
    .map((t) => {
      const a = t.answers!
      const chosen = a[t.activeAnswer ?? 'natural'] || a.natural || a.quick
      return {
        question: t.question,
        answerSummary: chosen.slice(0, 280),
        experiencesMentioned: (t.analysis?.relevantExperience ?? []).map((r) => r.label),
        skillsMentioned: [],
      }
    })
}
