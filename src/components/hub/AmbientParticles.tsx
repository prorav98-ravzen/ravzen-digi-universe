'use client'

/**
 * AmbientParticles — Slow-drifting translucent energy particles.
 *
 * Performance constraints:
 *   - 16 particles max (safe on low-end mobile GPU).
 *   - Pure CSS animation — no requestAnimationFrame, no JS per frame.
 *   - Single shared @keyframes `ambientDrift` — declared in globals.css.
 *   - Per-particle opacity set via CSS custom property `--max-op`.
 *   - GPU-composited: only `opacity` and `transform` animate.
 *   - Reduced motion: component returns null entirely.
 *
 * Each particle drifts upward and fades out on a different timing cycle
 * giving variety without needing unique keyframe names per particle.
 */

import { useReducedMotion } from '@/hooks/useReducedMotion'

// ── Deterministic seed ────────────────────────────────────────────────────────

function seed(i: number, a: number, b: number): number {
  return ((i * a + b) % 97) / 97
}

const COLORS = [
  'rgba(77,127,255,',
  'rgba(124,92,252,',
  'rgba(0,212,255,',
  'rgba(77,127,255,',
] as const

const PARTICLE_COUNT = 16

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id:     i,
  x:      5  + seed(i, 73, 17) * 88,
  yStart: 15 + seed(i, 41, 29) * 70,
  sz:     2  + seed(i, 11,  7) * 5,
  maxOp:  0.20 + seed(i, 19, 37) * 0.35,
  dur:    8  + seed(i, 23, 53) * 12,
  delay:  seed(i, 31, 43)      * 10,
  color:  COLORS[i % COLORS.length],
}))

// ── Component ─────────────────────────────────────────────────────────────────

export default function AmbientParticles() {
  const reduced = useReducedMotion()
  if (reduced) return null

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={
            {
              left:       `${p.x}%`,
              top:        `${p.yStart}%`,
              width:      `${p.sz}px`,
              height:     `${p.sz}px`,
              background: `${p.color}0.9)`,
              boxShadow:  `0 0 ${p.sz * 2.5}px ${p.color}0.4)`,
              // CSS custom property drives the keyframe opacity stops
              '--max-op':       String(p.maxOp),
              animation:        `ambientDrift ${p.dur}s ease-in-out ${p.delay}s infinite`,
              opacity:          0,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
