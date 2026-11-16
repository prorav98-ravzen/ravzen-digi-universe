import { isEditorRole, isSameOriginMutation } from '@/lib/security/guards'
/**
 * requireEditor — server-side auth + role guard for API routes.
 *
 * Usage in Route Handlers:
 *   const { user, supabase } = await requireEditor()
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *
 * This ensures:
 *   1. The user is authenticated
 *   2. Their profile exists and is active
 *   3. They have at least EDITOR role
 *
 * For higher role requirements, check user.role after this call.
 */

import { createClient }    from '@/lib/supabase/server'
import type { AuthUser }   from '@/types/auth'

export async function requireEditor(request?: Request): Promise<{
  user:    AuthUser | null
  supabase: Awaited<ReturnType<typeof createClient>>
}> {
  const supabase = await createClient()
  if (request) {
    const h = request.headers
    if (!isSameOriginMutation(h.get('origin'), h.get('host'), h.get('sec-fetch-site'))) return { user: null, supabase }
  }
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return { user: null, supabase }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, full_name, email')
    .eq('id', authUser.id)
    .single()

  if (!profile?.is_active || !isEditorRole(profile.role)) return { user: null, supabase }

  const user: AuthUser = {
    id:        authUser.id,
    email:     profile?.email ?? authUser.email ?? '',
    role:      profile?.role  ?? 'EDITOR',
    fullName:  profile?.full_name ?? null,
    avatarUrl: null,
    isActive:  profile?.is_active ?? false,
  }

  return { user, supabase }
}
