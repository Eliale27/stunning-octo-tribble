// Shared request/response contract between the web client and the AI proxy server.
// Kept dependency-free so both sides can import it.

export interface AIMessageText { type: 'text'; text: string }
export interface AIMessageImage { type: 'image'; mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'; data: string }
export type AIContent = AIMessageText | AIMessageImage

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string | AIContent[]
}

export type AIEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface AITextRequest {
  system: string
  messages: AIMessage[]
  model?: string
  maxTokens?: number
  effort?: AIEffort
}

export interface AIJsonRequest extends AITextRequest {
  /** JSON schema the response must conform to (structured outputs). */
  schema: Record<string, unknown>
}

export interface AIHealth {
  ok: boolean
  configured: boolean
  model: string
}

export interface FetchUrlResponse {
  url: string
  title?: string
  text: string
}
