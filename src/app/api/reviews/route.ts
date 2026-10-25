import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
const schema = z.object({
  artworkId: z.string().uuid(), imageIndex: z.number().int().min(0).max(100).default(0), name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(9).max(25), rating: z.number().int().min(1).max(5),
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
  let json: unknown
  try { json = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid review details' }, { status: 400 })
  const input = parsed.data
  const db = await createClient()
  const { error } = await db.rpc('submit_guest_artwork_review', {
    p_artwork: input.artworkId, p_image: input.imageIndex,
    p_name: input.name, p_phone: input.phone,
    p_rating: input.rating, p_body: input.body
  })
  if (error) return NextResponse.json({ error: error.message.includes('Please wait') ? 'Please wait 24 hours before submitting another review.' : 'Unable to submit review.' }, { status: 429 })
  return NextResponse.json({ message: 'Review submitted for moderation.' }, { status: 201 })
}
