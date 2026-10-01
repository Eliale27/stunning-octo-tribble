import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { PageHeader } from '@/components/ui/Bits'
import { cn, fmtMinutes } from '@/lib/utils'
import { AlertSoundControl } from '@/components/ui/AlertSoundControl'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useT } from '@/i18n'

function Row({ label, hint, children, wide = false }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-sm font-semibold">{label}</p>{hint && <p className="text-xs text-muted">{hint}</p>}</div>
      <div className={wide ? 'sm:w-96' : 'sm:w-56'}>{children}</div>
    </div>
  )
}

export default function Settings() {
  const settings = useStore(s => s.settings)
  const update = useStore(s => s.updateSettings)
  const resetDemo = useStore(s => s.resetDemo)
  const startTour = useStore(s => s.startTour)
  const [name, setName] = useState(settings.name)
  const t = useT()
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('app.settings.title')} sub={t('app.settings.sub')} />
      <div className="card divide-y divide-line px-5">
        <Row label={t('common.language')} hint={t('app.settings.languageHint')}>
          <LanguageSwitcher variant="select" className="w-full" />
        </Row>
        <Row label={t('app.settings.name')} hint={t('app.settings.nameHint')}>
          <input className="input" value={name} onChange={e => setName(e.target.value)} onBlur={() => name.trim() && update({ name: name.trim() })} />
        </Row>
        <Row label={t('app.settings.dailyGoal')} hint={t('app.settings.dailyGoalHint', { time: fmtMinutes(settings.dailyGoalMinutes) })}>
          <input type="range" min={30} max={480} step={15} value={settings.dailyGoalMinutes} onChange={e => update({ dailyGoalMinutes: +e.target.value })} className="w-full accent-sage" />
        </Row>
        <Row label={t('app.settings.focusLength')} hint={t('app.settings.focusLengthHint')}>
          <div className="flex gap-1.5">{[15, 25, 45, 50, 60].map(m => <button key={m} onClick={() => update({ focusMinutes: m })} className={cn('btn h-9 flex-1 px-0 text-xs', settings.focusMinutes === m ? 'btn-primary' : 'btn-soft')}>{m}</button>)}</div>
        </Row>
        <Row label={t('app.settings.breakLength')}>
          <div className="flex gap-1.5">{[5, 10, 15].map(m => <button key={m} onClick={() => update({ breakMinutes: m })} className={cn('btn h-9 flex-1 px-0 text-xs', settings.breakMinutes === m ? 'btn-primary' : 'btn-soft')}>{t('app.settings.breakOption', { n: m })}</button>)}</div>
        </Row>
        <Row label={t('app.settings.sound')} hint={t('app.settings.soundHint')} wide><AlertSoundControl /></Row>
        <Row label={t('app.settings.tour')} hint={t('app.settings.tourHint')}>
          <button onClick={startTour} className="btn btn-soft w-full">{t('app.settings.tourButton')}</button>
        </Row>
      </div>

      <div className="card mt-4 p-5">
        <p className="text-sm font-semibold">{t('app.settings.demoTitle')}</p>
        <p className="text-xs text-muted">{t('app.settings.demoDesc')}</p>
        <button onClick={() => { if (confirm(t('app.settings.demoConfirm'))) resetDemo() }} className="btn btn-soft mt-3">{t('app.settings.demoButton')}</button>
      </div>
      <p className="mt-6 text-center text-xs text-muted">{t('app.settings.footer')}</p>
    </div>
  )
}
