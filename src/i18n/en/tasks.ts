import type { tasks as Pt } from '../pt/tasks'

export const tasks: typeof Pt = {
  title: 'Tasks',
  pendingCount_one: '{count} pending',
  pendingCount_other: '{count} pending',
  doneCount_one: '{count} done',
  doneCount_other: '{count} done',
  newTask: 'New task',
  filters: { todas: 'All', hoje: 'Today', proximas: 'Upcoming', concluidas: 'Done' },
  allSubjects: 'All subjects',
  groups: { overdue: 'Overdue', today: 'Today', tomorrow: 'Tomorrow', thisWeek: 'This week', later: 'Later', noDate: 'No date', done: 'Done' },
  empty: { title: 'Nothing here yet', desc: 'Create a task and take the first step of the day.' },
  form: {
    name: '☐ Name',
    namePlaceholder: 'e.g. Study the French Revolution',
    subject: '📚 Subject',
    none: 'None',
    date: '📅 Date',
    priority: '⭐ Priority',
    category: '🏷️ Category',
    estimate: '⏱️ Estimated time (min)',
    notes: '📝 Notes',
    notesPlaceholder: 'Details, links, reminders…',
    subtasks: 'Subtasks',
    addSubtask: 'Add a subtask…',
    create: 'Create task',
    categories: {
      estudo: 'Study', exercicios: 'Exercises', revisao: 'Review', resumo: 'Summary', aula: 'Class',
      redacao: 'Essay', simulado: 'Mock exam', organizacao: 'Organization', leitura: 'Reading',
    },
  },
  row: {
    priorityTitle: '{label} priority',
    newSubtask: 'New subtask…',
    editTask: 'Edit task',
    drag: 'Drag',
  },
}
