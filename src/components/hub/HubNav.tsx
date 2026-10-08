'use client'

/**
 * HubNav — Floating navigation bar.
 *
 * Renders in two modes:
 *   Hub mode (activeZone = null):
 *     Left  — RAVZEN wordmark (click replays intro)
 *     Centre — "UNIVERSE HUB" label
 *     Right  — ↑ TOP scroll button
 *
 *   Zone mode (activeZone set):
 *     Left  — ← Back to Universe button (calls exitZone)
 *     Centre — zone breadcrumb with accent colour
 *     Right  — ↑ TOP scroll button
 *
 * The nav is always mounted and transitions smoothly between modes.
 */

import { useCallback }       from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useExperience }     from '@/store/experienceStore'
import { ZONE_MAP }          from '@/config/zones'
import { cn }                from '@/lib/utils/cn'

interface HubNavProps {
  activeZone?: string | null
}

export default function HubNav({ activeZone = null }: HubNavProps) {
  const { exitZone, hasInteracted, openClosing } = useExperience()

  const zoneConfig = activeZone ? ZONE_MAP[activeZone as keyof typeof ZONE_MAP] : null

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleWordmark = useCallback(() => {
    try { sessionStorage.removeItem('ravzen_intro_seen') } catch { /* */ }
    window.location.reload()
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
      style={{
        background:          'rgba(3,4,10,0.6)',
        backdropFilter:      'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        borderBottom:        '1px solid rgba(255,255,255,0.06)',
        zIndex:              'var(--z-hud)' as unknown as number,
      }}
      aria-label="Universe navigation"
    >
      {/* ── Left ──────────────────────────────────────────────── */}
      {zoneConfig ? (
        /* Inside a zone — show back button */
        <button
          type="button"
          onClick={() => exitZone()}
          className={cn(
            'flex items-center gap-2 font-mono text-xs tracking-wider uppercase cursor-pointer',
            'transition-colors duration-200',
            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:rounded',
            'focus-visible:outline-[var(--color-energy-blue)]',
          )}
          style={{ color: 'rgba(248,250,255,0.55)' }}
          aria-label="Return to Universe Hub"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          <span className="hover:text-[rgba(248,250,255,0.9)] transition-colors duration-200">
            Universe
          </span>
        </button>
      ) : (
        /* On hub — show wordmark */
        <button
          type="button"
          onClick={handleWordmark}
          className={cn(
            'flex items-baseline gap-1.5 cursor-pointer group',
            'focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)]',
            'focus-visible:outline-offset-4 focus-visible:rounded',
          )}
          aria-label="RAVZEN — return to intro"
        >
          <span
            className="font-display font-bold text-sm tracking-[0.22em] uppercase transition-colors duration-200"
            style={{ color: 'var(--color-energy-white)' }}
          >
            RAVZEN
          </span>
          <span
            className="font-mono text-[9px] tracking-widest uppercase opacity-50 group-hover:opacity-80 transition-opacity duration-200"
            style={{ color: 'var(--color-energy-blue)' }}
          >
            DIGI
          </span>
        </button>
      )}

      {/* ── Centre ────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2"
        aria-live="polite"
        aria-label="Current location"
      >
        {zoneConfig ? (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: zoneConfig.gradientFrom }}
              aria-hidden="true"
            />
            <span
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: zoneConfig.gradientFrom }}
            >
              {zoneConfig.label}
            </span>
          </>
        ) : (
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(248,250,255,0.2)' }}
          >
            UNIVERSE HUB
          </span>
        )}
      </div>

      {/* ── Right ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Closing experience trigger — only show after first interaction */}
        {!zoneConfig && hasInteracted && (
          <button
            type="button"
            onClick={openClosing}
            className={cn(
              'flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase cursor-pointer',
              'text-[rgba(248,250,255,0.25)] hover:text-[rgba(248,250,255,0.6)]',
              'transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)]',
              'focus-visible:outline-offset-3 focus-visible:rounded',
            )}
            aria-label="Open the RAVZEN closing experience"
          >
            <Sparkles size={11} aria-hidden="true" />
            <span className="hidden sm:inline">CONTACT</span>
          </button>
        )}
        <button
          type="button"
          onClick={scrollToTop}
          className={cn(
            'font-mono text-[10px] tracking-widest uppercase cursor-pointer',
            'text-[rgba(248,250,255,0.3)] hover:text-[rgba(248,250,255,0.7)]',
            'transition-colors duration-200',
            'focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)]',
            'focus-visible:outline-offset-3 focus-visible:rounded',
          )}
          aria-label="Scroll to top"
        >
          ↑ TOP
        </button>
      </div>
    </nav>
  )
}
