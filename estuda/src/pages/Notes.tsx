import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Search, Trash2, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useStore } from '@/store/useStore'
import { NoteEditor } from '@/components/NoteEditor'
import { Select, SubjectChip } from '@/components/ui/Bits'
import { cn } from '@/lib/utils'

const emojis = ['📝', '📐', '🏛️', '🧬', '✍️', '🌍', '💡', '📚', '🗓️', '⭐', '🧠', '🔬']

export default function Notes() {
  const notes = useStore(s => s.notes)
  const subjects = useStore(s => s.subjects)
  const { addNote, updateNote, removeNote } = useStore()
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null)
  const [q, setQ] = useState('')
  const [mobileEditing, setMobileEditing] = useState(false)
  const active = notes.find(n => n.id === activeId)

  const filtered = useMemo(() => notes.filter(n => n.title.toLowerCase().includes(q.toLowerCase()) || n.content.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [notes, q])

  const create = () => { const id = addNote(); setActiveId(id); setMobileEditing(true) }
  const open = (id: string) => { setActiveId(id); setMobileEditing(true) }

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-4 md:h-[calc(100vh-6rem)]">
      {/* List */}
      <aside className={cn('card flex w-full flex-col md:w-72 md:shrink-0', mobileEditing && 'hidden md:flex')}>
        <div className="border-b border-line p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <h1 className="text-lg font-bold">Anotações</h1>
            <button onClick={create} className="btn btn-primary h-8 px-2.5 text-xs"><Plus size={14} /> Nova</button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input h-9 pl-8 text-xs" placeholder="Buscar…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {filtered.map(n => (
            <li key={n.id}>
              <button onClick={() => open(n.id)} className={cn('flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition', activeId === n.id ? 'bg-beige' : 'hover:bg-cream-2')}>
                <span className="text-lg leading-none">{n.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{n.title || 'Sem título'}</p>
                  <p className="truncate text-[11px] text-muted">{formatDistanceToNow(parseISO(n.updatedAt), { locale: ptBR, addSuffix: true })}</p>
                  <SubjectChip id={n.subjectId} size="xs" className="mt-1" />
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <p className="p-4 text-center text-xs text-muted">Nenhuma anotação encontrada.</p>}
        </ul>
      </aside>

      {/* Editor */}
      <section className={cn('card flex min-w-0 flex-1 flex-col', !mobileEditing && 'hidden md:flex')}>
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <button onClick={() => setMobileEditing(false)} className="btn btn-ghost -ml-2 h-8 w-8 p-0 md:hidden"><ArrowLeft size={16} /></button>
                <div className="relative">
                  <select value={active.emoji} onChange={e => updateNote(active.id, { emoji: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Ícone">
                    {emojis.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-cream-2 text-xl hover:bg-beige">{active.emoji}</span>
                </div>
                <input value={active.title} onChange={e => updateNote(active.id, { title: e.target.value })} placeholder="Sem título"
                  className="min-w-0 flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-muted/60" />
                <Select className="hidden w-auto min-w-[140px] sm:block" value={active.subjectId ?? ''} onChange={v => updateNote(active.id, { subjectId: v || undefined })} placeholder="Sem matéria" options={subjects.map(s => ({ value: s.id, label: `${s.emoji} ${s.name}` }))} />
                <button onClick={() => { if (confirm('Excluir esta anotação?')) { removeNote(active.id); setActiveId(notes.find(n => n.id !== active.id)?.id ?? null); setMobileEditing(false) } }} className="btn btn-ghost h-8 w-8 p-0 text-muted hover:text-rose-ink"><Trash2 size={15} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8">
                <div className="mx-auto max-w-2xl">
                  <NoteEditor noteId={active.id} content={active.content} onChange={html => updateNote(active.id, { content: html })} />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <p className="text-4xl">📝</p>
                <p className="mt-2 font-bold">Selecione ou crie uma anotação</p>
                <p className="text-sm text-muted">Títulos, listas, checklists, tabelas, código e callouts.</p>
                <button onClick={create} className="btn btn-primary mt-4"><Plus size={15} /> Nova anotação</button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
