import type { focus as Pt } from '../pt/focus'

export const focus: typeof Pt = {
  title: 'Enfoque',
  sub: 'Una sesión a la vez. El resto puede esperar.',
  phrases: [
    'Tú puedes. Sigue enfocado. 🌱',
    'Un paso a la vez. Estás avanzando.',
    'Respira. El único lugar donde estar ahora es aquí.',
    'La sesión de hoy es el resultado de mañana.',
  ],
  modeFocus: '🌱 Sesión de enfoque',
  modeBreak: '☕ Pausa',
  state: {
    focusing: 'enfocado',
    resting: 'descansando',
    ready: 'listo para empezar',
    paused: 'en pausa',
  },
  breakHint: 'Levántate, toma agua, estírate. Te lo mereces.',
  restart: 'Reiniciar',
  pause: 'Pausar',
  start: 'Iniciar',
  finishNow: 'Terminar ahora',
  skipBreak: 'Saltar pausa',
  duration: 'Duración',
  presetMin: '{n} min',
  breakInfo: 'Pausa de {n} min entre sesiones · ajústala en Configuración',
  alertSound: 'Sonido al terminar',
  subject: 'Materia',
  freeSession: 'Sesión libre',
  topic: 'Tema',
  noTopic: 'Ninguno',
  stats: {
    sessionsToday: 'Sesiones hoy',
    timeToday: 'Tiempo hoy',
    dailyGoal: 'Meta diaria',
  },
}
