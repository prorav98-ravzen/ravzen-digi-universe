'use client'

/**
 * useMediaQuery
 *
 * Evaluates a CSS media query and returns whether it currently matches.
 * Re-evaluates when the viewport changes.
 *
 * SSR-safe: returns false until hydration.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
 */

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)

    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

// ── Breakpoint shorthands ─────────────────────────────────────────────────────
// Matches Tailwind's default breakpoints exactly.

export function useIsMobile()  { return !useMediaQuery('(min-width: 640px)')   }
export function useIsSm()      { return useMediaQuery('(min-width: 640px)')    }
export function useIsMd()      { return useMediaQuery('(min-width: 768px)')    }
export function useIsLg()      { return useMediaQuery('(min-width: 1024px)')   }
export function useIsXl()      { return useMediaQuery('(min-width: 1280px)')   }
export function useIs2xl()     { return useMediaQuery('(min-width: 1536px)')   }
