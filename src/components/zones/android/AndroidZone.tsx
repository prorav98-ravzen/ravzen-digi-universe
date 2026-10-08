'use client'

/**
 * AndroidZone — RAVZEN ANDROID LAB
 *
 * Stage: 'zone' && activeZone === 'android'
 *
 * Layout:
 *   Sticky header   — title, breadcrumb, back button
 *   Search bar      — live text filter
 *   Category filter — scrollable pill row
 *   App grid        — responsive: 1 col mobile / 2 tablet / 3 desktop
 *   Detail modal    — AppDetailModal overlay
 *
 * Data:
 *   Phase 4: imports from demoApps (clearly isolated).
 *   Phase 5: replace import with Supabase data-access call → AndroidApp[].
 *   The component only depends on AndroidApp[]; source is irrelevant.
 *
 * Background: deep dark teal gradient — space-station feel.
 * Entrance: GSAP header → filter → cards stagger.
 * Reduced motion: elements visible immediately.
 */

import {
  useState, useMemo, useEffect, useRef, useCallback,
} from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { useExperience }          from '@/store/experienceStore'
import { useReducedMotion }       from '@/hooks/useReducedMotion'
import { ANDROID_CATEGORIES }     from '@/types/android'
import { DEMO_ANDROID_APPS }      from '@/data/android/demoApps'
import AppCard                    from './AppCard'
import AppDetailModal             from './AppDetailModal'
import AdSlot                     from '@/components/ads/AdSlot'
import { cn }                     from '@/lib/utils/cn'
import type { AndroidApp, AndroidCategory } from '@/types/android'

export default function AndroidZone() {
  const { exitZone }   = useExperience()
  const reduced        = useReducedMotion()
  const containerRef   = useRef<HTMLDivElement>(null)

  const [searchQuery,     setSearchQuery]     = useState('')
  const [activeCategory,  setActiveCategory]  = useState<AndroidCategory | 'all'>('all')
  const [selectedApp,     setSelectedApp]     = useState<AndroidApp | null>(null)

  // Phase 4 data source — replace with async fetch in Phase 5
  const allApps = DEMO_ANDROID_APPS

  const filtered = useMemo(() => {
    let result = activeCategory === 'all'
      ? allApps
      : allApps.filter((a) => a.category === activeCategory)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) => a.name.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q)
      )
    }

    return result
  }, [allApps, activeCategory, searchQuery])

  // ── GSAP entrance ─────────────────────────────────────────────────────

  useEffect(() => {
    if (reduced) return
    let cancelled = false

    async function run() {
      const { gsap } = await import('gsap')
      if (cancelled) return
      const el = containerRef.current
      if (!el) return

      const header = el.querySelector<HTMLElement>('.az-header')
      const search = el.querySelector<HTMLElement>('.az-search')
      const filter = el.querySelector<HTMLElement>('.az-filter')
      const cards  = el.querySelectorAll<HTMLElement>('.az-card')

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

  const handleSelect = useCallback((app: AndroidApp) => {
    setSelectedApp(app)
  }, [])

  // Escape: close modal, then return to hub
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (selectedApp) { setSelectedApp(null); return }
      handleReturn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedApp, handleReturn])

  return (
    <div
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        background: 'linear-gradient(155deg, #031a10 0%, #03040a 50%, #031520 100%)',
        zIndex:     'var(--z-zone)' as unknown as number,
      }}
      role="main"
      aria-label="RAVZEN Android Lab"
    >
      <AdSlot zone="android" position="top" className="px-4 md:px-8 pt-3" />
      <div ref={containerRef} className="max-w-6xl mx-auto px-4 md:px-8 pb-20">

        {/* ── Sticky header ─────────────────────────────────── */}
        <header
          className={cn(
            'az-header sticky top-0 z-20',
            'flex items-center justify-between gap-4 py-4 mb-5',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            background:     'rgba(3,26,16,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom:   '1px solid rgba(0,255,135,0.1)',
          }}
        >
          <div className="min-w-0">
            <p
              className="font-mono text-[9px] tracking-[0.4em] uppercase mb-0.5"
              style={{ color: 'rgba(0,255,135,0.55)' }}
            >
              RAVZEN / ANDROID
            </p>
            <h1
              className="font-display font-bold tracking-wider leading-none"
              style={{
                fontSize: 'clamp(1.1rem, 3.5vw, 2rem)',
                color:    'var(--color-energy-white)',
              }}
            >
              ANDROID LAB
            </h1>
          </div>

          <button
            type="button"
            onClick={handleReturn}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase shrink-0',
              'transition-all duration-200 cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-[#00ff87] focus-visible:outline-offset-3',
            )}
            style={{
              background: 'rgba(0,255,135,0.07)',
              border:     '1px solid rgba(0,255,135,0.2)',
              color:      '#00ff87',
            }}
            aria-label="Return to Universe Hub"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Universe</span>
          </button>
        </header>

        {/* ── App count ─────────────────────────────────────── */}
        <p
          className="font-mono text-[10px] tracking-widest uppercase mb-4"
          style={{ color: 'rgba(0,255,135,0.4)' }}
        >
          {filtered.length} app{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'all' && ` — ${ANDROID_CATEGORIES.find((c) => c.key === activeCategory)?.label}`}
        </p>

        {/* ── Search ────────────────────────────────────────── */}
        <div
          className={cn(
            'az-search relative mb-4',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(0,255,135,0.45)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 rounded-xl text-sm font-mono"
            style={{
              background:  'rgba(0,255,135,0.04)',
              border:      '1px solid rgba(0,255,135,0.15)',
              color:       'var(--color-energy-white)',
              outline:     'none',
            }}
            aria-label="Search Android apps"
          />
        </div>

        {/* ── Category filter ───────────────────────────────── */}
        <nav
          className={cn(
            'az-filter flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-7',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Filter by category"
        >
          <CategoryPill
            label="All"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {ANDROID_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.key}
              label={cat.label}
              active={activeCategory === cat.key}
              onClick={() => setActiveCategory(cat.key)}
            />
          ))}
        </nav>

        {/* ── App grid ──────────────────────────────────────── */}
        <section aria-label="Android apps">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center gap-3">
              <p className="font-display font-semibold text-lg" style={{ color: 'rgba(0,255,135,0.7)' }}>
                No apps found
              </p>
              <p className="text-sm" style={{ color: 'rgba(248,250,255,0.35)' }}>
                Try a different category or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filtered.map((app) => (
                <div
                  key={app.id}
                  className="az-card"
                  style={{ opacity: reduced ? 1 : 0 }}
                >
                  <AppCard app={app} onSelect={handleSelect} />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Detail modal ────────────────────────────────────── */}
      <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      <AdSlot zone="android" position="bottom" className="px-4 md:px-8 pb-4" />
    </div>
  )
}

// ── Category pill ──────────────────────────────────────────────────────────────

function CategoryPill({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 font-mono text-[10px] tracking-wider uppercase',
        'px-3.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer',
        'transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-[#00ff87] focus-visible:outline-offset-2',
      )}
      style={{
        background: active ? 'rgba(0,255,135,0.14)' : 'rgba(0,255,135,0.04)',
        border:     `1px solid ${active ? 'rgba(0,255,135,0.4)' : 'rgba(0,255,135,0.12)'}`,
        color:      active ? '#00ff87' : 'rgba(0,255,135,0.5)',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
