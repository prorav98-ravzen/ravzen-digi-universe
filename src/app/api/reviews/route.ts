import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
const schema = z.object({
  artworkId: z.string().uuid(), imageIndex: z.number().int().min(0).max(100).default(0), name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(25).optional(), rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000)
})

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('artworkId')
  if (!id || !z.string().uuid().safeParse(id).success) return NextResponse.json({ error: 'Invalid artwork' }, { status: 400 })
  const imageIndex = Number(req.nextUrl.searchParams.get('imageIndex') ?? '0')
  if (!Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex > 100) return NextResponse.json({ error: 'Invalid image' }, { status: 400 })
  const db = await createClient()
  const { data, error } = await db.rpc('review_public_list', { p_artwork: id, p_image: imageIndex })
  if (error) return NextResponse.json({ error: 'Unable to load reviews' }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || !user.email || !user.email_confirmed_at || user.is_anonymous)
    return NextResponse.json({ error: 'Verify your email before submitting a review.' }, { status: 401 })
  let json: unknown
  try { json = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid review details' }, { status: 400 })
  const input = parsed.data
  const db = supabase
  const { data: artwork } = await db.from('design_projects').select('id,cover_image_url,gallery_urls').eq('id', input.artworkId).eq('status', 'published').maybeSingle()
  if (!artwork) return NextResponse.json({ error: 'Artwork unavailable' }, { status: 404 })
  const imageCount = new Set([artwork.cover_image_url, ...(artwork.gallery_urls ?? [])].filter(Boolean)).size
  if (input.imageIndex > 0 && input.imageIndex > imageCount) return NextResponse.json({ error: 'Image unavailable' }, { status: 400 })
  const { error } = await db.from('artwork_reviews').insert({
    artwork_id: input.artworkId, artwork_image_index: input.imageIndex, reviewer_id: user.id, reviewer_email: user.email,
    reviewer_name: input.name, reviewer_phone: input.phone || null, rating: input.rating,
    body: input.body, status: 'pending'
  })
  if (error?.code === '23505') return NextResponse.json({ error: 'You have already reviewed this artwork.' }, { status: 409 })
  if (error) return NextResponse.json({ error: 'Unable to submit review. Please retry or contact support.', code: error.code }, { status: 500 })
  return NextResponse.json({ message: 'Review submitted for moderation.' }, { status: 201 })
}
