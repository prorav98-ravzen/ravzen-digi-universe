'use client'

/**
 * SoftwareReturnTransition — Exit animation when leaving the Software Zone.
 *
 * Sequence (~1.1s):
 *   0.00s  Blue-violet veil fades in over the Software Lab
 *   0.26s  Energy orb implodes at centre (scale-in, then vanish)
 *   0.72s  Void flash
 *   0.92s  Fade out → returnToHub()
 *
 * Reduced motion: returnToHub() fires immediately.
 */

import { useEffect, useRef } from 'react'
import { useExperience }     from '@/store/experienceStore'
import { useReducedMotion }  from '@/hooks/useReducedMotion'

export default function SoftwareReturnTransition() {
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

      const veil = el.querySelector<HTMLElement>('.srt-veil')
      const orb  = el.querySelector<HTMLElement>('.srt-orb')

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete() { if (!cancelled) returnToHub() },
      })
      tlRef.current = tl

      tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.26 }, 0)
      tl.fromTo(orb,
        { opacity: 0, scale: 3.8 },
        { opacity: 1, scale: 0.12, duration: 0.44, ease: 'power3.in' }, 0.26)
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
        className="srt-veil absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(77,127,255,0.90) 0%, rgba(124,92,252,0.85) 100%)',
          opacity:    0,
        }}
      />
      <div
        className="srt-orb relative rounded-full"
        style={{
          width:      120, height: 120,
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(77,127,255,0.5) 60%, transparent 100%)',
          opacity:    0,
        }}
      />
    </div>
  )
}
