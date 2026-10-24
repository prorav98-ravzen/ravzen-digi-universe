import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = await createClient()
  const { data, error } = await db.rpc('studio_visitor_stats')
  if (error) return NextResponse.json({ error: 'Visitor statistics unavailable' }, { status: 503 })
  const stats = Array.isArray(data) ? data[0] : data
  return NextResponse.json({ today: Number(stats?.today_visitors ?? 0), month: Number(stats?.month_visitors ?? 0), total: Number(stats?.total_visitors ?? 0) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const visitorId = (body as { visitorId?: unknown } | null)?.visitorId
  if (typeof visitorId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId)) return NextResponse.json({ error: 'Invalid visitor' }, { status: 400 })
  const db = await createClient()
  const { error } = await db.rpc('record_studio_visit', { p_visitor: visitorId })
  if (error) return NextResponse.json({ error: 'Visitor tracking unavailable' }, { status: 503 })
  return GET()
}
