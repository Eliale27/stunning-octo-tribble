import type { AIJsonRequest, AITextRequest, AIHealth } from '../../../shared/ai-contract'

/** A transport moves prompts to a model and returns text or JSON. */
export interface AITransport {
  readonly name: string
  streamText(req: AITextRequest, onDelta: (text: string) => void, signal?: AbortSignal): Promise<string>
  json<T>(req: AIJsonRequest, signal?: AbortSignal): Promise<T>
  health(): Promise<AIHealth>
}

export class AITransportError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'AITransportError'
  }
}

export function parseJsonLoose<T>(text: string): T {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed) as T
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fence) return JSON.parse(fence[1]) as T
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1)) as T
    throw new AITransportError('Model returned malformed JSON')
  }
}

// ---------- Server transport: talks to the local proxy (key stays server-side) ----------

export class ServerTransport implements AITransport {
  readonly name = 'server'
  constructor(private base = '/api') {}

  async health(): Promise<AIHealth> {
    try {
      const r = await fetch(`${this.base}/health`)
      if (!r.ok) return { ok: false, configured: false, model: '' }
      return (await r.json()) as AIHealth
    } catch {
      return { ok: false, configured: false, model: '' }
    }
  }

  async streamText(req: AITextRequest, onDelta: (t: string) => void, signal?: AbortSignal): Promise<string> {
    const r = await fetch(`${this.base}/ai/stream`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(req), signal,
    })
    if (!r.ok || !r.body) throw new AITransportError(await safeError(r), r.status)
    const reader = r.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let full = ''
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''
      for (const ev of events) {
        const line = ev.split('\n').find((l) => l.startsWith('data:'))
        if (!line) continue
        const payload = JSON.parse(line.slice(5).trim()) as { type: string; text?: string; message?: string }
        if (payload.type === 'delta' && payload.text) { full += payload.text; onDelta(payload.text) }
        else if (payload.type === 'error') throw new AITransportError(payload.message ?? 'AI error')
      }
    }
    return full
  }

  async json<T>(req: AIJsonRequest, signal?: AbortSignal): Promise<T> {
    const r = await fetch(`${this.base}/ai/json`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(req), signal,
    })
    if (!r.ok) throw new AITransportError(await safeError(r), r.status)
    const data = (await r.json()) as { result: T }
    return data.result
  }
}

async function safeError(r: Response): Promise<string> {
  try {
    const j = (await r.json()) as { error?: string }
    return j.error ?? `Request failed (${r.status})`
  } catch {
    return `Request failed (${r.status})`
  }
}

// ---------- Browser transport: bring-your-own-key, calls Anthropic directly ----------

export class BrowserTransport implements AITransport {
  readonly name = 'browser'
  constructor(private apiKey: string, private defaultModel: string) {}

  async health(): Promise<AIHealth> {
    return { ok: Boolean(this.apiKey), configured: Boolean(this.apiKey), model: this.defaultModel }
  }

  private async client() {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    return new Anthropic({ apiKey: this.apiKey, dangerouslyAllowBrowser: true })
  }

  async streamText(req: AITextRequest, onDelta: (t: string) => void, signal?: AbortSignal): Promise<string> {
    const client = await this.client()
    const { buildMessages } = await import('./anthropicParams')
    const stream = client.messages.stream({
      model: req.model ?? this.defaultModel,
      max_tokens: req.maxTokens ?? 4000,
      system: req.system,
      messages: buildMessages(req.messages),
      output_config: { effort: req.effort ?? 'medium' },
    }, { signal })
    let full = ''
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        full += event.delta.text
        onDelta(event.delta.text)
      }
    }
    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') throw new AITransportError('The model declined this request.')
    return full
  }

  async json<T>(req: AIJsonRequest, signal?: AbortSignal): Promise<T> {
    const client = await this.client()
    const { buildMessages } = await import('./anthropicParams')
    const res = await client.messages.create({
      model: req.model ?? this.defaultModel,
      max_tokens: req.maxTokens ?? 8000,
      system: req.system,
      messages: buildMessages(req.messages),
      output_config: {
        effort: req.effort ?? 'medium',
        format: { type: 'json_schema', schema: req.schema },
      },
    }, { signal })
    if (res.stop_reason === 'refusal') throw new AITransportError('The model declined this request.')
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
    return parseJsonLoose<T>(text)
  }
}
