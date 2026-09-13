import type { Settings } from '@/lib/types'
import type { AIEngine } from './engine'
import { LLMEngine } from './llmEngine'
import { OfflineEngine } from './offlineEngine'
import { BrowserTransport, ServerTransport } from './transport'

export type { AIEngine, AnswerStreamUpdate, CompanyDraft } from './engine'
export type { InterviewContext, MemoryItem } from './context'
export { turnsToMemory } from './context'

let cache: { key: string; engine: AIEngine } | null = null

/** Resolve the engine for the current settings. Cached per settings signature. */
export function getEngine(settings: Settings): AIEngine {
  const key = `${settings.aiMode}|${settings.model}|${settings.fastModel}|${settings.browserApiKey ?? ''}`
  if (cache?.key === key) return cache.engine
  let engine: AIEngine
  if (settings.aiMode === 'server') engine = new LLMEngine(new ServerTransport(), { model: settings.model, fastModel: settings.fastModel })
  else if (settings.aiMode === 'browser' && settings.browserApiKey) engine = new LLMEngine(new BrowserTransport(settings.browserApiKey, settings.model), { model: settings.model, fastModel: settings.fastModel })
  else engine = new OfflineEngine()
  cache = { key, engine }
  return engine
}

export async function checkServerHealth() {
  return new ServerTransport().health()
}
