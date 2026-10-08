/**
 * GET /api/ads?zone=design&position=top
 *
 * Returns the highest-priority active advertisement for the given slot.
 * Only returns ads where:
 *   - is_active = true
 *   - slot matches zone + position
 *   - starts_at IS NULL OR starts_at <= now
 *   - ends_at IS NULL OR ends_at >= now
 *
 * Response: { ad: AdData | null }
 * Short cache: 30 s (ads change infrequently; stale-while-revalidate handles freshness).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z }                          from 'zod'
import { createClient }               from '@/lib/supabase/server'

const QuerySchema = z.object({
  zone:     z.enum(['universe', 'design', 'android', 'software', 'system']),
  position: z.enum(['top', 'bottom', 'left', 'right', 'center', 'custom']),
})

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const parsed = QuerySchema.safeParse({
    zone:     searchParams.get('zone'),
    position: searchParams.get('position'),
  })

  if (!parsed.success) {
    return NextResponse.json({ ad: null }, { status: 400 })
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  // Find the matching slot
  const { data: slot } = await supabase
    .from('ad_slots')
    .select('id')
    .eq('zone', parsed.data.zone)
    .eq('position', parsed.data.position)
    .eq('is_active', true)
    .single()

  if (!slot) {
    return NextResponse.json({ ad: null })
  }

  // Get highest-priority active ad for this slot
  const { data: ad } = await supabase
    .from('advertisements')
    .select('id, title, body_text, media_url, media_type, cta_text, cta_url, animation_type')
    .eq('slot_id', slot.id)
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('priority', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json(
    { ad: ad ?? null },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    }
  )
}
