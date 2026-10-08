'use client'

/**
 * PortalIcon — animated futuristic portal SVG used as the intro CTA icon.
 *
 * Three concentric rings:
 *   outer  — slow clockwise spin
 *   middle — faster counter-clockwise spin
 *   inner  — pulsing glow dot at centre
 *
 * Reduced motion: all animations are disabled; icon renders as a static
 * geometric mark that still communicates "portal / entry point".
 *
 * Sizing: driven by a `size` prop (px). Defaults to 64.
 * The SVG is purely decorative — aria-hidden on the wrapper.
 */

import { useReducedMotion } from '@/hooks/useReducedMotion'

interface PortalIconProps {
  size?: number
  className?: string
}

export default function PortalIcon({ size = 64, className }: PortalIconProps) {
  const reduced = useReducedMotion()

  const cx = size / 2
  const cy = size / 2
  // Ring radii as fractions of the total size
  const rOuter  = size * 0.44
  const rMiddle = size * 0.34
  const rInner  = size * 0.20
  const rDot    = size * 0.07

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* ── Outer ring — slow clockwise ──────────────────────────────── */}
      <circle
        cx={cx} cy={cy} r={rOuter}
        stroke="rgba(77,127,255,0.22)"
        strokeWidth={size * 0.018}
        strokeDasharray={`${rOuter * 0.6} ${rOuter * 0.4}`}
        style={reduced ? undefined : {
          transformOrigin: `${cx}px ${cy}px`,
          animation: 'spin-slow 18s linear infinite',
        }}
      />

      {/* Corner ticks at 0 / 90 / 180 / 270 degrees on outer ring */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x1 = cx + (rOuter - size * 0.06) * Math.cos(rad)
        const y1 = cy + (rOuter - size * 0.06) * Math.sin(rad)
        const x2 = cx + (rOuter + size * 0.03) * Math.cos(rad)
        const y2 = cy + (rOuter + size * 0.03) * Math.sin(rad)
        return (
          <line
            key={deg}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(77,127,255,0.5)"
            strokeWidth={size * 0.022}
            strokeLinecap="round"
          />
        )
      })}

      {/* ── Middle ring — counter-clockwise ─────────────────────────── */}
      <circle
        cx={cx} cy={cy} r={rMiddle}
        stroke="rgba(124,92,252,0.35)"
        strokeWidth={size * 0.015}
        strokeDasharray={`${rMiddle * 1.2} ${rMiddle * 0.8}`}
        style={reduced ? undefined : {
          transformOrigin: `${cx}px ${cy}px`,
          animation: 'spin-reverse 10s linear infinite',
        }}
      />

      {/* ── Inner ring — static reference circle ────────────────────── */}
      <circle
        cx={cx} cy={cy} r={rInner}
        stroke="rgba(77,127,255,0.4)"
        strokeWidth={size * 0.012}
      />

      {/* Diagonal cross inside inner ring */}
      <line
        x1={cx - rInner * 0.6} y1={cy - rInner * 0.6}
        x2={cx + rInner * 0.6} y2={cy + rInner * 0.6}
        stroke="rgba(77,127,255,0.25)"
        strokeWidth={size * 0.012}
      />
      <line
        x1={cx + rInner * 0.6} y1={cy - rInner * 0.6}
        x2={cx - rInner * 0.6} y2={cy + rInner * 0.6}
        stroke="rgba(77,127,255,0.25)"
        strokeWidth={size * 0.012}
      />

      {/* ── Centre dot — pulsing glow ────────────────────────────────── */}
      <circle
        cx={cx} cy={cy} r={rDot}
        fill="rgba(77,127,255,0.9)"
        style={reduced ? undefined : {
          animation: 'pulse-glow 2.5s ease-in-out infinite',
        }}
      />

      {/* Soft glow behind the centre dot (no filter, just a larger translucent circle) */}
      <circle
        cx={cx} cy={cy} r={rDot * 2.2}
        fill="rgba(77,127,255,0.12)"
        style={reduced ? undefined : {
          animation: 'pulse-glow 2.5s ease-in-out infinite',
          animationDelay: '0.4s',
        }}
      />
    </svg>
  )
}
