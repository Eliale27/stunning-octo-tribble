/**
 * First-visit guided tour: one short message per step, each pointing at a part of
 * the screen marked with `data-tour="<target>"`. If the target is not on screen
 * (e.g. a feature not shipped yet), the message is shown centred instead.
 * Title and text live in the translation files: `app.tour.<target>.{title,text}`.
 */
export interface TourStep {
  target: string
  /** Route to open before looking for the target (hash router path). */
  route?: string
  emoji: string
}

export const tourSteps: TourStep[] = [
  { target: 'timer', route: '/app/foco', emoji: '⏱️' },
  { target: 'music', route: '/app/foco', emoji: '🎧' },
  { target: 'language', emoji: '🌐' },
  { target: 'planner', route: '/app/planejamento', emoji: '🗓️' },
  { target: 'review', route: '/app/revisao', emoji: '🔁' },
]
