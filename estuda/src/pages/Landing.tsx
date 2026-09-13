import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CalendarDays, Timer, BarChart3, Repeat, ChevronDown, Check, Sparkles } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

const fade = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const } }

function DashboardPreview() {
  const bars = [40, 65, 30, 80, 55, 90, 70]
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-tr from-sage-soft via-sky-soft to-lilac-soft opacity-70 blur-3xl" />
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
        <div className="flex">
          <div className="hidden w-48 shrink-0 border-r border-line bg-cream p-4 sm:block">
            <Logo className="mb-6" />
            {['🏠 Início', '📚 Minhas matérias', '📅 Planejamento', '✅ Tarefas', '📝 Anotações', '⏱️ Foco', '🔄 Revisão', '📊 Meu progresso'].map((i, idx) => (
              <div key={i} className={cn('mb-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium', idx === 0 ? 'bg-beige' : 'text-ink-2')}>{i}</div>
            ))}
          </div>
          <div className="flex-1 space-y-4 bg-cream p-4 sm:p-6">
            <div>
              <p className="text-lg font-extrabold sm:text-xl">Bom dia, Eliale 👋</p>
              <p className="text-xs text-muted">Pequenos passos todos os dias levam você mais longe.</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[['📚', '3', 'sessões'], ['⏱️', '2h24', 'hoje'], ['🎯', '3h', 'meta'], ['🔥', '12', 'dias'], ['✅', '2/4', 'tarefas']].map(([i, v, l]) => (
                <div key={l} className="card p-2 sm:p-3"><p className="text-sm">{i}</p><p className="text-sm font-extrabold sm:text-base">{v}</p><p className="text-[9px] text-muted sm:text-[10px]">{l}</p></div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="card flex items-center gap-4 p-4 sm:col-span-2">
                <ProgressRing value={80} size={84} stroke={9}><span className="text-sm font-extrabold">80%</span></ProgressRing>
                <div className="flex-1">
                  <p className="text-sm font-bold">Seu progresso hoje</p>
                  <p className="text-[11px] text-muted">Você está 80% mais perto da sua meta de hoje.</p>
                  <ProgressBar value={80} className="mt-2" height="h-2" />
                </div>
              </div>
              <div className="card p-4">
                <p className="mb-2 text-[11px] font-bold text-muted">ESTA SEMANA</p>
                <div className="flex h-14 items-end gap-1">{bars.map((b, i) => <div key={i} className={cn('flex-1 rounded-md', i === 6 ? 'bg-sage' : 'bg-sage-soft')} style={{ height: `${b}%` }} />)}</div>
              </div>
            </div>
            <div className="card p-4">
              <p className="mb-2 text-sm font-bold">Tarefas de hoje</p>
              {[['Estudar Revolução Francesa', 'História', 'bg-butter-soft text-butter-ink', true], ['Resolver 20 questões de Geometria', 'Matemática', 'bg-sky-soft text-sky-ink', false], ['Revisar crase e regência', 'Português', 'bg-rose-soft text-rose-ink', true]].map(([t, s, c, d]) => (
                <div key={t as string} className="flex items-center gap-2 py-1.5 text-xs">
                  <span className={cn('grid h-4 w-4 place-items-center rounded border', d ? 'border-sage bg-sage text-white' : 'border-line-2')}>{d && <Check size={10} />}</span>
                  <span className={cn('flex-1', d && 'text-muted line-through')}>{t as string}</span>
                  <span className={cn('chip hidden px-2 py-0.5 text-[10px] sm:inline-flex', c as string)}>{s as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = [
  { icon: CalendarDays, tone: 'bg-sky-soft text-sky-ink', title: 'Planeje seus estudos', desc: 'Matérias, tópicos, prioridades e metas em um só lugar. Veja tudo por dia, semana ou mês, em calendário, lista ou kanban. Arraste e solte para reorganizar.', bullets: ['Cores pastel por matéria', 'Arrastar e soltar', 'Metas diárias, semanais e mensais'] },
  { icon: Timer, tone: 'bg-sage-soft text-sage-ink', title: 'Mantenha o foco', desc: 'Um cronômetro bonito, sem distrações. Sessões de 15 a 60 minutos, pausas automáticas e o tempo registrado sozinho no seu progresso.', bullets: ['Pomodoro personalizável', 'Registro automático', 'Frases que acompanham a sessão'] },
  { icon: BarChart3, tone: 'bg-lilac-soft text-lilac-ink', title: 'Acompanhe seu progresso', desc: 'Horas estudadas, dias de estudo, questões, taxa de acerto e evolução semanal. Gráficos simples que mostram o que realmente importa.', bullets: ['Comparação com a semana anterior', 'Matérias que precisam de atenção', 'Níveis e conquistas discretas'] },
  { icon: Repeat, tone: 'bg-rose-soft text-rose-ink', title: 'Crie uma rotina consistente', desc: 'Revisão espaçada avisa o que revisar e quando. Sequência de dias, níveis e pequenas conquistas para manter o ritmo sem pressão.', bullets: ['Revisar hoje · em breve · dominado', 'Sequência de estudos', 'Anotações estilo Notion'] },
]

const testimonials = [
  { name: 'Marina S.', role: 'Vestibulanda · Medicina', text: 'Pela primeira vez consigo ver o que já estudei e o que falta. A revisão espaçada me salvou em Biologia.', emoji: '🌿' },
  { name: 'João P.', role: 'Concurseiro', text: 'Simples do jeito certo. Abro, vejo minhas tarefas do dia, ligo o foco e vou. Sem enrolação.', emoji: '🎯' },
  { name: 'Letícia R.', role: 'Estudante de Direito', text: 'O visual me deixa calma. Parece um caderno bonito que se organiza sozinho.', emoji: '✨' },
]

const faqs = [
  ['O Estuda é gratuito?', 'Sim. Você pode planejar, focar, anotar e acompanhar seu progresso sem pagar nada. Recursos avançados poderão chegar em um plano opcional no futuro.'],
  ['Funciona no celular?', 'Sim. A plataforma é totalmente responsiva: no celular a navegação vira um menu inferior, o cronômetro ocupa a tela e os botões são grandes e fáceis de tocar.'],
  ['Como funciona a revisão inteligente?', 'Cada tópico estudado entra em um ciclo de revisão espaçada (1, 3, 7, 14, 30 e 60 dias). Você avalia como foi lembrar e o sistema ajusta o próximo intervalo.'],
  ['Preciso configurar muita coisa?', 'Não. Crie suas matérias, adicione alguns tópicos e comece uma sessão de foco. O resto se organiza a partir do que você faz.'],
  ['Meus dados ficam seguros?', 'Nesta versão de demonstração, tudo fica salvo apenas no seu navegador. Nada é enviado para servidores.'],
]

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-2 md:flex">
            <a href="#como-funciona" className="hover:text-ink">Como funciona</a>
            <a href="#recursos" className="hover:text-ink">Recursos</a>
            <a href="#depoimentos" className="hover:text-ink">Depoimentos</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/entrar" className="btn btn-ghost hidden sm:inline-flex">Entrar</Link>
            <Link to="/entrar" className="btn btn-primary">Começar grátis</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-butter-soft/70 via-sage-soft/40 to-transparent blur-3xl" />
        <div className="mx-auto max-w-3xl text-center">
          <motion.span {...fade} className="chip bg-surface text-ink-2 shadow-soft"><Sparkles size={13} className="text-butter-ink" /> Seu espaço pessoal para estudar melhor</motion.span>
          <motion.h1 {...fade} transition={{ ...fade.transition, delay: 0.05 }} className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Estude melhor. Organize sua rotina. <span className="bg-gradient-to-r from-sage-ink via-sky-ink to-lilac-ink bg-clip-text text-transparent">Alcance seus objetivos.</span>
          </motion.h1>
          <motion.p {...fade} transition={{ ...fade.transition, delay: 0.1 }} className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
            Uma plataforma simples e inteligente para transformar seus estudos em uma rotina consistente.
          </motion.p>
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.15 }} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/entrar" className="btn btn-primary h-12 px-6 text-base">Começar gratuitamente <ArrowRight size={17} /></Link>
            <a href="#como-funciona" className="btn btn-soft h-12 px-6 text-base">Conhecer a plataforma</a>
          </motion.div>
          <p className="mt-4 text-xs text-muted">Sem cartão. Sem instalação. Só você e seus estudos.</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }} className="mt-14 px-1">
          <DashboardPreview />
        </motion.div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Como funciona</h2>
            <p className="mt-3 text-ink-2">Três passos, nenhuma complicação.</p>
          </motion.div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ['1', '📚', 'Crie suas matérias', 'Adicione matérias e tópicos, escolha uma cor pastel para cada uma e defina o que quer concluir e até quando.'],
              ['2', '⏱️', 'Estude com foco', 'Inicie uma sessão de foco. O tempo é registrado automaticamente e o tópico avança sozinho.'],
              ['3', '🔄', 'Revise e acompanhe', 'O Estuda avisa o que revisar, mostra seu progresso e celebra suas conquistas de forma discreta.'],
            ].map(([n, e, t, d], i) => (
              <motion.div key={n} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }} className="card card-hover p-7">
                <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-cream-2 text-2xl">{e}</span><span className="text-4xl font-extrabold text-line-2">{n}</span></div>
                <h3 className="mt-5 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="px-5 py-10">
        <div className="mx-auto max-w-6xl space-y-20">
          {features.map((f, i) => (
            <motion.div key={f.title} {...fade} className={cn('grid items-center gap-10 md:grid-cols-2', i % 2 === 1 && 'md:[&>*:first-child]:order-2')}>
              <div>
                <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', f.tone)}><f.icon size={22} /></span>
                <h3 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-2">{f.desc}</p>
                <ul className="mt-5 space-y-2">
                  {f.bullets.map(b => <li key={b} className="flex items-center gap-2 text-sm font-medium"><span className="grid h-5 w-5 place-items-center rounded-full bg-sage-soft text-sage-ink"><Check size={12} /></span>{b}</li>)}
                </ul>
              </div>
              <FeatureArt index={i} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.h2 {...fade} className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Quem usa, sente vontade de estudar</motion.h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.figure key={t.name} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }} className="card p-6">
                <blockquote className="text-[15px] leading-relaxed text-ink">“{t.text}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-cream-2 text-lg">{t.emoji}</span>
                  <div><p className="text-sm font-bold">{t.name}</p><p className="text-xs text-muted">{t.role}</p></div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 pb-24">
        <div className="mx-auto max-w-2xl">
          <motion.h2 {...fade} className="text-center text-3xl font-extrabold tracking-tight">Perguntas frequentes</motion.h2>
          <div className="mt-8 space-y-2">
            {faqs.map(([q, a], i) => (
              <div key={q} className="card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold">
                  {q}<ChevronDown size={18} className={cn('shrink-0 text-muted transition', openFaq === i && 'rotate-180')} />
                </button>
                <motion.div initial={false} animate={{ height: openFaq === i ? 'auto' : 0 }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-2">{a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-24">
        <motion.div {...fade} className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-sage-soft via-sky-soft to-lilac-soft p-10 text-center sm:p-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Quando entrar aqui, você vai sentir vontade de estudar.</h2>
          <p className="mx-auto mt-3 max-w-md text-ink-2">Comece hoje com 30 minutos. Amanhã, mais 30. É assim que se chega longe.</p>
          <Link to="/entrar" className="btn btn-primary mt-8 h-12 px-7 text-base">Começar gratuitamente <ArrowRight size={17} /></Link>
        </motion.div>
      </section>

      <footer className="border-t border-line px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} Estuda · Seu espaço pessoal para estudar melhor.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureArt({ index }: { index: number }) {
  if (index === 0) return (
    <div className="card p-5">
      <div className="mb-3 flex gap-1 rounded-xl bg-beige p-1 text-xs font-semibold">{['📅 Calendário', '📋 Lista', '🗂️ Kanban', '📆 Semana'].map((t, i) => <span key={t} className={cn('flex-1 rounded-lg px-2 py-1.5 text-center', i === 3 ? 'bg-surface shadow-soft' : 'text-muted')}>{t}</span>)}</div>
      <div className="grid grid-cols-4 gap-2">
        {[['Seg', ['Geometria', 'bg-sky-soft text-sky-ink'], ['Redação', 'bg-rose-soft text-rose-ink']], ['Ter', ['Genética', 'bg-sage-soft text-sage-ink']], ['Qua', ['Era Vargas', 'bg-butter-soft text-butter-ink'], ['Vocabulary', 'bg-lilac-soft text-lilac-ink']], ['Qui', ['Simulado', 'bg-sky-soft text-sky-ink']]].map(([d, ...items]) => (
          <div key={d as string} className="rounded-xl bg-cream-2 p-2">
            <p className="mb-2 text-[10px] font-bold uppercase text-muted">{d as string}</p>
            {(items as string[][]).map(([t, c]) => <div key={t} className={cn('mb-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold', c)}>{t}</div>)}
          </div>
        ))}
      </div>
    </div>
  )
  if (index === 1) return (
    <div className="card flex flex-col items-center p-8">
      <span className="chip mb-4 bg-sage-soft text-sage-ink">🌱 Sessão de foco</span>
      <ProgressRing value={64} size={170} stroke={12}><p className="text-4xl font-extrabold tabular-nums">16:00</p></ProgressRing>
      <p className="mt-4 text-sm text-ink-2">Você consegue. Continue focado. 🌱</p>
      <div className="mt-4 flex gap-1.5">{[15, 25, 45, 50, 60].map(m => <span key={m} className={cn('rounded-lg px-2.5 py-1 text-xs font-semibold', m === 25 ? 'bg-ink text-cream' : 'bg-beige')}>{m}</span>)}</div>
    </div>
  )
  if (index === 2) return (
    <div className="card p-6">
      <p className="text-xl font-extrabold">Você estudou 18h40 esta semana.</p>
      <p className="mt-1 text-sm font-semibold text-sage-ink">Isso representa +23% em relação à semana passada.</p>
      <div className="mt-5 flex h-28 items-end gap-2">{[35, 50, 42, 70, 60, 85, 100].map((h, i) => <div key={i} className={cn('flex-1 rounded-lg', i === 6 ? 'bg-lilac' : 'bg-lilac-soft')} style={{ height: `${h}%` }} />)}</div>
      <div className="mt-5 space-y-2">{[['Matemática', 78, 'bg-sky'], ['Português', 62, 'bg-rose'], ['Biologia', 55, 'bg-sage']].map(([n, v, c]) => <div key={n as string}><div className="mb-1 flex justify-between text-xs"><span className="font-semibold">{n as string}</span><span className="text-muted">{v as number}%</span></div><ProgressBar value={v as number} color={c as string} height="h-1.5" /></div>)}</div>
    </div>
  )
  return (
    <div className="card space-y-3 p-5">
      {[['🔴', 'Revisar hoje', 'Funções · estudado há 7 dias', 'Está na hora de revisar.', 'text-rose-ink'], ['🟡', 'Revisar em breve', 'Genética · estudado há 2 dias', 'Revisar amanhã', 'text-butter-ink'], ['🟢', 'Dominado', 'Reading · 5ª revisão', 'Revisar em 30 dias', 'text-sage-ink']].map(([e, b, t, s, c]) => (
        <div key={b} className="flex items-center gap-3 rounded-xl bg-cream-2 p-3">
          <span className="text-lg">{e}</span>
          <div className="flex-1"><p className="text-[10px] font-bold uppercase text-muted">{b}</p><p className="text-sm font-semibold">{t}</p><p className={cn('text-xs font-semibold', c)}>{s}</p></div>
          {b === 'Revisar hoje' && <span className="btn btn-primary h-8 px-3 text-xs">Começar revisão →</span>}
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-xl bg-peach-soft/60 p-3"><span className="text-2xl">🔥</span><div><p className="text-sm font-bold">Você estudou por 12 dias seguidos!</p><p className="text-xs text-muted">🌿 Criando ritmo · 3 conquistas este mês</p></div></div>
    </div>
  )
}
