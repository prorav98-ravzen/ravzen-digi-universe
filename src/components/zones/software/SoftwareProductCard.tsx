'use client'

/**
 * SoftwareProductCard — Software product showcase card.
 *
 * Displays: cover image, category badge, name, tagline,
 *           OS compatibility chips, version, price, download/demo chips.
 * Hover: lift + blue-violet border glow.
 * Keyboard: button role, Enter/Space fires onSelect.
 */

import Image                  from 'next/image'
import { useState }           from 'react'
import { Download, Play }     from 'lucide-react'
import { cn }                 from '@/lib/utils/cn'
import { SOFTWARE_CATEGORIES } from '@/types/software'
import type { SoftwareProduct } from '@/types/software'

interface SoftwareProductCardProps {
  product:  SoftwareProduct
  onSelect: (product: SoftwareProduct) => void
}

// Shorten long OS strings for badge display
function shortOS(os: string): string {
  return os
    .replace('Windows ', 'Win ')
    .replace('macOS ', 'Mac ')
    .replace(' (any modern browser)', '')
    .replace('Browser ', '')
    .split(' ')[0]          // take first word if still long
}

export default function SoftwareProductCard({ product, onSelect }: SoftwareProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const categoryLabel =
    SOFTWARE_CATEGORIES.find((c) => c.key === product.category)?.label ?? product.category

  return (
    <article>
      <button
        type="button"
        className={cn(
          'group w-full text-left rounded-2xl overflow-hidden cursor-pointer',
          'transition-all duration-300 ease-out',
          'active:scale-[0.98]',
          'focus-visible:outline-2 focus-visible:outline-offset-3',
          'focus-visible:outline-[#4d7fff]',
        )}
        style={{
          background: 'rgba(77,127,255,0.03)',
          border:     '1px solid rgba(77,127,255,0.1)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.35)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(77,127,255,0.38)'
          el.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(77,127,255,0.12)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(77,127,255,0.1)'
          el.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.35)'
        }}
        onClick={() => onSelect(product)}
        aria-label={`View ${product.name} — ${product.tagline}`}
      >
        {/* ── Cover image ───────────────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: '52%', background: 'rgba(77,127,255,0.04)' }}
        >
          {!imgLoaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
          <Image
            src={product.coverImage}
            alt={product.name}
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

          {/* Dark gradient footer on cover */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(3,4,10,0.85), transparent)' }}
            aria-hidden="true"
          />

          {/* Category badge */}
          <span
            className="absolute top-2.5 left-2.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(77,127,255,0.22)', border: '1px solid rgba(77,127,255,0.38)', color: '#a5b8ff' }}
          >
            {categoryLabel}
          </span>

          {/* Featured / New badges */}
          {product.isFeatured && (
            <span
              className="absolute top-2.5 right-2.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,184,0,0.2)', border: '1px solid rgba(255,184,0,0.35)', color: '#ffd166' }}
              aria-label="Featured product"
            >
              ★ Featured
            </span>
          )}
          {!product.isFeatured && product.isNew && (
            <span
              className="absolute top-2.5 right-2.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(124,92,252,0.2)', border: '1px solid rgba(124,92,252,0.38)', color: '#c4b5fd' }}
            >
              NEW
            </span>
          )}
        </div>

        {/* ── Card body ─────────────────────────────────────────── */}
        <div className="p-4 space-y-2.5">

          {/* Name + tagline */}
          <div>
            <h3
              className="font-display font-semibold text-sm leading-snug"
              style={{ color: 'var(--color-energy-white)' }}
            >
              {product.name}
            </h3>
            <p
              className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
              style={{ color: 'rgba(248,250,255,0.48)' }}
            >
              {product.tagline}
            </p>
          </div>

          {/* OS compatibility chips */}
          {product.supportedOS.length > 0 && (
            <div className="flex flex-wrap gap-1" aria-label="Supported operating systems">
              {product.supportedOS.slice(0, 3).map((os) => (
                <span
                  key={os}
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(77,127,255,0.08)', border: '1px solid rgba(77,127,255,0.18)', color: 'rgba(165,184,255,0.8)' }}
                >
                  {shortOS(os)}
                </span>
              ))}
              {product.supportedOS.length > 3 && (
                <span
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(248,250,255,0.3)' }}
                >
                  +{product.supportedOS.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Version + price + chips */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(77,127,255,0.08)]">
            <div className="flex items-center gap-2">
              {/* Version */}
              <span
                className="font-mono text-[9px]"
                style={{ color: 'rgba(248,250,255,0.3)' }}
              >
                v{product.version}
              </span>

              {/* Download chip */}
              {product.downloadUrl && (
                <span
                  className="flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(77,127,255,0.08)', color: 'rgba(77,127,255,0.75)' }}
                  aria-label="Download available"
                >
                  <Download size={9} aria-hidden="true" /> DL
                </span>
              )}

              {/* Demo chip */}
              {product.demoUrl && (
                <span
                  className="flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(124,92,252,0.08)', color: 'rgba(124,92,252,0.8)' }}
                  aria-label="Demo available"
                >
                  <Play size={9} aria-hidden="true" /> Demo
                </span>
              )}
            </div>

            {/* Price */}
            <span
              className="font-mono text-xs font-semibold"
              style={{
                color: product.isFree ? 'var(--color-energy-green)'
                     : product.price.amount === null ? 'rgba(248,250,255,0.4)'
                     : '#a5b8ff',
              }}
            >
              {product.price.label}
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}
