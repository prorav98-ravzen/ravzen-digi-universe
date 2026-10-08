'use client'

/**
 * ZoneCard — Interactive universe zone selection card.
 *
 * Visual identity per zone (from config/zones.ts):
 *   DESIGN   — purple → pink gradient
 *   ANDROID  — green → cyan gradient
 *   SOFTWARE — blue → violet gradient
 *   SYSTEM   — gold → orange gradient
 *
 * Interaction model:
 *   Hover / focus  → border brightens, glow appears, icon lifts slightly
 *   Active (press) → card scales down slightly (tactile confirmation)
 *   Selected       → persistent glow + filled gradient border
 *   Touch          → same as hover/active via pointer events (no hover-only logic)
 *   Keyboard       → fully accessible via button role; Enter/Space = onSelect
 *
 * Tilt / depth:
 *   On pointer move inside the card, a CSS custom-property-driven perspective
 *   tilt is applied using `rotateX` / `rotateY`. Max tilt: 8°.
 *   This is CSS-transform only — zero JS per frame after the property is set.
 *   On pointer leave, tilt resets with a CSS transition.
 *   Touch devices: tilt is disabled (hover: none media query checked at runtime).
 *
 * Glass reflection:
 *   A semi-transparent white gradient overlay shifts slightly with the tilt,
 *   simulating a physical glass surface catch-light.
 *
 * Reduced motion:
 *   Tilt and float animation disabled; hover/focus states still work.
 *
 * Props:
 *   zone       — ZoneConfig from config/zones.ts
 *   isSelected — controlled selected state
 *   onSelect   — called when the card is activated (click, Enter, Space)
 *   tabIndex   — override tab order if needed
 */

import {
  useRef,
  useCallback,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { Palette, Smartphone, Monitor, Network, type LucideIcon } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMediaQuery }    from '@/hooks/useMediaQuery'
import { cn }               from '@/lib/utils/cn'
import type { ZoneConfig }  from '@/config/zones'

// ── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  Smartphone,
  Monitor,
  Network,
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ZoneCardProps {
  zone:        ZoneConfig
  isSelected?: boolean
  onSelect:    (key: string) => void
  /** Stagger delay in ms for the entrance animation (applied via style) */
  entranceDelay?: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ZoneCard({
  zone,
  isSelected = false,
  onSelect,
  entranceDelay = 0,
}: ZoneCardProps) {
  const reduced     = useReducedMotion()
  // Tilt is disabled on touch-only devices (no hover capability)
  const isTouch     = useMediaQuery('(hover: none) and (pointer: coarse)')
  const enableTilt  = !reduced && !isTouch

  const cardRef     = useRef<HTMLButtonElement>(null)
  const Icon        = ICON_MAP[zone.icon] ?? Network

  // ── Pointer tilt ───────────────────────────────────────────────────────

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (!enableTilt) return
      const el   = cardRef.current
      if (!el)   return
      const rect = el.getBoundingClientRect()
      const x    = (e.clientX - rect.left)  / rect.width   // 0–1
      const y    = (e.clientY - rect.top)   / rect.height  // 0–1
      // rotateY: left = -8°, right = +8°;  rotateX: top = +6°, bottom = -6°
      const ry   = (x - 0.5) * 16   // -8 … +8
      const rx   = (0.5 - y) * 12   // -6 … +6

      el.style.setProperty('--tilt-x', `${rx}deg`)
      el.style.setProperty('--tilt-y', `${ry}deg`)
      // Reflection shifts opposite to tilt (parallax feel)
      el.style.setProperty('--refl-x', `${50 + (x - 0.5) * -20}%`)
      el.style.setProperty('--refl-y', `${50 + (y - 0.5) * -20}%`)
    },
    [enableTilt]
  )

  const handlePointerLeave = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--refl-x', '50%')
    el.style.setProperty('--refl-y', '50%')
  }, [])

  // ── Keyboard ───────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect(zone.key)
      }
    },
    [zone.key, onSelect]
  )

  // ── Styles ─────────────────────────────────────────────────────────────

  const borderColor = isSelected
    ? `${zone.gradientFrom}80`
    : `rgba(255,255,255,0.09)`

  const glowShadow = isSelected
    ? `0 0 30px ${zone.glowColor}, 0 0 60px ${zone.glowColor.replace('0.35', '0.12')}`
    : 'none'

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={() => onSelect(zone.key)}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        // Layout
        'relative flex flex-col items-center gap-4 p-6 w-full',
        // Shape
        'rounded-2xl overflow-hidden',
        // Glass base
        'backdrop-blur-md',
        // Float animation (paused for reduced motion via globals.css)
        !reduced && 'animate-float',
        // Interaction
        'cursor-pointer select-none',
        'active:scale-[0.96]',
        // Focus ring
        'focus-visible:outline-2 focus-visible:outline-offset-3',
        // Transition
        'transition-[border-color,box-shadow,transform] duration-300',
        // Group for child transitions
        'group',
      )}
      style={{
        // CSS custom properties for tilt (defaults = no tilt)
        '--tilt-x':  '0deg',
        '--tilt-y':  '0deg',
        '--refl-x':  '50%',
        '--refl-y':  '50%',
        // 3D transform from custom properties
        transform: enableTilt
          ? 'perspective(700px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))'
          : undefined,
        transformStyle:  enableTilt ? 'preserve-3d' : undefined,
        // Transition for tilt reset on pointer leave
        transition: enableTilt
          ? 'transform 0.5s ease-out, border-color 0.3s ease, box-shadow 0.3s ease'
          : 'border-color 0.3s ease, box-shadow 0.3s ease',
        background:   'rgba(255,255,255,0.04)',
        border:       `1px solid ${borderColor}`,
        boxShadow:    `0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07), ${glowShadow}`,
        // Entrance stagger
        animationDelay: `${entranceDelay}ms`,
      } as React.CSSProperties}
      aria-label={`${zone.label} — ${zone.description}`}
      aria-pressed={isSelected}
    >
      {/* ── Hover / selected gradient fill ──────────────────────────── */}
      <span
        className={cn(
          'absolute inset-0 rounded-2xl pointer-events-none',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          isSelected && 'opacity-100',
        )}
        style={{
          background: `linear-gradient(135deg, ${zone.gradientFrom}18 0%, ${zone.gradientTo}15 100%)`,
        }}
        aria-hidden="true"
      />

      {/* ── Glass reflection catch-light ─────────────────────────────── */}
      {enableTilt && (
        <span
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at var(--refl-x) var(--refl-y), rgba(255,255,255,0.08) 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Border glow (selected / hover) ───────────────────────────── */}
      <span
        className={cn(
          'absolute inset-0 rounded-2xl pointer-events-none',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          isSelected && 'opacity-100',
        )}
        style={{
          boxShadow: `inset 0 0 0 1px ${zone.gradientFrom}45`,
        }}
        aria-hidden="true"
      />

      {/* ── Icon container ────────────────────────────────────────────── */}
      <span
        className="relative flex items-center justify-center w-14 h-14 rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5"
        style={{
          background: `linear-gradient(135deg, ${zone.gradientFrom}22 0%, ${zone.gradientTo}22 100%)`,
          border:     `1px solid ${zone.gradientFrom}35`,
          boxShadow:  `inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
        aria-hidden="true"
      >
        <Icon
          size={22}
          style={{
            color:  zone.gradientFrom,
            filter: `drop-shadow(0 0 6px ${zone.glowColor})`,
          }}
        />
      </span>

      {/* ── Text content ──────────────────────────────────────────────── */}
      <span className="flex flex-col items-center gap-1.5 text-center">
        <span
          className="font-display font-bold text-xs tracking-[0.18em] uppercase text-[var(--color-energy-white)]"
        >
          {zone.label}
        </span>
        <span
          className="font-mono text-[10px] tracking-widest uppercase transition-opacity duration-300"
          style={{ color: zone.gradientFrom, opacity: 0.75 }}
        >
          {zone.tagline}
        </span>
        <span className="text-[11px] text-[rgba(248,250,255,0.38)] leading-relaxed hidden sm:block max-w-[130px]">
          {zone.description}
        </span>
      </span>

      {/* ── Enter indicator (visible on hover/focus) ──────────────────── */}
      <span
        className="flex items-center gap-1 font-mono text-[9px] tracking-widest uppercase opacity-0 group-hover:opacity-60 transition-opacity duration-300 mt-auto"
        style={{ color: zone.gradientTo }}
        aria-hidden="true"
      >
        ENTER ›
      </span>
    </button>
  )
}
