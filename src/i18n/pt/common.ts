export const common = {
  // date-fns format patterns (see https://date-fns.org/docs/format)
  fmt: {
    dayMonth: "d 'de' MMM",            // 3 de out
    dayMonthLong: "d 'de' MMMM",       // 3 de outubro
    weekdayDayMonth: "EEEE, d 'de' MMMM", // sexta-feira, 3 de outubro
    weekdayShortDay: 'EEE d',          // sex 3
    dayMonthNumeric: 'd/M',            // 3/10
    monthShort: 'MMM',
    monthYear: 'MMMM yyyy',
    time: 'HH:mm',
  },
  actions: {
    save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', add: 'Adicionar', close: 'Fechar',
    back: 'Voltar', next: 'Próximo', skip: 'Pular', finish: 'Concluir', confirm: 'Confirmar', remove: 'Remover',
    search: 'Buscar', open: 'Abrir', done: 'Concluído',
  },
  relative: { today: 'Hoje', tomorrow: 'Amanhã', yesterday: 'Ontem', daysAgo_one: 'há {count} dia', daysAgo_other: 'há {count} dias', inDays_one: 'em {count} dia', inDays_other: 'em {count} dias' },
  greeting: { morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite' },
  duration: { minutes: '{n}min', hours: '{n}h', hoursMinutes: '{h}h{m}' },
  priority: { alta: 'Alta', media: 'Média', baixa: 'Baixa' },
  status: { todo: 'A fazer', in_progress: 'Em andamento', done: 'Concluído', locked: 'Bloqueado' },
  levels: { 0: 'Começando', 1: 'Criando ritmo', 2: 'Consistente', 3: 'Avançado', 4: 'Mestre' },
  streakDays_one: '{count} dia', streakDays_other: '{count} dias',
  quotes: [
    'Não precisa estudar perfeitamente. Precisa continuar.',
    'Seu futuro está sendo construído nas pequenas sessões de hoje.',
    '30 minutos hoje são melhores que zero.',
    'Consistência vence intensidade.',
    'Aprender é lento até o dia em que deixa de ser.',
    'O que você revisa hoje, lembra amanhã.',
    'Foque na próxima sessão, não em todo o caminho.',
    'Cada tópico concluído é um peso a menos.',
    'Você não precisa de motivação. Precisa de um começo.',
    'Estudar cansado ainda é estudar. Só ajuste o ritmo.',
    'Progresso invisível ainda é progresso.',
    'Comece pequeno. Termine o que começou.',
    'A dúvida de hoje é a resposta de amanhã.',
    'Descansar também faz parte do plano.',
  ],
  achievements: {
    'first-session': { title: 'Primeira sessão concluída', desc: 'Toda jornada começa com um passo.' },
    'streak-7': { title: '7 dias consecutivos', desc: 'Uma semana inteira de constância.' },
    'hours-10': { title: '10 horas estudadas', desc: 'Dez horas de dedicação registradas.' },
    'questions-100': { title: '100 questões resolvidas', desc: 'Prática que vira confiança.' },
    'weekly-goal': { title: 'Primeira meta semanal concluída', desc: 'Planejou, executou, alcançou.' },
    'streak-30': { title: '30 dias consecutivos', desc: 'Um mês inteiro. Isso é um hábito.' },
    'hours-50': { title: '50 horas estudadas', desc: 'Meio caminho para a maestria.' },
    'topic-master': { title: 'Primeiro tópico dominado', desc: 'Revisado até virar memória de longo prazo.' },
    'notes-5': { title: '5 anotações criadas', desc: 'Seu caderno digital está crescendo.' },
    'early-bird': { title: 'Sessão antes das 8h', desc: 'O silêncio da manhã rende.' },
  },
  toasts: {
    sessionDone: 'Mais uma sessão concluída! 🎉',
    sessionDoneDesc: '{minutes} minutos registrados. Hora de uma pausa.',
    breakDone: 'Pausa concluída',
    breakDoneDesc: 'Pronto para a próxima sessão?',
    achievement: 'Conquista desbloqueada',
  },
  untitledNote: 'Sem título',
  language: 'Idioma',
}
