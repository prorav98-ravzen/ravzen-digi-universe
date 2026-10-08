'use client'

/**
 * AndroidActivation — Cinematic activation sequence for the Android zone.
 *
 * Triggered when stage === 'zone-enter' && activeZone === 'android'.
 * Calls zoneReady() on completion → Android Lab renders.
 *
 * ─── 13-step sequence ──────────────────────────────────────────────────────
 *  1.  ANDROID card highlighted, others dim.                         0.00s
 *  2.  Energy core materialises above scene, pulses green.           0.30s
 *  3.  Energy beam descends from core.                               0.80s
 *  4.  RavzenBot appears (powered-off, dim).                         1.00s
 *  5.  Beam impacts the bot — flash.                                 1.35s
 *  6.  Bot "powers on": body brightens, charge line sweeps up.       1.40s
 *  7.  Eyes illuminate (cyan glow).                                  1.65s
 *  8.  Bot reacts — slight jump + bounce settle.                     1.80s
 *  9.  Antenna tip flashes.                                          1.95s
 * 10.  Gradient particles/bubbles burst outward.                     2.05s
 * 11.  Right arm waves twice.                                        2.20s
 * 12.  Bot walks toward door; door slides open.                      3.00s
 * 13.  Cyan flash fills screen → zoneReady() called.                 3.90s
 *
 * Performance:
 *  - All targets queried from containerRef (no global DOM queries).
 *  - GSAP imported dynamically (out of initial bundle).
 *  - Timeline killed + intervals cleared on unmount.
 *  - Particle bubbles: 12 CSS divs animated with GSAP stagger.
 *  - RavzenBot is SVG — zero canvas overhead.
 *
 * Reduced motion: entire sequence skipped; zoneReady() fires immediately.
 * ───────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react'
import { useExperience }     from '@/store/experienceStore'
import { useReducedMotion }  from '@/hooks/useReducedMotion'
import RavzenBot             from './RavzenBot'

// Bubble positions (deterministic to avoid hydration mismatch)
const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id:    i,
  angle: (360 / 12) * i,               // degrees
  dist:  55 + (i % 3) * 22,            // px from centre
  size:  5 + (i % 4) * 4,
  color: i % 2 === 0 ? '#00ff87' : '#00d4ff',
}))

export default function AndroidActivation() {
  const { zoneReady } = useExperience()
  const reduced       = useReducedMotion()
  const containerRef  = useRef<HTMLDivElement>(null)
  const tlRef         = useRef<gsap.core.Timeline | null>(null)

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

      // Core experience elements
      const core        = root.querySelector<HTMLElement>('.aa-core')
      const coreGlow    = root.querySelector<HTMLElement>('.aa-core-glow')
      const beam        = root.querySelector<HTMLElement>('.aa-beam')
      const botWrap     = root.querySelector<HTMLElement>('.aa-bot-wrap')
      const flash       = root.querySelector<HTMLElement>('.aa-impact-flash')
      const bubbles     = root.querySelectorAll<HTMLElement>('.aa-bubble')
      const door        = root.querySelector<HTMLElement>('.aa-door')
      const doorLeft    = root.querySelector<HTMLElement>('.aa-door-left')
      const doorRight   = root.querySelector<HTMLElement>('.aa-door-right')
      const screenFlash = root.querySelector<HTMLElement>('.aa-screen-flash')

      // Bot SVG parts — guard botWrap first so querySelector is never optional
      if (!botWrap) return
      const eyeL       = botWrap.querySelector<HTMLElement>('[data-part="eye-left"]')
      const eyeR       = botWrap.querySelector<HTMLElement>('[data-part="eye-right"]')
      const armRight   = botWrap.querySelector<HTMLElement>('[data-part="arm-right"]')
      const body       = botWrap.querySelector<HTMLElement>('[data-part="body"]')
      const chestDot   = botWrap.querySelector<HTMLElement>('[data-part="chest-indicator"]')
      const antOrb     = botWrap.querySelector<HTMLElement>('[data-part="antenna-orb"]')
      const bodyTrim   = botWrap.querySelector<HTMLElement>('[data-part="body-trim"]')
      const chargeLine = botWrap.querySelector<HTMLElement>('[data-part="charge-line"]')
      const legL       = botWrap.querySelector<HTMLElement>('[data-part="leg-left"]')
      const legR       = botWrap.querySelector<HTMLElement>('[data-part="leg-right"]')

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete() { if (!cancelled) zoneReady() },
      })
      tlRef.current = tl

      // Step 1 — overlay fades in
      tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.30 }, 0)

      // Step 2 — energy core materialises + pulses
      tl.fromTo(core,
        { opacity: 0, scale: 0.3, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.40, ease: 'back.out(2)' }, 0.30)
      tl.to(core, { scale: 1.3, duration: 0.20, ease: 'power2.inOut', yoyo: true, repeat: 3 }, 0.65)
      tl.to(coreGlow, { scale: 2.5, opacity: 1, duration: 0.50 }, 0.65)

      // Step 3 — energy beam descends
      tl.fromTo(beam,
        { scaleY: 0, opacity: 0.9, transformOrigin: 'top center' },
        { scaleY: 1, opacity: 0.75, duration: 0.35, ease: 'power2.in' }, 0.80)

      // Step 4 — bot appears (powered-off — dim, no glow)
      tl.fromTo(botWrap,
        { opacity: 0, y: 12 },
        { opacity: 0.55, y: 0, duration: 0.30 }, 1.00)

      // Step 5 — beam impacts bot, impact flash
      tl.to(beam, { opacity: 0, duration: 0.10 }, 1.35)
      tl.fromTo(flash,
        { scale: 0, opacity: 1 },
        { scale: 5, opacity: 0, duration: 0.40, ease: 'power2.out' }, 1.35)

      // Step 6 — bot powers on: body brightens, charge sweep
      tl.to(botWrap, { opacity: 1, duration: 0.25 }, 1.40)
      tl.fromTo(chargeLine,
        { opacity: 0, scaleX: 0, transformOrigin: 'left center' },
        { opacity: 1, scaleX: 1, duration: 0.40, ease: 'power2.out' }, 1.40)
      tl.to(chargeLine, { opacity: 0, duration: 0.20 }, 1.78)
      tl.to(body,
        { stroke: '#00d4ff', fill: 'url(#rbBodyGrad)', duration: 0.30 }, 1.42)
      tl.to(bodyTrim,
        { fill: '#00d4ff', opacity: 1, duration: 0.30 }, 1.42)
      tl.to(chestDot,
        { fill: '#00ff87', opacity: 1, duration: 0.25 }, 1.50)

      // Step 7 — eyes illuminate
      tl.to([eyeL, eyeR],
        { fill: '#00d4ff', stroke: '#00ff87', duration: 0.25, stagger: 0.08 }, 1.65)

      // Step 8 — bot reacts (small jump)
      tl.to(botWrap, {
        y: -14, duration: 0.20, ease: 'power2.out',
      }, 1.80)
      tl.to(botWrap, {
        y: 0, duration: 0.35, ease: 'bounce.out',
      }, 2.00)

      // Step 9 — antenna orb flashes
      tl.to(antOrb,
        { fill: '#00ff87', r: 8, duration: 0.15, yoyo: true, repeat: 3 }, 1.95)

      // Step 10 — bubble burst
      bubbles.forEach((b, i) => {
        const rad = ((BUBBLES[i].angle - 90) * Math.PI) / 180
        const dx  = BUBBLES[i].dist * Math.cos(rad)
        const dy  = BUBBLES[i].dist * Math.sin(rad)
        tl.fromTo(b,
          { opacity: 0, x: 0, y: 0, scale: 0 },
          { opacity: 1, x: dx, y: dy, scale: 1, duration: 0.45,
            ease: 'back.out(1.6)' },
          2.05 + i * 0.025)
        tl.to(b, { opacity: 0, scale: 0.5, duration: 0.35 }, 2.55 + i * 0.025)
      })

      // Step 11 — right arm waves twice
      tl.to(armRight, {
        rotate: -55,
        duration: 0.25, ease: 'power2.out',
        transformOrigin: '50% 10%',
      }, 2.20)
      tl.to(armRight, {
        rotate: -10,
        duration: 0.22, ease: 'power2.inOut',
        transformOrigin: '50% 10%',
      }, 2.45)
      tl.to(armRight, {
        rotate: -55,
        duration: 0.22, ease: 'power2.out',
        transformOrigin: '50% 10%',
      }, 2.67)
      tl.to(armRight, {
        rotate: 0,
        duration: 0.25, ease: 'power2.inOut',
        transformOrigin: '50% 10%',
      }, 2.89)

      // Step 12 — bot walks toward door (leg alternation + body shift)
      // Show door
      tl.to(door, { opacity: 1, duration: 0.20 }, 3.00)

      // Walk: 3 steps — legs alternate, body shifts right
      const walkStep = 0.20
      for (let step = 0; step < 3; step++) {
        const t = 3.05 + step * walkStep * 2
        tl.to(legL, { y: -8, duration: walkStep, ease: 'power2.out' }, t)
        tl.to(legL, { y: 0,  duration: walkStep, ease: 'power2.in'  }, t + walkStep)
        tl.to(legR, { y: -8, duration: walkStep, ease: 'power2.out' }, t + walkStep)
        tl.to(legR, { y: 0,  duration: walkStep, ease: 'power2.in'  }, t + walkStep * 2)
        tl.to(botWrap, { x: `+=${22}`, duration: walkStep * 2, ease: 'none' }, t)
      }

      // Door slides open
      tl.to(doorLeft,  { x: -55, duration: 0.40, ease: 'power2.inOut' }, 3.40)
      tl.to(doorRight, { x:  55, duration: 0.40, ease: 'power2.inOut' }, 3.40)

      // Bot enters door
      tl.to(botWrap, { x: '+=80', opacity: 0, duration: 0.40, ease: 'power2.in' }, 3.50)

      // Step 13 — cyan flash → transition
      tl.fromTo(screenFlash,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.in' }, 3.70)
      tl.to(root, { opacity: 0, duration: 0.22 }, 3.88)
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
        background: 'radial-gradient(ellipse at 50% 45%, #031a10 0%, #03040a 100%)',
        opacity:    0,
      }}
      role="presentation"
      aria-label="Entering Android Zone"
      aria-hidden="true"
    >
      {/* ── Energy core ──────────────────────────────────────── */}
      <div
        className="aa-core absolute rounded-full"
        style={{
          width:        40, height:   40,
          top:          '12%', left: '50%',
          transform:    'translateX(-50%)',
          background:   'radial-gradient(circle, #00ff87 0%, #00d4ff 60%, #004433 100%)',
          boxShadow:    '0 0 24px rgba(0,255,135,0.9)',
          opacity:      0,
        }}
      />
      {/* Core outer glow */}
      <div
        className="aa-core-glow absolute rounded-full"
        style={{
          width:        80, height: 80,
          top:          'calc(12% - 20px)', left: '50%',
          transform:    'translateX(-50%)',
          background:   'radial-gradient(circle, rgba(0,255,135,0.4) 0%, transparent 70%)',
          opacity:      0,
          pointerEvents:'none',
        }}
      />

      {/* ── Energy beam ──────────────────────────────────────── */}
      <div
        className="aa-beam absolute"
        style={{
          width:           3,
          height:          '30%',
          top:             'calc(12% + 22px)',
          left:            '50%',
          transform:       'translateX(-50%) scaleY(0)',
          transformOrigin: 'top center',
          background:      'linear-gradient(to bottom, #00ff87, rgba(0,212,255,0.3), transparent)',
          opacity:         0,
          pointerEvents:   'none',
        }}
      />

      {/* ── Impact flash ─────────────────────────────────────── */}
      <div
        className="aa-impact-flash absolute rounded-full pointer-events-none"
        style={{
          width:     36, height: 36,
          top:       '50%', left: '50%',
          transform: 'translate(-50%, -50%) scale(0)',
          border:    '2px solid rgba(0,255,135,0.9)',
          opacity:   0,
        }}
      />

      {/* ── RavzenBot wrapper ────────────────────────────────── */}
      <div
        className="aa-bot-wrap absolute"
        style={{
          bottom: '22%',
          left:   '50%',
          transform: 'translateX(-50%)',
          opacity: 0,
        }}
      >
        <RavzenBot size={110} />
      </div>

      {/* ── Particle bubbles ─────────────────────────────────── */}
      <div
        className="aa-bubble-origin absolute pointer-events-none"
        style={{ bottom: '38%', left: '50%' }}
      >
        {BUBBLES.map((b) => (
          <div
            key={b.id}
            className="aa-bubble absolute rounded-full"
            style={{
              width:     b.size,
              height:    b.size,
              marginLeft:-b.size / 2,
              marginTop: -b.size / 2,
              background:b.color,
              boxShadow: `0 0 ${b.size * 2}px ${b.color}`,
              opacity:   0,
            }}
          />
        ))}
      </div>

      {/* ── Android Zone door ────────────────────────────────── */}
      <div
        className="aa-door absolute overflow-hidden flex"
        style={{
          right:   '10%',
          bottom:  '15%',
          width:   110,
          height:  130,
          opacity: 0,
        }}
      >
        <div
          className="aa-door-left h-full"
          style={{
            flex:       1,
            background: 'linear-gradient(135deg, rgba(0,255,135,0.1), rgba(0,212,255,0.08))',
            border:     '1px solid rgba(0,255,135,0.3)',
            borderRight:'none',
            borderRadius:'8px 0 0 8px',
          }}
        />
        <div
          className="aa-door-right h-full"
          style={{
            flex:       1,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,255,135,0.1))',
            border:     '1px solid rgba(0,255,135,0.3)',
            borderLeft: 'none',
            borderRadius:'0 8px 8px 0',
          }}
        />
      </div>

      {/* ── Screen flash ─────────────────────────────────────── */}
      <div
        className="aa-screen-flash absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
          opacity:    0,
        }}
      />
    </div>
  )
}
