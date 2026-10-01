export const planner = {
  title: 'Meu Plano',
  sub: 'Organize por dia, semana ou mês. Arraste, solte e ajuste no seu ritmo.',
  newTask: 'Nova tarefa',
  views: { calendario: '📅 Calendário', lista: '📋 Lista', kanban: '🗂️ Kanban', semana: '📆 Semana', metas: '🎯 Metas' },
  fmt: {
    weekDaySub: 'd MMM',               // 3 out
    selectedDay: "EEEE, d 'de' MMM",   // sexta-feira, 3 de out
    deadline: 'dd/MM',                 // 03/10
  },
  week: {
    today: 'hoje',
    hint: 'Arraste as tarefas entre os dias para reorganizar sua semana.',
  },
  calendar: {
    weekdays: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'], // starting Monday
    task: 'Tarefa',
    empty: 'Nenhuma tarefa neste dia.',
  },
  goals: {
    newGoal: 'Nova meta',
    create: 'Criar meta',
    heading: { daily: 'Meta diária', weekly: 'Meta semanal', monthly: 'Meta mensal' },
    empty: { daily: 'Nenhuma meta diária.', weekly: 'Nenhuma meta semanal.', monthly: 'Nenhuma meta mensal.' },
    period: { daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal' },
    unitOptions: { minutes: 'Minutos', questions: 'Questões', sessions: 'Sessões', topics: 'Tópicos' },
    units: { minutes: 'minutos', questions: 'questões', topics: 'tópicos', sessions: 'sessões' },
    progress: '{current} de {target}',
    until: ' · até {date}',
    form: {
      title: 'Título',
      period: 'Período',
      measureIn: 'Medir em',
      target: 'Alvo',
      subject: 'Matéria',
      allSubjects: 'Todas',
      deadline: 'Prazo (opcional)',
    },
    suggestion: {
      minutes: { daily: 'Estudar {amount} por dia', weekly: 'Estudar {amount} esta semana', monthly: 'Estudar {amount} este mês' },
      questions: { daily: 'Resolver {n} questões hoje', weekly: 'Resolver {n} questões esta semana', monthly: 'Resolver {n} questões este mês' },
      topics: 'Concluir {n} tópicos',
      topicsOf: 'Concluir {n} tópicos de {subject}',
      sessions: 'Completar {n} sessões de foco',
    },
  },
}
