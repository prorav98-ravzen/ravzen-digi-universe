/**
 * Animation utilities barrel.
 *
 * GSAP helpers and Framer Motion variants both define similarly-named
 * functions (fadeIn, scaleIn). They are namespaced here to avoid collisions.
 *
 * Usage:
 *   import { gsapUtils, framerVariants, EASE, DUR } from '@/lib/animation'
 *   import type { EaseKey }                         from '@/lib/animation'
 */

// GSAP constants — used directly
export { EASE, DUR, createUniverseTimeline } from './gsap'
export type { EaseKey } from './gsap'

// GSAP element helpers — namespaced to avoid collision with Framer names
export {
  fadeIn   as gsapFadeIn,
  fadeOut  as gsapFadeOut,
  scaleIn  as gsapScaleIn,
  staggerReveal,
} from './gsap'

// Framer Motion variants — namespaced for clarity
export {
  fadeUp,
  fadeDown,
  fadeIn      as framerFadeIn,
  scaleIn     as framerScaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
  modalOverlay,
  modalContent,
  instantVariants,
} from './variants'
