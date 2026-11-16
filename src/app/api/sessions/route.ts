import { readBoundedJson } from '@/lib/security/json'
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
  session_token: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body   = await readBoundedJson(request)
    const parsed = HeartbeatSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.rpc('session_heartbeat', { p_token: parsed.data.session_token, p_end: false })

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
