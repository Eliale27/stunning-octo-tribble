import type Anthropic from '@anthropic-ai/sdk'
import type { AIMessage } from '../../../shared/ai-contract'

export function buildMessages(messages: AIMessage[]): Anthropic.MessageParam[] {
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
