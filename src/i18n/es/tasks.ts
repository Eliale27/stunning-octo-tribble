import type { tasks as Pt } from '../pt/tasks'

export const tasks: typeof Pt = {
  title: 'Tareas',
  pendingCount_one: '{count} pendiente',
  pendingCount_other: '{count} pendientes',
  doneCount_one: '{count} completada',
  doneCount_other: '{count} completadas',
  newTask: 'Nueva tarea',
  filters: { todas: 'Todas', hoje: 'Hoy', proximas: 'Próximas', concluidas: 'Completadas' },
  allSubjects: 'Todas las materias',
  groups: { overdue: 'Atrasadas', today: 'Hoy', tomorrow: 'Mañana', thisWeek: 'Esta semana', later: 'Más adelante', noDate: 'Sin fecha', done: 'Completadas' },
  empty: { title: 'Nada por aquí', desc: 'Crea una tarea y da el primer paso del día.' },
  form: {
    name: '☐ Nombre',
    namePlaceholder: 'Ej.: Estudiar la Revolución Francesa',
    subject: '📚 Materia',
    none: 'Ninguna',
    date: '📅 Fecha',
    priority: '⭐ Prioridad',
    category: '🏷️ Categoría',
    estimate: '⏱️ Tiempo estimado (min)',
    notes: '📝 Notas',
    notesPlaceholder: 'Detalles, enlaces, recordatorios…',
    subtasks: 'Subtareas',
    addSubtask: 'Agregar subtarea…',
    create: 'Crear tarea',
    categories: {
      estudo: 'Estudio', exercicios: 'Ejercicios', revisao: 'Repaso', resumo: 'Resumen', aula: 'Clase',
      redacao: 'Redacción', simulado: 'Simulacro', organizacao: 'Organización', leitura: 'Lectura',
    },
  },
  row: {
    priorityTitle: 'Prioridad {label}',
    newSubtask: 'Nueva subtarea…',
    editTask: 'Editar tarea',
    drag: 'Arrastrar',
  },
}
