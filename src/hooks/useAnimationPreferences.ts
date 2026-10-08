'use client'

/**
 * useAnimationPreferences
 *
 * Combines reduced-motion detection and device tier classification
 * into a single hook that every animation component can consume.
 *
 * Decision matrix:
 *   prefersReducedMotion=true  → skip all animations
 *   tier='low'                 → CSS-only fallback, no WebGL
 *   tier='mid'                 → limited particles, no heavy post-processing
 *   tier='high'                → full cinematic experience
 */

import { useReducedMotion } from './useReducedMotion'
import { useDeviceCapability } from './useDeviceCapability'
import type { AnimationPreferences } from '@/types/animations'

export function useAnimationPreferences(): AnimationPreferences & {
  /** Whether the full cinematic 3D/particle experience should run */
  enableFullExperience: boolean
  /** Whether any animation at all should run */
  enableAnimations:     boolean
  /** Whether WebGL / Three.js scenes should render */
  enableWebGL:          boolean
} {
  const reducedMotion = useReducedMotion()
  const capability    = useDeviceCapability()

  const enableAnimations     = !reducedMotion
  const enableWebGL          = !reducedMotion && capability.supportsWebGL && capability.tier !== 'low'
  const enableFullExperience = enableWebGL && capability.tier === 'high'

  return {
    prefersReducedMotion: reducedMotion,
    isLowPowerDevice:     capability.tier === 'low',
    enableAnimations,
    enableWebGL,
    enableFullExperience,
  }
}
