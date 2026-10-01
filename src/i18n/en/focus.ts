import type { focus as Pt } from '../pt/focus'

export const focus: typeof Pt = {
  title: 'Focus',
  sub: 'One session at a time. The rest can wait.',
  phrases: [
    'You can do this. Stay focused. 🌱',
    'One step at a time. You are moving forward.',
    'Breathe. The only place to be right now is here.',
    "Today's session is tomorrow's result.",
  ],
  modeFocus: '🌱 Focus session',
  modeBreak: '☕ Break',
  state: {
    focusing: 'focusing',
    resting: 'resting',
    ready: 'ready to start',
    paused: 'paused',
  },
  breakHint: 'Stand up, drink some water, stretch. You earned it.',
  restart: 'Restart',
  pause: 'Pause',
  start: 'Start',
  finishNow: 'Finish now',
  skipBreak: 'Skip break',
  duration: 'Duration',
  presetMin: '{n} min',
  breakInfo: '{n} min break between sessions · change it in Settings',
  alertSound: 'Sound when done',
  subject: 'Subject',
  freeSession: 'Free session',
  topic: 'Topic',
  noTopic: 'None',
  stats: {
    sessionsToday: 'Sessions today',
    timeToday: 'Time today',
    dailyGoal: 'Daily goal',
  },
}
