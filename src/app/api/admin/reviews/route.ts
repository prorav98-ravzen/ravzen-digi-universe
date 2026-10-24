import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
async function authorize() {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return false
  const { data, error } = await auth.rpc('review_is_admin')
  return !error && data === true
}
export async function GET() {
  if (!await authorize()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await (await createClient()).from('artwork_reviews').select('id,artwork_id,reviewer_name,reviewer_email,reviewer_phone,rating,body,status,admin_reply,verified_client,created_at').order('created_at', { ascending: false }).limit(300)
  if (error) return NextResponse.json({ error: 'Unable to load' }, { status: 500 })
  const reviews = data ?? []
  return NextResponse.json({ reviews, analytics: { total: reviews.length, pending: reviews.filter(x => x.status === 'pending').length, approved: reviews.filter(x => x.status === 'approved').length, averageRating: reviews.filter(x => x.status === 'approved').reduce((sum,x) => sum + x.rating,0) / (reviews.filter(x => x.status === 'approved').length || 1) } }, { headers: { 'Cache-Control': 'no-store' } })
}
const schema = z.object({ id: z.string().uuid(), status: z.enum(['pending','approved','rejected']), adminReply: z.string().max(2000).nullable(), verifiedClient: z.boolean() })
export async function PATCH(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  if (!await authorize()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let input: unknown
  try { input = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = schema.safeParse(input)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 })
  const { id, status, adminReply, verifiedClient } = parsed.data
  const { error } = await getAdminClient().from('artwork_reviews').update({ status, admin_reply: adminReply, verified_client: verifiedClient, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
