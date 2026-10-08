/**
 * Framer Motion animation variants.
 *
 * All variants respect the reduced-motion preference.
 * Apply them to motion components via the `variants` prop.
 *
 * Pattern:
 *   const { variants } = useReducedVariants(fadeUp)
 *   <motion.div variants={variants} initial="hidden" animate="visible" />
 */

import type { Variants } from 'framer-motion'

// ── Base variants ─────────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
}

export const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

// ── Container with stagger ────────────────────────────────────────────────────

/** Wrap around a list of items to stagger their children */
export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren:  0.08,
      delayChildren:    0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
}

/** Child item used inside staggerContainer */
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.25 },
  },
}

// ── Modal / overlay ───────────────────────────────────────────────────────────

export const modalOverlay: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

export const modalContent: Variants = {
  hidden:  { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.34, 1.2, 0.64, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

// ── Reduced-motion safe wrapper ───────────────────────────────────────────────

/**
 * Returns a version of any variant set that has instant transitions.
 * Use when prefersReducedMotion is true.
 */
export function instantVariants(variants: Variants): Variants {
  const instant: Variants = {}

  for (const [key, value] of Object.entries(variants)) {
    if (typeof value === 'object' && value !== null) {
      instant[key] = {
        ...value,
        transition: { duration: 0 },
      }
    }
  }

  return instant
}
