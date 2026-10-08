/**
 * Activity source — Supabase-backed implementation.
 *
 * Replaces the Phase 2 mock source with real active session counts
 * from the database. The ×3 presentation multiplier is still enforced
 * here — the UI never does arithmetic on raw counts.
 *
 * Privacy: No PII is stored. Sessions are tracked by anonymous tokens.
 * The raw count is never exposed publicly — only the multiplied value.
 */

export interface ActivityData {
  raw:        number
  displayed:  number
  multiplier: number
}

const ACTIVITY_MULTIPLIER = 3

// ── Source interface ───────────────────────────────────────────────────────────

export interface ActivitySource {
  fetch(): Promise<ActivityData>
}

// ── Supabase source ────────────────────────────────────────────────────────────
//
// Counts active_sessions rows where last_seen_at is within the stale threshold.
// Uses the admin client to bypass RLS (active_sessions has a permissive read policy
// but the admin client is simpler and always available server-side).

const SupabaseActivitySource: ActivitySource = {
  async fetch(): Promise<ActivityData> {
    // Dynamic import to avoid loading Supabase if env vars aren't set
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const staleThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { count, error } = await supabase
      .from('active_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', staleThreshold)

    if (error) {
      // Never crash the page over a broken counter
      return { raw: 0, displayed: 0, multiplier: ACTIVITY_MULTIPLIER }
    }

    const raw = count ?? 0
    return {
      raw,
      displayed:  raw * ACTIVITY_MULTIPLIER,
      multiplier: ACTIVITY_MULTIPLIER,
    }
  },
}

// ── Fallback mock (used when Supabase is not configured) ──────────────────────

const MockActivitySource: ActivitySource = {
  async fetch(): Promise<ActivityData> {
    const minute = new Date().getMinutes()
    const raw    = 1 + (minute % 8)
    return { raw, displayed: raw * ACTIVITY_MULTIPLIER, multiplier: ACTIVITY_MULTIPLIER }
  },
}

// ── Active source ──────────────────────────────────────────────────────────────
// Use Supabase if env vars are configured, otherwise fall back to mock.
// This lets the app build and run without a database during development.

const hasSupabaseConfig = typeof process !== 'undefined'
  && !!process.env.NEXT_PUBLIC_SUPABASE_URL
  && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

export const ACTIVITY_SOURCE: ActivitySource = hasSupabaseConfig
  ? SupabaseActivitySource
  : MockActivitySource

export async function fetchUniverseActivity(): Promise<ActivityData> {
  try {
    return await ACTIVITY_SOURCE.fetch()
  } catch {
    return { raw: 0, displayed: 0, multiplier: ACTIVITY_MULTIPLIER }
  }
}
