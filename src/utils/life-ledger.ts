import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true,
})

export const createLedgerId = (prefix = 'ledger') => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\u4e00-\u9fa5]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `post-${Date.now()}`

export const formatDate = (value: string | number | Date, locale = 'zh-CN') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))

export const formatDateTime = (value: string | number | Date, locale = 'zh-CN') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

export const formatMonthLabel = (value: string | number | Date, locale = 'zh-CN') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(new Date(value))

export const toDateInputValue = (value?: string | number | Date | null) => {
  const date = value ? new Date(value) : new Date()
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export const toDayKey = (value?: string | number | Date | null) => {
  const date = value ? new Date(value) : new Date()
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

export const toMonthKey = (value?: string | number | Date | null) => toDayKey(value).slice(0, 7)

export const buildShareUrl = (path: string) => {
  if (typeof window === 'undefined') return path

  const base = import.meta.env.APP_BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${window.location.origin}${normalizedBase}${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1')
}

export const copyText = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  if (typeof document === 'undefined') return false

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  return true
}

export const downloadTextFile = (filename: string, content: string, type = 'text/plain;charset=utf-8') => {
  if (typeof document === 'undefined') return

  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const readFilesAsDataUrls = async (input: FileList | File[]) => {
  const files = Array.from(input)

  const tasks = files.map(
    (file) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      }),
  )

  return Promise.all(tasks)
}

export const renderMarkdown = (markdown: string) => {
  const parsed = marked.parse(markdown || '')
  const html = typeof parsed === 'string' ? parsed : ''
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })
}

export const extractPlainText = (markdown: string) =>
  (markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#>*_\-\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const clipText = (text: string, length = 120) => {
  if (text.length <= length) return text
  return `${text.slice(0, length).trim()}...`
}

export const markdownSummary = (markdown: string, length = 120) =>
  clipText(extractPlainText(markdown), length)

export const normalizeKeywordList = (value: string) =>
  value
    .split(/[，,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)

export const uniqueList = <T>(list: T[]) => Array.from(new Set(list))

export const createSvgCover = (label: string, start = '#7dd3fc', end = '#f0abfc') => {
  const safeLabel = label.slice(0, 28)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" rx="40" fill="url(#hero)" />
      <circle cx="180" cy="120" r="120" fill="rgba(255,255,255,0.18)" />
      <circle cx="1040" cy="520" r="160" fill="rgba(255,255,255,0.12)" />
      <text x="80" y="300" fill="#ffffff" font-size="68" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">${safeLabel}</text>
      <text x="82" y="372" fill="rgba(255,255,255,0.84)" font-size="28" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif">人生手账 · 清新优雅记录</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const insertAroundSelection = (
  source: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix = '',
  placeholder = '内容',
) => {
  const selected = source.slice(selectionStart, selectionEnd) || placeholder
  const next =
    source.slice(0, selectionStart) +
    prefix +
    selected +
    suffix +
    source.slice(selectionEnd)

  const cursorStart = selectionStart + prefix.length
  const cursorEnd = cursorStart + selected.length

  return {
    value: next,
    selectionStart: cursorStart,
    selectionEnd: cursorEnd,
  }
}

export const insertLineAtSelection = (
  source: string,
  selectionStart: number,
  selectionEnd: number,
  line: string,
) => {
  const before = source.slice(0, selectionStart)
  const selected = source.slice(selectionStart, selectionEnd)
  const after = source.slice(selectionEnd)
  const block = selected || '内容'
  const next = `${before}${line}${block}${after}`

  return {
    value: next,
    selectionStart: selectionStart + line.length,
    selectionEnd: selectionStart + line.length + block.length,
  }
}

export const sortByDateDesc = <T>(list: T[], getter: (item: T) => string) =>
  [...list].sort((a, b) => +new Date(getter(b)) - +new Date(getter(a)))

export const monthStats = <T>(list: T[], getter: (item: T) => string) => {
  const map = new Map<string, number>()

  list.forEach((item) => {
    const key = toMonthKey(getter(item))
    map.set(key, (map.get(key) || 0) + 1)
  })

  return [...map.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => (a.month > b.month ? -1 : 1))
}
