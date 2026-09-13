/** Client-side document text extraction. Files never leave the browser. */

export type ResumeSource = 'pdf' | 'docx' | 'txt'

export async function extractText(file: File): Promise<{ text: string; source: ResumeSource }> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return { text: await extractPdf(file), source: 'pdf' }
  if (name.endsWith('.docx') || file.type.includes('officedocument.wordprocessingml')) return { text: await extractDocx(file), source: 'docx' }
  if (name.endsWith('.doc')) throw new Error('Legacy .doc files are not supported — please save as .docx, PDF or TXT.')
  return { text: await file.text(), source: 'txt' }
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjs.getDocument({ data }).promise
  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    let last: number | null = null
    let line = ''
    const lines: string[] = []
    for (const item of content.items) {
      if (!('str' in item)) continue
      const y = Math.round(item.transform[5])
      if (last !== null && Math.abs(y - last) > 2) { lines.push(line.trim()); line = '' }
      line += (item.str ?? '') + (item.hasEOL ? '\n' : ' ')
      last = y
    }
    lines.push(line.trim())
    pages.push(lines.join('\n'))
  }
  const text = pages.join('\n\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!text) throw new Error('This PDF has no extractable text (it may be scanned). Paste the text instead.')
  return text
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
  return result.value.replace(/\n{3,}/g, '\n\n').trim()
}

/** Very small HTML → text converter for job/company pages fetched through the proxy. */
export function htmlToText(html: string): string {
  const withoutScripts = html.replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ')
  const blocks = withoutScripts.replace(/<\/(p|div|li|h[1-6]|tr|br|section|article)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
  const text = blocks.replace(/<[^>]+>/g, ' ')
  const decoded = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  return decoded.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n')
}

export async function fetchPublicUrl(url: string): Promise<{ text: string; title?: string }> {
  const r = await fetch('/api/fetch-url', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) })
  if (!r.ok) {
    const j = (await r.json().catch(() => ({}))) as { error?: string }
    throw new Error(j.error ?? 'Could not fetch that URL. Paste the text instead.')
  }
  return (await r.json()) as { text: string; title?: string }
}
