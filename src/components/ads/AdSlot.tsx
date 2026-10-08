'use client'

/**
 * AdSlot — Renders the active advertisement for a given zone + position.
 *
 * Behaviour:
 *   - Fetches the highest-priority active ad for this slot from /api/ads.
 *   - Renders nothing if no ad is active or the fetch fails.
 *   - Tracks ad_click events via useAnalytics.
 *   - Respects reduced-motion for the slide animation.
 *   - Never blocks critical navigation controls.
 *   - Responsive: text / image / video, all capped to safe sizes.
 *   - Labelled "Sponsored" per ethical ad disclosure.
 *
 * Positions:
 *   top    — sticky below zone header
 *   bottom — above footer area
 *
 * Security:
 *   - CTA URL opened in _blank with noopener noreferrer.
 *   - Media URL rendered via next/image (remote pattern allowlisted).
 *   - No inline scripts executed from ad content.
 */

import { useEffect, useState, useCallback } from 'react'
import Image                                 from 'next/image'
import { X }                                 from 'lucide-react'
import { useAnalytics }                      from '@/hooks/useAnalytics'
import { useReducedMotion }                  from '@/hooks/useReducedMotion'
import { cn }                                from '@/lib/utils/cn'

type Zone     = 'universe' | 'design' | 'android' | 'software' | 'system'
type Position = 'top' | 'bottom'

interface AdData {
  id:             string
  title:          string
  body_text:      string | null
  media_url:      string | null
  media_type:     'image' | 'video' | 'text'
  cta_text:       string | null
  cta_url:        string | null
  animation_type: 'fade' | 'slide' | 'none'
}

interface AdSlotProps {
  zone:      Zone
  position:  Position
  className?: string
}

/** Zone accent colours for the ad border tint */
const ZONE_ACCENT: Record<Zone, string> = {
  universe: '#4d7fff',
  design:   '#b44dff',
  android:  '#00ff87',
  software: '#4d7fff',
  system:   '#ffb800',
}

export default function AdSlot({ zone, position, className }: AdSlotProps) {
  const [ad, setAd]         = useState<AdData | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { track }           = useAnalytics()
  const reduced             = useReducedMotion()

  // Load ad
  useEffect(() => {
    if (dismissed) return

    async function load() {
      try {
        const res = await fetch(`/api/ads?zone=${zone}&position=${position}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json() as { ad: AdData | null }
        if (data.ad) {
          setAd(data.ad)
          // Brief delay before showing so it doesn't flash during zone entrance
          setTimeout(() => setVisible(true), 800)
        }
      } catch { /* silent */ }
    }

    load()
  }, [zone, position, dismissed])

  const handleClick = useCallback(() => {
    if (!ad?.cta_url) return
    track({ event_type: 'ad_click', entity_id: ad.id, entity_type: 'advertisement' })
    window.open(ad.cta_url, '_blank', 'noopener,noreferrer')
  }, [ad, track])

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setDismissed(true)
    setAd(null)
  }, [])

  if (!ad || dismissed) return null

  const accent = ZONE_ACCENT[zone]

  const animStyle: React.CSSProperties = reduced || ad.animation_type === 'none'
    ? { opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }
    : ad.animation_type === 'slide'
    ? {
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : (position === 'top' ? 'translateY(-12px)' : 'translateY(12px)'),
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }
    : {
        opacity:   visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }

  return (
    <aside
      className={cn('relative w-full', className)}
      aria-label={`Sponsored content: ${ad.title}`}
      style={animStyle}
    >
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background:   `rgba(${zone === 'design' ? '180,77,255' : zone === 'android' ? '0,255,135' : zone === 'system' ? '255,184,0' : '77,127,255'},0.04)`,
          border:       `1px solid ${accent}25`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Sponsored label */}
        <span
          className="absolute top-2 left-3 font-mono text-[9px] tracking-widest uppercase"
          style={{ color: `${accent}60` }}
          aria-hidden="true"
        >
          Sponsored
        </span>

        {/* Dismiss button — always accessible, never blocks navigation */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-1.5 right-2 w-6 h-6 flex items-center justify-center rounded cursor-pointer opacity-40 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-energy-white)' }}
          aria-label="Dismiss advertisement"
        >
          <X size={12} />
        </button>

        {/* Ad content */}
        <div
          className={cn(
            'flex items-center gap-4 px-4 pt-6 pb-3',
            ad.cta_url && 'cursor-pointer'
          )}
          onClick={ad.cta_url ? handleClick : undefined}
          role={ad.cta_url ? 'button' : undefined}
          tabIndex={ad.cta_url ? 0 : undefined}
          onKeyDown={ad.cta_url ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() } : undefined}
          aria-label={ad.cta_url ? `${ad.title} — ${ad.cta_text ?? 'Learn more'}` : undefined}
        >
          {/* Media */}
          {ad.media_url && ad.media_type === 'image' && (
            <div className="relative shrink-0 rounded-lg overflow-hidden" style={{ width: 56, height: 56 }}>
              <Image
                src={ad.media_url}
                alt={ad.title}
                fill
                sizes="56px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-sm leading-snug truncate"
              style={{ color: 'var(--color-energy-white)' }}
            >
              {ad.title}
            </p>
            {ad.body_text && (
              <p
                className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
                style={{ color: 'rgba(248,250,255,0.5)' }}
              >
                {ad.body_text}
              </p>
            )}
          </div>

          {/* CTA chip */}
          {ad.cta_text && (
            <span
              className="shrink-0 font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg"
              style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}
              aria-hidden="true"
            >
              {ad.cta_text}
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
