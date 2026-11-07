// Fetch only editorially selected primary publishers. Never fetch a model-provided URL.
export const FEEDS = [
  { name: 'Google Blog', url: 'https://blog.google/technology/ai/rss/', hosts: ['blog.google'] },
  { name: 'GitHub Blog', url: 'https://github.blog/category/engineering/feed/', hosts: ['github.blog'] },
  { name: 'Microsoft Research', url: 'https://www.microsoft.com/en-us/research/feed/', hosts: ['www.microsoft.com'] },
]
export type Source = { title: string; url: string; publishedAt: string; name: string; text: string; hosts: string[] }
export function plainText(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<(script|style|nav|footer|header)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => { const c = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n); return c > 0 && c <= 0x10ffff ? String.fromCodePoint(c) : '' })
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}
export function canonicalSource(raw: string, hosts: string[]) {
  const url = new URL(raw)
  if (url.protocol !== 'https:' || url.port || url.username || url.password || !hosts.includes(url.hostname)) throw new Error('source_host')
  url.hash = ''; url.search = ''; url.pathname = url.pathname.replace(/\/+$/, '') || '/'
  return url.toString()
}
export function parseFeed(xml: string, feed: typeof FEEDS[number], now = Date.now()): Source[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].flatMap(match => {
    const field = (tag: string) => match[1].match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] ?? ''
    try {
      const date = Date.parse(plainText(field('pubDate') || field('dc:date')))
      if (!Number.isFinite(date) || date > now || date < now - 14 * 86400_000) return []
      return [{ title: plainText(field('title')), url: canonicalSource(plainText(field('link')), feed.hosts), publishedAt: new Date(date).toISOString(), name: feed.name, hosts: feed.hosts, text: plainText(field('content:encoded') || field('description')) }]
    } catch { return [] }
  })
}
export async function fetchSource(url: string, hosts: string[], redirects = 0, signal = AbortSignal.timeout(12_000)): Promise<string> {
  canonicalSource(url, hosts)
  const response = await fetch(url, { redirect: 'manual', signal, cache: 'no-store', headers: { 'User-Agent': 'RAVZEN-Tech-Insights/1.0 (+https://ravzen.vercel.app/tech-insights)' } })
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= 3 || !response.headers.get('location')) throw new Error('source_redirect')
    return fetchSource(new URL(response.headers.get('location')!, url).toString(), hosts, redirects + 1, signal)
  }
  if (!response.ok || !response.body) throw new Error('source_unavailable')
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let body = ''; let size = 0
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 2_000_000) throw new Error('source_too_large'); body += decoder.decode(value, { stream: true }) }
  } finally { await reader.cancel() }
  return body + decoder.decode()
}
export async function discoverSources() {
  const results = await Promise.allSettled(FEEDS.map(async feed => parseFeed(await fetchSource(feed.url, feed.hosts), feed)))
  const seen = new Set<string>()
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : []).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).filter(s => !seen.has(s.url) && !!seen.add(s.url)).slice(0, 20)
}
export async function sourceEvidence(source: Source) {
  const html = await fetchSource(source.url, source.hosts)
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
  const evidence = article ? plainText(article) : source.text
  if (evidence.length < 1800) throw new Error('source_insufficient')
  return evidence.slice(0, 26000)
}
