import type { app as Pt } from '../pt/app'

export const app: typeof Pt = {
  nav: {
    home: 'Inicio', subjects: 'Mis materias', planner: 'Planificación', tasks: 'Tareas', notes: 'Notas',
    focus: 'Enfoque', review: 'Repaso', progress: 'Mi progreso', achievements: 'Logros', settings: 'Ajustes',
  },
  mobileNav: { home: 'Inicio', tasks: 'Tareas', focus: 'Enfoque', planner: 'Plan', progress: 'Progreso' },
  timer: { pause: 'Pausar', resume: 'Continuar', focusing: 'Enfocado', break: 'Pausa' },
  aria: {
    expandMenu: 'Expandir menú', collapseMenu: 'Contraer menú', openMenu: 'Abrir menú', close: 'Cerrar',
    replayTour: 'Volver a ver el tour', logout: 'Salir',
  },
  tour: {
    aria: 'Tour guiado',
    stepOf: 'Paso {step} de {total}',
    timer: { title: 'Cronómetro', text: 'Elige la duración, dale a play y estudia en sesiones Pomodoro con pausas automáticas.' },
    music: { title: 'Música', text: 'Reproduce tus playlists de Spotify aquí mismo, junto al cronómetro, sin salir de la plataforma.' },
    language: { title: 'Idioma', text: 'Cambia el idioma de la interfaz cuando quieras; tu elección se guarda para las próximas visitas.' },
    planner: { title: 'Planificación', text: 'Organiza tu semana en calendario, lista o kanban y sigue tus metas.' },
    review: { title: 'Repaso', text: 'El repaso espaciado te avisa qué repasar y cuándo, para que lo aprendido se quede de verdad.' },
  },
  sound: {
    turnOff: 'Apagar sonido', turnOn: 'Activar sonido', volume: 'Volumen de la alerta', off: 'off', preview: 'Escuchar el sonido', test: 'Probar',
  },
  settings: {
    title: 'Ajustes',
    sub: 'Adapta la plataforma a tu forma de estudiar.',
    languageHint: 'La interfaz y las fechas siguen el idioma elegido.',
    name: 'Tu nombre', nameHint: '¿Cómo quieres que te llamemos?',
    dailyGoal: 'Meta diaria', dailyGoalHint: 'Actualmente {time} al día',
    focusLength: 'Duración del enfoque', focusLengthHint: 'Estándar del Pomodoro',
    breakLength: 'Duración de la pausa', breakOption: '{n} min',
    sound: 'Sonido al terminar', soundHint: 'Una campanita suave cuando el cronómetro llega a cero. Suena aunque la pestaña esté en segundo plano.',
    tour: 'Tour guiado', tourHint: 'Vuelve a ver la presentación de las partes principales de la plataforma.', tourButton: 'Ver el tour',
    demoTitle: 'Datos de demostración',
    demoDesc: 'Esta versión guarda todo en tu navegador. Puedes restaurar los datos de ejemplo iniciales cuando quieras.',
    demoConfirm: '¿Restaurar los datos de demostración? Se perderán tus cambios.',
    demoButton: 'Restaurar demostración',
    footer: 'estuda · v0.1 · hecho con calma y café ☕',
  },
  login: {
    title: 'Qué bueno verte de nuevo 🌱',
    sub: 'Tu espacio está listo. Entra y sigue donde lo dejaste.',
    nameLabel: '¿Cómo quieres que te llamemos?', namePlaceholder: 'Eliale',
    emailLabel: 'Correo electrónico', emailPlaceholder: 'tu@ejemplo.com',
    enter: 'Entrar', or: 'o', demo: 'Explorar con datos de demostración',
    note: 'Versión de demostración: ningún dato sale de tu navegador.',
    cardToday: 'Hoy', cardHeadline: 'Estás un 80% más cerca de tu meta.',
    cardStreak: '🔥 12 días seguidos', cardLevel: '🌿 Cogiendo ritmo',
    quote: '“No hace falta estudiar perfecto. Hace falta seguir.”',
  },
}
