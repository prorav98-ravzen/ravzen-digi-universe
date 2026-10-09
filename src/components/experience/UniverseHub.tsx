'use client'

/**
 * UniverseHub — Full Phase 2 interactive universe hub.
 *
 * Composition:
 *   HubNav          — floating top navigation
 *   NebulaLayer     — pointer-parallax nebula colour washes
 *   StarField       — depth-layered CSS stars + celestial objects
 *   AmbientParticles — slow-drifting energy particles
 *   Title section   — "RAVZEN / DIGI UNIVERSE" with GSAP entrance
 *   ZoneCard ×4     — interactive zone selection cards
 *   UniverseActivity — live activity counter
 *
 * Entrance animation (GSAP):
 *   0.0s  Background already visible (no animation needed)
 *   0.15s Title line 1 (RAVZEN label) fades + slides up
 *   0.30s Title line 2 (DIGI UNIVERSE) fades + slides up
 *   0.45s Subtitle fades up
 *   0.55s Cards stagger in (4 × 0.09s stagger)
 *   1.10s Activity counter fades in
 *
 * Pointer parallax:
 *   Handled entirely inside NebulaLayer — zero additional JS here.
 *
 * Selected zone state:
 *   Tracks which card is highlighted. Phase 3 will use this to
 *   trigger zone-activation sequences. For now it's visual only.
 *
 * Responsive layout:
 *   Mobile  (< sm):  single column (cards stack 2×2 via grid-cols-2)
 *   Tablet  (sm–lg): 2 columns
 *   Desktop (≥ lg):  4 columns
 *
 * Reduced motion:
 *   GSAP entrance skipped; all elements visible immediately.
 *   Float animation disabled via globals.css media rule.
 *   Particle layer returns null.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useReducedMotion }   from '@/hooks/useReducedMotion'
import { useExperience }      from '@/store/experienceStore'
import { ZONES }              from '@/config/zones'
import { cn }                 from '@/lib/utils/cn'
import CosmicUniverse3D       from '@/components/hub/CosmicUniverse3D'
import ZoneCard               from '@/components/hub/ZoneCard'
import UniverseActivity       from '@/components/hub/UniverseActivity'
import HubNav                 from '@/components/hub/HubNav'
import AdSlot                 from '@/components/ads/AdSlot'
import type { ZoneKey }       from '@/config/zones'

export default function UniverseHub() {
  const reduced          = useReducedMotion()
  const { enterZone }    = useExperience()
  const containerRef     = useRef<HTMLDivElement>(null)

  // Phase 3: clicking a card triggers the zone activation cinematic.
  // Only 'design' is fully implemented; others remain visual-only.
  const handleZoneSelect = useCallback((key: string) => {
    // All four zones now have full implementations
    enterZone(key as ZoneKey)
  }, [enterZone])

  // ── GSAP entrance animation ────────────────────────────────────────────

  useEffect(() => {
    if (reduced) return

    let cancelled = false

    async function animate() {
      const { gsap } = await import('gsap')
      if (cancelled) return

      const el = containerRef.current
      if (!el) return

      const logoMark = el.querySelector<HTMLElement>('.hub-brand-logo')
      const label    = el.querySelector<HTMLElement>('.hub-ravzen-label')
      const title    = el.querySelector<HTMLElement>('.hub-title')
      const subtitle = el.querySelector<HTMLElement>('.hub-subtitle')
      const cards    = el.querySelectorAll<HTMLElement>('.hub-zone-card')
      const activity = el.querySelector<HTMLElement>('.hub-activity')

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(logoMark, { opacity: 0, y: 14, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.55 }, 0.08)
      tl.fromTo(label,    { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 0.20)
      tl.fromTo(title,    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.34)
      tl.fromTo(subtitle, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 0.45)
      tl.fromTo(
        cards,
        { opacity: 0, y: 28, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.09 },
        0.55
      )
      tl.fromTo(activity, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 1.10)

      return () => tl.kill()
    }

    const cleanup = animate()

    return () => {
      cancelled = true
      cleanup?.then((fn) => fn?.())
    }
  }, [reduced])

  return (
    <div
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #060918 0%, #03040a 100%)',
        zIndex:     'var(--z-universe)' as unknown as number,
      }}
      role="main"
      aria-label="RAVZEN DIGI UNIVERSE"
    >
      {/* ── Skip to main content ─────────────────────────────────────── */}
      <a
        href="#zone-cards"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:fixed focus:top-16 focus:left-4 focus:z-[70]',
          'focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-mono',
          'focus:bg-[var(--color-energy-blue)] focus:text-white',
        )}
      >
        Skip to zone selection
      </a>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <HubNav activeZone={null} />

      {/* ── Realistic 3D Space environment (behind everything) ──────── */}
      <CosmicUniverse3D />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8 pt-20 gap-10 md:gap-12"
      >
        {/* ── Title & Official Brand Mark ──────────────────────────── */}
        <header className="text-center flex flex-col items-center space-y-2 mt-4 md:mt-8">
          <div
            className="hub-brand-logo mb-1"
            style={{ opacity: reduced ? 1 : 0 }}
          >
            <img
              src="/images/ravzen-logo.png"
              alt="RAVZEN Official Emblem"
              width={56}
              height={56}
              className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-[0_0_24px_rgba(77,127,255,0.4)] select-none"
            />
          </div>

          <p
            className="hub-ravzen-label font-mono text-[10px] tracking-[0.5em] uppercase"
            style={{
              color:   'rgba(77,127,255,0.65)',
              opacity: reduced ? 1 : 0,
            }}
          >
            RAVZEN
          </p>

          <h1
            className="hub-title font-display font-bold tracking-wider leading-none"
            style={{
              fontSize:   'clamp(1.8rem, 6vw, 4.2rem)',
              color:      'var(--color-energy-white)',
              textShadow: '0 0 60px rgba(77,127,255,0.2), 0 0 120px rgba(77,127,255,0.06)',
              opacity:    reduced ? 1 : 0,
            }}
          >
            DIGI UNIVERSE
          </h1>

          <p
            className="hub-subtitle font-mono text-[10px] tracking-[0.4em] uppercase"
            style={{
              color:   'rgba(248,250,255,0.25)',
              opacity: reduced ? 1 : 0,
            }}
          >
            Select a zone to explore
          </p>
        </header>

        {/* ── Zone cards ────────────────────────────────────────────── */}
        <section
          id="zone-cards"
          className="w-full max-w-4xl"
          aria-label="Universe Zones"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {ZONES.map((zone, i) => (
              <div
                key={zone.key}
                className="hub-zone-card"
                style={{ opacity: reduced ? 1 : 0 }}
              >
                <ZoneCard
                  zone={zone}
                  isSelected={false}
                  onSelect={handleZoneSelect}
                  entranceDelay={i * 90}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Universe Activity counter ─────────────────────────────── */}
        <div
          className="hub-activity"
          style={{ opacity: reduced ? 1 : 0 }}
        >
          <UniverseActivity />
        </div>

        {/* ── Universe bottom ad slot ───────────────────────────────── */}
        <AdSlot zone="universe" position="bottom" className="w-full max-w-2xl" />

        {/* Spacer so content isn't cramped on tall displays */}
        <div className="flex-1 min-h-8" aria-hidden="true" />
      </div>
    </div>
  )
}
