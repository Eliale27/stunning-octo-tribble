import type { planner as Pt } from '../pt/planner'

export const planner: typeof Pt = {
  title: 'Mi Plan',
  sub: 'Organiza por día, semana o mes. Arrastra, suelta y ajusta a tu ritmo.',
  newTask: 'Nueva tarea',
  views: { calendario: '📅 Calendario', lista: '📋 Lista', kanban: '🗂️ Kanban', semana: '📆 Semana', metas: '🎯 Metas' },
  fmt: {
    weekDaySub: 'd MMM',               // 3 oct
    selectedDay: "EEEE, d 'de' MMM",   // viernes, 3 de oct
    deadline: 'dd/MM',                 // 03/10
  },
  week: {
    today: 'hoy',
    hint: 'Arrastra las tareas entre los días para reorganizar tu semana.',
  },
  calendar: {
    weekdays: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    task: 'Tarea',
    empty: 'No hay tareas para este día.',
  },
  goals: {
    newGoal: 'Nueva meta',
    create: 'Crear meta',
    heading: { daily: 'Meta diaria', weekly: 'Meta semanal', monthly: 'Meta mensual' },
    empty: { daily: 'Ninguna meta diaria.', weekly: 'Ninguna meta semanal.', monthly: 'Ninguna meta mensual.' },
    period: { daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' },
    unitOptions: { minutes: 'Minutos', questions: 'Preguntas', sessions: 'Sesiones', topics: 'Temas' },
    units: { minutes: 'minutos', questions: 'preguntas', topics: 'temas', sessions: 'sesiones' },
    progress: '{current} de {target}',
    until: ' · hasta el {date}',
    form: {
      title: 'Título',
      period: 'Período',
      measureIn: 'Medir en',
      target: 'Objetivo',
      subject: 'Materia',
      allSubjects: 'Todas',
      deadline: 'Fecha límite (opcional)',
    },
    suggestion: {
      minutes: { daily: 'Estudiar {amount} al día', weekly: 'Estudiar {amount} esta semana', monthly: 'Estudiar {amount} este mes' },
      questions: { daily: 'Resolver {n} preguntas hoy', weekly: 'Resolver {n} preguntas esta semana', monthly: 'Resolver {n} preguntas este mes' },
      topics: 'Completar {n} temas',
      topicsOf: 'Completar {n} temas de {subject}',
      sessions: 'Completar {n} sesiones de enfoque',
    },
  },
}
