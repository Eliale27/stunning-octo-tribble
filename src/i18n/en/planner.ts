import type { planner as Pt } from '../pt/planner'

export const planner: typeof Pt = {
  title: 'My Plan',
  sub: 'Organize by day, week or month. Drag, drop and adjust at your own pace.',
  newTask: 'New task',
  views: { calendario: '📅 Calendar', lista: '📋 List', kanban: '🗂️ Kanban', semana: '📆 Week', metas: '🎯 Goals' },
  fmt: {
    weekDaySub: 'MMM d',           // Oct 3
    selectedDay: 'EEEE, MMM d',    // Friday, Oct 3
    deadline: 'MM/dd',             // 10/03
  },
  week: {
    today: 'today',
    hint: 'Drag tasks between days to rearrange your week.',
  },
  calendar: {
    weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    task: 'Task',
    empty: 'No tasks on this day.',
  },
  goals: {
    newGoal: 'New goal',
    create: 'Create goal',
    heading: { daily: 'Daily goal', weekly: 'Weekly goal', monthly: 'Monthly goal' },
    empty: { daily: 'No daily goals yet.', weekly: 'No weekly goals yet.', monthly: 'No monthly goals yet.' },
    period: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
    unitOptions: { minutes: 'Minutes', questions: 'Questions', sessions: 'Sessions', topics: 'Topics' },
    units: { minutes: 'minutes', questions: 'questions', topics: 'topics', sessions: 'sessions' },
    progress: '{current} of {target}',
    until: ' · by {date}',
    form: {
      title: 'Title',
      period: 'Period',
      measureIn: 'Measure in',
      target: 'Target',
      subject: 'Subject',
      allSubjects: 'All',
      deadline: 'Deadline (optional)',
    },
    suggestion: {
      minutes: { daily: 'Study {amount} a day', weekly: 'Study {amount} this week', monthly: 'Study {amount} this month' },
      questions: { daily: 'Solve {n} questions today', weekly: 'Solve {n} questions this week', monthly: 'Solve {n} questions this month' },
      topics: 'Finish {n} topics',
      topicsOf: 'Finish {n} topics in {subject}',
      sessions: 'Complete {n} focus sessions',
    },
  },
}
