/**
 * POST /api/sessions/end — Remove an active session on page unload.
 * Called via navigator.sendBeacon so it fires even as the tab closes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z }                          from 'zod'
import { createClient }               from '@/lib/supabase/server'

const EndSchema = z.object({
  session_token: z.string().min(1).max(200),
})

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json()
    const parsed = EndSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: true })

    const supabase = await createClient()
    await supabase.from('active_sessions').delete()
      .eq('session_token', parsed.data.session_token)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
