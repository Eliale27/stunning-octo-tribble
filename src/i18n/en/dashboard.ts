import type { dashboard as Pt } from '../pt/dashboard'

export const dashboard: typeof Pt = {
  tagline: 'Small steps every day take you further.',
  startFocus: 'Start a focus session',
  stats: {
    studiesToday: "Today's studies",
    session_one: 'session',
    session_other: 'sessions',
    timeStudied: 'Time studied',
    today: 'today',
    dailyGoal: 'Daily goal',
    pctDone: '{pct}% done',
    streak: 'Streak',
    inARow: 'in a row',
    tasks: 'Tasks',
    doneToday: 'done today',
  },
  progress: {
    ofGoal: 'of goal',
    title: 'Your progress today',
    goalDone: "Today's goal is done. Rest with pride. 🌿",
    closer: "You're {pct}% closer to today's goal.",
    studied: '{time} studied',
    remaining: '{time} to go',
    toNext: '{pct}% to {emoji} {name}',
  },
  quote: { label: "Today's motivation" },
  tasks: {
    title: "Today's tasks",
    seeAll: 'See all',
    empty: 'No tasks for today. How about planning your next session?',
    subtasks: '{done}/{total} subtasks',
  },
  week: {
    title: 'This week',
    details: 'Details',
    last7: '{time} in the last 7 days',
  },
  review: {
    title: 'To review today',
    action: 'Review',
    empty: 'Nothing pending. Your memory thanks you. 🧠',
    studiedAgo_one: 'studied {count} day ago',
    studiedAgo_other: 'studied {count} days ago',
  },
  goals: { title: 'Goals', manage: 'Manage' },
}
