'use client'

/**
 * SystemCard — System project showcase card.
 *
 * Displays: cover image, category badge, project status badge,
 *           name, tagline, tech-stack chips (first 3), price/contact.
 * Hover: lift + gold-orange border glow.
 * Keyboard: button role, Enter/Space fires onSelect.
 */

import Image                  from 'next/image'
import { useState }           from 'react'
import { cn }                 from '@/lib/utils/cn'
import {
  SYSTEM_CATEGORIES,
  PROJECT_STATUS_LABELS,
  type SystemProject,
} from '@/types/system'

interface SystemCardProps {
  system:   SystemProject
  onSelect: (system: SystemProject) => void
}

// Status → colour
const STATUS_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  'active':      { bg: 'rgba(0,255,135,0.12)', border: 'rgba(0,255,135,0.3)',  color: '#00ff87' },
  'beta':        { bg: 'rgba(77,127,255,0.12)', border: 'rgba(77,127,255,0.3)', color: '#4d7fff' },
  'coming-soon': { bg: 'rgba(255,184,0,0.12)',  border: 'rgba(255,184,0,0.3)',  color: '#ffb800' },
  'archived':    { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(248,250,255,0.4)' },
}

export default function SystemCard({ system, onSelect }: SystemCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const categoryLabel =
    SYSTEM_CATEGORIES.find((c) => c.key === system.category)?.label ?? system.category

  const statusStyle = STATUS_STYLE[system.status] ?? STATUS_STYLE['active']
  const statusLabel = PROJECT_STATUS_LABELS[system.status]

  return (
    <article>
      <button
        type="button"
        className={cn(
          'group w-full text-left rounded-2xl overflow-hidden cursor-pointer',
          'transition-all duration-300 ease-out active:scale-[0.98]',
          'focus-visible:outline-2 focus-visible:outline-offset-3',
          'focus-visible:outline-[#ffb800]',
        )}
        style={{
          background: 'rgba(255,184,0,0.025)',
          border:     '1px solid rgba(255,184,0,0.1)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.35)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(255,184,0,0.38)'
          el.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(255,184,0,0.1)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(255,184,0,0.1)'
          el.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.35)'
        }}
        onClick={() => onSelect(system)}
        aria-label={`View ${system.name} — ${system.tagline}`}
      >
        {/* ── Cover image ─────────────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: '52%', background: 'rgba(255,184,0,0.04)' }}
        >
          {!imgLoaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}

          <Image
            src={system.coverImage}
            alt={system.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-transform duration-500',
              'group-hover:scale-105',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />

          {/* Bottom gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(3,4,10,0.85), transparent)' }}
            aria-hidden="true"
          />

          {/* Category badge */}
          <span
            className="absolute top-2.5 left-2.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(255,184,0,0.2)', border: '1px solid rgba(255,184,0,0.35)', color: '#ffd166' }}
          >
            {categoryLabel}
          </span>

          {/* Status badge */}
          <span
            className="absolute top-2.5 right-2.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-md"
            style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.color }}
            aria-label={`Project status: ${statusLabel}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* ── Card body ─────────────────────────────────────────── */}
        <div className="p-4 space-y-2.5">

          {/* Name + tagline */}
          <div>
            <h3
              className="font-display font-semibold text-sm leading-snug"
              style={{ color: 'var(--color-energy-white)' }}
            >
              {system.name}
            </h3>
            <p
              className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
              style={{ color: 'rgba(248,250,255,0.48)' }}
            >
              {system.tagline}
            </p>
          </div>

          {/* Tech stack chips */}
          {system.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1" aria-label="Technology stack">
              {system.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,184,0,0.07)', border: '1px solid rgba(255,184,0,0.18)', color: 'rgba(255,209,102,0.8)' }}
                >
                  {tech}
                </span>
              ))}
              {system.techStack.length > 3 && (
                <span
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(248,250,255,0.3)' }}
                >
                  +{system.techStack.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Industry + price row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(255,184,0,0.08)]">
            <span
              className="font-mono text-[9px]"
              style={{ color: 'rgba(255,184,0,0.5)' }}
            >
              {system.clientIndustry ?? system.category}
              {system.projectYear && ` · ${system.projectYear}`}
            </span>
            <span
              className="font-mono text-xs font-semibold"
              style={{
                color: system.contactForQuote ? 'rgba(248,250,255,0.4)'
                     : system.price.amount === 0 ? 'var(--color-energy-green)'
                     : '#ffd166',
              }}
            >
              {system.price.label}
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}
