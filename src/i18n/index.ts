import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { translate, dateLocales, type Lang, type Vars } from './core'

export { LANGS, DEFAULT_LANG, langNames, langTags, dateLocales, detectLang, translate, fmtNumber } from './core'
export type { Lang, Vars } from './core'

export type TFn = (key: string, vars?: Vars) => string

/** `t('page.key', { n: 3 })` for the current language. Re-renders on language change. */
export function useT(): TFn {
  const lang = useStore(s => s.language)
  return useCallback((key: string, vars?: Vars) => translate(lang, key, vars), [lang])
}

/** Current language plus the matching date-fns locale (pass it to `format`). */
export function useLang() {
  const lang = useStore(s => s.language)
  const setLanguage = useStore(s => s.setLanguage)
  return { lang, dfLocale: dateLocales[lang], setLanguage }
}

/** Plain (non-hook) translate for code outside React, e.g. store actions. */
export const t = (key: string, vars?: Vars) => translate(useStore.getState().language as Lang, key, vars)
