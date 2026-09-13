import type { CandidateKnowledgeBase, JobAnalysis, MatchResult } from './types'
import { displayTerm, findTerms, LANGUAGE_TERMS, normalize, similarity, TECH_TERMS, SOFT_TERMS, tokenSet } from './skills'
import { clamp } from './utils'

function kbCorpus(kb: CandidateKnowledgeBase): string {
  return [
    kb.headline, kb.summary,
    ...kb.experiences.flatMap((e) => [e.role, e.company, ...e.responsibilities, ...e.projects, ...e.results, ...e.tools]),
    ...kb.projects.flatMap((p) => [p.name, p.description, ...p.tools, ...p.results]),
    ...kb.education.flatMap((e) => [e.degree, e.field, e.institution]),
    ...kb.skills.hard, ...kb.skills.soft, ...kb.skills.technologies, ...kb.skills.tools,
    ...kb.skills.languages.map((l) => `${l.language} ${l.level}`),
  ].filter(Boolean).join('\n')
}

function requirementCovered(req: string, corpus: string, corpusTokens: Set<string>): boolean {
  const reqTerms = findTerms(req, [...TECH_TERMS, ...SOFT_TERMS])
  if (reqTerms.length) {
    const hits = reqTerms.filter((t) => corpus.includes(normalize(t)))
    if (hits.length / reqTerms.length >= 0.5) return true
  }
  const toks = Array.from(tokenSet(req))
  if (!toks.length) return false
  const hit = toks.filter((t) => corpusTokens.has(t)).length
  return hit / toks.length >= 0.5
}

/** Deterministic, local resume ↔ job match. Works with or without a model. */
export function computeMatch(kb: CandidateKnowledgeBase, job: JobAnalysis): MatchResult {
  const corpusRaw = kbCorpus(kb)
  const corpus = normalize(corpusRaw)
  const corpusTokens = tokenSet(corpusRaw)

  // Skills
  const jobSkills = uniqueCI([...job.skills, ...findTerms(job.skills.join(' '), TECH_TERMS).map(displayTerm)])
  const skillHits = jobSkills.filter((s) => corpus.includes(normalize(s)))
  const skills = jobSkills.length ? (skillHits.length / jobSkills.length) * 100 : 60

  // Requirements
  const must = job.mustHave
  const mustHits = must.filter((r) => requirementCovered(r, corpus, corpusTokens))
  const nice = job.niceToHave
  const niceHits = nice.filter((r) => requirementCovered(r, corpus, corpusTokens))
  const requirements = must.length ? ((mustHits.length + 0.5 * niceHits.length) / (must.length + 0.5 * nice.length)) * 100 : 60

  // Experience: responsibilities similarity against experiences
  const expText = kb.experiences.map((e) => [e.role, ...e.responsibilities, ...e.projects, ...e.results].join(' '))
  const respScores = job.responsibilities.map((r) => Math.max(0, ...expText.map((e) => similarity(r, e))))
  const respAvg = respScores.length ? respScores.reduce((a, b) => a + b, 0) / respScores.length : 0
  const titleSim = Math.max(0, ...kb.experiences.map((e) => similarity(e.role, job.title)), similarity(kb.headline ?? '', job.title))
  const experience = clamp(35 + respAvg * 110 + titleSim * 40 + Math.min(kb.experiences.length, 4) * 4)

  // Education
  const eduText = normalize(kb.education.map((e) => `${e.degree} ${e.field ?? ''} ${e.kind}`).join(' '))
  const wantsDegree = /degree|bachelor|master|bsc|msc|phd|graduat/i.test([...must, ...nice].join(' '))
  const hasDegree = kb.education.some((e) => e.kind === 'degree' || e.kind === 'postgraduate')
  const certHits = kb.education.filter((e) => e.kind === 'certification').length
  const education = wantsDegree ? (hasDegree ? 92 : 45) + Math.min(certHits, 2) * 3 : (kb.education.length ? 85 : 70) + (eduText.includes(normalize(job.title.split(' ')[0] ?? '')) ? 5 : 0)

  // Languages
  const wanted = job.languages.length ? job.languages : findTerms(job.mustHave.join(' '), LANGUAGE_TERMS)
  const spoken = kb.skills.languages.map((l) => normalize(l.language))
  const langHits = wanted.filter((w) => spoken.some((s) => s.includes(normalize(w).split(' ')[0])))
  const language = wanted.length ? (langHits.length / wanted.length) * 100 : (spoken.length ? 85 : 70)

  const overall = Math.round(0.3 * experience + 0.28 * skills + 0.22 * requirements + 0.1 * education + 0.1 * language)

  const strongMatches = [
    ...skillHits.slice(0, 6).map((s) => ({ label: s, evidence: findEvidence(kb, s) })),
    ...mustHits.slice(0, 4).map((r) => ({ label: r, evidence: findEvidence(kb, r) })),
  ]
  const gaps = [...must.filter((r) => !mustHits.includes(r)), ...jobSkills.filter((s) => !skillHits.includes(s))].slice(0, 8)

  const talkingPoints = kb.experiences
    .map((e) => {
      const text = [e.role, ...e.responsibilities, ...e.projects, ...e.results].join(' ')
      const score = job.responsibilities.reduce((a, r) => a + similarity(r, text), 0) + job.keywords.filter((k) => normalize(text).includes(normalize(k))).length * 0.3
      return { e, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ e }) => ({
      label: `${e.role} at ${e.company}`,
      why: e.results[0] ? `Lead with: ${e.results[0]}` : e.responsibilities[0] ? `Highlight: ${e.responsibilities[0]}` : 'Directly relevant role for this position.',
    }))

  return {
    overall: clamp(overall), experience: Math.round(clamp(experience)), skills: Math.round(clamp(skills)),
    education: Math.round(clamp(education)), language: Math.round(clamp(language)), requirements: Math.round(clamp(requirements)),
    strongMatches, gaps, talkingPoints,
  }
}

function findEvidence(kb: CandidateKnowledgeBase, term: string): string {
  const t = normalize(term)
  const toks = Array.from(tokenSet(term))
  const candidates: string[] = [
    ...kb.experiences.flatMap((e) => [...e.responsibilities, ...e.projects, ...e.results].map((x) => `${x} (${e.company})`)),
    ...kb.projects.map((p) => `${p.description} (${p.name})`),
    ...kb.education.map((e) => `${e.degree} — ${e.institution}`),
  ]
  const direct = candidates.find((c) => normalize(c).includes(t))
  if (direct) return direct
  let best = '', bestScore = 0
  for (const c of candidates) {
    const s = toks.filter((k) => normalize(c).includes(k)).length
    if (s > bestScore) { best = c; bestScore = s }
  }
  if (best) return best
  const skillList = [...kb.skills.hard, ...kb.skills.technologies, ...kb.skills.tools, ...kb.skills.soft]
  return skillList.some((s) => normalize(s).includes(t)) ? `Listed under skills: ${term}` : 'Mentioned in resume'
}

function uniqueCI(items: string[]): string[] {
  const seen = new Set<string>()
  return items.filter((x) => { const k = normalize(x); if (seen.has(k)) return false; seen.add(k); return true })
}
