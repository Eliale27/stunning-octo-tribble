import type { common as Pt } from '../pt/common'

export const common: typeof Pt = {
  fmt: {
    dayMonth: "d 'de' MMM",            // 3 de oct
    dayMonthLong: "d 'de' MMMM",       // 3 de octubre
    weekdayDayMonth: "EEEE, d 'de' MMMM", // viernes, 3 de octubre
    weekdayShortDay: 'EEE d',          // vie 3
    dayMonthNumeric: 'd/M',            // 3/10
    monthShort: 'MMM',
    monthYear: 'MMMM yyyy',
    time: 'HH:mm',
  },
  actions: {
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', add: 'Añadir', close: 'Cerrar',
    back: 'Volver', next: 'Siguiente', skip: 'Omitir', finish: 'Listo', confirm: 'Confirmar', remove: 'Quitar',
    search: 'Buscar', open: 'Abrir', done: 'Hecho',
  },
  relative: { today: 'Hoy', tomorrow: 'Mañana', yesterday: 'Ayer', daysAgo_one: 'hace {count} día', daysAgo_other: 'hace {count} días', inDays_one: 'en {count} día', inDays_other: 'en {count} días' },
  greeting: { morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches' },
  duration: { minutes: '{n}min', hours: '{n}h', hoursMinutes: '{h}h{m}' },
  priority: { alta: 'Alta', media: 'Media', baixa: 'Baja' },
  status: { todo: 'Por hacer', in_progress: 'En curso', done: 'Hecho', locked: 'Bloqueado' },
  levels: { 0: 'Empezando', 1: 'Cogiendo ritmo', 2: 'Constante', 3: 'Avanzado', 4: 'Maestro' },
  streakDays_one: '{count} día', streakDays_other: '{count} días',
  quotes: [
    'No hace falta estudiar perfecto. Hace falta seguir.',
    'Tu futuro se construye en las pequeñas sesiones de hoy.',
    '30 minutos hoy valen más que cero.',
    'La constancia le gana a la intensidad.',
    'Aprender es lento hasta el día en que deja de serlo.',
    'Lo que repasas hoy, lo recuerdas mañana.',
    'Concéntrate en la próxima sesión, no en todo el camino.',
    'Cada tema terminado es un peso menos.',
    'No necesitas motivación. Necesitas empezar.',
    'Estudiar cansado sigue siendo estudiar. Solo ajusta el ritmo.',
    'El progreso invisible también es progreso.',
    'Empieza en pequeño. Termina lo que empezaste.',
    'La duda de hoy es la respuesta de mañana.',
    'Descansar también forma parte del plan.',
  ],
  achievements: {
    'first-session': { title: 'Primera sesión completada', desc: 'Todo camino empieza con un paso.' },
    'streak-7': { title: '7 días seguidos', desc: 'Una semana entera de constancia.' },
    'hours-10': { title: '10 horas de estudio', desc: 'Diez horas de dedicación registradas.' },
    'questions-100': { title: '100 preguntas resueltas', desc: 'Práctica que se convierte en confianza.' },
    'weekly-goal': { title: 'Primera meta semanal cumplida', desc: 'Lo planeaste, lo hiciste, lo lograste.' },
    'streak-30': { title: '30 días seguidos', desc: 'Un mes entero. Eso ya es un hábito.' },
    'hours-50': { title: '50 horas de estudio', desc: 'A mitad de camino hacia la maestría.' },
    'topic-master': { title: 'Primer tema dominado', desc: 'Repasado hasta volverse memoria a largo plazo.' },
    'notes-5': { title: '5 notas creadas', desc: 'Tu cuaderno digital está creciendo.' },
    'early-bird': { title: 'Sesión antes de las 8', desc: 'El silencio de la mañana rinde.' },
  },
  toasts: {
    sessionDone: '¡Otra sesión completada! 🎉',
    sessionDoneDesc: '{minutes} minutos registrados. Hora de un descanso.',
    breakDone: 'Descanso terminado',
    breakDoneDesc: '¿Listo para la próxima sesión?',
    achievement: 'Logro desbloqueado',
  },
  untitledNote: 'Sin título',
  language: 'Idioma',
}
