import type { common as Pt } from '../pt/common'

export const common: typeof Pt = {
  fmt: {
    dayMonth: 'MMM d',                 // Oct 3
    dayMonthLong: 'MMMM d',            // October 3
    weekdayDayMonth: 'EEEE, MMMM d',   // Friday, October 3
    weekdayShortDay: 'EEE d',          // Fri 3
    dayMonthNumeric: 'M/d',            // 10/3
    monthShort: 'MMM',
    monthYear: 'MMMM yyyy',
    time: 'h:mm a',
  },
  actions: {
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add', close: 'Close',
    back: 'Back', next: 'Next', skip: 'Skip', finish: 'Done', confirm: 'Confirm', remove: 'Remove',
    search: 'Search', open: 'Open', done: 'Done',
  },
  relative: { today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday', daysAgo_one: '{count} day ago', daysAgo_other: '{count} days ago', inDays_one: 'in {count} day', inDays_other: 'in {count} days' },
  greeting: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
  duration: { minutes: '{n}min', hours: '{n}h', hoursMinutes: '{h}h{m}' },
  priority: { alta: 'High', media: 'Medium', baixa: 'Low' },
  status: { todo: 'To do', in_progress: 'In progress', done: 'Done', locked: 'Locked' },
  levels: { 0: 'Getting started', 1: 'Finding a rhythm', 2: 'Consistent', 3: 'Advanced', 4: 'Master' },
  streakDays_one: '{count} day', streakDays_other: '{count} days',
  quotes: [
    "You don't have to study perfectly. You have to keep going.",
    'Your future is being built in the small sessions you do today.',
    '30 minutes today beats zero.',
    'Consistency beats intensity.',
    "Learning feels slow until the day it doesn't.",
    'What you review today, you remember tomorrow.',
    'Focus on the next session, not the whole road.',
    'Every finished topic is one less thing on your mind.',
    "You don't need motivation. You need a start.",
    'Studying tired is still studying. Just adjust the pace.',
    'Invisible progress is still progress.',
    'Start small. Finish what you started.',
    "Today's question is tomorrow's answer.",
    'Rest is part of the plan too.',
  ],
  achievements: {
    'first-session': { title: 'First session completed', desc: 'Every journey starts with a step.' },
    'streak-7': { title: '7 days in a row', desc: 'A whole week of consistency.' },
    'hours-10': { title: '10 hours studied', desc: 'Ten hours of dedication on record.' },
    'questions-100': { title: '100 questions solved', desc: 'Practice that turns into confidence.' },
    'weekly-goal': { title: 'First weekly goal reached', desc: 'Planned it, did it, got there.' },
    'streak-30': { title: '30 days in a row', desc: 'A whole month. That is a habit.' },
    'hours-50': { title: '50 hours studied', desc: 'Halfway to mastery.' },
    'topic-master': { title: 'First topic mastered', desc: 'Reviewed until it became long-term memory.' },
    'notes-5': { title: '5 notes created', desc: 'Your digital notebook is growing.' },
    'early-bird': { title: 'Session before 8 am', desc: 'The quiet of the morning pays off.' },
  },
  toasts: {
    sessionDone: 'Another session done! 🎉',
    sessionDoneDesc: '{minutes} minutes logged. Time for a break.',
    breakDone: 'Break over',
    breakDoneDesc: 'Ready for the next session?',
    achievement: 'Achievement unlocked',
  },
  untitledNote: 'Untitled',
  language: 'Language',
}
