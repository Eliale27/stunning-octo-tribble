# estuda.

Seu espaço pessoal para estudar melhor.

Plataforma web de estudos, organização e produtividade acadêmica: planejamento, foco (Pomodoro), tarefas, anotações, revisão espaçada, metas, estatísticas e gamificação discreta. Interface inspirada no Notion, com paleta pastel, cards minimalistas e muito espaço em branco.

> Esta versão é uma demonstração completa com dados fictícios. Tudo é salvo no `localStorage` do navegador; nada é enviado a servidores.

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm run preview    # serve o build
```

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tokens de cor pastel em `src/index.css`)
- Zustand (estado + persistência local)
- Motion (microinterações), Recharts (gráficos), dnd-kit (arrastar e soltar), Tiptap (editor de notas), canvas-confetti

## Estrutura

```
src/
  components/      layout (sidebar/menu mobile), ui (progress, modal, toasts…), editor de notas, formulários de tarefa
  pages/           Landing, Login, Dashboard, Matérias, Planejamento, Tarefas, Anotações, Foco, Revisão, Progresso, Conquistas, Configurações
  store/           estado global (zustand) e seletores derivados
  data/seed.ts     dados fictícios de demonstração
  lib/             tipos, utilitários (streak, níveis, revisão espaçada, frases)
atc-voice/         projeto anterior deste repositório (PWA "ATC Voice"), preservado
```

## Rotas

| Rota | Página |
| --- | --- |
| `#/` | Landing page |
| `#/entrar` | Login (demo) |
| `#/app` | Dashboard |
| `#/app/materias`, `#/app/materias/:id` | Matérias e tópicos |
| `#/app/planejamento?tab=calendario\|lista\|kanban\|semana\|metas` | Meu Plano |
| `#/app/tarefas` | Tarefas e subtarefas |
| `#/app/anotacoes` | Editor de anotações |
| `#/app/foco` | Pomodoro |
| `#/app/revisao` | Revisão espaçada |
| `#/app/progresso` | Estatísticas |
| `#/app/conquistas` | Níveis e conquistas |
| `#/app/configuracoes` | Configurações |

O roteamento usa hash (`#/…`) e `base: './'`, então o build funciona em qualquer subpasta, incluindo GitHub Pages.
