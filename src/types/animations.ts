/**
 * Animation types — used by GSAP, Framer Motion, and R3F layers.
 *
 * Separating animation configuration from component props keeps
 * animation logic independent of content/business logic.
 */

// ── Experience state machine ──────────────────────────────────────────────────

/**
 * Stages of the universe experience.
 * This drives the top-level stage machine in ExperienceStore (Phase 1).
 * Defined here in Phase 0 so animation utilities can reference it.
 */
export type ExperienceStage =
  | 'intro'       // White screen, letter reveal
  | 'portal'      // Four-panel portal opening animation
  | 'hub'         // Universe Hub — space environment with zone cards
  | 'zone-enter'  // Zone activation animation playing
  | 'zone'        // Inside a zone (content visible)
  | 'zone-exit'   // Transitioning back to hub
  | 'closing'     // Final closing experience

// ── Animation preferences ─────────────────────────────────────────────────────

/**
 * Detected at runtime — drives whether full animations run.
 * Every animation component checks this before starting.
 */
export interface AnimationPreferences {
  /** User's OS-level reduced-motion setting */
  prefersReducedMotion: boolean
  /** Device classified as low-power (throttles WebGL/particles) */
  isLowPowerDevice: boolean
}

// ── GSAP timeline options ─────────────────────────────────────────────────────

export interface TimelineOptions {
  duration: number
  ease:     string
  delay?:   number
  stagger?: number
}

// ── Particle configuration ────────────────────────────────────────────────────

export interface ParticleConfig {
  count:   number
  size:    number
  speed:   number
  spread:  number
  color:   string
  opacity: number
  shape:   'circle' | 'dot' | 'line'
}

// ── Zone card interactive state ───────────────────────────────────────────────

export interface ZoneCardState {
  isHovered: boolean
  isActive:  boolean
  isDimmed:  boolean
  /** Normalised pointer position within the card: -1 to 1 */
  pointerX:  number
  pointerY:  number
}

// ── Portal panel config ───────────────────────────────────────────────────────

export interface PortalPanelConfig {
  panel:    'top' | 'bottom' | 'left' | 'right'
  exitX:    number
  exitY:    number
  duration: number
}
