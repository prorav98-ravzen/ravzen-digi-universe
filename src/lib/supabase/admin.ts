/**
 * Supabase ADMIN client — service-role key.
 *
 * SERVER ONLY. Never imported from client-side code.
 * The service-role key is never in the client bundle.
 *
 * Used for:
 * - Operations that must bypass RLS (e.g. session cleanup)
 * - Server-side admin actions
 *
 * Access is enforced by Next.js server boundaries.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function createAdminClient(): SupabaseClient {
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase admin credentials. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}

// Singleton — one admin client per server process lifecycle
let _adminClient: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createAdminClient()
  }
  return _adminClient
}
