import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, Brain } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader, EmptyState } from '@/components/ui/Bits'
import { Modal } from '@/components/ui/Modal'
import { cn, colorClasses, reviewInfo, reviewIntervals, fmtMinutes, accuracy } from '@/lib/utils'
import type { Subject, Topic } from '@/lib/types'

type Item = { s: Subject; t: Topic; info: NonNullable<ReturnType<typeof reviewInfo>> }

const buckets = [
  { key: 'today', label: 'Revisar hoje', dot: 'bg-rose', emoji: '🔴', hint: 'A memória enfraquece: revise agora para fixar.' },
  { key: 'soon', label: 'Revisar em breve', dot: 'bg-butter', emoji: '🟡', hint: 'Ainda está fresco, mas o prazo se aproxima.' },
  { key: 'mastered', label: 'Dominado', dot: 'bg-sage', emoji: '🟢', hint: 'Intervalos longos: você já consolidou.' },
] as const

export default function Review() {
  const subjects = useStore(s => s.subjects)
  const markReviewed = useStore(s => s.markReviewed)
  const [active, setActive] = useState<Item | null>(null)
  const [step, setStep] = useState<'recall' | 'rate' | 'done'>('recall')

  const items: Item[] = subjects.flatMap(s => s.topics.map(t => ({ s, t, info: reviewInfo(t) })).filter((x): x is Item => x.info !== null))
    .sort((a, b) => a.info.daysUntil - b.info.daysUntil)
  const byBucket = (k: Item['info']['bucket']) => items.filter(i => i.info.bucket === k)

  const open = (i: Item) => { setActive(i); setStep('recall') }
  const rate = (r: 'hard' | 'ok' | 'easy') => { if (active) { markReviewed(active.s.id, active.t.id, r); setStep('done') } }

  return (
    <div>
      <PageHeader title="Revisar" sub="Revisão espaçada: o sistema avisa o que revisar, e quando." />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {buckets.map(b => (
          <div key={b.key} className="card p-4">
            <p className="text-2xl font-extrabold">{byBucket(b.key).length}</p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted"><span className={cn('h-2 w-2 rounded-full', b.dot)} />{b.label}</p>
          </div>
        ))}
      </div>

      {items.length === 0 && <EmptyState emoji="🧠" title="Nada para revisar ainda" desc="Estude um tópico e ele entrará automaticamente no ciclo de revisões." />}

      <div className="space-y-8">
        {buckets.map(b => {
          const list = byBucket(b.key)
          if (!list.length) return null
          return (
            <section key={b.key}>
              <div className="mb-3">
                <h2 className="section-title">{b.emoji} {b.label}</h2>
                <p className="text-xs text-muted">{b.hint}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map(({ s, t, info }, i) => {
                  const c = colorClasses[s.color]
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card card-hover flex items-center gap-4 p-4">
                      <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl', c.soft)}>{s.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{t.name}</p>
                        <p className="text-xs text-muted">{s.name} · {info.daysSince === 0 ? 'estudado hoje' : `estudado há ${info.daysSince} ${info.daysSince === 1 ? 'dia' : 'dias'}`}</p>
                        <p className={cn('mt-0.5 text-xs font-semibold', b.key === 'today' ? 'text-rose-ink' : b.key === 'soon' ? 'text-butter-ink' : 'text-sage-ink')}>
                          {info.daysUntil <= 0 ? 'Está na hora de revisar.' : info.daysUntil === 1 ? 'Revisar amanhã' : `Revisar em ${info.daysUntil} dias`}
                        </p>
                      </div>
                      <button onClick={() => open({ s, t, info })} className={cn('btn h-9 px-3 text-xs', b.key === 'today' ? 'btn-primary' : 'btn-soft')}>
                        {b.key === 'today' ? 'Começar revisão' : 'Revisar'} <ArrowRight size={13} />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active ? `${active.s.emoji} ${active.t.name}` : ''}>
        <AnimatePresence mode="wait">
          {active && step === 'recall' && (
            <motion.div key="recall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-2xl bg-cream-2 p-5 text-center">
                <Brain className="mx-auto mb-2 text-lilac-ink" />
                <p className="font-semibold">Antes de olhar as anotações, tente lembrar:</p>
                <p className="mt-1 text-sm text-muted">Quais são os 3 pontos principais de <strong>{active.t.name}</strong>? Explique em voz alta ou escreva em uma folha.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-cream-2 p-3"><p className="font-bold">{fmtMinutes(active.t.minutes)}</p><p className="text-muted">estudados</p></div>
                <div className="rounded-xl bg-cream-2 p-3"><p className="font-bold">{active.t.questions ? `${accuracy(active.t)}%` : '—'}</p><p className="text-muted">de acerto</p></div>
                <div className="rounded-xl bg-cream-2 p-3"><p className="font-bold">{active.t.reviewStage + 1}ª</p><p className="text-muted">revisão</p></div>
              </div>
              <button onClick={() => setStep('rate')} className="btn btn-primary w-full">Já lembrei, avaliar</button>
            </motion.div>
          )}
          {active && step === 'rate' && (
            <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-sm text-muted">Como foi lembrar deste conteúdo?</p>
              <button onClick={() => rate('hard')} className="btn btn-soft w-full justify-between bg-rose-soft text-rose-ink">😅 Difícil <span className="text-xs font-normal">rever em {reviewIntervals[Math.max(0, active.t.reviewStage - 1)]}d</span></button>
              <button onClick={() => rate('ok')} className="btn btn-soft w-full justify-between bg-butter-soft text-butter-ink">🙂 Lembrei com esforço <span className="text-xs font-normal">rever em {reviewIntervals[Math.min(5, active.t.reviewStage + 1)]}d</span></button>
              <button onClick={() => rate('easy')} className="btn btn-soft w-full justify-between bg-sage-soft text-sage-ink">😎 Fácil <span className="text-xs font-normal">rever em {reviewIntervals[Math.min(5, active.t.reviewStage + 2)]}d</span></button>
            </motion.div>
          )}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
              <p className="text-4xl">🧠</p>
              <p className="mt-2 font-bold">Revisão registrada</p>
              <p className="text-sm text-muted">O próximo lembrete já está agendado.</p>
              <button onClick={() => setActive(null)} className="btn btn-primary mt-4 w-full">Continuar</button>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  )
}
