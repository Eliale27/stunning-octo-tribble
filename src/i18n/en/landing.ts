import type { landing as Pt } from '../pt/landing'

export const landing: typeof Pt = {
  nav: { how: 'How it works', features: 'Features', testimonials: 'Testimonials', faq: 'FAQ', login: 'Sign in', start: 'Start for free' },
  hero: {
    badge: 'Your personal space to study better',
    title: 'Study better. Organize your routine.',
    titleAccent: 'Reach your goals.',
    sub: 'A simple, smart platform that turns your studying into a consistent routine.',
    cta: 'Get started for free',
    secondary: 'See how it works',
    note: 'No card. No install. Just you and your studies.',
  },
  preview: {
    nav: ['🏠 Home', '📚 My subjects', '📅 Planner', '✅ Tasks', '📝 Notes', '⏱️ Focus', '🔄 Review', '📊 My progress'],
    greeting: 'Good morning, Eliale 👋',
    greetingSub: 'Small steps every day take you further.',
    stats: { sessions: 'sessions', today: 'today', goal: 'goal', days: 'days', tasks: 'tasks' },
    progressTitle: 'Your progress today',
    progressSub: "You're 80% of the way to today's goal.",
    thisWeek: 'THIS WEEK',
    tasksTitle: "Today's tasks",
    tasks: [
      { title: 'Study the French Revolution', subject: 'History' },
      { title: 'Solve 20 geometry problems', subject: 'Math' },
      { title: 'Review comma rules and agreement', subject: 'English' },
    ],
  },
  how: {
    title: 'How it works',
    sub: 'Three steps, zero hassle.',
    steps: [
      { title: 'Create your subjects', desc: 'Add subjects and topics, pick a pastel color for each one and decide what you want to finish and by when.' },
      { title: 'Study with focus', desc: 'Start a focus session. Your time is logged automatically and the topic moves forward on its own.' },
      { title: 'Review and track', desc: 'Estuda tells you what to review, shows your progress and celebrates your wins quietly.' },
    ],
  },
  features: [
    { title: 'Plan your studies', desc: 'Subjects, topics, priorities and goals in one place. See everything by day, week or month, as a calendar, list or kanban board. Drag and drop to rearrange.', bullets: ['Pastel colors per subject', 'Drag and drop', 'Daily, weekly and monthly goals'] },
    { title: 'Stay focused', desc: 'A beautiful, distraction-free timer. Sessions from 15 to 60 minutes, automatic breaks and your time logged to your progress by itself.', bullets: ['Customizable Pomodoro', 'Automatic logging', 'Quotes to keep you company'] },
    { title: 'Track your progress', desc: 'Hours studied, study days, questions, accuracy and weekly growth. Simple charts that show what really matters.', bullets: ['Comparison with last week', 'Subjects that need attention', 'Subtle levels and achievements'] },
    { title: 'Build a consistent routine', desc: 'Spaced repetition tells you what to review and when. Day streaks, levels and small achievements keep the rhythm going without pressure.', bullets: ['Review today · soon · mastered', 'Study streak', 'Notion-style notes'] },
  ],
  art: {
    views: ['📅 Calendar', '📋 List', '🗂️ Kanban', '📆 Week'],
    days: ['Mon', 'Tue', 'Wed', 'Thu'],
    week: { geometry: 'Geometry', essay: 'Essay', genetics: 'Genetics', vargas: 'Cold War', vocabulary: 'Vocabulary', mock: 'Mock exam' },
    focusChip: '🌱 Focus session',
    focusMsg: "You've got this. Stay focused. 🌱",
    weekHours: 'You studied 18h40 this week.',
    weekDelta: "That's +23% compared to last week.",
    subjects: { math: 'Math', portuguese: 'English', biology: 'Biology' },
    review: [
      { label: 'Review today', topic: 'Functions · studied 7 days ago', when: "It's time to review." },
      { label: 'Review soon', topic: 'Genetics · studied 2 days ago', when: 'Review tomorrow' },
      { label: 'Mastered', topic: 'Reading · 5th review', when: 'Review in 30 days' },
    ],
    startReview: 'Start review →',
    streakTitle: "You've studied 12 days in a row!",
    streakSub: '🌿 Finding a rhythm · 3 achievements this month',
  },
  testimonials: {
    title: 'People who use it actually want to study',
    items: [
      { name: 'Marina S.', role: 'Pre-med student', text: "For the first time I can see what I've already studied and what's left. Spaced repetition saved me in Biology." },
      { name: 'João P.', role: 'Civil service candidate', text: 'Simple in the right way. I open it, see my tasks for the day, start focus and go. No fuss.' },
      { name: 'Letícia R.', role: 'Law student', text: 'The look keeps me calm. It feels like a pretty notebook that organizes itself.' },
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      { q: 'Is Estuda free?', a: 'Yes. You can plan, focus, take notes and track your progress without paying anything. Advanced features may arrive in an optional plan in the future.' },
      { q: 'Does it work on my phone?', a: 'Yes. The platform is fully responsive: on your phone the navigation becomes a bottom menu, the timer fills the screen and the buttons are big and easy to tap.' },
      { q: 'How does smart review work?', a: 'Every topic you study enters a spaced repetition cycle (1, 3, 7, 14, 30 and 60 days). You rate how well you remembered it and the system adjusts the next interval.' },
      { q: 'Do I need to set up a lot?', a: 'No. Create your subjects, add a few topics and start a focus session. The rest organizes itself around what you do.' },
      { q: 'Is my data safe?', a: 'In this demo version, everything is stored only in your browser. Nothing is sent to any server.' },
    ],
  },
  cta: {
    title: "Once you're in here, you'll actually want to study.",
    sub: 'Start today with 30 minutes. Tomorrow, 30 more. That is how you go far.',
    button: 'Get started for free',
  },
  footer: '© {year} Estuda · Your personal space to study better.',
}
