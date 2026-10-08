/**
 * Supabase SERVER client.
 *
 * Use in Server Components, Route Handlers, and Server Actions.
 * Reads cookies for session management via next/headers.
 * Never use the browser client in server code.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll called from a Server Component render — cookies are read-only.
            // This is expected and safe; session refresh is handled by middleware.
          }
        },
      },
    }
  )
}
