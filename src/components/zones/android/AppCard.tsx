'use client'

/**
 * AppCard — Android app showcase card.
 *
 * Displays: icon, name, tagline, category badge, version, price chip,
 *           download and demo availability indicators.
 * Hover: subtle lift + green border glow.
 * Keyboard: button role, Enter/Space fires onSelect.
 * Image: icon uses next/image with skeleton fallback.
 */

import Image              from 'next/image'
import { useState }       from 'react'
import { Download, Play } from 'lucide-react'
import { cn }             from '@/lib/utils/cn'
import { ANDROID_CATEGORIES } from '@/types/android'
import type { AndroidApp }    from '@/types/android'

interface AppCardProps {
  app:      AndroidApp
  onSelect: (app: AndroidApp) => void
}

export default function AppCard({ app, onSelect }: AppCardProps) {
  const [iconLoaded, setIconLoaded] = useState(false)

  const categoryLabel =
    ANDROID_CATEGORIES.find((c) => c.key === app.category)?.label ?? app.category

  return (
    <article>
      <button
        type="button"
        className={cn(
          'group w-full text-left rounded-2xl overflow-hidden cursor-pointer',
          'transition-all duration-300 ease-out',
          'active:scale-[0.98]',
          'focus-visible:outline-2 focus-visible:outline-offset-3',
          'focus-visible:outline-[#00ff87]',
        )}
        style={{
          background: 'rgba(0,255,135,0.025)',
          border:     '1px solid rgba(0,255,135,0.1)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.35)',
          // Hover glow via CSS — performance-friendly
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(0,255,135,0.35)'
          el.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.45), 0 0 20px rgba(0,255,135,0.12)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(0,255,135,0.1)'
          el.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.35)'
        }}
        onClick={() => onSelect(app)}
        aria-label={`View ${app.name} — ${app.tagline}`}
      >
        {/* ── Cover strip ─────────────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: '55%', background: 'rgba(0,255,135,0.04)' }}
        >
          <Image
            src={app.coverImage}
            alt={app.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-transform duration-500',
              'group-hover:scale-105',
              iconLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setIconLoaded(true)}
            loading="lazy"
          />
          {!iconLoaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}

          {/* Gradient footer on cover */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(3,4,10,0.8), transparent)' }}
            aria-hidden="true"
          />

          {/* Badges */}
          {app.isNew && (
            <span
              className="absolute top-2.5 left-2.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(0,255,135,0.25)', border: '1px solid rgba(0,255,135,0.4)', color: '#00ff87' }}
            >
              NEW
            </span>
          )}
          {app.isFeatured && (
            <span
              className="absolute top-2.5 right-2.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,184,0,0.2)', border: '1px solid rgba(255,184,0,0.35)', color: '#ffd166' }}
              aria-label="Featured app"
            >
              ★ Featured
            </span>
          )}
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="flex gap-3 p-4">
          {/* App icon */}
          <div
            className="relative shrink-0 rounded-xl overflow-hidden"
            style={{ width: 52, height: 52, background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)' }}
          >
            <Image
              src={app.iconUrl}
              alt=""
              fill
              sizes="52px"
              className="object-cover"
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3
              className="font-display font-semibold text-sm leading-snug line-clamp-1"
              style={{ color: 'var(--color-energy-white)' }}
            >
              {app.name}
            </h3>
            <p
              className="text-xs line-clamp-2 leading-relaxed"
              style={{ color: 'rgba(248,250,255,0.5)' }}
            >
              {app.tagline}
            </p>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              {/* Category */}
              <span
                className="font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', color: '#00ff87' }}
              >
                {categoryLabel}
              </span>

              {/* Version */}
              <span
                className="font-mono text-[9px]"
                style={{ color: 'rgba(248,250,255,0.3)' }}
              >
                v{app.version}
              </span>

              {/* Price */}
              <span
                className="font-mono text-[9px] tracking-wide font-semibold ml-auto"
                style={{
                  color: app.isFree ? '#00ff87'
                       : app.price.amount === null ? 'rgba(248,250,255,0.4)'
                       : '#00d4ff',
                }}
              >
                {app.price.label}
              </span>
            </div>

            {/* Download / Demo chips */}
            <div className="flex gap-1.5 pt-0.5">
              {app.apkUrl && (
                <span
                  className="flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,255,135,0.08)', color: 'rgba(0,255,135,0.7)' }}
                  aria-label="APK download available"
                >
                  <Download size={9} aria-hidden="true" /> APK
                </span>
              )}
              {app.demoUrl && (
                <span
                  className="flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,212,255,0.08)', color: 'rgba(0,212,255,0.7)' }}
                  aria-label="Demo available"
                >
                  <Play size={9} aria-hidden="true" /> Demo
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </article>
  )
}
