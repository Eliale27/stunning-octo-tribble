import type { app as Pt } from '../pt/app'

export const app: typeof Pt = {
  nav: {
    home: 'Home', subjects: 'My subjects', planner: 'Planner', tasks: 'Tasks', notes: 'Notes',
    focus: 'Focus', review: 'Review', progress: 'My progress', achievements: 'Achievements', settings: 'Settings',
  },
  mobileNav: { home: 'Home', tasks: 'Tasks', focus: 'Focus', planner: 'Plan', progress: 'Progress' },
  timer: { pause: 'Pause', resume: 'Resume', focusing: 'Focusing', break: 'Break' },
  aria: {
    expandMenu: 'Expand menu', collapseMenu: 'Collapse menu', openMenu: 'Open menu', close: 'Close',
    replayTour: 'Replay the tour', logout: 'Log out',
  },
  tour: {
    aria: 'Guided tour',
    stepOf: 'Step {step} of {total}',
    timer: { title: 'Timer', text: 'Pick a duration, hit play and study in Pomodoro sessions with automatic breaks.' },
    music: { title: 'Music', text: 'Play your Spotify playlists right here, next to the timer, without leaving the app.' },
    language: { title: 'Language', text: 'Switch the interface language whenever you like; your choice is saved for next time.' },
    planner: { title: 'Planner', text: 'Organize your week as a calendar, list or kanban board and keep track of your goals.' },
    review: { title: 'Review', text: 'Spaced repetition tells you what to review and when, so what you learn really sticks.' },
  },
  sound: {
    turnOff: 'Turn sound off', turnOn: 'Turn sound on', volume: 'Alert volume', off: 'off', preview: 'Play the sound', test: 'Test',
  },
  settings: {
    title: 'Settings',
    sub: 'Make the app fit the way you study.',
    languageHint: 'The interface and dates follow the language you choose.',
    name: 'Your name', nameHint: 'What should we call you?',
    dailyGoal: 'Daily goal', dailyGoalHint: 'Currently {time} a day',
    focusLength: 'Focus length', focusLengthHint: 'Pomodoro default',
    breakLength: 'Break length', breakOption: '{n} min',
    sound: 'Sound when done', soundHint: 'A soft chime when the timer hits zero. Plays even when the tab is in the background.',
    tour: 'Guided tour', tourHint: 'Watch the walkthrough of the main parts of the app again.', tourButton: 'Replay tour',
    demoTitle: 'Demo data',
    demoDesc: 'This version keeps everything in your browser. You can restore the initial sample data at any time.',
    demoConfirm: 'Restore the demo data? Your changes will be lost.',
    demoButton: 'Restore demo',
    footer: 'estuda · v0.1 · made with calm and coffee ☕',
  },
  login: {
    title: 'Welcome back 🌱',
    sub: 'Your space is ready. Sign in and pick up where you left off.',
    nameLabel: 'What should we call you?', namePlaceholder: 'Eliale',
    emailLabel: 'Email', emailPlaceholder: 'you@example.com',
    enter: 'Sign in', or: 'or', demo: 'Explore with demo data',
    note: 'Demo version: no data ever leaves your browser.',
    cardToday: 'Today', cardHeadline: "You're 80% of the way to your goal.",
    cardStreak: '🔥 12-day streak', cardLevel: '🌿 Finding a rhythm',
    quote: "“You don't have to study perfectly. You have to keep going.”",
  },
}
