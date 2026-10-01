import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CalendarDays, Timer, BarChart3, Repeat, ChevronDown, Check, Sparkles } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useT, type TFn } from '@/i18n'
import { cn } from '@/lib/utils'

const fade = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const } }

function DashboardPreview({ t }: { t: TFn }) {
  const bars = [40, 65, 30, 80, 55, 90, 70]
  const navItems = [0, 1, 2, 3, 4, 5, 6, 7].map(i => t(`landing.preview.nav.${i}`))
  const stats: Array<[string, string, string]> = [
    ['📚', '3', t('landing.preview.stats.sessions')], ['⏱️', '2h24', t('landing.preview.stats.today')], ['🎯', '3h', t('landing.preview.stats.goal')],
    ['🔥', '12', t('landing.preview.stats.days')], ['✅', '2/4', t('landing.preview.stats.tasks')],
  ]
  const tasks: Array<[string, string, string, boolean]> = [
    [t('landing.preview.tasks.0.title'), t('landing.preview.tasks.0.subject'), 'bg-butter-soft text-butter-ink', true],
    [t('landing.preview.tasks.1.title'), t('landing.preview.tasks.1.subject'), 'bg-sky-soft text-sky-ink', false],
    [t('landing.preview.tasks.2.title'), t('landing.preview.tasks.2.subject'), 'bg-rose-soft text-rose-ink', true],
  ]
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-tr from-sage-soft via-sky-soft to-lilac-soft opacity-70 blur-3xl" />
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
        <div className="flex">
          <div className="hidden w-48 shrink-0 border-r border-line bg-cream p-4 sm:block">
            <Logo className="mb-6" />
            {navItems.map((i, idx) => (
              <div key={i} className={cn('mb-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium', idx === 0 ? 'bg-beige' : 'text-ink-2')}>{i}</div>
            ))}
          </div>
          <div className="flex-1 space-y-4 bg-cream p-4 sm:p-6">
            <div>
              <p className="text-lg font-extrabold sm:text-xl">{t('landing.preview.greeting')}</p>
              <p className="text-xs text-muted">{t('landing.preview.greetingSub')}</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {stats.map(([i, v, l]) => (
                <div key={l} className="card p-2 sm:p-3"><p className="text-sm">{i}</p><p className="text-sm font-extrabold sm:text-base">{v}</p><p className="text-[9px] text-muted sm:text-[10px]">{l}</p></div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="card flex items-center gap-4 p-4 sm:col-span-2">
                <ProgressRing value={80} size={84} stroke={9}><span className="text-sm font-extrabold">80%</span></ProgressRing>
                <div className="flex-1">
                  <p className="text-sm font-bold">{t('landing.preview.progressTitle')}</p>
                  <p className="text-[11px] text-muted">{t('landing.preview.progressSub')}</p>
                  <ProgressBar value={80} className="mt-2" height="h-2" />
                </div>
              </div>
              <div className="card p-4">
                <p className="mb-2 text-[11px] font-bold text-muted">{t('landing.preview.thisWeek')}</p>
                <div className="flex h-14 items-end gap-1">{bars.map((b, i) => <div key={i} className={cn('flex-1 rounded-md', i === 6 ? 'bg-sage' : 'bg-sage-soft')} style={{ height: `${b}%` }} />)}</div>
              </div>
            </div>
            <div className="card p-4">
              <p className="mb-2 text-sm font-bold">{t('landing.preview.tasksTitle')}</p>
              {tasks.map(([title, s, c, d]) => (
                <div key={title} className="flex items-center gap-2 py-1.5 text-xs">
                  <span className={cn('grid h-4 w-4 place-items-center rounded border', d ? 'border-sage bg-sage text-white' : 'border-line-2')}>{d && <Check size={10} />}</span>
                  <span className={cn('flex-1', d && 'text-muted line-through')}>{title}</span>
                  <span className={cn('chip hidden px-2 py-0.5 text-[10px] sm:inline-flex', c)}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// copy lives in `landing.features.<i>` / `landing.testimonials.items.<i>` / `landing.faq.items.<i>`
const features = [
  { icon: CalendarDays, tone: 'bg-sky-soft text-sky-ink' },
  { icon: Timer, tone: 'bg-sage-soft text-sage-ink' },
  { icon: BarChart3, tone: 'bg-lilac-soft text-lilac-ink' },
  { icon: Repeat, tone: 'bg-rose-soft text-rose-ink' },
]
const testimonialEmojis = ['🌿', '🎯', '✨']
const faqCount = 5
const howSteps = [['1', '📚'], ['2', '⏱️'], ['3', '🔄']]

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const t = useT()
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-2 md:flex">
            <a href="#como-funciona" className="hover:text-ink">{t('landing.nav.how')}</a>
            <a href="#recursos" className="hover:text-ink">{t('landing.nav.features')}</a>
            <a href="#depoimentos" className="hover:text-ink">{t('landing.nav.testimonials')}</a>
            <a href="#faq" className="hover:text-ink">{t('landing.nav.faq')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher tour={false} className="mr-1" />
            <Link to="/entrar" className="btn btn-ghost hidden sm:inline-flex">{t('landing.nav.login')}</Link>
            <Link to="/entrar" className="btn btn-primary">{t('landing.nav.start')}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-butter-soft/70 via-sage-soft/40 to-transparent blur-3xl" />
        <div className="mx-auto max-w-3xl text-center">
          <motion.span {...fade} className="chip bg-surface text-ink-2 shadow-soft"><Sparkles size={13} className="text-butter-ink" /> {t('landing.hero.badge')}</motion.span>
          <motion.h1 {...fade} transition={{ ...fade.transition, delay: 0.05 }} className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            {t('landing.hero.title')} <span className="bg-gradient-to-r from-sage-ink via-sky-ink to-lilac-ink bg-clip-text text-transparent">{t('landing.hero.titleAccent')}</span>
          </motion.h1>
          <motion.p {...fade} transition={{ ...fade.transition, delay: 0.1 }} className="mx-auto mt-5 max-w-xl text-lg text-ink-2">
            {t('landing.hero.sub')}
          </motion.p>
          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.15 }} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/entrar" className="btn btn-primary h-12 px-6 text-base">{t('landing.hero.cta')} <ArrowRight size={17} /></Link>
            <a href="#como-funciona" className="btn btn-soft h-12 px-6 text-base">{t('landing.hero.secondary')}</a>
          </motion.div>
          <p className="mt-4 text-xs text-muted">{t('landing.hero.note')}</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }} className="mt-14 px-1">
          <DashboardPreview t={t} />
        </motion.div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fade} className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('landing.how.title')}</h2>
            <p className="mt-3 text-ink-2">{t('landing.how.sub')}</p>
          </motion.div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {howSteps.map(([n, e], i) => (
              <motion.div key={n} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }} className="card card-hover p-7">
                <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-cream-2 text-2xl">{e}</span><span className="text-4xl font-extrabold text-line-2">{n}</span></div>
                <h3 className="mt-5 text-lg font-bold">{t(`landing.how.steps.${i}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{t(`landing.how.steps.${i}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="px-5 py-10">
        <div className="mx-auto max-w-6xl space-y-20">
          {features.map((f, i) => (
            <motion.div key={i} {...fade} className={cn('grid items-center gap-10 md:grid-cols-2', i % 2 === 1 && 'md:[&>*:first-child]:order-2')}>
              <div>
                <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', f.tone)}><f.icon size={22} /></span>
                <h3 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">{t(`landing.features.${i}.title`)}</h3>
                <p className="mt-3 leading-relaxed text-ink-2">{t(`landing.features.${i}.desc`)}</p>
                <ul className="mt-5 space-y-2">
                  {[0, 1, 2].map(b => <li key={b} className="flex items-center gap-2 text-sm font-medium"><span className="grid h-5 w-5 place-items-center rounded-full bg-sage-soft text-sage-ink"><Check size={12} /></span>{t(`landing.features.${i}.bullets.${b}`)}</li>)}
                </ul>
              </div>
              <FeatureArt index={i} t={t} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.h2 {...fade} className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{t('landing.testimonials.title')}</motion.h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonialEmojis.map((emoji, i) => (
              <motion.figure key={i} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }} className="card p-6">
                <blockquote className="text-[15px] leading-relaxed text-ink">“{t(`landing.testimonials.items.${i}.text`)}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-cream-2 text-lg">{emoji}</span>
                  <div><p className="text-sm font-bold">{t(`landing.testimonials.items.${i}.name`)}</p><p className="text-xs text-muted">{t(`landing.testimonials.items.${i}.role`)}</p></div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 pb-24">
        <div className="mx-auto max-w-2xl">
          <motion.h2 {...fade} className="text-center text-3xl font-extrabold tracking-tight">{t('landing.faq.title')}</motion.h2>
          <div className="mt-8 space-y-2">
            {Array.from({ length: faqCount }, (_, i) => (
              <div key={i} className="card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold">
                  {t(`landing.faq.items.${i}.q`)}<ChevronDown size={18} className={cn('shrink-0 text-muted transition', openFaq === i && 'rotate-180')} />
                </button>
                <motion.div initial={false} animate={{ height: openFaq === i ? 'auto' : 0 }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-2">{t(`landing.faq.items.${i}.a`)}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-24">
        <motion.div {...fade} className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-sage-soft via-sky-soft to-lilac-soft p-10 text-center sm:p-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('landing.cta.title')}</h2>
          <p className="mx-auto mt-3 max-w-md text-ink-2">{t('landing.cta.sub')}</p>
          <Link to="/entrar" className="btn btn-primary mt-8 h-12 px-7 text-base">{t('landing.cta.button')} <ArrowRight size={17} /></Link>
        </motion.div>
      </section>

      <footer className="border-t border-line px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
          <Logo />
          <p>{t('landing.footer', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureArt({ index, t }: { index: number; t: TFn }) {
  if (index === 0) {
    const views = [0, 1, 2, 3].map(i => t(`landing.art.views.${i}`))
    const week: Array<[string, ...string[][]]> = [
      [t('landing.art.days.0'), [t('landing.art.week.geometry'), 'bg-sky-soft text-sky-ink'], [t('landing.art.week.essay'), 'bg-rose-soft text-rose-ink']],
      [t('landing.art.days.1'), [t('landing.art.week.genetics'), 'bg-sage-soft text-sage-ink']],
      [t('landing.art.days.2'), [t('landing.art.week.vargas'), 'bg-butter-soft text-butter-ink'], [t('landing.art.week.vocabulary'), 'bg-lilac-soft text-lilac-ink']],
      [t('landing.art.days.3'), [t('landing.art.week.mock'), 'bg-sky-soft text-sky-ink']],
    ]
    return (
      <div className="card p-5">
        <div className="mb-3 flex gap-1 rounded-xl bg-beige p-1 text-xs font-semibold">{views.map((v, i) => <span key={v} className={cn('flex-1 rounded-lg px-2 py-1.5 text-center', i === 3 ? 'bg-surface shadow-soft' : 'text-muted')}>{v}</span>)}</div>
        <div className="grid grid-cols-4 gap-2">
          {week.map(([d, ...items]) => (
            <div key={d} className="rounded-xl bg-cream-2 p-2">
              <p className="mb-2 text-[10px] font-bold uppercase text-muted">{d}</p>
              {items.map(([title, c]) => <div key={title} className={cn('mb-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold', c)}>{title}</div>)}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (index === 1) return (
    <div className="card flex flex-col items-center p-8">
      <span className="chip mb-4 bg-sage-soft text-sage-ink">{t('landing.art.focusChip')}</span>
      <ProgressRing value={64} size={170} stroke={12}><p className="text-4xl font-extrabold tabular-nums">16:00</p></ProgressRing>
      <p className="mt-4 text-sm text-ink-2">{t('landing.art.focusMsg')}</p>
      <div className="mt-4 flex gap-1.5">{[15, 25, 45, 50, 60].map(m => <span key={m} className={cn('rounded-lg px-2.5 py-1 text-xs font-semibold', m === 25 ? 'bg-ink text-cream' : 'bg-beige')}>{m}</span>)}</div>
    </div>
  )
  if (index === 2) {
    const subjects: Array<[string, number, string]> = [[t('landing.art.subjects.math'), 78, 'bg-sky'], [t('landing.art.subjects.portuguese'), 62, 'bg-rose'], [t('landing.art.subjects.biology'), 55, 'bg-sage']]
    return (
      <div className="card p-6">
        <p className="text-xl font-extrabold">{t('landing.art.weekHours')}</p>
        <p className="mt-1 text-sm font-semibold text-sage-ink">{t('landing.art.weekDelta')}</p>
        <div className="mt-5 flex h-28 items-end gap-2">{[35, 50, 42, 70, 60, 85, 100].map((h, i) => <div key={i} className={cn('flex-1 rounded-lg', i === 6 ? 'bg-lilac' : 'bg-lilac-soft')} style={{ height: `${h}%` }} />)}</div>
        <div className="mt-5 space-y-2">{subjects.map(([n, v, c]) => <div key={n}><div className="mb-1 flex justify-between text-xs"><span className="font-semibold">{n}</span><span className="text-muted">{v}%</span></div><ProgressBar value={v} color={c} height="h-1.5" /></div>)}</div>
      </div>
    )
  }
  const reviewRows: Array<[string, number, string]> = [['🔴', 0, 'text-rose-ink'], ['🟡', 1, 'text-butter-ink'], ['🟢', 2, 'text-sage-ink']]
  return (
    <div className="card space-y-3 p-5">
      {reviewRows.map(([e, i, c]) => (
        <div key={i} className="flex items-center gap-3 rounded-xl bg-cream-2 p-3">
          <span className="text-lg">{e}</span>
          <div className="flex-1"><p className="text-[10px] font-bold uppercase text-muted">{t(`landing.art.review.${i}.label`)}</p><p className="text-sm font-semibold">{t(`landing.art.review.${i}.topic`)}</p><p className={cn('text-xs font-semibold', c)}>{t(`landing.art.review.${i}.when`)}</p></div>
          {i === 0 && <span className="btn btn-primary h-8 px-3 text-xs">{t('landing.art.startReview')}</span>}
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-xl bg-peach-soft/60 p-3"><span className="text-2xl">🔥</span><div><p className="text-sm font-bold">{t('landing.art.streakTitle')}</p><p className="text-xs text-muted">{t('landing.art.streakSub')}</p></div></div>
    </div>
  )
}
