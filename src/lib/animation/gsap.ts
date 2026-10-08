/**
 * GSAP utilities — timeline factories and easing constants.
 *
 * Architecture:
 * - GSAP is always imported dynamically to keep it out of the initial bundle.
 * - These helpers accept a pre-loaded gsap instance so callers control load timing.
 * - Reduced-motion is NOT enforced here — callers (hooks) handle that.
 */

import type { TimelineOptions } from '@/types/animations'

// ── Easing presets ────────────────────────────────────────────────────────────

export const EASE = {
  cinematic:   'power3.inOut',
  enter:       'power3.out',
  exit:        'power2.in',
  spring:      'back.out(1.5)',
  springStrong:'back.out(2.5)',
  smooth:      'power2.inOut',
  instant:     'none',
} as const

export type EaseKey = keyof typeof EASE

// ── Duration presets (seconds) ────────────────────────────────────────────────

export const DUR = {
  instant: 0,
  fast:    0.25,
  normal:  0.45,
  slow:    0.75,
  cinema:  1.2,
  epic:    2.0,
} as const

// ── Timeline factory ──────────────────────────────────────────────────────────

/**
 * Creates a GSAP timeline with sensible defaults for the universe experience.
 *
 * @param gsap   - Pre-loaded GSAP instance
 * @param opts   - Override any default TimelineVars
 */
export function createUniverseTimeline(
  gsap: typeof import('gsap').gsap,
  opts: TimelineOptions & gsap.TimelineVars = { duration: DUR.normal, ease: EASE.enter }
): gsap.core.Timeline {
  return gsap.timeline({
    defaults: {
      ease:     opts.ease     ?? EASE.enter,
      duration: opts.duration ?? DUR.normal,
    },
    ...opts,
  })
}

// ── Element helpers ───────────────────────────────────────────────────────────

/** Fade an element in from invisible */
export function fadeIn(
  gsap: typeof import('gsap').gsap,
  target: gsap.TweenTarget,
  opts: Partial<TimelineOptions> = {}
) {
  return gsap.fromTo(
    target,
    { opacity: 0, y: 8 },
    {
      opacity:  1,
      y:        0,
      duration: opts.duration ?? DUR.normal,
      ease:     opts.ease     ?? EASE.enter,
      delay:    opts.delay    ?? 0,
    }
  )
}

/** Fade an element out */
export function fadeOut(
  gsap: typeof import('gsap').gsap,
  target: gsap.TweenTarget,
  opts: Partial<TimelineOptions> = {}
) {
  return gsap.to(target, {
    opacity:  0,
    y:        -8,
    duration: opts.duration ?? DUR.fast,
    ease:     opts.ease     ?? EASE.exit,
    delay:    opts.delay    ?? 0,
  })
}

/** Staggered reveal of a group of elements */
export function staggerReveal(
  gsap: typeof import('gsap').gsap,
  targets: gsap.TweenTarget,
  opts: Partial<TimelineOptions> = {}
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 16 },
    {
      opacity:  1,
      y:        0,
      duration: opts.duration ?? DUR.normal,
      ease:     opts.ease     ?? EASE.enter,
      stagger:  opts.stagger  ?? 0.1,
      delay:    opts.delay    ?? 0,
    }
  )
}

/** Scale + fade entrance */
export function scaleIn(
  gsap: typeof import('gsap').gsap,
  target: gsap.TweenTarget,
  opts: Partial<TimelineOptions> = {}
) {
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.85 },
    {
      opacity:  1,
      scale:    1,
      duration: opts.duration ?? DUR.normal,
      ease:     opts.ease     ?? EASE.spring,
      delay:    opts.delay    ?? 0,
    }
  )
}
