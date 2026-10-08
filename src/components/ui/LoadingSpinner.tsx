/**
 * LoadingSpinner — full-page and inline loading indicators.
 */

import { cn } from '@/lib/utils/cn'

interface SpinnerProps {
  /** Visual size */
  size?: 'sm' | 'md' | 'lg'
  /** Colour accent */
  color?: string
  className?: string
  label?: string
}

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 40,
} as const

/**
 * Inline spinner — SVG ring with CSS animation.
 * Does NOT use Tailwind animate-spin so it respects
 * the reduced-motion CSS override in globals.css.
 */
export function Spinner({ size = 'md', color, className, label = 'Loading' }: SpinnerProps) {
  const px = SIZE_MAP[size]
  const c  = color ?? 'var(--color-energy-blue)'
  const r  = px / 2 - 3

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      className={cn('animate-spin-slow', className)}
      aria-label={label}
      role="status"
    >
      {/* Track */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2"
      />
      {/* Arc */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={`${r * 1.2} ${r * 5}`}
        style={{ filter: `drop-shadow(0 0 4px ${c})` }}
      />
    </svg>
  )
}

/** Full-page loading overlay */
export function PageLoader({ message }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--color-void)', zIndex: 'var(--z-overlay)' }}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      {message && (
        <p className="type-label text-[rgba(248,250,255,0.5)] mt-2">{message}</p>
      )}
    </div>
  )
}

/** Section-level loading state */
export function SectionLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center py-16', className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size="md" />
    </div>
  )
}
