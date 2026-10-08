'use client'

/**
 * useDeviceCapability
 *
 * Classifies the device into three performance tiers.
 * Used to conditionally enable WebGL/3D scenes and particle effects.
 *
 * Tier logic:
 *   low  — no WebGL, OR reduced-motion, OR very old device
 *   mid  — mobile or low pixel ratio (still has WebGL)
 *   high — desktop with WebGL and no motion preference
 *
 * SSR-safe: defaults to 'high' on the server (optimistic).
 * The true tier is determined after hydration.
 */

import { useEffect, useState } from 'react'

export type DeviceTier = 'high' | 'mid' | 'low'

export interface DeviceCapability {
  /** Performance classification */
  tier:                DeviceTier
  /** Whether WebGL is available at all */
  supportsWebGL:       boolean
  /** Pointer is a touch screen */
  isTouch:             boolean
  /** Device pixel ratio */
  pixelRatio:          number
  /** OS-level reduced motion preference */
  prefersReducedMotion:boolean
}

const SERVER_DEFAULT: DeviceCapability = {
  tier:                 'high',
  supportsWebGL:        true,
  isTouch:              false,
  pixelRatio:           1,
  prefersReducedMotion: false,
}

function detect(): DeviceCapability {
  // WebGL detection
  let supportsWebGL = false
  try {
    const canvas = document.createElement('canvas')
    supportsWebGL = !!(
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl' as 'webgl')
    )
  } catch {
    supportsWebGL = false
  }

  const isTouch             = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const pixelRatio          = window.devicePixelRatio ?? 1
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let tier: DeviceTier = 'high'

  if (!supportsWebGL || prefersReducedMotion) {
    tier = 'low'
  } else if (isTouch || pixelRatio < 1.5) {
    tier = 'mid'
  }

  return { tier, supportsWebGL, isTouch, pixelRatio, prefersReducedMotion }
}

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>(SERVER_DEFAULT)

  useEffect(() => {
    setCapability(detect())
  }, [])

  return capability
}
