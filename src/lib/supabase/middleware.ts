/**
 * Supabase MIDDLEWARE client.
 *
 * Responsibilities:
 *   1. Refresh the Supabase session cookie on every request.
 *   2. Protect /admin/* routes — redirect unauthenticated users to /admin/login.
 *   3. Redirect authenticated users away from /admin/login → /admin/dashboard.
 *
 * Architecture note:
 *   This file is the only place admin route protection lives.
 *   Components and API routes must ALSO check auth server-side —
 *   middleware is defence-in-depth, not the sole guard.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT remove this call
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminRoute   = pathname.startsWith('/admin')
  const isLoginRoute   = pathname === '/admin/login'

  // Unauthenticated → redirect to login
  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Already authenticated → redirect away from login page
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return supabaseResponse
}
