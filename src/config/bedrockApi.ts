/** Base URL for Express Bedrock API (no trailing slash). Empty = same origin. */
export function bedrockApiBase(): string {
  const raw = import.meta.env.VITE_BEDROCK_API_BASE?.trim() ?? ''
  return raw.replace(/\/$/, '')
}

export function bedrockApiUrl(path: string): string {
  const base = bedrockApiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}
