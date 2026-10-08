/**
 * Supabase BROWSER client.
 *
 * Use in Client Components ('use client') only.
 * Uses NEXT_PUBLIC_ keys — safe for the browser bundle.
 * Never import this in Server Components, Route Handlers, or middleware.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
