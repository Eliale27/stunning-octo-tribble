import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TableKit } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extensions'
import { Node, mergeAttributes } from '@tiptap/core'
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, ListChecks, Highlighter, Table as TableIcon,
  Image as ImageIcon, Link as LinkIcon, Code, Quote, Lightbulb, Minus, Undo2, Redo2, Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML() { return [{ tag: 'div[data-type="callout"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout', class: 'callout' }), 0] },
  addCommands() {
    return {
      toggleCallout: () => ({ commands }: { commands: { toggleNode: (a: string, b: string) => boolean } }) => commands.toggleNode(this.name, 'paragraph'),
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: { toggleCallout: () => ReturnType }
  }
}

export function NoteEditor({ content, onChange, noteId }: { content: string; onChange: (html: string) => void; noteId: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      TaskList, TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: false } }),
      Image.configure({ inline: false, allowBase64: true }),
      Highlight,
      Callout,
      Placeholder.configure({ placeholder: 'Escreva algo… use "/" mentalmente: título, lista, checklist, tabela, código.' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Swap content when switching notes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    if (editor.getHTML() !== content) editor.commands.setContent(content, { emitUpdate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, editor])

  if (!editor) return null

  const B = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" onMouseDown={e => e.preventDefault()} onClick={onClick} title={title}
      className={cn('grid h-8 w-8 place-items-center rounded-lg text-ink-2 transition hover:bg-beige', active && 'bg-beige text-ink')}>{children}</button>
  )
  const Sep = () => <span className="mx-1 h-5 w-px bg-line-2" />

  const addLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link (URL)', prev ?? 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
  const addImage = () => {
    const url = window.prompt('URL da imagem')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap items-center gap-0.5 rounded-xl border border-line bg-surface/95 p-1 backdrop-blur">
        <B title="Parágrafo" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')}><Type size={15} /></B>
        <B title="Título" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}><Heading1 size={15} /></B>
        <B title="Subtítulo" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 size={15} /></B>
        <B title="Título 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 size={15} /></B>
        <Sep />
        <B title="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={15} /></B>
        <B title="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={15} /></B>
        <B title="Riscado" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough size={15} /></B>
        <B title="Destaque" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}><Highlighter size={15} /></B>
        <B title="Código" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}><Code size={15} /></B>
        <Sep />
        <B title="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={15} /></B>
        <B title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={15} /></B>
        <B title="Checklist" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')}><ListChecks size={15} /></B>
        <Sep />
        <B title="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote size={15} /></B>
        <B title="Callout" onClick={() => editor.chain().focus().toggleCallout().run()} active={editor.isActive('callout')}><Lightbulb size={15} /></B>
        <B title="Bloco de código" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}><Code size={15} className="rotate-90" /></B>
        <B title="Tabela" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={15} /></B>
        <B title="Imagem" onClick={addImage}><ImageIcon size={15} /></B>
        <B title="Link" onClick={addLink} active={editor.isActive('link')}><LinkIcon size={15} /></B>
        <B title="Divisor" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={15} /></B>
        <Sep />
        <B title="Desfazer" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={15} /></B>
        <B title="Refazer" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={15} /></B>
      </div>
      <EditorContent editor={editor} className="px-1" />
      {editor.isActive('table') && (
        <div className="mt-3 flex flex-wrap gap-1 text-xs">
          {[
            ['+ linha', () => editor.chain().focus().addRowAfter().run()], ['+ coluna', () => editor.chain().focus().addColumnAfter().run()],
            ['− linha', () => editor.chain().focus().deleteRow().run()], ['− coluna', () => editor.chain().focus().deleteColumn().run()],
            ['remover tabela', () => editor.chain().focus().deleteTable().run()],
          ].map(([l, fn]) => <button key={l as string} onClick={fn as () => void} className="btn btn-soft h-7 px-2 text-[11px]">{l as string}</button>)}
        </div>
      )}
    </div>
  )
}
