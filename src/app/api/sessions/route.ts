/**
 * POST /api/sessions — Upsert an active session (heartbeat).
 * GET  /api/sessions — Intentionally not implemented; use /api/activity.
 *
 * Privacy: session_token is an anonymous UUID — never linked to any user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z }                          from 'zod'
import { createClient }               from '@/lib/supabase/server'

const HeartbeatSchema = z.object({
  session_token: z.string().min(1).max(200),
})

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json()
    const parsed = HeartbeatSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = await createClient()

    // Upsert — creates or refreshes last_seen_at
    const { error } = await supabase
      .from('active_sessions')
      .upsert(
        { session_token: parsed.data.session_token, last_seen_at: new Date().toISOString() },
        { onConflict: 'session_token' }
      )

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
