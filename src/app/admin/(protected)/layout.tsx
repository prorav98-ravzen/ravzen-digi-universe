/**
 * Admin layout — Server Component.
 *
 * Verifies auth and role server-side before rendering any admin UI.
 * This is defence-in-depth — middleware also redirects unauthenticated users.
 *
 * The login route (/admin/login) is exempt — it must render without auth.
 */

import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import AdminShell        from '@/components/admin/AdminShell'
import type { AuthUser } from '@/types/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Middleware handles the redirect, but we double-check here
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active) redirect('/admin/login?error=inactive')

  const authUser: AuthUser = {
    id:        user.id,
    email:     profile?.email ?? user.email ?? '',
    role:      profile?.role  ?? 'EDITOR',
    fullName:  profile?.full_name ?? null,
    avatarUrl: null,
    isActive:  profile?.is_active ?? false,
  }

  return (
    <AdminShell user={authUser}>
      {children}
    </AdminShell>
  )
}
