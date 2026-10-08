'use client'

/**
 * ProjectCard — Reusable design project card.
 *
 * Displays: cover image, category badge, title, short description, price.
 * Hover state: image scales, card lifts with shadow increase.
 * Keyboard: fully accessible button — Enter/Space fires onSelect.
 * Image: uses next/image with fill layout for responsive aspect-ratio box.
 * Loading: skeleton shimmer shown until image loads (onLoadingComplete).
 */

import Image                from 'next/image'
import { useState }         from 'react'
import { cn }               from '@/lib/utils/cn'
import { DESIGN_CATEGORIES } from '@/types/design'
import type { DesignProject } from '@/types/design'

interface ProjectCardProps {
  project:  DesignProject
  onSelect: (project: DesignProject) => void
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const categoryLabel =
    DESIGN_CATEGORIES.find((c) => c.key === project.category)?.label ?? project.category

  return (
    <article>
      <button
        type="button"
        className={cn(
          'group w-full text-left rounded-2xl overflow-hidden',
          'cursor-pointer',
          'transition-all duration-300 ease-out',
          'focus-visible:outline-2 focus-visible:outline-offset-3',
          'focus-visible:outline-[#b44dff]',
          'active:scale-[0.98]',
        )}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border:     '1px solid rgba(255,255,255,0.08)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.3)',
        }}
        onClick={() => onSelect(project)}
        aria-label={`View ${project.title}`}
      >
        {/* ── Cover image ─────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '62%' }}>
          {/* Skeleton while image loads */}
          {!imgLoaded && (
            <div className="skeleton absolute inset-0" aria-hidden="true" />
          )}

          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-transform duration-500 ease-out',
              'group-hover:scale-105',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />

          {/* Category badge */}
          <span
            className="absolute top-3 left-3 font-mono text-[9px] tracking-widest uppercase px-2 py-1 rounded-md backdrop-blur-sm"
            style={{
              background: 'rgba(180,77,255,0.25)',
              border:     '1px solid rgba(180,77,255,0.4)',
              color:      '#e8b4ff',
            }}
          >
            {categoryLabel}
          </span>

          {/* Featured badge */}
          {project.isFeatured && (
            <span
              className="absolute top-3 right-3 font-mono text-[9px] tracking-widest uppercase px-2 py-1 rounded-md backdrop-blur-sm"
              style={{
                background: 'rgba(255,184,0,0.2)',
                border:     '1px solid rgba(255,184,0,0.35)',
                color:      '#ffd166',
              }}
              aria-label="Featured project"
            >
              ★ Featured
            </span>
          )}

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(10,4,26,0.7) 0%, transparent 50%)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* ── Card body ───────────────────────────────────────────── */}
        <div className="p-4 space-y-2">
          <h3
            className="font-display font-semibold text-sm leading-snug line-clamp-2"
            style={{ color: 'var(--color-energy-white)' }}
          >
            {project.title}
          </h3>

          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: 'rgba(248,250,255,0.5)' }}
          >
            {project.shortDesc}
          </p>

          {/* Price + year row */}
          <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.06)]">
            <span
              className="font-mono text-xs font-semibold"
              style={{
                color: project.price.amount === 0
                  ? 'var(--color-energy-green)'
                  : project.price.amount === null
                  ? 'rgba(248,250,255,0.45)'
                  : '#e8b4ff',
              }}
            >
              {project.price.label}
            </span>

            {project.year && (
              <span
                className="font-mono text-[10px]"
                style={{ color: 'rgba(248,250,255,0.3)' }}
              >
                {project.year}
              </span>
            )}
          </div>
        </div>
      </button>
    </article>
  )
}
