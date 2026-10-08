'use client'

/**
 * useGSAP
 *
 * A safe wrapper around GSAP timeline creation.
 *
 * Handles:
 * - Reduced-motion: returns a no-op proxy when user prefers reduced motion
 * - Cleanup: kills the timeline on component unmount
 * - Lazy import: keeps GSAP out of the SSR bundle
 *
 * @example
 * const { createTimeline, gsap } = useGSAP()
 *
 * useEffect(() => {
 *   const tl = createTimeline({ onComplete: () => doSomething() })
 *   tl.fromTo('.element', { opacity: 0 }, { opacity: 1, duration: 0.6 })
 * }, [])
 */

import { useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from './useReducedMotion'
import type { TimelineOptions } from '@/types/animations'

interface GSAPModule {
  gsap: typeof import('gsap').gsap
}

interface UseGSAPReturn {
  /**
   * Create a GSAP timeline. The timeline is automatically killed on unmount.
   * Returns null if reduced motion is enabled.
   */
  createTimeline: (
    opts?: Partial<TimelineOptions> & gsap.TimelineVars
  ) => gsap.core.Timeline | null
  /**
   * Direct access to the loaded GSAP instance.
   * null until the async import resolves.
   */
  gsapRef: React.MutableRefObject<GSAPModule['gsap'] | null>
}

export function useGSAP(): UseGSAPReturn {
  const reducedMotion = useReducedMotion()
  const gsapRef       = useRef<GSAPModule['gsap'] | null>(null)
  const timelinesRef  = useRef<gsap.core.Timeline[]>([])

  // Load GSAP lazily
  useEffect(() => {
    import('gsap').then(({ gsap }) => {
      gsapRef.current = gsap
    })
  }, [])

  // Kill all timelines on unmount
  useEffect(() => {
    const tls = timelinesRef.current
    return () => {
      tls.forEach((tl) => tl.kill())
      tls.length = 0
    }
  }, [])

  const createTimeline = useCallback(
    (opts?: Partial<TimelineOptions> & gsap.TimelineVars): gsap.core.Timeline | null => {
      // Return null if reduced motion — callers check for null
      if (reducedMotion) return null

      if (!gsapRef.current) {
        console.warn('useGSAP: GSAP not yet loaded. Call createTimeline inside a useEffect.')
        return null
      }

      const tl = gsapRef.current.timeline(opts ?? {})
      timelinesRef.current.push(tl)
      return tl
    },
    [reducedMotion]
  )

  return { createTimeline, gsapRef }
}
