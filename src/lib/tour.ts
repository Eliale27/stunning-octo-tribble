/**
 * First-visit guided tour: one short message per step, each pointing at a part of
 * the screen marked with `data-tour="<target>"`. If the target is not on screen
 * (e.g. a feature not shipped yet), the message is shown centred instead.
 */
export interface TourStep {
  target: string
  /** Route to open before looking for the target (hash router path). */
  route?: string
  emoji: string
  title: string
  text: string
}

export const tourSteps: TourStep[] = [
  { target: 'timer', route: '/app/foco', emoji: '⏱️', title: 'Cronômetro', text: 'Escolha a duração, aperte o play e estude em sessões Pomodoro com pausas automáticas.' },
  { target: 'music', route: '/app/foco', emoji: '🎧', title: 'Música', text: 'Toque suas playlists do Spotify aqui, ao lado do cronômetro, sem sair da plataforma.' },
  { target: 'language', emoji: '🌐', title: 'Idioma', text: 'Troque o idioma da interface quando quiser; a escolha fica salva para as próximas visitas.' },
  { target: 'planner', route: '/app/planejamento', emoji: '🗓️', title: 'Planejamento', text: 'Organize a semana em calendário, lista ou kanban e acompanhe suas metas.' },
  { target: 'review', route: '/app/revisao', emoji: '🔁', title: 'Revisão', text: 'A revisão espaçada avisa o que revisar e quando, para o conteúdo fixar de verdade.' },
]
