/** A compact dictionary of technologies, tools and soft skills used for local keyword matching. */
export const TECH_TERMS = [
  'javascript', 'typescript', 'python', 'java', 'kotlin', 'swift', 'go', 'golang', 'rust', 'c#', 'c++', 'php', 'ruby', 'scala', 'r', 'dart',
  'react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte', 'node', 'node.js', 'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'rails', 'laravel', '.net',
  'react native', 'flutter', 'android', 'ios', 'electron',
  'html', 'css', 'sass', 'tailwind', 'graphql', 'rest', 'grpc', 'websocket',
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'bigquery', 'snowflake', 'oracle', 'sql server',
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab', 'ci/cd', 'linux', 'nginx',
  'git', 'jira', 'confluence', 'notion', 'figma', 'slack', 'trello', 'asana', 'salesforce', 'hubspot', 'zendesk', 'intercom', 'sap', 'power bi', 'tableau', 'looker', 'excel', 'google sheets', 'airtable',
  'pandas', 'numpy', 'scikit-learn', 'sklearn', 'tensorflow', 'pytorch', 'keras', 'spark', 'hadoop', 'airflow', 'dbt', 'kafka', 'machine learning', 'deep learning', 'nlp', 'llm', 'openai', 'langchain', 'prompt engineering', 'data annotation', 'data labeling', 'rlhf',
  'agile', 'scrum', 'kanban', 'okr', 'product management', 'ux', 'ui', 'design systems', 'a/b testing', 'analytics', 'seo', 'sem', 'google analytics', 'crm', 'erp',
  'customer support', 'customer success', 'technical support', 'qa', 'testing', 'selenium', 'cypress', 'playwright', 'jest', 'unit testing', 'automation',
  'accounting', 'bookkeeping', 'quickbooks', 'finance', 'budgeting', 'forecasting', 'payroll', 'recruiting', 'sourcing', 'onboarding', 'hr',
  'copywriting', 'content writing', 'translation', 'localization', 'proofreading', 'editing', 'transcription', 'social media', 'email marketing', 'community management',
  'project management', 'pmp', 'stakeholder management', 'vendor management', 'procurement', 'logistics', 'supply chain', 'operations',
]

export const SOFT_TERMS = [
  'communication', 'teamwork', 'collaboration', 'leadership', 'ownership', 'problem solving', 'problem-solving', 'critical thinking', 'attention to detail',
  'time management', 'organization', 'adaptability', 'flexibility', 'creativity', 'empathy', 'customer focus', 'proactive', 'autonomy', 'self-starter',
  'mentoring', 'coaching', 'negotiation', 'presentation', 'public speaking', 'conflict resolution', 'decision making', 'analytical', 'resilience', 'curiosity',
  'accountability', 'reliability', 'fast learner', 'multitasking', 'prioritization', 'remote work', 'async communication', 'cross-functional', 'stakeholder',
]

export const LANGUAGE_TERMS = ['english', 'portuguese', 'spanish', 'italian', 'french', 'german', 'japanese', 'chinese', 'mandarin', 'korean', 'arabic', 'hindi', 'dutch', 'russian']

const STOP = new Set(['the', 'and', 'for', 'with', 'you', 'our', 'are', 'will', 'that', 'this', 'from', 'have', 'your', 'about', 'into', 'their', 'they', 'them', 'than', 'then', 'been', 'being', 'also', 'able', 'work', 'working', 'team', 'role', 'job', 'we', 'a', 'an', 'to', 'of', 'in', 'on', 'as', 'at', 'by', 'or', 'is', 'be', 'it', 'its', 'if', 'not', 'all', 'any', 'can', 'who', 'what', 'when', 'where', 'how', 'more', 'most', 'other', 'such', 'each', 'per', 'via', 'etc', 'including', 'across', 'within', 'using', 'through', 'strong', 'experience', 'years', 'year', 'plus', 'skills', 'ability', 'knowledge', 'required', 'preferred', 'must', 'should', 'would', 'like', 'well', 'good', 'great', 'new', 'high', 'level', 'company', 'candidate', 'candidates', 'position', 'responsibilities', 'requirements', 'qualifications', 'benefits', 'apply', 'looking', 'join', 'us', 'we\'re', 'you\'ll', 'ideal'])

export function normalize(s: string): string {
  return s.toLowerCase().replace(/[“”"']/g, '').replace(/\s+/g, ' ').trim()
}

export function findTerms(text: string, dictionary: string[]): string[] {
  const t = ` ${normalize(text).replace(/[,;:()\[\]/]/g, ' ')} `
  const hits: string[] = []
  for (const term of dictionary) {
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`[\\s(]${esc}[\\s),.;:]`, 'i').test(t)) hits.push(term)
  }
  return Array.from(new Set(hits))
}

export function keywordFrequency(text: string, limit = 20): string[] {
  const counts = new Map<string, number>()
  for (const w of normalize(text).replace(/[^a-z0-9+#./\s-]/g, ' ').split(/\s+/)) {
    if (w.length < 3 || STOP.has(w) || /^\d+$/.test(w)) continue
    counts.set(w, (counts.get(w) ?? 0) + 1)
  }
  return Array.from(counts.entries()).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w)
}

export function overlap(a: string[], b: string[]): string[] {
  const set = new Set(b.map(normalize))
  return a.filter((x) => set.has(normalize(x)))
}

export function tokenSet(s: string): Set<string> {
  return new Set(normalize(s).replace(/[^a-z0-9+#.\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))
}

export function similarity(a: string, b: string): number {
  const sa = tokenSet(a), sb = tokenSet(b)
  if (!sa.size || !sb.size) return 0
  let inter = 0
  for (const w of sa) if (sb.has(w)) inter++
  return inter / Math.sqrt(sa.size * sb.size)
}

const DISPLAY: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', 'c#': 'C#', 'c++': 'C++', php: 'PHP', 'next.js': 'Next.js', nextjs: 'Next.js', 'vue': 'Vue', 'node.js': 'Node.js', node: 'Node.js',
  nestjs: 'NestJS', fastapi: 'FastAPI', '.net': '.NET', 'react native': 'React Native', ios: 'iOS', html: 'HTML', css: 'CSS', sass: 'Sass', graphql: 'GraphQL', rest: 'REST', grpc: 'gRPC',
  sql: 'SQL', mysql: 'MySQL', postgresql: 'PostgreSQL', postgres: 'PostgreSQL', sqlite: 'SQLite', mongodb: 'MongoDB', redis: 'Redis', dynamodb: 'DynamoDB', bigquery: 'BigQuery', 'sql server': 'SQL Server',
  aws: 'AWS', gcp: 'GCP', 'ci/cd': 'CI/CD', nginx: 'NGINX', 'github actions': 'GitHub Actions', gitlab: 'GitLab', jira: 'Jira', hubspot: 'HubSpot', sap: 'SAP', 'power bi': 'Power BI', 'a/b testing': 'A/B testing',
  numpy: 'NumPy', 'scikit-learn': 'scikit-learn', sklearn: 'scikit-learn', tensorflow: 'TensorFlow', pytorch: 'PyTorch', nlp: 'NLP', llm: 'LLM', openai: 'OpenAI', langchain: 'LangChain', rlhf: 'RLHF',
  okr: 'OKR', ux: 'UX', ui: 'UI', seo: 'SEO', sem: 'SEM', crm: 'CRM', erp: 'ERP', qa: 'QA', pmp: 'PMP', hr: 'HR', quickbooks: 'QuickBooks', dbt: 'dbt', 'e-commerce': 'E-commerce',
}

/** Human-friendly casing for a dictionary term ("zendesk" → "Zendesk", "sql" → "SQL"). */
export function displayTerm(term: string): string {
  const t = term.toLowerCase()
  if (DISPLAY[t]) return DISPLAY[t]
  return t.split(' ').map((w) => (w.length > 1 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ')
}
