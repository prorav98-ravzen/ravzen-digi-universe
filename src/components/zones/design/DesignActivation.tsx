'use client'

/**
 * DesignActivation — Cinematic activation sequence for the Design zone.
 *
 * Triggered when stage === 'zone-enter' && activeZone === 'design'.
 * Calls zoneReady() on completion so the orchestrator shows the Design Lab.
 *
 * ─── 11-step sequence ──────────────────────────────────────────────────────
 *  1. Hub cards visible. DESIGN card highlighted; others dim.        0.00s
 *  2. Energy orb materialises above the grid.                        0.40s
 *  3. Orb pulses — charges up.                                       0.70s
 *  4. Orb accelerates downward toward the Design Core.               1.10s
 *  5. Impact flash — orb enters the Core.                            1.55s
 *  6. Energy transfer: purple–pink gradient ripple spreads outward.  1.60s
 *  7. Gradient illumination fills the Core shell.                    1.75s
 *  8. Scrambled letter blocks appear inside the Core.                1.90s
 *  9. Letters randomise briefly then lock into: D-E-S-I-G-N.         2.00s
 * 10. Completed Core splits open in four directions.                 2.80s
 * 11. White flash fills the screen → zoneReady() called.             3.30s
 *
 * Reduced motion: entire sequence is skipped; zoneReady() fires immediately.
 *
 * Architecture:
 *  - Overlay sits above the Hub (z-zone = 30) and below modals.
 *  - All animation targets are selected from containerRef — no global DOM queries.
 *  - GSAP is imported dynamically; the timeline is killed on unmount.
 *  - The Hub remains mounted beneath this overlay the whole time (no teardown).
 * ───────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react'
import { useExperience }     from '@/store/experienceStore'
import { useReducedMotion }  from '@/hooks/useReducedMotion'

// ── Letter scrambler helpers ──────────────────────────────────────────────────

const WORD    = 'DESIGN'
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'

function scramble(el: HTMLElement, targetChar: string, onDone: () => void) {
  let ticks = 0
  const MAX  = 10
  const id   = setInterval(() => {
    el.textContent = ticks >= MAX
      ? targetChar
      : CHARSET[Math.floor(Math.random() * CHARSET.length)]
    if (++ticks > MAX) { clearInterval(id); onDone() }
  }, 45)
  return id
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DesignActivation() {
  const { zoneReady }  = useExperience()
  const reduced        = useReducedMotion()
  const containerRef   = useRef<HTMLDivElement>(null)
  const tlRef          = useRef<gsap.core.Timeline | null>(null)
  const intervalIds    = useRef<ReturnType<typeof setInterval>[]>([])

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

      const root    = containerRef.current
      if (!root)    return

      const orb          = root.querySelector<HTMLElement>('.da-orb')
      const orbGlow      = root.querySelector<HTMLElement>('.da-orb-glow')
      const core         = root.querySelector<HTMLElement>('.da-core')
      const coreShell    = root.querySelector<HTMLElement>('.da-core-shell')
      const coreRipple   = root.querySelector<HTMLElement>('.da-ripple')
      const letterWrap   = root.querySelector<HTMLElement>('.da-letters')
      const letters      = root.querySelectorAll<HTMLElement>('.da-letter')
      const panelTop     = root.querySelector<HTMLElement>('.da-panel-top')
      const panelBottom  = root.querySelector<HTMLElement>('.da-panel-bottom')
      const panelLeft    = root.querySelector<HTMLElement>('.da-panel-left')
      const panelRight   = root.querySelector<HTMLElement>('.da-panel-right')
      const flash        = root.querySelector<HTMLElement>('.da-flash')

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete() { if (!cancelled) zoneReady() },
      })
      tlRef.current = tl

      // Step 1 — overlay fades in (hub cards already visible underneath)
      tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0)

      // Step 2 — orb materialises above core
      tl.fromTo(orb,
        { opacity: 0, y: -80, scale: 0.4 },
        { opacity: 1, y: 0,   scale: 1,   duration: 0.45, ease: 'back.out(1.8)' }, 0.40)

      // Step 3 — orb pulses (charges up)
      tl.to(orb, {
        scale: 1.35, duration: 0.22, ease: 'power2.inOut', yoyo: true, repeat: 2,
      }, 0.70)
      tl.to(orbGlow, {
        scale: 2.2, opacity: 0.9, duration: 0.55, ease: 'power2.out',
      }, 0.70)

      // Step 4 — orb dives into core
      tl.to(orb,     { y: 140, scale: 0.25, duration: 0.38, ease: 'power3.in' },  1.10)
      tl.to(orbGlow, { scale: 0,  opacity: 0, duration: 0.30 },                   1.10)

      // Step 5 — impact flash
      tl.to(orb, { opacity: 0, duration: 0.05 }, 1.55)
      tl.fromTo('.da-impact',
        { scale: 0, opacity: 1 },
        { scale: 3.5, opacity: 0, duration: 0.45, ease: 'power2.out' }, 1.55)

      // Step 6 — energy ripple spreads
      tl.fromTo(coreRipple,
        { scale: 0, opacity: 0.9 },
        { scale: 4.5, opacity: 0, duration: 0.70, ease: 'power1.out' }, 1.60)

      // Step 7 — core shell illuminates with gradient
      tl.to(coreShell, {
        borderColor: '#b44dff',
        boxShadow:   '0 0 40px rgba(180,77,255,0.7), 0 0 80px rgba(180,77,255,0.3), inset 0 0 30px rgba(180,77,255,0.2)',
        background:  'linear-gradient(135deg, rgba(180,77,255,0.18) 0%, rgba(255,77,157,0.12) 100%)',
        duration: 0.55, ease: 'power2.out',
      }, 1.75)
      tl.to(core, { scale: 1.08, duration: 0.30, ease: 'back.out(1.2)', yoyo: true, repeat: 1 }, 1.75)

      // Step 8 — letter blocks appear
      tl.fromTo(letterWrap,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1,  duration: 0.35, ease: 'back.out(2)' }, 1.90)

      // Step 9 — scramble each letter with stagger, then lock to D-E-S-I-G-N
      tl.call(() => {
        if (cancelled) return
        letters.forEach((el, i) => {
          setTimeout(() => {
            if (cancelled) return
            const id = scramble(el, WORD[i], () => { /* letter locked */ })
            intervalIds.current.push(id)
          }, i * 75)
        })
      }, [], 2.00)

      // Step 10 — after scramble time (6 letters × 75ms delay + ~450ms scramble ≈ 0.90s)
      // Core panels split open in four directions
      tl.to(panelTop,    { y: '-55%', duration: 0.50, ease: 'power2.inOut' }, 2.80)
      tl.to(panelBottom, { y:  '55%', duration: 0.50, ease: 'power2.inOut' }, 2.80)
      tl.to(panelLeft,   { x: '-55%', duration: 0.50, ease: 'power2.inOut' }, 2.80)
      tl.to(panelRight,  { x:  '55%', duration: 0.50, ease: 'power2.inOut' }, 2.80)

      tl.to(coreShell, {
        scale: 1.5, opacity: 0, duration: 0.45, ease: 'power2.in',
      }, 2.85)
      tl.to(letterWrap, { scale: 1.6, opacity: 0, duration: 0.40 }, 2.90)

      // Step 11 — white flash → transition
      tl.fromTo(flash,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, ease: 'power2.in' }, 3.10)
      tl.to(root, { opacity: 0, duration: 0.22 }, 3.35)
      // onComplete fires zoneReady()
    }

    const intervalSnapshot = intervalIds.current

    run()

    return () => {
      cancelled = true
      tlRef.current?.kill()
      intervalSnapshot.forEach(clearInterval)
    }
  }, [reduced, zoneReady])

  if (reduced) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        zIndex:     'var(--z-zone)' as unknown as number,
        background: 'radial-gradient(ellipse at 50% 40%, #07041a 0%, #03040a 100%)',
        opacity: 0,
      }}
      role="presentation"
      aria-label="Entering Design Zone"
      aria-hidden="true"
    >
      {/* ── Energy orb ────────────────────────────────────────────── */}
      <div
        className="da-orb absolute"
        style={{
          width:        36, height:  36,
          borderRadius: '50%',
          background:   'radial-gradient(circle, #ff4d9d 0%, #b44dff 60%, #7c2fff 100%)',
          boxShadow:    '0 0 24px rgba(180,77,255,0.9)',
          top:          '22%',
          left:         '50%',
          transform:    'translateX(-50%)',
          opacity:      0,
        }}
      />

      {/* Orb outer glow ring */}
      <div
        className="da-orb-glow absolute"
        style={{
          width:        80, height: 80,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(180,77,255,0.5) 0%, transparent 70%)',
          top:          'calc(22% - 22px)',
          left:         '50%',
          transform:    'translateX(-50%)',
          opacity:      0,
        }}
      />

      {/* Impact flash ring */}
      <div
        className="da-impact absolute rounded-full"
        style={{
          width:        40, height: 40,
          borderRadius: '50%',
          border:       '2px solid rgba(180,77,255,0.9)',
          top:          '50%', left: '50%',
          transform:    'translate(-50%, -50%) scale(0)',
          opacity:      0,
        }}
      />

      {/* ── Design Core ───────────────────────────────────────────── */}
      <div
        ref={undefined}
        className="da-core absolute flex items-center justify-center"
        style={{
          width: 220, height: 220,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Core shell — the activating ring */}
        <div
          className="da-core-shell absolute inset-0 rounded-2xl"
          style={{
            border:     '1px solid rgba(180,77,255,0.2)',
            background: 'rgba(180,77,255,0.04)',
            transition: 'none',
          }}
        />

        {/* Energy ripple */}
        <div
          className="da-ripple absolute rounded-full"
          style={{
            width:        60, height: 60,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(180,77,255,0.6) 0%, transparent 70%)',
            opacity:      0,
          }}
        />

        {/* Four opening panels — sit inside the core shell */}
        {/* TOP */}
        <div className="da-panel-top absolute left-0 right-0 top-0 h-[52%] rounded-t-2xl overflow-hidden"
          style={{ background: 'linear-gradient(to bottom, rgba(180,77,255,0.12), transparent)', borderBottom: '1px solid rgba(180,77,255,0.2)' }} />
        {/* BOTTOM */}
        <div className="da-panel-bottom absolute left-0 right-0 bottom-0 h-[52%] rounded-b-2xl overflow-hidden"
          style={{ background: 'linear-gradient(to top, rgba(255,77,157,0.12), transparent)', borderTop: '1px solid rgba(255,77,157,0.2)' }} />
        {/* LEFT */}
        <div className="da-panel-left absolute top-0 bottom-0 left-0 w-[52%] rounded-l-2xl overflow-hidden"
          style={{ background: 'linear-gradient(to right, rgba(180,77,255,0.10), transparent)', borderRight: '1px solid rgba(180,77,255,0.15)', zIndex: 1 }} />
        {/* RIGHT */}
        <div className="da-panel-right absolute top-0 bottom-0 right-0 w-[52%] rounded-r-2xl overflow-hidden"
          style={{ background: 'linear-gradient(to left, rgba(255,77,157,0.10), transparent)', borderLeft: '1px solid rgba(255,77,157,0.15)', zIndex: 1 }} />

        {/* ── DESIGN letters ──────────────────────────────────────── */}
        <div
          className="da-letters relative z-10 flex gap-2"
          style={{ opacity: 0 }}
        >
          {WORD.split('').map((ch, i) => (
            <span
              key={i}
              className="da-letter flex items-center justify-center font-display font-bold rounded-lg"
              style={{
                width:      36, height: 42,
                fontSize:   '1.1rem',
                color:      '#f8faff',
                background: 'rgba(180,77,255,0.12)',
                border:     '1px solid rgba(180,77,255,0.4)',
                boxShadow:  'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* ── White flash (final transition) ────────────────────────── */}
      <div
        className="da-flash absolute inset-0 pointer-events-none"
        style={{ background: '#ffffff', opacity: 0 }}
      />
    </div>
  )
}
