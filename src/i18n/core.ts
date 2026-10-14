/**
 * Minimal i18n: nested dictionaries per language (src/i18n/<lang>/*.ts),
 * dotted keys, `{var}` interpolation and `_one`/`_other` plural variants
 * chosen by `vars.count`. No framework dependency.
 */
import { ptBR, enUS, es as esLocale } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import { pt } from './pt'
import { en } from './en'
import { es } from './es'

export type Lang = 'pt' | 'en' | 'es'
export const LANGS: Lang[] = ['pt', 'en', 'es']
export const DEFAULT_LANG: Lang = 'pt'
export const langNames: Record<Lang, string> = { pt: 'Português', en: 'English', es: 'Español' }
/** BCP 47 tags for <html lang> and Intl formatting. */
export const langTags: Record<Lang, string> = { pt: 'pt-BR', en: 'en-US', es: 'es' }

const dicts: Record<Lang, unknown> = { pt, en, es }
export const dateLocales: Record<Lang, DateFnsLocale> = { pt: ptBR, en: enUS, es: esLocale }

export type Vars = Record<string, string | number | undefined>

function lookup(dict: unknown, key: string): string | undefined {
  let cur: unknown = dict
  for (const part of key.split('.')) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part]
    else return undefined
  }
  return typeof cur === 'string' ? cur : undefined
}

/** Translate `key` for `lang`, falling back to Portuguese and then to the key itself. */
export function translate(lang: Lang, key: string, vars?: Vars): string {
  let k = key
  if (vars && typeof vars.count === 'number') {
    const variant = vars.count === 1 ? `${key}_one` : `${key}_other`
    if (lookup(dicts[lang], variant) ?? lookup(dicts[DEFAULT_LANG], variant)) k = variant
  }
  let s = lookup(dicts[lang], k) ?? lookup(dicts[DEFAULT_LANG], k)
  if (s === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key "${key}" (${lang})`)
    return key
  }
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, name: string) => (vars[name] === undefined ? `{${name}}` : String(vars[name])))
  return s
}

/** Pick the browser language on first visit; unsupported languages fall back to the default. */
export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return DEFAULT_LANG
  const candidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean)
  for (const tag of candidates) {
    const base = tag.toLowerCase().split('-')[0] as Lang
    if (LANGS.includes(base)) return base
  }
  return DEFAULT_LANG
}

/** Number formatting that follows the language (decimal separators etc). */
export const fmtNumber = (lang: Lang, n: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(langTags[lang], opts).format(n)
