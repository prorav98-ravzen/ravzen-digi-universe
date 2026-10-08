/**
 * Next.js middleware entry point.
 *
 * Phase 0: Session refresh only.
 * Phase 1+: Admin route protection added inside updateSession().
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     * - Next.js internals (_next/static, _next/image)
     * - favicon.ico
     * - Static files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
