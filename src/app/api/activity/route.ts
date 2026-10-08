/**
 * GET /api/activity
 *
 * Returns the current Universe Activity count for public display.
 *
 * Response shape:
 *   { raw: number, displayed: number, multiplier: number }
 *
 * Rules:
 *   - `displayed` = `raw` × `multiplier` (enforced in activitySource)
 *   - No session records are created here — read-only
 *   - Short cache (15 s) — frequent enough to feel live, cheap to serve
 *   - Phase 2: backed by MockActivitySource
 *   - Phase 3+: replace ACTIVITY_SOURCE in lib/activity/activitySource.ts
 */

import { NextResponse }           from 'next/server'
import { fetchUniverseActivity }  from '@/lib/activity/activitySource'

export const dynamic = 'force-dynamic'   // never statically cache this route

export async function GET() {
  const data = await fetchUniverseActivity()

  return NextResponse.json(data, {
    status: 200,
    headers: {
      // 15 s fresh, serve stale up to 30 s while revalidating
      'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
    },
  })
}
