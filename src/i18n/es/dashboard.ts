import type { dashboard as Pt } from '../pt/dashboard'

export const dashboard: typeof Pt = {
  tagline: 'Pequeños pasos cada día te llevan más lejos.',
  startFocus: 'Iniciar sesión de enfoque',
  stats: {
    studiesToday: 'Estudios de hoy',
    session_one: 'sesión',
    session_other: 'sesiones',
    timeStudied: 'Tiempo estudiado',
    today: 'hoy',
    dailyGoal: 'Meta diaria',
    pctDone: '{pct}% completado',
    streak: 'Racha',
    inARow: 'seguidos',
    tasks: 'Tareas',
    doneToday: 'completadas hoy',
  },
  progress: {
    ofGoal: 'de la meta',
    title: 'Tu progreso de hoy',
    goalDone: 'Meta del día cumplida. Descansa con orgullo. 🌿',
    closer: 'Estás {pct}% más cerca de tu meta de hoy.',
    studied: '{time} estudiados',
    remaining: 'faltan {time}',
    toNext: '{pct}% para {emoji} {name}',
  },
  quote: { label: 'Motivación de hoy' },
  tasks: {
    title: 'Tareas de hoy',
    seeAll: 'Ver todas',
    empty: 'No hay tareas para hoy. ¿Qué tal planificar la próxima sesión?',
    subtasks: '{done}/{total} subtareas',
  },
  week: {
    title: 'Esta semana',
    details: 'Detalles',
    last7: '{time} en los últimos 7 días',
  },
  review: {
    title: 'Para repasar hoy',
    action: 'Repasar',
    empty: 'Nada pendiente. Tu memoria te lo agradece. 🧠',
    studiedAgo_one: 'estudiado hace {count} día',
    studiedAgo_other: 'estudiado hace {count} días',
  },
  goals: { title: 'Metas', manage: 'Gestionar' },
}
