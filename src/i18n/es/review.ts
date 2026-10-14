import type { review as Pt } from '../pt/review'

export const review: typeof Pt = {
  title: 'Repasar',
  sub: 'Repaso espaciado: el sistema te avisa qué repasar, y cuándo.',
  buckets: {
    today: { label: 'Repasar hoy', hint: 'La memoria se debilita: repasa ahora para fijarlo.' },
    soon: { label: 'Repasar pronto', hint: 'Aún está fresco, pero el plazo se acerca.' },
    mastered: { label: 'Dominado', hint: 'Intervalos largos: ya lo consolidaste.' },
  },
  empty: {
    title: 'Nada que repasar todavía',
    desc: 'Estudia un tema y entrará automáticamente en el ciclo de repasos.',
  },
  studiedToday: 'estudiado hoy',
  studiedAgo_one: 'estudiado hace {count} día',
  studiedAgo_other: 'estudiado hace {count} días',
  dueNow: 'Es hora de repasar.',
  dueIn_one: 'Repasar mañana',
  dueIn_other: 'Repasar en {count} días',
  startReview: 'Empezar repaso',
  review: 'Repasar',
  recall: {
    title: 'Antes de mirar los apuntes, intenta recordar:',
    promptBefore: '¿Cuáles son los 3 puntos principales de ',
    promptAfter: '? Explícalo en voz alta o escríbelo en una hoja.',
    studied: 'estudiados',
    accuracy: 'de acierto',
    nth: '{n}.º',
    reviewLabel: 'repaso',
    recalled: 'Ya lo recordé, evaluar',
  },
  rate: {
    question: '¿Qué tal fue recordar este contenido?',
    hard: '😅 Difícil',
    ok: '🙂 Lo recordé con esfuerzo',
    easy: '😎 Fácil',
    again: 'repasar en {n}d',
  },
  done: {
    title: 'Repaso registrado',
    desc: 'El próximo recordatorio ya está programado.',
    continue: 'Continuar',
  },
}
