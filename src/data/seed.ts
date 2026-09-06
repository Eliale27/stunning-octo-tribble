import { addDays, formatISO, subDays, setHours, setMinutes, format } from 'date-fns'
import type { Goal, Note, Session, Settings, Subject, Task, Topic } from '@/lib/types'

const iso = (d: Date) => formatISO(d)
const day = (offset: number) => format(addDays(new Date(), offset), 'yyyy-MM-dd')
const at = (offsetDays: number, h: number, m = 0) => iso(setMinutes(setHours(subDays(new Date(), -offsetDays), h), m))

const topic = (
  subjectId: string, id: string, name: string, status: Topic['status'], progress: number,
  minutes: number, questions: number, correct: number, lastDaysAgo: number | null, reviewStage: number,
): Topic => ({
  id, subjectId, name, status, progress, minutes, questions, correct,
  lastSession: lastDaysAgo === null ? undefined : at(-lastDaysAgo, 19),
  reviewStage,
  lastReviewed: lastDaysAgo === null ? undefined : at(-lastDaysAgo, 19),
})

export const seedSubjects: Subject[] = [
  {
    id: 'mat', name: 'Matemática', color: 'sky', emoji: '📐', goalDate: day(44),
    topics: [
      topic('mat', 'mat-1', 'Equações', 'done', 100, 310, 84, 71, 12, 3),
      topic('mat', 'mat-2', 'Funções', 'done', 100, 265, 62, 49, 7, 2),
      topic('mat', 'mat-3', 'Geometria', 'in_progress', 45, 140, 30, 21, 0, 0),
      topic('mat', 'mat-4', 'Probabilidade', 'locked', 0, 0, 0, 0, null, 0),
      topic('mat', 'mat-5', 'Estatística', 'locked', 0, 0, 0, 0, null, 0),
    ],
  },
  {
    id: 'his', name: 'História', color: 'butter', emoji: '🏛️', goalDate: day(60),
    topics: [
      topic('his', 'his-1', 'Revolução Francesa', 'in_progress', 60, 180, 40, 33, 1, 1),
      topic('his', 'his-2', 'Era Vargas', 'done', 100, 150, 35, 27, 15, 4),
      topic('his', 'his-3', 'Guerra Fria', 'todo', 10, 25, 0, 0, 3, 0),
      topic('his', 'his-4', 'Brasil Colônia', 'done', 100, 120, 28, 20, 21, 4),
    ],
  },
  {
    id: 'bio', name: 'Biologia', color: 'sage', emoji: '🧬',
    topics: [
      topic('bio', 'bio-1', 'Citologia', 'done', 100, 210, 55, 48, 9, 3),
      topic('bio', 'bio-2', 'Genética', 'in_progress', 70, 190, 44, 31, 2, 1),
      topic('bio', 'bio-3', 'Ecologia', 'in_progress', 30, 60, 12, 10, 4, 0),
      topic('bio', 'bio-4', 'Evolução', 'todo', 0, 0, 0, 0, null, 0),
    ],
  },
  {
    id: 'por', name: 'Português', color: 'rose', emoji: '✍️',
    topics: [
      topic('por', 'por-1', 'Interpretação de texto', 'done', 100, 240, 90, 79, 5, 2),
      topic('por', 'por-2', 'Crase e regência', 'in_progress', 55, 95, 36, 22, 1, 1),
      topic('por', 'por-3', 'Redação', 'in_progress', 40, 200, 6, 5, 6, 1),
      topic('por', 'por-4', 'Figuras de linguagem', 'todo', 0, 0, 0, 0, null, 0),
    ],
  },
  {
    id: 'ing', name: 'Inglês', color: 'lilac', emoji: '🌍',
    topics: [
      topic('ing', 'ing-1', 'Reading', 'done', 100, 160, 48, 44, 30, 5),
      topic('ing', 'ing-2', 'Vocabulary', 'in_progress', 65, 130, 70, 58, 2, 2),
      topic('ing', 'ing-3', 'Grammar', 'in_progress', 35, 80, 24, 15, 8, 3),
    ],
  },
]

/* Sessions across the last 5 weeks, with a 12-day streak ending today. */
const pattern: Array<[number, string, string | undefined, number, number?, number?]> = [
  // [daysAgo, subject, topic, minutes, questions, correct]
  [0, 'mat', 'mat-3', 50, 12, 9],
  [0, 'por', 'por-2', 45, 10, 6],
  [0, 'his', 'his-1', 49],
  [1, 'bio', 'bio-2', 60, 15, 11],
  [1, 'his', 'his-1', 40, 8, 7],
  [1, 'por', 'por-2', 35, 12, 8],
  [2, 'mat', 'mat-3', 90, 18, 12],
  [2, 'ing', 'ing-2', 50, 20, 17],
  [3, 'his', 'his-3', 25],
  [3, 'bio', 'bio-2', 70, 14, 9],
  [3, 'mat', 'mat-3', 60],
  [4, 'bio', 'bio-3', 60, 12, 10],
  [4, 'por', 'por-1', 40, 15, 13],
  [4, 'mat', 'mat-2', 55, 10, 8],
  [5, 'por', 'por-1', 100, 25, 22],
  [5, 'mat', 'mat-2', 50],
  [6, 'por', 'por-3', 120],
  [6, 'ing', 'ing-2', 30, 15, 13],
  [7, 'mat', 'mat-2', 80, 20, 16],
  [7, 'bio', 'bio-1', 40, 10, 9],
  [8, 'ing', 'ing-3', 50, 12, 7],
  [8, 'mat', 'mat-2', 60, 12, 9],
  [9, 'bio', 'bio-1', 90, 20, 18],
  [9, 'por', 'por-3', 50],
  [10, 'mat', 'mat-1', 70, 15, 13],
  [10, 'his', 'his-1', 60, 12, 10],
  [11, 'mat', 'mat-1', 60, 14, 12],
  [11, 'bio', 'bio-1', 45, 10, 8],
  // gap on day 12
  [13, 'his', 'his-2', 50, 10, 8],
  [13, 'mat', 'mat-1', 55, 12, 10],
  [14, 'bio', 'bio-2', 60, 15, 11],
  [15, 'his', 'his-2', 60, 12, 9],
  [15, 'por', 'por-1', 40, 18, 15],
  [16, 'mat', 'mat-1', 75, 20, 17],
  [17, 'ing', 'ing-3', 30, 12, 8],
  [17, 'bio', 'bio-2', 60, 14, 9],
  [19, 'mat', 'mat-1', 50, 11, 9],
  [19, 'por', 'por-1', 60, 20, 17],
  [20, 'his', 'his-2', 40, 13, 10],
  [21, 'his', 'his-4', 60, 14, 10],
  [21, 'bio', 'bio-1', 35],
  [22, 'mat', 'mat-1', 45, 12, 10],
  [24, 'his', 'his-4', 60, 14, 10],
  [24, 'por', 'por-1', 40, 12, 12],
  [25, 'bio', 'bio-1', 60, 15, 13],
  [26, 'mat', 'mat-1', 60, 8, 6],
  [27, 'ing', 'ing-1', 40, 10, 9],
  [28, 'his', 'his-4', 30],
  [29, 'ing', 'ing-1', 50, 12, 11],
  [29, 'mat', 'mat-1', 45, 10, 8],
  [30, 'ing', 'ing-1', 70, 26, 24],
  [32, 'bio', 'bio-1', 45, 10, 8],
  [33, 'por', 'por-1', 40, 15, 13],
]

export const seedSessions: Session[] = pattern.map(([d, subjectId, topicId, minutes, questions, correct], i) => ({
  id: `s-${i}`,
  subjectId,
  topicId,
  date: at(-d, 8 + (i % 3) * 5, (i * 7) % 60),
  minutes,
  questions,
  correct,
}))

export const seedTasks: Task[] = [
  {
    id: 't1', title: 'Estudar Revolução Francesa', subjectId: 'his', date: day(0), priority: 'alta', category: 'Estudo',
    estimate: 90, notes: 'Focar nas fases: Assembleia, Convenção e Diretório.', status: 'doing', createdAt: at(-3, 10),
    subtasks: [
      { id: 't1a', title: 'Ler capítulo 5', done: true },
      { id: 't1b', title: 'Fazer resumo', done: true },
      { id: 't1c', title: 'Assistir aula', done: false },
      { id: 't1d', title: 'Resolver questões', done: false },
    ],
  },
  { id: 't2', title: 'Resolver 20 questões de Geometria', subjectId: 'mat', date: day(0), priority: 'alta', category: 'Exercícios', estimate: 45, status: 'todo', createdAt: at(-2, 10), subtasks: [] },
  { id: 't3', title: 'Revisar crase e regência', subjectId: 'por', date: day(0), priority: 'media', category: 'Revisão', estimate: 30, status: 'done', createdAt: at(-2, 10), subtasks: [] },
  { id: 't4', title: 'Flashcards de vocabulário', subjectId: 'ing', date: day(0), priority: 'baixa', category: 'Revisão', estimate: 20, status: 'done', createdAt: at(-1, 10), subtasks: [] },
  { id: 't5', title: 'Mapa mental de Genética', subjectId: 'bio', date: day(1), priority: 'media', category: 'Resumo', estimate: 40, status: 'todo', createdAt: at(-1, 10), subtasks: [
    { id: 't5a', title: 'Leis de Mendel', done: false },
    { id: 't5b', title: 'Heredogramas', done: false },
  ] },
  { id: 't6', title: 'Redação: tema "Educação digital"', subjectId: 'por', date: day(2), priority: 'alta', category: 'Redação', estimate: 60, status: 'todo', createdAt: at(-1, 10), subtasks: [] },
  { id: 't7', title: 'Simulado de Matemática', subjectId: 'mat', date: day(3), priority: 'alta', category: 'Simulado', estimate: 120, status: 'todo', createdAt: at(-1, 10), subtasks: [] },
  { id: 't8', title: 'Assistir aula de Ecologia', subjectId: 'bio', date: day(4), priority: 'baixa', category: 'Aula', estimate: 50, status: 'todo', createdAt: at(0, 9), subtasks: [] },
  { id: 't9', title: 'Revisar Era Vargas', subjectId: 'his', date: day(5), priority: 'media', category: 'Revisão', estimate: 30, status: 'todo', createdAt: at(0, 9), subtasks: [] },
  { id: 't10', title: 'Organizar caderno da semana', date: day(6), priority: 'baixa', category: 'Organização', estimate: 15, status: 'todo', createdAt: at(0, 9), subtasks: [] },
  { id: 't11', title: 'Resumo de Citologia', subjectId: 'bio', date: day(-1), priority: 'media', category: 'Resumo', estimate: 40, status: 'done', createdAt: at(-3, 9), subtasks: [] },
  { id: 't12', title: 'Questões de Funções', subjectId: 'mat', date: day(-2), priority: 'alta', category: 'Exercícios', estimate: 50, status: 'done', createdAt: at(-4, 9), subtasks: [] },
]

export const seedGoals: Goal[] = [
  { id: 'g1', title: 'Estudar 3 horas por dia', period: 'daily', target: 180, unit: 'minutes' },
  { id: 'g2', title: 'Resolver 50 questões esta semana', period: 'weekly', target: 50, unit: 'questions' },
  { id: 'g3', title: 'Estudar 15 horas esta semana', period: 'weekly', target: 900, unit: 'minutes' },
  { id: 'g4', title: 'Concluir Matemática até ' + format(addDays(new Date(), 44), 'dd/MM'), period: 'monthly', target: 5, unit: 'topics', subjectId: 'mat', deadline: day(44) },
  { id: 'g5', title: 'Completar 40 sessões de foco no mês', period: 'monthly', target: 40, unit: 'sessions' },
]

export const seedNotes: Note[] = [
  {
    id: 'n1', title: 'Revolução Francesa — resumo', emoji: '🏛️', subjectId: 'his', updatedAt: at(0, 7),
    content: `
<h1>Revolução Francesa</h1>
<p>Processo que transformou a França entre <strong>1789 e 1799</strong>, derrubando o Antigo Regime e inaugurando a era contemporânea.</p>
<div class="callout" data-type="callout">💡 <span>Ideia central: crise financeira + desigualdade dos Estados + ideias iluministas = ruptura.</span></div>
<h2>Fases</h2>
<table>
<tr><th>Fase</th><th>Período</th><th>Marco</th></tr>
<tr><td>Assembleia Nacional</td><td>1789–1792</td><td>Declaração dos Direitos do Homem</td></tr>
<tr><td>Convenção</td><td>1792–1795</td><td>República e Terror</td></tr>
<tr><td>Diretório</td><td>1795–1799</td><td>Golpe do 18 Brumário</td></tr>
</table>
<h2>Para lembrar</h2>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="true">Causas econômicas</li>
<li data-type="taskItem" data-checked="true">Os três Estados</li>
<li data-type="taskItem" data-checked="false">Jacobinos x Girondinos</li>
<li data-type="taskItem" data-checked="false">Consequências para o Brasil</li>
</ul>
<blockquote>"Liberdade, igualdade, fraternidade" — <mark>lema</mark> que sintetiza os ideais do movimento.</blockquote>
`,
  },
  {
    id: 'n2', title: 'Funções — fórmulas essenciais', emoji: '📐', subjectId: 'mat', updatedAt: at(-2, 20),
    content: `
<h1>Funções</h1>
<h2>Função afim</h2>
<p>Forma geral: <code>f(x) = ax + b</code>. O coeficiente <strong>a</strong> indica a inclinação e <strong>b</strong> o ponto onde a reta cruza o eixo y.</p>
<h2>Função quadrática</h2>
<p><code>f(x) = ax² + bx + c</code></p>
<pre><code>Δ = b² − 4ac
x = (−b ± √Δ) / 2a
Vértice: xv = −b / 2a, yv = −Δ / 4a</code></pre>
<h3>Erros comuns</h3>
<ol>
<li>Esquecer o sinal de <em>b</em> ao calcular o vértice</li>
<li>Confundir concavidade (a &gt; 0 → para cima)</li>
</ol>
`,
  },
  {
    id: 'n3', title: 'Plano da semana', emoji: '🗓️', updatedAt: at(-1, 8),
    content: `
<h1>Plano da semana</h1>
<p>Meta: <strong>15h</strong> de estudo e <strong>50 questões</strong>.</p>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="true">Segunda — Matemática + Português</li>
<li data-type="taskItem" data-checked="true">Terça — Biologia + História</li>
<li data-type="taskItem" data-checked="false">Quarta — Redação</li>
<li data-type="taskItem" data-checked="false">Quinta — Simulado</li>
<li data-type="taskItem" data-checked="false">Sexta — Revisões</li>
</ul>
<hr>
<p>Lembrete: <a href="#">pedir material da aula de Ecologia</a>.</p>
`,
  },
  {
    id: 'n4', title: 'Vocabulary — week 12', emoji: '🌍', subjectId: 'ing', updatedAt: at(-3, 21),
    content: `
<h1>Vocabulary — week 12</h1>
<table>
<tr><th>Word</th><th>Meaning</th><th>Example</th></tr>
<tr><td>although</td><td>embora</td><td>Although it rained, we went out.</td></tr>
<tr><td>whereas</td><td>enquanto que</td><td>She likes tea, whereas I prefer coffee.</td></tr>
<tr><td>therefore</td><td>portanto</td><td>He studied, therefore he passed.</td></tr>
</table>
`,
  },
]

export const seedSettings: Settings = {
  name: 'Eliale',
  dailyGoalMinutes: 180,
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  soundEnabled: true,
  weekStartsMonday: true,
}

export const achievementDefs = [
  { id: 'first-session', title: 'Primeira sessão concluída', desc: 'Toda jornada começa com um passo.', emoji: '🌱' },
  { id: 'streak-7', title: '7 dias consecutivos', desc: 'Uma semana inteira de constância.', emoji: '🔥' },
  { id: 'hours-10', title: '10 horas estudadas', desc: 'Dez horas de dedicação registradas.', emoji: '⏱️' },
  { id: 'questions-100', title: '100 questões resolvidas', desc: 'Prática que vira confiança.', emoji: '🎯' },
  { id: 'weekly-goal', title: 'Primeira meta semanal concluída', desc: 'Planejou, executou, alcançou.', emoji: '🏁' },
  { id: 'streak-30', title: '30 dias consecutivos', desc: 'Um mês inteiro. Isso é um hábito.', emoji: '🌳' },
  { id: 'hours-50', title: '50 horas estudadas', desc: 'Meio caminho para a maestria.', emoji: '⭐' },
  { id: 'topic-master', title: 'Primeiro tópico dominado', desc: 'Revisado até virar memória de longo prazo.', emoji: '🧠' },
  { id: 'notes-5', title: '5 anotações criadas', desc: 'Seu caderno digital está crescendo.', emoji: '📝' },
  { id: 'early-bird', title: 'Sessão antes das 8h', desc: 'O silêncio da manhã rende.', emoji: '🌅' },
] as const

export type AchievementId = (typeof achievementDefs)[number]['id']
