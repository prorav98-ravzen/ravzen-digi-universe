'use client'

/**
 * AndroidReturnTransition — Exit animation when leaving the Android Zone.
 *
 * Sequence (~1.2s):
 *   0.00s  Cyan–green veil fades in over the Android Lab
 *   0.28s  Energy collapses inward (radial scale + opacity)
 *   0.75s  Void flash
 *   1.00s  Fade out → returnToHub() called
 *
 * Reduced motion: no animation; returnToHub() fires immediately.
 */

import { useEffect, useRef } from 'react'
import { useExperience }     from '@/store/experienceStore'
import { useReducedMotion }  from '@/hooks/useReducedMotion'

export default function AndroidReturnTransition() {
  const { returnToHub } = useExperience()
  const reduced         = useReducedMotion()
  const ref             = useRef<HTMLDivElement>(null)
  const tlRef           = useRef<gsap.core.Timeline | null>(null)

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

      const veil = el.querySelector<HTMLElement>('.art-veil')
      const orb  = el.querySelector<HTMLElement>('.art-orb')

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete() { if (!cancelled) returnToHub() },
      })
      tlRef.current = tl

      tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.28 }, 0)
      tl.fromTo(orb,
        { opacity: 0, scale: 3.5 },
        { opacity: 1, scale: 0.15, duration: 0.42, ease: 'power3.in' }, 0.28)
      tl.to(orb,  { opacity: 0, duration: 0.18 }, 0.68)
      tl.to(veil, { background: '#03040a', duration: 0.16 }, 0.72)
      tl.to(el,   { opacity: 0, duration: 0.22 }, 0.90)
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
      <div
        className="art-veil absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,135,0.88) 0%, rgba(0,212,255,0.82) 100%)',
          opacity:    0,
        }}
      />
      <div
        className="art-orb relative rounded-full"
        style={{
          width:        110, height: 110,
          background:   'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,255,135,0.5) 60%, transparent 100%)',
          opacity:      0,
        }}
      />
    </div>
  )
}
