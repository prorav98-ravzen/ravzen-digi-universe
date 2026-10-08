'use client'

/**
 * SystemZone — RAVZEN SYSTEMS
 *
 * Stage: 'zone' && activeZone === 'system'
 *
 * Layout:
 *   Sticky header   — title, breadcrumb, back button
 *   Search bar      — live text filter (name + tagline)
 *   Category filter — scrollable pills (POS / Business / Management / Web / Automation / Custom / Special)
 *   System grid     — 1 col mobile / 2 tablet / 3 desktop
 *   Detail modal    — SystemDetailModal overlay on select
 *
 * Data:
 *   Phase 6: imports from demoSystems (clearly isolated).
 *   Phase 7: swap import → Supabase data-access call returning SystemProject[].
 *   Component depends only on SystemProject[]; source is irrelevant.
 *
 * Background: deep amber-dark gradient — "industrial command centre" feel.
 * Entrance: GSAP header → search → filter → cards stagger.
 * Reduced motion: elements visible immediately.
 */

import {
  useState, useMemo, useEffect, useRef, useCallback,
} from 'react'
import { ArrowLeft, Search }     from 'lucide-react'
import { useExperience }          from '@/store/experienceStore'
import { useReducedMotion }       from '@/hooks/useReducedMotion'
import { SYSTEM_CATEGORIES }      from '@/types/system'
import { DEMO_SYSTEMS }           from '@/data/system/demoSystems'
import SystemCard                 from './SystemCard'
import SystemDetailModal          from './SystemDetailModal'
import AdSlot                     from '@/components/ads/AdSlot'
import { cn }                     from '@/lib/utils/cn'
import type { SystemProject, SystemCategory } from '@/types/system'

export default function SystemZone() {
  const { exitZone }     = useExperience()
  const reduced          = useReducedMotion()
  const containerRef     = useRef<HTMLDivElement>(null)

  const [searchQuery,     setSearchQuery]     = useState('')
  const [activeCategory,  setActiveCategory]  = useState<SystemCategory | 'all'>('all')
  const [selectedSystem,  setSelectedSystem]  = useState<SystemProject | null>(null)

  // Phase 6 data source — swap for Supabase fetch in Phase 7
  const allSystems = DEMO_SYSTEMS

  const filtered = useMemo(() => {
    let result = activeCategory === 'all'
      ? allSystems
      : allSystems.filter((s) => s.category === activeCategory)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q)
      )
    }

    return result
  }, [allSystems, activeCategory, searchQuery])

  // ── GSAP entrance ─────────────────────────────────────────────────────

  useEffect(() => {
    if (reduced) return
    let cancelled = false

    async function run() {
      const { gsap } = await import('gsap')
      if (cancelled) return
      const el = containerRef.current
      if (!el) return

      const header = el.querySelector<HTMLElement>('.sz-header')
      const search = el.querySelector<HTMLElement>('.sz-search')
      const filter = el.querySelector<HTMLElement>('.sz-filter')
      const cards  = el.querySelectorAll<HTMLElement>('.sz-card')

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
      if (selectedSystem) { setSelectedSystem(null); return }
      handleReturn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedSystem, handleReturn])

  return (
    <div
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        background: 'linear-gradient(155deg, #130800 0%, #03040a 55%, #0d0500 100%)',
        zIndex:     'var(--z-zone)' as unknown as number,
      }}
      role="main"
      aria-label="RAVZEN Systems"
    >
      <AdSlot zone="system" position="top" className="px-4 md:px-8 pt-3" />
      <div ref={containerRef} className="max-w-6xl mx-auto px-4 md:px-8 pb-20">

        {/* ── Sticky header ──────────────────────────────────────── */}
        <header
          className={cn(
            'sz-header sticky top-0 z-20',
            'flex items-center justify-between gap-4 py-4 mb-5',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            background:     'rgba(19,8,0,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom:   '1px solid rgba(255,184,0,0.1)',
          }}
        >
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-[0.4em] uppercase mb-0.5"
              style={{ color: 'rgba(255,184,0,0.55)' }}>
              RAVZEN / SYSTEMS
            </p>
            <h1
              className="font-display font-bold tracking-wider leading-none"
              style={{
                fontSize: 'clamp(1.1rem, 3.5vw, 2rem)',
                color:    'var(--color-energy-white)',
              }}
            >
              SYSTEMS
            </h1>
          </div>

          <button
            type="button"
            onClick={handleReturn}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase shrink-0',
              'transition-all duration-200 cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-[#ffb800] focus-visible:outline-offset-3',
            )}
            style={{
              background: 'rgba(255,184,0,0.08)',
              border:     '1px solid rgba(255,184,0,0.22)',
              color:      '#ffb800',
            }}
            aria-label="Return to Universe Hub"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Universe</span>
          </button>
        </header>

        {/* Count */}
        <p className="font-mono text-[10px] tracking-widest uppercase mb-4"
          style={{ color: 'rgba(255,184,0,0.4)' }}>
          {filtered.length} system{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'all' && ` — ${SYSTEM_CATEGORIES.find((c) => c.key === activeCategory)?.label}`}
        </p>

        {/* ── Search ─────────────────────────────────────────────── */}
        <div className={cn('sz-search relative mb-4', reduced ? 'opacity-100' : 'opacity-0')}>
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(255,184,0,0.45)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search systems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 rounded-xl text-sm font-mono"
            style={{
              background: 'rgba(255,184,0,0.04)',
              border:     '1px solid rgba(255,184,0,0.14)',
              color:      'var(--color-energy-white)',
              outline:    'none',
            }}
            aria-label="Search systems"
          />
        </div>

        {/* ── Category filter ───────────────────────────────────── */}
        <nav
          className={cn(
            'sz-filter flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-7',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Filter by category"
        >
          <CategoryPill label="All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
          {SYSTEM_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.key}
              label={cat.label}
              active={activeCategory === cat.key}
              onClick={() => setActiveCategory(cat.key)}
            />
          ))}
        </nav>

        {/* ── System grid ───────────────────────────────────────── */}
        <section aria-label="Systems">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center gap-3">
              <p className="font-display font-semibold text-lg" style={{ color: 'rgba(255,184,0,0.7)' }}>
                No systems found
              </p>
              <p className="text-sm" style={{ color: 'rgba(248,250,255,0.35)' }}>
                Try a different category or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filtered.map((system) => (
                <div key={system.id} className="sz-card" style={{ opacity: reduced ? 1 : 0 }}>
                  <SystemCard system={system} onSelect={setSelectedSystem} />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Detail modal ──────────────────────────────────────── */}
      <SystemDetailModal system={selectedSystem} onClose={() => setSelectedSystem(null)} />
      <AdSlot zone="system" position="bottom" className="px-4 md:px-8 pb-4" />
    </div>
  )
}

// ── Category pill ─────────────────────────────────────────────────────────────

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 font-mono text-[10px] tracking-wider uppercase',
        'px-3.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer',
        'transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-[#ffb800] focus-visible:outline-offset-2',
      )}
      style={{
        background: active ? 'rgba(255,184,0,0.14)' : 'rgba(255,184,0,0.04)',
        border:     `1px solid ${active ? 'rgba(255,184,0,0.4)' : 'rgba(255,184,0,0.12)'}`,
        color:      active ? '#ffb800' : 'rgba(255,184,0,0.5)',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
