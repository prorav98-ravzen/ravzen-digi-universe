'use client'

/**
 * SoftwareActivation — Cinematic activation for the Software zone.
 *
 * Stage: 'zone-enter' && activeZone === 'software'
 * Calls zoneReady() on completion.
 *
 * ─── 11-step sequence ──────────────────────────────────────────────────────
 *  1. Overlay fades in over the hub.                                 0.00s
 *  2. Energy orb materialises above centre, pulses blue-violet.     0.30s
 *  3. Orb charges up (scale pulse × 2).                             0.65s
 *  4. Energy beam descends from orb toward the computer.            1.00s
 *  5. Orb dives into computer; impact flash.                        1.45s
 *  6. Computer "powers on": chassis rim illuminates.                1.52s
 *  7. Screen illuminates — gradient fills the panels.               1.65s
 *  8. Energy ring expands outward from screen centre.               1.75s
 *  9. "SOFTWARE ZONE" text reveals on screen.                       2.10s
 * 10. Four screen panels split outward (puzzle open):               2.70s
 *       TL → top-left, TR → top-right,
 *       BL → bottom-left, BR → bottom-right
 * 11. Blue-violet flash fills the screen → zoneReady().             3.20s
 *
 * Reduced motion: skips entire sequence; zoneReady() fires immediately.
 * All targets queried inside containerRef — no global DOM queries.
 * GSAP imported dynamically (out of initial bundle).
 * Timeline killed on unmount.
 * ───────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react'
import { useExperience }     from '@/store/experienceStore'
import { useReducedMotion }  from '@/hooks/useReducedMotion'
import ComputerSVG           from './ComputerSVG'

export default function SoftwareActivation() {
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

      const orb         = root.querySelector<HTMLElement>('.sa-orb')
      const orbGlow     = root.querySelector<HTMLElement>('.sa-orb-glow')
      const beam        = root.querySelector<HTMLElement>('.sa-beam')
      const impactFlash = root.querySelector<HTMLElement>('.sa-impact-flash')
      const screenFlash = root.querySelector<HTMLElement>('.sa-screen-flash')
      const svgWrap     = root.querySelector<HTMLElement>('.sa-computer')

      // Computer SVG data-part elements — guard first
      if (!svgWrap) return
      const body        = svgWrap.querySelector<HTMLElement>('[data-part="body"]')
      const statusLed   = svgWrap.querySelector<HTMLElement>('[data-part="status-led"]')
      const panelTL     = svgWrap.querySelector<HTMLElement>('[data-part="panel-tl"]')
      const panelTR     = svgWrap.querySelector<HTMLElement>('[data-part="panel-tr"]')
      const panelBL     = svgWrap.querySelector<HTMLElement>('[data-part="panel-bl"]')
      const panelBR     = svgWrap.querySelector<HTMLElement>('[data-part="panel-br"]')
      const screenText  = svgWrap.querySelector<HTMLElement>('[data-part="screen-text"]')
      const energyRing  = svgWrap.querySelector<HTMLElement>('[data-part="energy-ring"]')

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete() { if (!cancelled) zoneReady() },
      })
      tlRef.current = tl

      // Step 1 — overlay fades in
      tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.30 }, 0)

      // Step 2 — energy orb materialises
      tl.fromTo(orb,
        { opacity: 0, scale: 0.3, y: -30 },
        { opacity: 1, scale: 1,   y: 0, duration: 0.45, ease: 'back.out(2)' }, 0.30)

      // Step 3 — orb charges (scale pulse)
      tl.to(orb,
        { scale: 1.4, duration: 0.22, ease: 'power2.inOut', yoyo: true, repeat: 2 }, 0.65)
      tl.to(orbGlow,
        { scale: 2.8, opacity: 1, duration: 0.55 }, 0.65)

      // Step 4 — beam descends
      tl.fromTo(beam,
        { scaleY: 0, opacity: 0.9, transformOrigin: 'top center' },
        { scaleY: 1, opacity: 0.7, duration: 0.38, ease: 'power2.in' }, 1.00)

      // Step 5 — orb dives + impact flash
      tl.to(orb,     { y: 160, scale: 0.2, opacity: 0, duration: 0.38, ease: 'power3.in' }, 1.08)
      tl.to(orbGlow, { scale: 0, opacity: 0, duration: 0.28 }, 1.08)
      tl.to(beam,    { opacity: 0, duration: 0.12 }, 1.42)
      tl.fromTo(impactFlash,
        { scale: 0, opacity: 1 },
        { scale: 6, opacity: 0, duration: 0.45, ease: 'power2.out' }, 1.45)

      // Step 6 — chassis rim illuminates
      if (body) {
        tl.to(body,
          { stroke: '#4d7fff', strokeWidth: 1.8, duration: 0.35 }, 1.52)
      }
      if (statusLed) {
        tl.to(statusLed,
          { fill: '#4d7fff', duration: 0.25 }, 1.55)
      }

      // Step 7 — screen panels illuminate
      const panels = [panelTL, panelTR, panelBL, panelBR]
      tl.to(panels,
        { fill: '#0a1e40', duration: 0.35, stagger: 0.06 }, 1.65)

      // Step 8 — energy ring expands
      if (energyRing) {
        tl.fromTo(energyRing,
          { opacity: 0, scale: 0.2 },
          { opacity: 1, scale: 6, duration: 0.65, ease: 'power1.out' }, 1.75)
        tl.to(energyRing, { opacity: 0, duration: 0.30 }, 2.20)
      }

      // Step 9 — "SOFTWARE ZONE" text reveals
      if (screenText) {
        tl.to(screenText,
          { opacity: 1, duration: 0.35, ease: 'power2.out' }, 2.10)
        // Panels brighten as text appears
        tl.to(panels,
          { fill: '#0d2a5c', duration: 0.40 }, 2.12)
      }

      // Step 10 — four-piece puzzle panels split
      const splitDur = 0.52
      const splitEase = 'power2.inOut'
      const splitDist = 60   // px each panel moves

      if (panelTL) tl.to(panelTL, { x: -splitDist, y: -splitDist, duration: splitDur, ease: splitEase }, 2.70)
      if (panelTR) tl.to(panelTR, { x:  splitDist, y: -splitDist, duration: splitDur, ease: splitEase }, 2.70)
      if (panelBL) tl.to(panelBL, { x: -splitDist, y:  splitDist, duration: splitDur, ease: splitEase }, 2.70)
      if (panelBR) tl.to(panelBR, { x:  splitDist, y:  splitDist, duration: splitDur, ease: splitEase }, 2.70)

      // Screen text fades as panels separate
      if (screenText) tl.to(screenText, { opacity: 0, duration: 0.30 }, 2.78)

      // Chassis dims as panels open
      if (body) tl.to(body, { opacity: 0.5, duration: 0.40 }, 2.80)

      // Step 11 — blue-violet flash → transition
      tl.fromTo(screenFlash,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, ease: 'power2.in' }, 3.12)
      tl.to(root, { opacity: 0, duration: 0.22 }, 3.32)
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
        background: 'radial-gradient(ellipse at 50% 45%, #060820 0%, #03040a 100%)',
        opacity:    0,
      }}
      role="presentation"
      aria-label="Entering Software Zone"
      aria-hidden="true"
    >
      {/* ── Energy orb ────────────────────────────────────────── */}
      <div
        className="sa-orb absolute rounded-full"
        style={{
          width:     38, height: 38,
          background:'radial-gradient(circle, #a78bfa 0%, #4d7fff 55%, #2a1b6e 100%)',
          boxShadow: '0 0 22px rgba(77,127,255,0.9)',
          top:       '12%', left: '50%',
          transform: 'translateX(-50%)',
          opacity:   0,
        }}
      />

      {/* Orb outer glow */}
      <div
        className="sa-orb-glow absolute rounded-full pointer-events-none"
        style={{
          width:     80, height: 80,
          background:'radial-gradient(circle, rgba(77,127,255,0.45) 0%, transparent 70%)',
          top:       'calc(12% - 21px)', left: '50%',
          transform: 'translateX(-50%)',
          opacity:   0,
        }}
      />

      {/* ── Energy beam ───────────────────────────────────────── */}
      <div
        className="sa-beam absolute pointer-events-none"
        style={{
          width:           3,
          height:          '28%',
          top:             'calc(12% + 20px)',
          left:            '50%',
          transform:       'translateX(-50%) scaleY(0)',
          transformOrigin: 'top center',
          background:      'linear-gradient(to bottom, #4d7fff, rgba(124,92,252,0.4), transparent)',
          opacity:         0,
        }}
      />

      {/* ── Impact flash ring ─────────────────────────────────── */}
      <div
        className="sa-impact-flash absolute rounded-full pointer-events-none"
        style={{
          width:     32, height: 32,
          border:    '2px solid rgba(77,127,255,0.9)',
          top:       '50%', left: '50%',
          transform: 'translate(-50%, -50%) scale(0)',
          opacity:   0,
        }}
      />

      {/* ── Computer SVG ──────────────────────────────────────── */}
      <div
        className="sa-computer absolute"
        style={{
          top:       '50%',
          left:      '50%',
          transform: 'translate(-50%, -48%)',
        }}
      >
        <ComputerSVG size={260} />
      </div>

      {/* ── Screen flash (final transition) ───────────────────── */}
      <div
        className="sa-screen-flash absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #4d7fff 0%, #7c5cfc 100%)',
          opacity:    0,
        }}
      />
    </div>
  )
}
