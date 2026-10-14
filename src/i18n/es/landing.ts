import type { landing as Pt } from '../pt/landing'

export const landing: typeof Pt = {
  nav: { how: 'Cómo funciona', features: 'Funciones', testimonials: 'Opiniones', faq: 'FAQ', login: 'Entrar', start: 'Empezar gratis' },
  hero: {
    badge: 'Tu espacio personal para estudiar mejor',
    title: 'Estudia mejor. Organiza tu rutina.',
    titleAccent: 'Alcanza tus objetivos.',
    sub: 'Una plataforma simple e inteligente para convertir tus estudios en una rutina constante.',
    cta: 'Empezar gratis',
    secondary: 'Conocer la plataforma',
    note: 'Sin tarjeta. Sin instalación. Solo tú y tus estudios.',
  },
  preview: {
    nav: ['🏠 Inicio', '📚 Mis materias', '📅 Planificación', '✅ Tareas', '📝 Notas', '⏱️ Enfoque', '🔄 Repaso', '📊 Mi progreso'],
    greeting: 'Buenos días, Eliale 👋',
    greetingSub: 'Pequeños pasos cada día te llevan más lejos.',
    stats: { sessions: 'sesiones', today: 'hoy', goal: 'meta', days: 'días', tasks: 'tareas' },
    progressTitle: 'Tu progreso de hoy',
    progressSub: 'Estás un 80% más cerca de tu meta de hoy.',
    thisWeek: 'ESTA SEMANA',
    tasksTitle: 'Tareas de hoy',
    tasks: [
      { title: 'Estudiar la Revolución Francesa', subject: 'Historia' },
      { title: 'Resolver 20 ejercicios de Geometría', subject: 'Matemáticas' },
      { title: 'Repasar acentuación y concordancia', subject: 'Lengua' },
    ],
  },
  how: {
    title: 'Cómo funciona',
    sub: 'Tres pasos, ninguna complicación.',
    steps: [
      { title: 'Crea tus materias', desc: 'Añade materias y temas, elige un color pastel para cada una y define qué quieres terminar y para cuándo.' },
      { title: 'Estudia con enfoque', desc: 'Inicia una sesión de enfoque. El tiempo se registra automáticamente y el tema avanza solo.' },
      { title: 'Repasa y haz seguimiento', desc: 'Estuda te avisa qué repasar, muestra tu progreso y celebra tus logros de forma discreta.' },
    ],
  },
  features: [
    { title: 'Planifica tus estudios', desc: 'Materias, temas, prioridades y metas en un solo lugar. Ve todo por día, semana o mes, en calendario, lista o kanban. Arrastra y suelta para reorganizar.', bullets: ['Colores pastel por materia', 'Arrastrar y soltar', 'Metas diarias, semanales y mensuales'] },
    { title: 'Mantén el enfoque', desc: 'Un cronómetro bonito, sin distracciones. Sesiones de 15 a 60 minutos, pausas automáticas y el tiempo registrado solo en tu progreso.', bullets: ['Pomodoro personalizable', 'Registro automático', 'Frases que acompañan la sesión'] },
    { title: 'Sigue tu progreso', desc: 'Horas estudiadas, días de estudio, preguntas, tasa de aciertos y evolución semanal. Gráficos simples que muestran lo que de verdad importa.', bullets: ['Comparación con la semana anterior', 'Materias que necesitan atención', 'Niveles y logros discretos'] },
    { title: 'Crea una rutina constante', desc: 'El repaso espaciado te avisa qué repasar y cuándo. Racha de días, niveles y pequeños logros para mantener el ritmo sin presión.', bullets: ['Repasar hoy · pronto · dominado', 'Racha de estudio', 'Notas estilo Notion'] },
  ],
  art: {
    views: ['📅 Calendario', '📋 Lista', '🗂️ Kanban', '📆 Semana'],
    days: ['Lun', 'Mar', 'Mié', 'Jue'],
    week: { geometry: 'Geometría', essay: 'Redacción', genetics: 'Genética', vargas: 'Guerra Fría', vocabulary: 'Vocabulary', mock: 'Simulacro' },
    focusChip: '🌱 Sesión de enfoque',
    focusMsg: 'Tú puedes. Sigue enfocado. 🌱',
    weekHours: 'Estudiaste 18h40 esta semana.',
    weekDelta: 'Eso es un +23% respecto a la semana pasada.',
    subjects: { math: 'Matemáticas', portuguese: 'Lengua', biology: 'Biología' },
    review: [
      { label: 'Repasar hoy', topic: 'Funciones · estudiado hace 7 días', when: 'Es hora de repasar.' },
      { label: 'Repasar pronto', topic: 'Genética · estudiado hace 2 días', when: 'Repasar mañana' },
      { label: 'Dominado', topic: 'Reading · 5.º repaso', when: 'Repasar en 30 días' },
    ],
    startReview: 'Empezar repaso →',
    streakTitle: '¡Llevas 12 días seguidos estudiando!',
    streakSub: '🌿 Cogiendo ritmo · 3 logros este mes',
  },
  testimonials: {
    title: 'Quien lo usa, tiene ganas de estudiar',
    items: [
      { name: 'Marina S.', role: 'Aspirante a Medicina', text: 'Por primera vez puedo ver lo que ya estudié y lo que me falta. El repaso espaciado me salvó en Biología.' },
      { name: 'João P.', role: 'Opositor', text: 'Simple como debe ser. Abro, veo mis tareas del día, activo el enfoque y listo. Sin vueltas.' },
      { name: 'Letícia R.', role: 'Estudiante de Derecho', text: 'El diseño me da calma. Parece un cuaderno bonito que se organiza solo.' },
    ],
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      { q: '¿Estuda es gratis?', a: 'Sí. Puedes planificar, enfocarte, tomar notas y seguir tu progreso sin pagar nada. Las funciones avanzadas podrían llegar en un plan opcional más adelante.' },
      { q: '¿Funciona en el celular?', a: 'Sí. La plataforma es totalmente responsiva: en el celular la navegación se convierte en un menú inferior, el cronómetro ocupa la pantalla y los botones son grandes y fáciles de tocar.' },
      { q: '¿Cómo funciona el repaso inteligente?', a: 'Cada tema estudiado entra en un ciclo de repaso espaciado (1, 3, 7, 14, 30 y 60 días). Tú evalúas qué tal lo recordaste y el sistema ajusta el siguiente intervalo.' },
      { q: '¿Tengo que configurar mucho?', a: 'No. Crea tus materias, añade algunos temas y empieza una sesión de enfoque. El resto se organiza a partir de lo que haces.' },
      { q: '¿Mis datos están seguros?', a: 'En esta versión de demostración, todo se guarda solo en tu navegador. No se envía nada a ningún servidor.' },
    ],
  },
  cta: {
    title: 'Cuando entres aquí, te van a dar ganas de estudiar.',
    sub: 'Empieza hoy con 30 minutos. Mañana, otros 30. Así es como se llega lejos.',
    button: 'Empezar gratis',
  },
  footer: '© {year} Estuda · Tu espacio personal para estudiar mejor.',
}
