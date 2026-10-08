'use client'

/**
 * PortalDoor — Dimensional four-panel portal opening animation.
 *
 * Stage: 'portal'
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  The screen is divided into four panels:                    │
 * │    TOP    — slides upward    (-100% Y)                      │
 * │    BOTTOM — slides downward  (+100% Y)                      │
 * │    LEFT   — slides left      (-100% X)                      │
 * │    RIGHT  — slides right     (+100% X)                      │
 * │                                                             │
 * │  As the panels part, the dark universe void is revealed     │
 * │  behind them. An energy ring pulses at the seam.            │
 * │                                                             │
 * │  Sequence:                                                  │
 * │    0.0s  Energy ring pulses (tells the user something       │
 * │           is about to happen)                               │
 * │    0.3s  Panels begin separating                            │
 * │    0.3–1.5s  All four panels slide simultaneously           │
 * │    1.2s  Dark void expands behind panels                    │
 * │    1.6s  Brief scale/zoom toward the opening                │
 * │    1.9s  enterHub() called — transition to Hub              │
 * │                                                             │
 * │  Each panel surface has:                                    │
 * │    - Glass/metal gradient base                              │
 * │    - SVG geometric engravings                               │
 * │    - Edge energy glow toward the centre seam                │
 * │                                                             │
 * │  Reduced motion:                                            │
 * │    Skip the animation entirely — call enterHub() immediately│
 * └─────────────────────────────────────────────────────────────┘
 */

import { useEffect, useRef } from 'react'
import { useExperience }      from '@/store/experienceStore'
import { useReducedMotion }   from '@/hooks/useReducedMotion'

// ── Panel surface ─────────────────────────────────────────────────────────────

type PanelSide = 'top' | 'bottom' | 'left' | 'right'

function PanelSurface({ side }: { side: PanelSide }) {
  const isH = side === 'top' || side === 'bottom'

  // Glow edge faces inward toward the seam — computed without duplicate keys
  const glowStyle: React.CSSProperties = isH
    ? {
        position:  'absolute',
        left:      0,
        right:     0,
        height:    '45%',
        ...(side === 'top'    ? { bottom: 0 } : { top: 0 }),
        background:
          side === 'top'
            ? 'linear-gradient(to bottom, transparent, rgba(77,127,255,0.12))'
            : 'linear-gradient(to top, transparent, rgba(77,127,255,0.12))',
        pointerEvents: 'none',
      }
    : {
        position: 'absolute',
        top:      0,
        bottom:   0,
        width:    '45%',
        ...(side === 'left' ? { right: 0 } : { left: 0 }),
        background:
          side === 'left'
            ? 'linear-gradient(to right, transparent, rgba(77,127,255,0.12))'
            : 'linear-gradient(to left, transparent, rgba(77,127,255,0.12))',
        pointerEvents: 'none',
      }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #e8ecff 0%, #f0f2ff 35%, #e4e8fa 65%, #dde2f5 100%)',
      }}
    >
      {/* Glass reflection */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.3) 100%)',
        }}
      />

      {/* SVG geometric engravings */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Fine grid lines */}
        <defs>
          <pattern
            id={`panel-grid-${side}`}
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(77,127,255,0.1)"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#panel-grid-${side})`} />

        {/* Corner decorative squares */}
        <rect
          x={isH ? '3%'  : (side === 'left' ? '75%' : '3%')}
          y={isH ? (side === 'top' ? '68%' : '5%') : '3%'}
          width="14%"
          height={isH ? '22%' : '14%'}
          rx="3"
          fill="none"
          stroke="rgba(77,127,255,0.35)"
          strokeWidth="0.8"
        />
        <rect
          x={isH ? '3.8%' : (side === 'left' ? '76.5%' : '4.5%')}
          y={isH ? (side === 'top' ? '70%' : '7.5%') : '5%'}
          width="10%"
          height={isH ? '17%' : '10%'}
          rx="2"
          fill="none"
          stroke="rgba(77,127,255,0.2)"
          strokeWidth="0.5"
        />

        {/* Seam energy line */}
        {isH ? (
          <line
            x1="0"
            y1={side === 'top' ? '100%' : '0%'}
            x2="100%"
            y2={side === 'top' ? '100%' : '0%'}
            stroke="rgba(77,127,255,0.55)"
            strokeWidth="1.5"
          />
        ) : (
          <line
            x1={side === 'left' ? '100%' : '0%'}
            y1="0"
            x2={side === 'left' ? '100%' : '0%'}
            y2="100%"
            stroke="rgba(77,127,255,0.55)"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Edge glow toward seam */}
      <div style={glowStyle} />
    </div>
  )
}

// ── Energy ring (at portal seam) ──────────────────────────────────────────────

function EnergyRing() {
  return (
    <svg
      className="portal-ring absolute inset-0 m-auto pointer-events-none"
      style={{
        width:  'min(50vmin, 280px)',
        height: 'min(50vmin, 280px)',
        opacity: 0,
        // positioned at centre via margin auto + absolute
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
          <stop offset="30%" stopColor="rgba(77,127,255,0)"  />
          <stop offset="75%" stopColor="rgba(77,127,255,0.35)" />
          <stop offset="100%" stopColor="rgba(77,127,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#ring-glow)" />
      <circle
        cx="100" cy="100" r="86"
        stroke="rgba(77,127,255,0.6)"
        strokeWidth="1"
        strokeDasharray="22 11"
        style={{ transformOrigin: '100px 100px', animation: 'spin-slow 7s linear infinite' }}
      />
      <circle
        cx="100" cy="100" r="74"
        stroke="rgba(124,92,252,0.5)"
        strokeWidth="1"
        strokeDasharray="11 22"
        style={{ transformOrigin: '100px 100px', animation: 'spin-reverse 5s linear infinite' }}
      />
      {/* Cardinal ticks */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return (
          <line
            key={deg}
            x1={100 + 66 * Math.cos(rad)} y1={100 + 66 * Math.sin(rad)}
            x2={100 + 78 * Math.cos(rad)} y2={100 + 78 * Math.sin(rad)}
            stroke="rgba(77,127,255,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )
      })}
      {/* Centre dot */}
      <circle cx="100" cy="100" r="5" fill="rgba(77,127,255,0.9)" />
      <circle cx="100" cy="100" r="2.5" fill="white" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PortalDoor() {
  const { enterHub }   = useExperience()
  const reduced        = useReducedMotion()
  const containerRef   = useRef<HTMLDivElement>(null)
  const tlRef          = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    // Reduced motion: skip straight to hub with no delay
    if (reduced) {
      enterHub()
      return
    }

    let cancelled = false

    async function animate() {
      const { gsap } = await import('gsap')
      if (cancelled) return

      const el = containerRef.current
      if (!el) return

      const top    = el.querySelector<HTMLElement>('.panel-top')
      const bottom = el.querySelector<HTMLElement>('.panel-bottom')
      const left   = el.querySelector<HTMLElement>('.panel-left')
      const right  = el.querySelector<HTMLElement>('.panel-right')
      const ring   = el.querySelector<HTMLElement>('.portal-ring')
      const void_  = el.querySelector<HTMLElement>('.portal-void')

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete() {
          if (!cancelled) enterHub()
        },
      })
      tlRef.current = tl

      // 0.0 — energy ring pulses in
      tl.fromTo(
        ring,
        { opacity: 0, scale: 0.65 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
        0
      )

      // 0.3 — void starts to appear behind panels
      tl.fromTo(
        void_,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        0.3
      )

      // 0.3 — all four panels slide simultaneously
      const panelDur = 1.15
      tl.to(top,    { y: '-100%', duration: panelDur }, 0.3)
      tl.to(bottom, { y:  '100%', duration: panelDur }, 0.3)
      tl.to(left,   { x: '-100%', duration: panelDur }, 0.3)
      tl.to(right,  { x:  '100%', duration: panelDur }, 0.3)

      // 1.2 — ring fades as panels clear
      tl.to(ring, { opacity: 0, scale: 1.4, duration: 0.5, ease: 'power2.in' }, 1.0)

      // 1.6 — subtle zoom toward the centre (camera through portal effect)
      tl.to(el, { scale: 1.07, duration: 0.45, ease: 'power2.in' }, 1.4)

      // 1.85 — fade out entire container
      tl.to(el, { opacity: 0, duration: 0.28, ease: 'power1.in' }, 1.65)
      // onComplete fires here → enterHub()
    }

    animate()

    return () => {
      cancelled = true
      tlRef.current?.kill()
    }
  }, [reduced, enterHub])

  // If reduced motion, nothing to render — enterHub was called immediately
  if (reduced) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 'var(--z-portal)' as unknown as number }}
      role="presentation"
      aria-label="Entering the RAVZEN DIGI UNIVERSE"
      aria-hidden="true"
    >
      {/* Dark universe void revealed behind the panels */}
      <div
        className="portal-void absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 55%, #060918 0%, #03040a 100%)',
          opacity: 0,
        }}
      />

      {/* TOP panel */}
      <div
        className="panel-top absolute inset-x-0 top-0"
        style={{ height: '50%', transformOrigin: 'top center' }}
      >
        <PanelSurface side="top" />
      </div>

      {/* BOTTOM panel */}
      <div
        className="panel-bottom absolute inset-x-0 bottom-0"
        style={{ height: '50%', transformOrigin: 'bottom center' }}
      >
        <PanelSurface side="bottom" />
      </div>

      {/* LEFT panel — sits on top of top/bottom so z-index: 1 */}
      <div
        className="panel-left absolute inset-y-0 left-0"
        style={{ width: '50%', transformOrigin: 'left center', zIndex: 1 }}
      >
        <PanelSurface side="left" />
      </div>

      {/* RIGHT panel */}
      <div
        className="panel-right absolute inset-y-0 right-0"
        style={{ width: '50%', transformOrigin: 'right center', zIndex: 1 }}
      >
        <PanelSurface side="right" />
      </div>

      {/* Energy ring — absolutely centred, above panels */}
      <EnergyRing />
    </div>
  )
}
