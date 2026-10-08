'use client'

/**
 * StarField — Enhanced depth-layered star background with celestial objects.
 *
 * Performance design:
 *   - Three star tiers: small (60), medium (28), large (10)
 *   - Counts are deliberately LOW for mobile GPU safety.
 *   - All positions deterministic (no Math.random) — no hydration mismatch.
 *   - Pure CSS divs — no canvas, no requestAnimationFrame loop.
 *   - Animations via CSS keyframes (GPU-composited opacity only).
 *   - Reduced motion: animations disabled globally via globals.css media rule.
 *   - Celestial objects (1 distant planet, 1 moon): CSS ellipses with gradient.
 *
 * DOM node count on mobile: 60 + 28 + 10 + 2 = 100 nodes total (safe).
 */

import { useMemo } from 'react'

// ── Deterministic seed ────────────────────────────────────────────────────────

function seed(i: number, a: number, b: number): number {
  return ((i * a + b) % 97) / 97
}

interface Star {
  id:    number
  x:     number
  y:     number
  sz:    number
  op:    number
  delay: number
  dur:   number
}

function makeStars(
  count: number,
  szMin: number, szMax: number,
  opMin: number, opMax: number
): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id:    i,
    x:     seed(i, 73, 11) * 100,
    y:     seed(i, 47, 31) * 100,
    sz:    szMin + seed(i, 13, 7)  * (szMax - szMin),
    op:    opMin + seed(i, 19, 41) * (opMax - opMin),
    delay: seed(i, 29, 53) * 7,
    dur:   3.5 + seed(i, 17, 23)   * 4.5,
  }))
}

// ── Celestial objects ─────────────────────────────────────────────────────────

function DistantPlanet() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        right:  '8%',
        top:    '12%',
        width:  'clamp(70px, 10vw, 130px)',
        height: 'clamp(70px, 10vw, 130px)',
        borderRadius: '50%',
        background: [
          'radial-gradient(circle at 38% 38%,',
          '  rgba(20, 15, 55, 0.95) 0%,',
          '  rgba(10, 8, 35, 0.92) 55%,',
          '  rgba(5, 4, 18, 0.88) 100%)',
        ].join(' '),
        boxShadow: [
          'inset -8px -8px 20px rgba(0,0,0,0.7)',
          'inset 3px 3px 12px rgba(124,92,252,0.15)',
          '0 0 40px rgba(124,92,252,0.08)',
          '0 0 80px rgba(124,92,252,0.04)',
        ].join(', '),
        // Subtle ring via outline
        outline: '1px solid rgba(124,92,252,0.12)',
        outlineOffset: '6px',
        opacity: 0.65,
      }}
      aria-hidden="true"
    >
      {/* Surface banding — 2 subtle horizontal strips */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: [
            'linear-gradient(175deg,',
            '  transparent 30%,',
            '  rgba(124,92,252,0.06) 38%,',
            '  transparent 45%,',
            '  rgba(77,127,255,0.05) 60%,',
            '  transparent 68%)',
          ].join(' '),
        }}
      />
    </div>
  )
}

function DistantMoon() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left:   '6%',
        bottom: '22%',
        width:  'clamp(28px, 4vw, 52px)',
        height: 'clamp(28px, 4vw, 52px)',
        borderRadius: '50%',
        background: [
          'radial-gradient(circle at 35% 35%,',
          '  rgba(180, 190, 220, 0.18) 0%,',
          '  rgba(90, 100, 140, 0.12) 50%,',
          '  rgba(20, 22, 45, 0.10) 100%)',
        ].join(' '),
        boxShadow: [
          'inset -4px -4px 10px rgba(0,0,0,0.5)',
          '0 0 20px rgba(77,127,255,0.06)',
        ].join(', '),
        border: '1px solid rgba(160,175,220,0.10)',
        opacity: 0.55,
      }}
      aria-hidden="true"
    />
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StarField() {
  // Capped counts for mobile GPU safety
  const small  = useMemo(() => makeStars(60, 0.5, 1.4, 0.12, 0.40), [])
  const medium = useMemo(() => makeStars(28, 1.4, 2.4, 0.30, 0.60), [])
  const large  = useMemo(() => makeStars(10, 2.4, 4.0, 0.50, 0.85), [])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Celestial objects — deepest layer */}
      <DistantPlanet />
      <DistantMoon />

      {/* Small stars */}
      {small.map((s) => (
        <div
          key={`ss${s.id}`}
          className="absolute rounded-full"
          style={{
            left:           `${s.x}%`,
            top:            `${s.y}%`,
            width:          `${s.sz}px`,
            height:         `${s.sz}px`,
            background:     'rgba(248,250,255,1)',
            opacity:        s.op,
            animation:      `pulse-glow ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Medium stars */}
      {medium.map((s) => (
        <div
          key={`sm${s.id}`}
          className="absolute rounded-full"
          style={{
            left:           `${s.x}%`,
            top:            `${s.y}%`,
            width:          `${s.sz}px`,
            height:         `${s.sz}px`,
            background:     'rgba(210,225,255,1)',
            opacity:        s.op,
            animation:      `pulse-glow ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
            boxShadow:      `0 0 ${s.sz * 2}px rgba(200,220,255,0.25)`,
          }}
        />
      ))}

      {/* Large bright stars with glow */}
      {large.map((s) => (
        <div
          key={`sl${s.id}`}
          className="absolute rounded-full"
          style={{
            left:           `${s.x}%`,
            top:            `${s.y}%`,
            width:          `${s.sz}px`,
            height:         `${s.sz}px`,
            background:     'rgba(180,210,255,1)',
            opacity:        s.op,
            animation:      `pulse-glow ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
            boxShadow:      `0 0 ${s.sz * 3}px rgba(77,127,255,0.35)`,
          }}
        />
      ))}
    </div>
  )
}
