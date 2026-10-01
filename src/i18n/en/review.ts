import type { review as Pt } from '../pt/review'

export const review: typeof Pt = {
  title: 'Review',
  sub: 'Spaced repetition: the system tells you what to review, and when.',
  buckets: {
    today: { label: 'Review today', hint: 'Memory is fading: review now to lock it in.' },
    soon: { label: 'Review soon', hint: 'Still fresh, but the deadline is getting close.' },
    mastered: { label: 'Mastered', hint: "Long intervals: you've already consolidated it." },
  },
  empty: {
    title: 'Nothing to review yet',
    desc: 'Study a topic and it will automatically join the review cycle.',
  },
  studiedToday: 'studied today',
  studiedAgo_one: 'studied {count} day ago',
  studiedAgo_other: 'studied {count} days ago',
  dueNow: "It's time to review.",
  dueIn_one: 'Review tomorrow',
  dueIn_other: 'Review in {count} days',
  startReview: 'Start review',
  review: 'Review',
  recall: {
    title: 'Before looking at your notes, try to recall:',
    promptBefore: 'What are the 3 main points of ',
    promptAfter: '? Explain out loud or write them down on paper.',
    studied: 'studied',
    accuracy: 'accuracy',
    nth: '#{n}',
    reviewLabel: 'review',
    recalled: 'Got it, rate it',
  },
  rate: {
    question: 'How did recalling this go?',
    hard: '😅 Hard',
    ok: '🙂 Recalled with effort',
    easy: '😎 Easy',
    again: 'review in {n}d',
  },
  done: {
    title: 'Review logged',
    desc: 'Your next reminder is already scheduled.',
    continue: 'Continue',
  },
}
