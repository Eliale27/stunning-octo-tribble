import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { PageHeader } from '@/components/ui/Bits'
import { cn, fmtMinutes } from '@/lib/utils'

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-sm font-semibold">{label}</p>{hint && <p className="text-xs text-muted">{hint}</p>}</div>
      <div className="sm:w-56">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={value} onClick={() => onChange(!value)} className={cn('relative h-7 w-12 rounded-full transition', value ? 'bg-sage' : 'bg-line-2')}>
      <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', value ? 'left-6' : 'left-1')} />
    </button>
  )
}

export default function Settings() {
  const settings = useStore(s => s.settings)
  const update = useStore(s => s.updateSettings)
  const resetDemo = useStore(s => s.resetDemo)
  const [name, setName] = useState(settings.name)
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" sub="Ajuste a plataforma ao seu jeito de estudar." />
      <div className="card divide-y divide-line px-5">
        <Row label="Seu nome" hint="Como você quer ser chamado">
          <input className="input" value={name} onChange={e => setName(e.target.value)} onBlur={() => name.trim() && update({ name: name.trim() })} />
        </Row>
        <Row label="Meta diária" hint={`Atualmente ${fmtMinutes(settings.dailyGoalMinutes)} por dia`}>
          <input type="range" min={30} max={480} step={15} value={settings.dailyGoalMinutes} onChange={e => update({ dailyGoalMinutes: +e.target.value })} className="w-full accent-sage" />
        </Row>
        <Row label="Duração do foco" hint="Padrão do Pomodoro">
          <div className="flex gap-1.5">{[15, 25, 45, 50, 60].map(m => <button key={m} onClick={() => update({ focusMinutes: m })} className={cn('btn h-9 flex-1 px-0 text-xs', settings.focusMinutes === m ? 'btn-primary' : 'btn-soft')}>{m}</button>)}</div>
        </Row>
        <Row label="Duração da pausa">
          <div className="flex gap-1.5">{[5, 10, 15].map(m => <button key={m} onClick={() => update({ breakMinutes: m })} className={cn('btn h-9 flex-1 px-0 text-xs', settings.breakMinutes === m ? 'btn-primary' : 'btn-soft')}>{m} min</button>)}</div>
        </Row>
        <Row label="Sons" hint="Aviso ao final de cada sessão"><Toggle value={settings.soundEnabled} onChange={v => update({ soundEnabled: v })} /></Row>
      </div>

      <div className="card mt-4 p-5">
        <p className="text-sm font-semibold">Dados de demonstração</p>
        <p className="text-xs text-muted">Esta versão guarda tudo no seu navegador. Você pode restaurar os dados fictícios iniciais a qualquer momento.</p>
        <button onClick={() => { if (confirm('Restaurar os dados de demonstração? Suas alterações serão perdidas.')) resetDemo() }} className="btn btn-soft mt-3">Restaurar demonstração</button>
      </div>
      <p className="mt-6 text-center text-xs text-muted">estuda · v0.1 · feito com calma e café ☕</p>
    </div>
  )
}
