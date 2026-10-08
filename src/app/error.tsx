'use client'

/**
 * Global error boundary — catches unhandled errors in the root segment.
 * Renders a branded fallback; never shows a blank screen.
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

interface GlobalErrorProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Send to monitoring service in production (replace with real integration)
    if (process.env.NODE_ENV === 'production') {
      // e.g. Sentry.captureException(error)
    } else {
      console.error('Global error boundary:', error)
    }
  }, [error])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'var(--color-void)' }}
      role="alert"
      aria-live="assertive"
    >
      <div
        className="absolute inset-0 grid-bg opacity-30 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-6 max-w-md w-full">
        <div className="space-y-2">
          <p className="type-label" style={{ color: 'var(--color-energy-blue)' }}>
            {SITE_CONFIG.name}
          </p>
          <h1 className="type-display" style={{ color: 'var(--color-energy-white)' }}>
            Universe Anomaly
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(248,250,255,0.5)' }}
          >
            An unexpected error interrupted the signal. No data was lost.
          </p>
          {error.digest && (
            <p
              className="font-mono text-[10px] tracking-widest"
              style={{ color: 'rgba(248,250,255,0.2)' }}
            >
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="btn-universe"
            aria-label="Try to restore the universe"
          >
            Restore Universe
          </button>
          <Link
            href="/"
            className="btn-universe inline-flex"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
