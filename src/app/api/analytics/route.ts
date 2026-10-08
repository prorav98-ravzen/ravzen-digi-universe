/**
 * POST /api/analytics
 *
 * Records a single analytics event.
 *
 * Privacy rules:
 *   - No IP addresses stored
 *   - No personally identifiable information
 *   - Only event type, session token, entity reference, and timestamp
 *   - Session token is anonymous — generated client-side, never linked to a user
 *
 * Rate: fire-and-forget. Client should not wait on this response.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z }                          from 'zod'
import { createClient }               from '@/lib/supabase/server'

const AnalyticsEventSchema = z.object({
  session_id:  z.string().min(1).max(200),
  event_type:  z.enum([
    'zone_visit', 'project_view', 'app_view', 'software_view', 'system_view',
    'download_click', 'whatsapp_click', 'email_click', 'cta_click', 'ad_click',
  ]),
  entity_id:   z.string().uuid().optional(),
  entity_type: z.enum(['design', 'android', 'software', 'system', 'advertisement']).optional(),
  referrer:    z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json()
    const parsed = AnalyticsEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('analytics_events').insert({
      session_id:  parsed.data.session_id,
      event_type:  parsed.data.event_type,
      entity_id:   parsed.data.entity_id   ?? null,
      entity_type: parsed.data.entity_type ?? null,
      referrer:    parsed.data.referrer     ?? null,
    })

    if (error) {
      // Silently fail — analytics must never break the user experience
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
