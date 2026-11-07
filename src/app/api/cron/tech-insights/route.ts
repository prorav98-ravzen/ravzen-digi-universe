import { timingSafeEqual, randomUUID, createHash, createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insightsClient } from '@/lib/insights/data'
import { publicationSlot } from '@/lib/insights/schema'
import { discoverSources, sourceEvidence } from '@/lib/insights/sources'
import { generateArticle } from '@/lib/insights/generate'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: Request) {
  const secret = process.env.TECH_INSIGHTS_SECRET
  if (!secret) return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  const supplied = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  const bearerValid = Buffer.byteLength(supplied) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  const timestamp = request.headers.get('x-ravzen-timestamp') ?? ''
  const signature = request.headers.get('x-ravzen-signature') ?? ''
  const expectedSignature = createHmac('sha256', secret).update(`${timestamp}:tech-insights`).digest('hex')
  const signatureValid = /^\d{10}$/.test(timestamp) && Math.abs(Date.now() / 1000 - Number(timestamp)) <= 60 && /^[a-f0-9]{64}$/.test(signature) && timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1'
  if (!bearerValid && (!signatureValid || dryRun)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (dryRun) {
    try {
      if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'configuration_missing' }, { status: 503 })
      const sources = await discoverSources()
      for (const source of sources.slice(0, 5)) {
        let evidence: string
        try { evidence = await sourceEvidence(source) } catch { continue }
        const article = await generateArticle(source, evidence)
        return NextResponse.json({ status: 'validated_not_published', title: article.title, source: source.url })
      }
      return NextResponse.json({ error: 'no_fresh_source' }, { status: 503 })
    } catch { return NextResponse.json({ error: 'validation_failed' }, { status: 503 }) }
  }
  const slot = publicationSlot()
  if (!slot) return NextResponse.json({ status: 'outside_publication_window' })
  const run = randomUUID()
  const db = insightsClient()
  const rpc = async (action: string, payload: object = {}) => {
    const { data, error } = await db.rpc('tech_insights_publish', { p_token: secret, p_action: action, p_week: slot.week, p_run: run, p_payload: payload })
    if (error) throw new Error('database_operation')
    return data
  }
  let claimed = false
  try {
    const claim = await rpc('claim')
    if (!claim?.claimed) return NextResponse.json({ status: claim?.status ?? 'already_running' })
    claimed = true
    if (!process.env.GEMINI_API_KEY) throw new Error('configuration_missing')
    const sources = await discoverSources()
    const used = new Set<string>(claim.used_sources ?? [])
    let source: (typeof sources)[number] | undefined
    let evidence = ''
    for (const candidate of sources.filter(s => !used.has(s.url)).slice(0, 5)) {
      try { evidence = await sourceEvidence(candidate); source = candidate; break } catch { /* Try another recent primary source. */ }
    }
    if (!source) throw new Error('no_fresh_source')
    const article = await generateArticle(source, evidence)
    const content = article.sections.flatMap(s => s.paragraphs).join(' ')
    const result = await rpc('publish', { ...article, slug: `${article.slug}-${slot.week}`, published_at: slot.publishAt, source_url: source.url, source_title: source.title, source_name: source.name, source_published_at: source.publishedAt, content_hash: createHash('sha256').update(content.normalize('NFKC')).digest('hex'), reading_minutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 180)) })
    return NextResponse.json({ status: 'published', slug: result.slug, publishedAt: slot.publishAt })
  } catch (error) {
    // Only predefined error codes enter logs. Never log prompts, response bodies or secrets.
    const message = error instanceof Error ? error.message : ''
    const code = /^(configuration_[a-z_]+|quality_[a-z_]+|gemini_(http_\d+|incomplete|unavailable)|source_[a-z_]+|no_fresh_source|database_operation)$/.test(message) ? message : 'generation_failed'
    console.error('tech_insights_run_failed', { run, code })
    if (claimed) { try { await rpc('fail', { code }) } catch { console.error('tech_insights_status_write_failed', { run }) } }
    return NextResponse.json({ error: code, run }, { status: 503 })
  }
}
