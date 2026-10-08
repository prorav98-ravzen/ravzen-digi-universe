'use client'

/**
 * StarField — CSS-only animated star background.
 *
 * Three layers:
 *   small  — 120 dim stars, slow pulse
 *   medium —  50 brighter stars
 *   large  —  15 prominent stars with glow
 *
 * Positions are deterministic (seeded by index) to avoid
 * hydration mismatches from Math.random().
 *
 * Reduced motion: stars are rendered but their pulse animation
 * is suppressed via the global @media rule in globals.css.
 */

import { useMemo } from 'react'

interface Star {
  id:    number
  x:     number   // %
  y:     number   // %
  sz:    number   // px
  op:    number   // 0–1
  delay: number   // s
  dur:   number   // s
}

function seed(i: number, a: number, b: number) {
  return ((i * a + b) % 97) / 97
}

function makeStars(count: number, szMin: number, szMax: number, opMin: number, opMax: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id:    i,
    x:     seed(i, 73, 11)  * 100,
    y:     seed(i, 47, 31)  * 100,
    sz:    szMin + seed(i, 13, 7)  * (szMax - szMin),
    op:    opMin + seed(i, 19, 41) * (opMax - opMin),
    delay: seed(i, 29, 53)  * 6,
    dur:   3    + seed(i, 17, 23) * 4,
  }))
}

export default function StarField() {
  const small  = useMemo(() => makeStars(120, 0.6, 1.6, 0.15, 0.45), [])
  const medium = useMemo(() => makeStars( 50, 1.6, 2.6, 0.35, 0.65), [])
  const large  = useMemo(() => makeStars( 15, 2.6, 4.2, 0.55, 0.9 ), [])

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {small.map((s) => (
        <div
          key={`s${s.id}`}
          className="absolute rounded-full"
          style={{
            left:            `${s.x}%`,
            top:             `${s.y}%`,
            width:           `${s.sz}px`,
            height:          `${s.sz}px`,
            background:      'rgba(248,250,255,1)',
            opacity:         s.op,
            animation:       `pulse-glow ${s.dur}s ease-in-out infinite`,
            animationDelay:  `${s.delay}s`,
          }}
        />
      ))}

      {medium.map((s) => (
        <div
          key={`m${s.id}`}
          className="absolute rounded-full"
          style={{
            left:            `${s.x}%`,
            top:             `${s.y}%`,
            width:           `${s.sz}px`,
            height:          `${s.sz}px`,
            background:      'rgba(210,225,255,1)',
            opacity:         s.op,
            animation:       `pulse-glow ${s.dur}s ease-in-out infinite`,
            animationDelay:  `${s.delay}s`,
            boxShadow:       `0 0 ${s.sz * 2}px rgba(200,220,255,0.3)`,
          }}
        />
      ))}

      {large.map((s) => (
        <div
          key={`l${s.id}`}
          className="absolute rounded-full"
          style={{
            left:            `${s.x}%`,
            top:             `${s.y}%`,
            width:           `${s.sz}px`,
            height:          `${s.sz}px`,
            background:      'rgba(180,210,255,1)',
            opacity:         s.op,
            animation:       `pulse-glow ${s.dur}s ease-in-out infinite`,
            animationDelay:  `${s.delay}s`,
            boxShadow:       `0 0 ${s.sz * 3}px rgba(77,127,255,0.4)`,
          }}
        />
      ))}
    </div>
  )
}
