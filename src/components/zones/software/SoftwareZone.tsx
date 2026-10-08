'use client'

/**
 * SoftwareZone — RAVZEN SOFTWARE LAB
 *
 * Stage: 'zone' && activeZone === 'software'
 *
 * Layout:
 *   Sticky header   — title, breadcrumb, back button
 *   Search bar      — live text filter (name + tagline)
 *   Category filter — horizontal scrollable pills
 *   Product grid    — 1 col mobile / 2 tablet / 3 desktop
 *   Detail modal    — SoftwareDetailModal overlay on select
 *
 * Data:
 *   Phase 5: imports from demoProducts (clearly isolated).
 *   Phase 6: swap import for Supabase data-access call → SoftwareProduct[].
 *   The component depends only on SoftwareProduct[]; source is irrelevant.
 *
 * Background: deep blue-violet dark gradient — "digital engine room" feel.
 * Entrance: GSAP header → search → filter → cards stagger.
 * Reduced motion: elements visible immediately.
 */

import {
  useState, useMemo, useEffect, useRef, useCallback,
} from 'react'
import { ArrowLeft, Search }         from 'lucide-react'
import { useExperience }              from '@/store/experienceStore'
import { useReducedMotion }           from '@/hooks/useReducedMotion'
import { SOFTWARE_CATEGORIES }        from '@/types/software'
import { DEMO_SOFTWARE_PRODUCTS }     from '@/data/software/demoProducts'
import SoftwareProductCard            from './SoftwareProductCard'
import SoftwareDetailModal            from './SoftwareDetailModal'
import AdSlot                         from '@/components/ads/AdSlot'
import { cn }                         from '@/lib/utils/cn'
import type { SoftwareProduct, SoftwareCategory } from '@/types/software'

export default function SoftwareZone() {
  const { exitZone }    = useExperience()
  const reduced         = useReducedMotion()
  const containerRef    = useRef<HTMLDivElement>(null)

  const [searchQuery,    setSearchQuery]    = useState('')
  const [activeCategory, setActiveCategory] = useState<SoftwareCategory | 'all'>('all')
  const [selectedProduct, setSelectedProduct] = useState<SoftwareProduct | null>(null)

  // Phase 5 data source — swap for async Supabase fetch in Phase 6
  const allProducts = DEMO_SOFTWARE_PRODUCTS

  const filtered = useMemo(() => {
    let result = activeCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q)
      )
    }

    return result
  }, [allProducts, activeCategory, searchQuery])

  // ── GSAP entrance ─────────────────────────────────────────────────────

  useEffect(() => {
    if (reduced) return
    let cancelled = false

    async function run() {
      const { gsap } = await import('gsap')
      if (cancelled) return
      const el = containerRef.current
      if (!el) return

      const header = el.querySelector<HTMLElement>('.swz-header')
      const search = el.querySelector<HTMLElement>('.swz-search')
      const filter = el.querySelector<HTMLElement>('.swz-filter')
      const cards  = el.querySelectorAll<HTMLElement>('.swz-card')

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(header, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45 }, 0)
      tl.fromTo(search, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 }, 0.18)
      tl.fromTo(filter, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 }, 0.28)
      tl.fromTo(cards,
        { opacity: 0, y: 22, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.06 },
        0.38)
    }

    run()
    return () => { cancelled = true }
  }, [reduced, activeCategory, searchQuery])

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleReturn = useCallback(() => exitZone(), [exitZone])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (selectedProduct) { setSelectedProduct(null); return }
      handleReturn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedProduct, handleReturn])

  return (
    <div
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        background: 'linear-gradient(155deg, #060820 0%, #03040a 55%, #080420 100%)',
        zIndex:     'var(--z-zone)' as unknown as number,
      }}
      role="main"
      aria-label="RAVZEN Software Lab"
    >
      <AdSlot zone="software" position="top" className="px-4 md:px-8 pt-3" />
      <div ref={containerRef} className="max-w-6xl mx-auto px-4 md:px-8 pb-20">

        {/* ── Sticky header ──────────────────────────────────────── */}
        <header
          className={cn(
            'swz-header sticky top-0 z-20',
            'flex items-center justify-between gap-4 py-4 mb-5',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            background:     'rgba(6,8,32,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom:   '1px solid rgba(77,127,255,0.1)',
          }}
        >
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-[0.4em] uppercase mb-0.5"
              style={{ color: 'rgba(77,127,255,0.55)' }}>
              RAVZEN / SOFTWARE
            </p>
            <h1
              className="font-display font-bold tracking-wider leading-none"
              style={{
                fontSize: 'clamp(1.1rem, 3.5vw, 2rem)',
                color:    'var(--color-energy-white)',
              }}
            >
              SOFTWARE LAB
            </h1>
          </div>

          <button
            type="button"
            onClick={handleReturn}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase shrink-0',
              'transition-all duration-200 cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-[#4d7fff] focus-visible:outline-offset-3',
            )}
            style={{
              background: 'rgba(77,127,255,0.08)',
              border:     '1px solid rgba(77,127,255,0.22)',
              color:      '#4d7fff',
            }}
            aria-label="Return to Universe Hub"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Universe</span>
          </button>
        </header>

        {/* Product count */}
        <p className="font-mono text-[10px] tracking-widest uppercase mb-4"
          style={{ color: 'rgba(77,127,255,0.4)' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'all' && ` — ${SOFTWARE_CATEGORIES.find((c) => c.key === activeCategory)?.label}`}
        </p>

        {/* ── Search ─────────────────────────────────────────────── */}
        <div className={cn('swz-search relative mb-4', reduced ? 'opacity-100' : 'opacity-0')}>
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(77,127,255,0.45)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search software..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 rounded-xl text-sm font-mono"
            style={{
              background: 'rgba(77,127,255,0.04)',
              border:     '1px solid rgba(77,127,255,0.14)',
              color:      'var(--color-energy-white)',
              outline:    'none',
            }}
            aria-label="Search software products"
          />
        </div>

        {/* ── Category filter ───────────────────────────────────── */}
        <nav
          className={cn(
            'swz-filter flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-7',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Filter by category"
        >
          <CategoryPill label="All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
          {SOFTWARE_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.key}
              label={cat.label}
              active={activeCategory === cat.key}
              onClick={() => setActiveCategory(cat.key)}
            />
          ))}
        </nav>

        {/* ── Product grid ──────────────────────────────────────── */}
        <section aria-label="Software products">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center gap-3">
              <p className="font-display font-semibold text-lg" style={{ color: 'rgba(77,127,255,0.7)' }}>
                No products found
              </p>
              <p className="text-sm" style={{ color: 'rgba(248,250,255,0.35)' }}>
                Try a different category or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="swz-card"
                  style={{ opacity: reduced ? 1 : 0 }}
                >
                  <SoftwareProductCard product={product} onSelect={setSelectedProduct} />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Detail modal ──────────────────────────────────────── */}
      <SoftwareDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <AdSlot zone="software" position="bottom" className="px-4 md:px-8 pb-4" />
    </div>
  )
}

// ── Category pill ──────────────────────────────────────────────────────────────

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 font-mono text-[10px] tracking-wider uppercase',
        'px-3.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer',
        'transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-[#4d7fff] focus-visible:outline-offset-2',
      )}
      style={{
        background: active ? 'rgba(77,127,255,0.15)' : 'rgba(77,127,255,0.04)',
        border:     `1px solid ${active ? 'rgba(77,127,255,0.4)' : 'rgba(77,127,255,0.12)'}`,
        color:      active ? '#4d7fff' : 'rgba(77,127,255,0.5)',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
