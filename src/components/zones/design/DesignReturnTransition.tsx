'use client'

/**
 * DesignReturnTransition — Exit animation when leaving the Design Zone.
 *
 * Stage: 'zone-exit' && activeZone === 'design'
 *
 * Sequence (GSAP, ~1.1 s):
 *   0.00s  Purple–pink energy veil fades in over the Design Zone
 *   0.25s  Energy collapses inward to centre (scale + opacity)
 *   0.65s  Brief void flash
 *   0.90s  Fade out → returnToHub() called
 *
 * Reduced motion: no animation; returnToHub() fires immediately.
 */

import { useEffect, useRef } from 'react'
import { useExperience }     from '@/store/experienceStore'
import { useReducedMotion }  from '@/hooks/useReducedMotion'

export default function DesignReturnTransition() {
  const { returnToHub } = useExperience()
  const reduced         = useReducedMotion()
  const ref             = useRef<HTMLDivElement>(null)
  const tlRef           = useRef<gsap.core.Timeline | null>(null)

  // Reduced motion fast path
  useEffect(() => {
    if (!reduced) return
    returnToHub()
  }, [reduced, returnToHub])

  useEffect(() => {
    if (reduced) return
    let cancelled = false

    async function run() {
      const { gsap } = await import('gsap')
      if (cancelled) return
      const el = ref.current
      if (!el) return

      const veil    = el.querySelector<HTMLElement>('.dr-veil')
      const orb     = el.querySelector<HTMLElement>('.dr-orb')

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete() { if (!cancelled) returnToHub() },
      })
      tlRef.current = tl

      // Veil materialises
      tl.fromTo(veil,
        { opacity: 0 },
        { opacity: 1, duration: 0.30 }, 0)

      // Energy orb implodes at centre
      tl.fromTo(orb,
        { opacity: 0, scale: 4 },
        { opacity: 1, scale: 0.2, duration: 0.45, ease: 'power3.in' }, 0.25)
      tl.to(orb, { opacity: 0, duration: 0.20 }, 0.65)

      // Void flash
      tl.to(veil, {
        background: '#03040a',
        duration: 0.18,
      }, 0.68)

      // Fade out
      tl.to(el, { opacity: 0, duration: 0.22 }, 0.88)
    }

    run()
    return () => {
      cancelled = true
      tlRef.current?.kill()
    }
  }, [reduced, returnToHub])

  if (reduced) return null

  return (
    <div
      ref={ref}
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 'var(--z-overlay)' as unknown as number }}
      aria-hidden="true"
    >
      {/* Veil */}
      <div
        className="dr-veil absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(180,77,255,0.85) 0%, rgba(255,77,157,0.80) 100%)',
          opacity:    0,
        }}
      />

      {/* Collapsing orb */}
      <div
        className="dr-orb relative"
        style={{
          width:        120, height: 120,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(180,77,255,0.6) 60%, transparent 100%)',
          opacity:      0,
        }}
      />
    </div>
  )
}
