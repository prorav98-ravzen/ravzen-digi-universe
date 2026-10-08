'use client'

/**
 * PageLoader — Initial loading state shown before the experience mounts.
 *
 * Appears for ~300ms while Next.js lazy-loads IntroScreen/UniverseHub.
 * Matches the void background so there's no flash of white.
 * Reduced motion: renders a simple static indicator.
 */

import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function PageLoader() {
  const reduced = useReducedMotion()

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'var(--color-void)', zIndex: 'var(--z-overlay)' as unknown as number }}
      aria-label="Loading RAVZEN DIGI UNIVERSE"
      role="status"
    >
      {/* Wordmark + loading indicator */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span
            className="font-display font-bold text-sm tracking-[0.22em] uppercase"
            style={{ color: 'var(--color-energy-white)' }}
          >
            RAVZEN
          </span>
          <span
            className="font-mono text-[9px] tracking-widest uppercase"
            style={{ color: 'rgba(77,127,255,0.5)' }}
          >
            DIGI
          </span>
        </div>

        {/* Animated loading bar */}
        <div
          className="relative overflow-hidden rounded-full"
          style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.06)' }}
          aria-hidden="true"
        >
          {!reduced && (
            <div
              className="absolute inset-y-0 rounded-full"
              style={{
                width:    '40%',
                background: 'linear-gradient(90deg, transparent, rgba(77,127,255,0.8), transparent)',
                animation: 'shimmer 1.5s linear infinite',
              }}
            />
          )}
          {reduced && (
            <div
              className="absolute inset-y-0 left-0 w-full rounded-full"
              style={{ background: 'rgba(77,127,255,0.5)' }}
            />
          )}
        </div>

        <span
          className="font-mono text-[9px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(248,250,255,0.2)' }}
        >
          INITIALISING
        </span>
      </div>
    </div>
  )
}
