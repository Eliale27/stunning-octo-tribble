import { Globe } from 'lucide-react'
import { LANGS, langNames, useLang, useT } from '@/i18n'
import { cn } from '@/lib/utils'

/**
 * Visible language selector. `pill` is the compact PT / EN / ES toggle used in
 * headers and the sidebar; `select` is the full dropdown used in Settings.
 */
export function LanguageSwitcher({ variant = 'pill', className, tour = true }: { variant?: 'pill' | 'select'; className?: string; /** Set `data-tour="language"` (only one instance should carry it). */ tour?: boolean }) {
  const { lang, setLanguage } = useLang()
  const t = useT()
  if (variant === 'select') {
    return (
      <select value={lang} onChange={e => setLanguage(e.target.value as typeof lang)} aria-label={t('common.language')}
        className={cn('input appearance-none pr-8', className)}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238A867C' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right .75rem center' }}>
        {LANGS.map(l => <option key={l} value={l}>{langNames[l]}</option>)}
      </select>
    )
  }
  return (
    <div data-tour={tour ? 'language' : undefined} role="radiogroup" aria-label={t('common.language')} className={cn('inline-flex items-center gap-0.5 rounded-full bg-beige p-0.5', className)}>
      <Globe size={13} className="ml-1.5 mr-0.5 text-muted" aria-hidden />
      {LANGS.map(l => (
        <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => setLanguage(l)} title={langNames[l]}
          className={cn('rounded-full px-2 py-1 text-[11px] font-bold uppercase transition', lang === l ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink')}>
          {l}
        </button>
      ))}
    </div>
  )
}
