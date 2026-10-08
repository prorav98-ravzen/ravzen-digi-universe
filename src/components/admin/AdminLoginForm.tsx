'use client'

/**
 * AdminLoginForm — Supabase email/password login for admin panel.
 *
 * Security:
 *   - Validates with Zod before submission.
 *   - Uses Supabase browser client (anon key — safe).
 *   - Password never stored; handled entirely by Supabase Auth.
 *   - On success, router.push('/admin/dashboard') — middleware verifies.
 *   - Error messages are generic (no user enumeration).
 */

import { useState, useCallback }    from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail }    from 'lucide-react'
import { createClient }               from '@/lib/supabase/client'
import { LoginSchema }                from '@/lib/validation/schemas'
import { cn }                         from '@/lib/utils/cn'

export default function AdminLoginForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const redirectTo   = params.get('redirectTo') ?? '/admin/dashboard'
  const errorParam   = params.get('error')

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(
    errorParam === 'inactive' ? 'Your account is inactive. Contact a SUPER_ADMIN.' : null
  )

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = LoginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid input')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    parsed.data.email,
        password: parsed.data.password,
      })

      if (authError) {
        setError('Invalid email or password.')
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email, password, redirectTo, router])

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-8"
      style={{
        background:   'rgba(255,255,255,0.04)',
        border:       '1px solid rgba(255,255,255,0.08)',
        backdropFilter:'blur(16px)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-2"
          style={{ color: 'rgba(77,127,255,0.6)' }}>
          RAVZEN
        </p>
        <h1 className="font-display font-bold text-xl tracking-wider"
          style={{ color: 'var(--color-energy-white)' }}>
          ADMIN ACCESS
        </h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(248,250,255,0.35)' }}>
          Authorized personnel only
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono tracking-wider uppercase"
            style={{ color: 'rgba(248,250,255,0.45)' }}
            htmlFor="admin-email">
            Email
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(248,250,255,0.3)' }} aria-hidden="true" />
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ravzen.com"
              autoComplete="email"
              required
              className={cn('w-full pl-9 pr-4 py-2.5 rounded-lg text-sm')}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.1)',
                color:      '#f8faff',
                outline:    'none',
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono tracking-wider uppercase"
            style={{ color: 'rgba(248,250,255,0.45)' }}
            htmlFor="admin-password">
            Password
          </label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(248,250,255,0.3)' }} aria-hidden="true" />
            <input
              id="admin-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.1)',
                color:      '#f8faff',
                outline:    'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ color: 'rgba(248,250,255,0.3)' }}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400" role="alert">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-mono text-sm font-semibold tracking-wider cursor-pointer disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #4d7fff, #7c5cfc)', color: '#fff' }}
        >
          {loading ? 'Authenticating…' : 'Enter Admin'}
        </button>
      </form>
    </div>
  )
}
