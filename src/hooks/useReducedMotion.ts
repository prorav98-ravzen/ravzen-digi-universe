'use client'

/**
 * useReducedMotion
 *
 * Returns true if the user has requested reduced motion at the OS level.
 * All animation hooks, GSAP timelines, and Framer Motion components
 * should check this before running any animation.
 *
 * SSR-safe: defaults to false on the server.
 */

import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)

    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
