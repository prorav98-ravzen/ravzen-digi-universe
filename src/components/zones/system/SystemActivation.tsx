'use client'

/**
 * SystemActivation — Cinematic activation for the System zone.
 *
 * Stage: 'zone-enter' && activeZone === 'system'
 * Calls zoneReady() on completion.
 *
 * ─── 10-step sequence ──────────────────────────────────────────────────────
 *  1. Overlay fades in over the hub.                                 0.00s
 *  2. Energy object (orb) materialises above centre, pulses gold.   0.30s
 *  3. Orb descends into the dormant System Core.                    0.90s
 *  4. Core powers on — hex fills with gold, pulse ring expands.     1.35s
 *  5. Four tech blocks appear staggered (HTML / CSS / JS / NODE).   1.55s
 *  6. Energy particles travel from core to each block along lines.  2.00s
 *  7. All four lines brighten — full architecture activated.        2.55s
 *  8. Core pulses brightly — "SYSTEM ACTIVE" flash.                 2.80s
 *  9. Structure opens in four directions (blocks & core scatter).   3.00s
 * 10. Gold flash fills screen → zoneReady() called.                 3.55s
 *
 * Reduced motion: skips entire sequence; zoneReady() fires immediately.
 * All targets queried inside containerRef — no global DOM queries.
 * GSAP imported dynamically.
 * Timeline killed on unmount.
 * ───────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react'
import { useExperience }     from '@/store/experienceStore'
import { useReducedMotion }  from '@/hooks/useReducedMotion'
import SystemCoreSVG         from './SystemCoreSVG'

export default function SystemActivation() {
  const { zoneReady }  = useExperience()
  const reduced        = useReducedMotion()
  const containerRef   = useRef<HTMLDivElement>(null)
  const tlRef          = useRef<gsap.core.Timeline | null>(null)

  // Reduced-motion fast path
  useEffect(() => {
    if (!reduced) return
    zoneReady()
  }, [reduced, zoneReady])

  // Full cinematic path
  useEffect(() => {
    if (reduced) return
    let cancelled = false

    async function run() {
      const { gsap } = await import('gsap')
      if (cancelled) return

      const root = containerRef.current
      if (!root)   return

      // Overlay elements
      const orb          = root.querySelector<HTMLElement>('.sya-orb')
      const orbGlow      = root.querySelector<HTMLElement>('.sya-orb-glow')
      const impactFlash  = root.querySelector<HTMLElement>('.sya-impact-flash')
      const screenFlash  = root.querySelector<HTMLElement>('.sya-screen-flash')
      const svgWrap      = root.querySelector<HTMLElement>('.sya-core')

      if (!svgWrap) return

      // SVG data-part elements
      const core       = svgWrap.querySelector<HTMLElement>('[data-part="core"]')
      const coreFill   = svgWrap.querySelector<HTMLElement>('[data-part="core-fill"]')
      const corePulse  = svgWrap.querySelector<HTMLElement>('[data-part="core-pulse"]')
      const coreText   = svgWrap.querySelector<HTMLElement>('[data-part="core-text"]')
      const coreDot    = svgWrap.querySelector<HTMLElement>('[data-part="core-dot"]')

      const blocks     = ['html', 'css', 'js', 'node'].map((id) =>
        svgWrap.querySelector<HTMLElement>(`[data-part="block-${id}"]`)
      )
      const lines      = ['html', 'css', 'js', 'node'].map((id) =>
        svgWrap.querySelector<SVGLineElement>(`[data-part="line-${id}"]`)
      )
      const energies   = ['html', 'css', 'js', 'node'].map((id) =>
        svgWrap.querySelector<SVGCircleElement>(`[data-part="energy-${id}"]`)
      )

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete() { if (!cancelled) zoneReady() },
      })
      tlRef.current = tl

      // Step 1 — overlay fades in
      tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.30 }, 0)

      // Step 2 — energy orb materialises above core
      tl.fromTo(orb,
        { opacity: 0, scale: 0.3, y: -50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }, 0.30)
      tl.to(orb, { scale: 1.4, duration: 0.22, ease: 'power2.inOut', yoyo: true, repeat: 2 }, 0.65)
      tl.to(orbGlow, { scale: 3, opacity: 1, duration: 0.55 }, 0.65)

      // Step 3 — orb dives into core
      tl.to(orb,     { y: 140, scale: 0.15, opacity: 0, duration: 0.42, ease: 'power3.in' }, 0.90)
      tl.to(orbGlow, { scale: 0, opacity: 0, duration: 0.32 }, 0.90)

      // Impact flash
      tl.fromTo(impactFlash,
        { scale: 0, opacity: 1 },
        { scale: 7, opacity: 0, duration: 0.48, ease: 'power2.out' }, 1.30)

      // Step 4 — core powers on
      if (core) {
        tl.to(core, {
          stroke: '#ffb800',
          strokeWidth: 2,
          duration: 0.35,
        }, 1.35)
      }
      if (coreFill) {
        tl.to(coreFill, { fill: 'rgba(255,184,0,0.18)', stroke: '#ffb800', duration: 0.40 }, 1.38)
      }
      if (coreDot) {
        tl.to(coreDot, { fill: '#ffb800', r: 8, duration: 0.30 }, 1.40)
      }
      if (coreText) {
        tl.to(coreText, { fill: '#ffb800', opacity: 1, duration: 0.30 }, 1.45)
      }
      if (corePulse) {
        tl.fromTo(corePulse,
          { opacity: 0, scale: 0.3 },
          { opacity: 0.8, scale: 1.5, duration: 0.55, ease: 'power2.out' }, 1.38)
        tl.to(corePulse, { opacity: 0, scale: 2.5, duration: 0.50 }, 1.80)
      }

      // Step 5 — tech blocks appear with stagger
      blocks.forEach((block, i) => {
        if (block) {
          tl.fromTo(block,
            { opacity: 0, scale: 0.6 },
            { opacity: 1, scale: 1, duration: 0.40, ease: 'back.out(1.6)' },
            1.55 + i * 0.10
          )
        }
      })

      // Step 6 — energy particles travel from core to each block
      const blockPositions = [
        { tx: 0,    ty: -140 },   // top (HTML)
        { tx: 140,  ty: 0    },   // right (CSS)
        { tx: 0,    ty: 140  },   // bottom (JS)
        { tx: -140, ty: 0    },   // left (NODE)
      ]

      energies.forEach((energy, i) => {
        if (energy) {
          tl.to(energy,
            { opacity: 1, x: blockPositions[i].tx, y: blockPositions[i].ty, duration: 0.55, ease: 'power2.inOut' },
            2.00 + i * 0.08
          )
          tl.to(energy, { opacity: 0, duration: 0.20 }, 2.55 + i * 0.08)
        }
      })

      // Step 7 — connection lines brighten
      lines.forEach((line, i) => {
        if (line) {
          tl.to(line,
            { stroke: 'rgba(255,184,0,0.7)', strokeWidth: 2, strokeDasharray: '6 2', duration: 0.35 },
            2.50 + i * 0.06
          )
        }
      })

      // Step 8 — core flash "SYSTEM ACTIVE"
      if (coreFill) {
        tl.to(coreFill, { fill: 'rgba(255,184,0,0.45)', duration: 0.22, yoyo: true, repeat: 1 }, 2.80)
      }

      // Step 9 — structure opens in four directions (blocks scatter, core scales up then fades)
      const scatter = [
        { x: 0,    y: -80 },
        { x: 80,   y: 0   },
        { x: 0,    y: 80  },
        { x: -80,  y: 0   },
      ]
      blocks.forEach((block, i) => {
        if (block) {
          tl.to(block, {
            x: scatter[i].x, y: scatter[i].y,
            opacity: 0,
            scale: 0.7,
            duration: 0.52, ease: 'power2.in',
          }, 3.00)
        }
      })
      if (core) {
        tl.to(core, { scale: 1.6, opacity: 0, duration: 0.50, ease: 'power2.in', transformOrigin: '50% 50%' }, 3.05)
      }
      if (coreFill) {
        tl.to(coreFill, { scale: 2, opacity: 0, duration: 0.50, transformOrigin: '50% 50%' }, 3.05)
      }

      // Step 10 — gold flash → transition
      tl.fromTo(screenFlash,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, ease: 'power2.in' }, 3.42)
      tl.to(root, { opacity: 0, duration: 0.24 }, 3.62)
      // onComplete → zoneReady()
    }

    run()

    return () => {
      cancelled = true
      tlRef.current?.kill()
    }
  }, [reduced, zoneReady])

  if (reduced) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        zIndex:     'var(--z-zone)' as unknown as number,
        background: 'radial-gradient(ellipse at 50% 50%, #130a00 0%, #03040a 100%)',
        opacity:    0,
      }}
      role="presentation"
      aria-label="Entering System Zone"
      aria-hidden="true"
    >
      {/* ── Energy orb ──────────────────────────────────────── */}
      <div
        className="sya-orb absolute rounded-full"
        style={{
          width:     36, height: 36,
          background:'radial-gradient(circle, #ffd166 0%, #ffb800 55%, #7a3d00 100%)',
          boxShadow: '0 0 22px rgba(255,184,0,0.9)',
          top:       '12%', left: '50%',
          transform: 'translateX(-50%)',
          opacity:   0,
        }}
      />

      {/* Orb outer glow */}
      <div
        className="sya-orb-glow absolute rounded-full pointer-events-none"
        style={{
          width:     80, height: 80,
          background:'radial-gradient(circle, rgba(255,184,0,0.45) 0%, transparent 70%)',
          top:       'calc(12% - 22px)', left: '50%',
          transform: 'translateX(-50%)',
          opacity:   0,
        }}
      />

      {/* ── Impact flash ring ───────────────────────────────── */}
      <div
        className="sya-impact-flash absolute rounded-full pointer-events-none"
        style={{
          width:     30, height: 30,
          border:    '2px solid rgba(255,184,0,0.9)',
          top:       '50%', left: '50%',
          transform: 'translate(-50%, -50%) scale(0)',
          opacity:   0,
        }}
      />

      {/* ── System Core SVG ─────────────────────────────────── */}
      <div
        className="sya-core absolute"
        style={{
          top:       '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <SystemCoreSVG size={280} />
      </div>

      {/* ── Screen flash (final transition) ─────────────────── */}
      <div
        className="sya-screen-flash absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #ffb800 0%, #ff6b35 100%)',
          opacity:    0,
        }}
      />
    </div>
  )
}
