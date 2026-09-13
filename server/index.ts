import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'
import type { AIJsonRequest, AITextRequest, AIHealth, AIMessage } from '../shared/ai-contract'

const PORT = Number(process.env.PORT ?? 8787)
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5'
const apiKey = process.env.ANTHROPIC_API_KEY
const client = apiKey ? new Anthropic({ apiKey }) : null

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

// Resumes and interview data are confidential: nothing is logged or stored server-side. The proxy is stateless.

function toMessages(messages: AIMessage[]): Anthropic.MessageParam[] {
  return messages.map((m) => ({
    role: m.role,
    content: typeof m.content === 'string'
      ? m.content
      : m.content.map((c): Anthropic.ContentBlockParam =>
          c.type === 'text'
            ? { type: 'text', text: c.text }
            : { type: 'image', source: { type: 'base64', media_type: c.mediaType, data: c.data } }),
  }))
}

function requireClient(res: express.Response): Anthropic | null {
  if (!client) {
    res.status(503).json({ error: 'AI proxy is not configured: set ANTHROPIC_API_KEY on the server (see .env.example).' })
    return null
  }
  return client
}

function errorMessage(err: unknown): { status: number; message: string } {
  if (err instanceof Anthropic.AuthenticationError) return { status: 401, message: 'Invalid Anthropic API key on the server.' }
  if (err instanceof Anthropic.RateLimitError) return { status: 429, message: 'Rate limited by the model provider — try again in a moment.' }
  if (err instanceof Anthropic.BadRequestError) return { status: 400, message: `Bad request to the model: ${err.message}` }
  if (err instanceof Anthropic.APIError) return { status: err.status ?? 502, message: err.message }
  return { status: 500, message: err instanceof Error ? err.message : 'Unknown error' }
}

app.get('/api/health', (_req, res) => {
  const body: AIHealth = { ok: true, configured: Boolean(client), model: DEFAULT_MODEL }
  res.json(body)
})

app.post('/api/ai/stream', async (req, res) => {
  const c = requireClient(res)
  if (!c) return
  const body = req.body as AITextRequest
  res.setHeader('content-type', 'text/event-stream')
  res.setHeader('cache-control', 'no-cache')
  res.setHeader('connection', 'keep-alive')
  res.flushHeaders()
  const send = (payload: unknown) => res.write(`data: ${JSON.stringify(payload)}\n\n`)
  const abort = new AbortController()
  req.on('close', () => abort.abort())
  try {
    const stream = c.messages.stream({
      model: body.model ?? DEFAULT_MODEL,
      max_tokens: body.maxTokens ?? 4000,
      system: body.system,
      messages: toMessages(body.messages),
      output_config: { effort: body.effort ?? 'medium' },
    }, { signal: abort.signal })
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') send({ type: 'delta', text: event.delta.text })
    }
    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') send({ type: 'error', message: 'The model declined this request.' })
    send({ type: 'done' })
  } catch (err) {
    if (!abort.signal.aborted) send({ type: 'error', message: errorMessage(err).message })
  } finally {
    res.end()
  }
})

app.post('/api/ai/json', async (req, res) => {
  const c = requireClient(res)
  if (!c) return
  const body = req.body as AIJsonRequest
  try {
    const response = await c.messages.create({
      model: body.model ?? DEFAULT_MODEL,
      max_tokens: body.maxTokens ?? 8000,
      system: body.system,
      messages: toMessages(body.messages),
      output_config: { effort: body.effort ?? 'medium', format: { type: 'json_schema', schema: body.schema } },
    })
    if (response.stop_reason === 'refusal') { res.status(422).json({ error: 'The model declined this request.' }); return }
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
    res.json({ result: JSON.parse(text) })
  } catch (err) {
    const e = errorMessage(err)
    res.status(e.status).json({ error: e.message })
  }
})

// Fetch a public job/company page so the client can extract text. Only http(s), no private hosts.
app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body as { url?: string }
  let parsed: URL
  try {
    parsed = new URL(url ?? '')
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol')
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[::1\])/.test(parsed.hostname)) throw new Error('private host')
  } catch {
    res.status(400).json({ error: 'Please provide a valid public http(s) URL.' })
    return
  }
  try {
    const r = await fetch(parsed, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; InterviewPilot/0.1)', accept: 'text/html,application/xhtml+xml,text/plain' }, redirect: 'follow', signal: AbortSignal.timeout(15000) })
    if (!r.ok) { res.status(502).json({ error: `The page responded with ${r.status}.` }); return }
    const html = await r.text()
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim()
    res.json({ url: parsed.toString(), title, text: htmlToText(html).slice(0, 60000) })
  } catch {
    res.status(502).json({ error: 'Could not fetch that URL (timeout, blocked, or requires login). Paste the text instead.' })
  }
})

function htmlToText(html: string): string {
  const withoutScripts = html.replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ')
  const blocks = withoutScripts.replace(/<\/(p|div|li|h[1-6]|tr|br|section|article)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
  const text = blocks.replace(/<[^>]+>/g, ' ')
  const decoded = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  return decoded.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n')
}

// In production, serve the built web app from the same process.
const here = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(here, '../dist')
if (process.env.NODE_ENV === 'production' && fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`InterviewPilot API on http://localhost:${PORT} — model ${DEFAULT_MODEL} — key ${client ? 'configured' : 'MISSING (offline mode still works in the app)'}`)
})
