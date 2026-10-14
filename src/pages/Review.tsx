import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, Brain } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader, EmptyState } from '@/components/ui/Bits'
import { Modal } from '@/components/ui/Modal'
import { cn, colorClasses, reviewInfo, reviewIntervals, fmtMinutes, accuracy } from '@/lib/utils'
import type { Subject, Topic } from '@/lib/types'
import { useT } from '@/i18n'

type Item = { s: Subject; t: Topic; info: NonNullable<ReturnType<typeof reviewInfo>> }

const buckets = [
  { key: 'today', dot: 'bg-rose', emoji: '🔴' },
  { key: 'soon', dot: 'bg-butter', emoji: '🟡' },
  { key: 'mastered', dot: 'bg-sage', emoji: '🟢' },
] as const

export default function Review() {
  const subjects = useStore(s => s.subjects)
  const markReviewed = useStore(s => s.markReviewed)
  const [active, setActive] = useState<Item | null>(null)
  const [step, setStep] = useState<'recall' | 'rate' | 'done'>('recall')
  const t = useT()

  const items: Item[] = subjects.flatMap(s => s.topics.map(t => ({ s, t, info: reviewInfo(t) })).filter((x): x is Item => x.info !== null))
    .sort((a, b) => a.info.daysUntil - b.info.daysUntil)
  const byBucket = (k: Item['info']['bucket']) => items.filter(i => i.info.bucket === k)

  const open = (i: Item) => { setActive(i); setStep('recall') }
  const rate = (r: 'hard' | 'ok' | 'easy') => { if (active) { markReviewed(active.s.id, active.t.id, r); setStep('done') } }

  return (
    <div>
      <PageHeader tourId="review" title={t('review.title')} sub={t('review.sub')} />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {buckets.map(b => (
          <div key={b.key} className="card p-4">
            <p className="text-2xl font-extrabold">{byBucket(b.key).length}</p>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted"><span className={cn('h-2 w-2 rounded-full', b.dot)} />{t(`review.buckets.${b.key}.label`)}</p>
          </div>
        ))}
      </div>

      {items.length === 0 && <EmptyState emoji="🧠" title={t('review.empty.title')} desc={t('review.empty.desc')} />}

      <div className="space-y-8">
        {buckets.map(b => {
          const list = byBucket(b.key)
          if (!list.length) return null
          return (
            <section key={b.key}>
              <div className="mb-3">
                <h2 className="section-title">{b.emoji} {t(`review.buckets.${b.key}.label`)}</h2>
                <p className="text-xs text-muted">{t(`review.buckets.${b.key}.hint`)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map(({ s, t: topic, info }, i) => {
                  const c = colorClasses[s.color]
                  return (
                    <motion.div key={topic.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card card-hover flex items-center gap-4 p-4">
                      <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl', c.soft)}>{s.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{topic.name}</p>
                        <p className="text-xs text-muted">{s.name} · {info.daysSince === 0 ? t('review.studiedToday') : t('review.studiedAgo', { count: info.daysSince })}</p>
                        <p className={cn('mt-0.5 text-xs font-semibold', b.key === 'today' ? 'text-rose-ink' : b.key === 'soon' ? 'text-butter-ink' : 'text-sage-ink')}>
                          {info.daysUntil <= 0 ? t('review.dueNow') : t('review.dueIn', { count: info.daysUntil })}
                        </p>
                      </div>
                      <button onClick={() => open({ s, t: topic, info })} className={cn('btn h-9 px-3 text-xs', b.key === 'today' ? 'btn-primary' : 'btn-soft')}>
                        {b.key === 'today' ? t('review.startReview') : t('review.review')} <ArrowRight size={13} />
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
                <p className="font-semibold">{t('review.recall.title')}</p>
                <p className="mt-1 text-sm text-muted">{t('review.recall.promptBefore')}<strong>{active.t.name}</strong>{t('review.recall.promptAfter')}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-cream-2 p-3"><p className="font-bold">{fmtMinutes(active.t.minutes)}</p><p className="text-muted">{t('review.recall.studied')}</p></div>
                <div className="rounded-xl bg-cream-2 p-3"><p className="font-bold">{active.t.questions ? `${accuracy(active.t)}%` : '—'}</p><p className="text-muted">{t('review.recall.accuracy')}</p></div>
                <div className="rounded-xl bg-cream-2 p-3"><p className="font-bold">{t('review.recall.nth', { n: active.t.reviewStage + 1 })}</p><p className="text-muted">{t('review.recall.reviewLabel')}</p></div>
              </div>
              <button onClick={() => setStep('rate')} className="btn btn-primary w-full">{t('review.recall.recalled')}</button>
            </motion.div>
          )}
          {active && step === 'rate' && (
            <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-sm text-muted">{t('review.rate.question')}</p>
              <button onClick={() => rate('hard')} className="btn btn-soft w-full justify-between bg-rose-soft text-rose-ink">{t('review.rate.hard')} <span className="text-xs font-normal">{t('review.rate.again', { n: reviewIntervals[Math.max(0, active.t.reviewStage - 1)] })}</span></button>
              <button onClick={() => rate('ok')} className="btn btn-soft w-full justify-between bg-butter-soft text-butter-ink">{t('review.rate.ok')} <span className="text-xs font-normal">{t('review.rate.again', { n: reviewIntervals[Math.min(5, active.t.reviewStage + 1)] })}</span></button>
              <button onClick={() => rate('easy')} className="btn btn-soft w-full justify-between bg-sage-soft text-sage-ink">{t('review.rate.easy')} <span className="text-xs font-normal">{t('review.rate.again', { n: reviewIntervals[Math.min(5, active.t.reviewStage + 2)] })}</span></button>
            </motion.div>
          )}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
              <p className="text-4xl">🧠</p>
              <p className="mt-2 font-bold">{t('review.done.title')}</p>
              <p className="text-sm text-muted">{t('review.done.desc')}</p>
              <button onClick={() => setActive(null)} className="btn btn-primary mt-4 w-full">{t('review.done.continue')}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  )
}
