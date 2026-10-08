'use client'

/**
 * DesignZone — RAVZEN DESIGN LAB
 *
 * Stage: 'zone' && activeZone === 'design'
 *
 * Layout:
 *   Sticky header    — "RAVZEN DESIGN LAB" title + back-to-universe button
 *   Category filter  — horizontal scrollable pill row
 *   Project grid     — responsive: 1 col mobile / 2 col tablet / 3 col desktop
 *   Detail modal     — ProjectDetailModal overlay on project select
 *
 * Data:
 *   Phase 3: imports from demoProjects (clearly isolated).
 *   Phase 4: swap import → async fetch from Supabase data-access layer.
 *   The component only depends on DesignProject[] — source is irrelevant.
 *
 * Entrance animation (GSAP):
 *   Title + breadcrumb slide up, then cards stagger in.
 *   Reduced motion: elements visible immediately.
 *
 * Background: bright white gradient to give a "design studio" feel,
 *   contrasting with the dark universe and providing good image contrast.
 */

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { ArrowLeft }              from 'lucide-react'
import { useExperience }          from '@/store/experienceStore'
import { useReducedMotion }       from '@/hooks/useReducedMotion'
import { DESIGN_CATEGORIES }      from '@/types/design'
import { DEMO_DESIGN_PROJECTS }   from '@/data/design/demoProjects'
import ProjectCard                from './ProjectCard'
import ProjectDetailModal         from './ProjectDetailModal'
import AdSlot                     from '@/components/ads/AdSlot'
import { cn }                     from '@/lib/utils/cn'
import type { DesignProject, DesignCategory } from '@/types/design'

export default function DesignZone() {
  const { exitZone }    = useExperience()
  const reduced         = useReducedMotion()
  const containerRef    = useRef<HTMLDivElement>(null)

  const [activeCategory, setActiveCategory] = useState<DesignCategory | 'all'>('all')
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null)

  // Phase 3 data source — replace with async fetch in Phase 4
  const allProjects = DEMO_DESIGN_PROJECTS

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return allProjects
    return allProjects.filter((p) => p.category === activeCategory)
  }, [allProjects, activeCategory])

  // ── Entrance animation ─────────────────────────────────────────────────

  useEffect(() => {
    if (reduced) return
    let cancelled = false

    async function run() {
      const { gsap } = await import('gsap')
      if (cancelled) return
      const el = containerRef.current
      if (!el) return

      const header = el.querySelector<HTMLElement>('.dz-header')
      const filter = el.querySelector<HTMLElement>('.dz-filter')
      const cards  = el.querySelectorAll<HTMLElement>('.dz-card')

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(header, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, 0)
      tl.fromTo(filter, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 0.2)
      tl.fromTo(cards,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06 },
        0.35
      )
    }

    run()
    return () => { cancelled = true }
  }, [reduced, activeCategory]) // re-run on filter change too

  // ── Return to universe ─────────────────────────────────────────────────

  const handleReturn = useCallback(() => {
    exitZone()
  }, [exitZone])

  // ── Keyboard: Escape closes modal or returns to hub ────────────────────

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (selectedProject) { setSelectedProject(null); return }
      handleReturn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedProject, handleReturn])

  return (
    <div
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        background: 'linear-gradient(155deg, #faf8ff 0%, #f2f0ff 40%, #fdf5ff 100%)',
        zIndex:     'var(--z-zone)' as unknown as number,
      }}
      role="main"
      aria-label="RAVZEN Design Lab"
    >
      {/* ── Top ad slot ─────────────────────────────────────────────── */}
      <AdSlot zone="design" position="top" className="px-4 md:px-8 pt-3" />

      <div ref={containerRef} className="max-w-6xl mx-auto px-4 md:px-8 pb-20">

        {/* ── Sticky header ──────────────────────────────────────── */}
        <header
          className={cn(
            'dz-header sticky top-0 z-20',
            'flex items-center justify-between gap-4',
            'py-4 mb-6',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            background:     'rgba(250,248,255,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom:   '1px solid rgba(180,77,255,0.12)',
          }}
        >
          {/* Left: breadcrumb + title */}
          <div className="min-w-0">
            <p
              className="font-mono text-[9px] tracking-[0.4em] uppercase mb-0.5"
              style={{ color: 'rgba(180,77,255,0.6)' }}
            >
              RAVZEN / DESIGN
            </p>
            <h1
              className="font-display font-bold tracking-wider leading-none"
              style={{
                fontSize:   'clamp(1.1rem, 3.5vw, 2rem)',
                color:      '#1a0d2e',
              }}
            >
              DESIGN LAB
            </h1>
          </div>

          {/* Right: back button */}
          <button
            type="button"
            onClick={handleReturn}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase',
              'transition-all duration-200 cursor-pointer shrink-0',
              'focus-visible:outline-2 focus-visible:outline-[#b44dff] focus-visible:outline-offset-3',
            )}
            style={{
              background: 'rgba(180,77,255,0.08)',
              border:     '1px solid rgba(180,77,255,0.2)',
              color:      '#b44dff',
            }}
            aria-label="Return to Universe Hub"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Universe</span>
          </button>
        </header>

        {/* ── Sub-header — project count ───────────────────────── */}
        <p
          className="font-mono text-[10px] tracking-widest uppercase mb-5"
          style={{ color: 'rgba(80,40,120,0.45)' }}
        >
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'all' && ` — ${DESIGN_CATEGORIES.find((c) => c.key === activeCategory)?.label}`}
        </p>

        {/* ── Category filter ────────────────────────────────────── */}
        <nav
          className={cn(
            'dz-filter flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-8',
            reduced ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Filter by category"
        >
          {/* "All" pill */}
          <CategoryPill
            label="All"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {DESIGN_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.key}
              label={cat.label}
              active={activeCategory === cat.key}
              onClick={() => setActiveCategory(cat.key)}
            />
          ))}
        </nav>

        {/* ── Project grid ───────────────────────────────────────── */}
        <section aria-label="Design projects">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-display font-semibold text-lg mb-2" style={{ color: '#4a2080' }}>
                No projects yet
              </p>
              <p className="text-sm" style={{ color: 'rgba(80,40,120,0.5)' }}>
                Nothing in this category — check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filtered.map((project) => (
                <div
                  key={project.id}
                  className="dz-card"
                  style={{ opacity: reduced ? 1 : 0 }}
                >
                  <ProjectCard
                    project={project}
                    onSelect={setSelectedProject}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Project detail modal ───────────────────────────────────── */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* ── Bottom ad slot ──────────────────────────────────────────── */}
      <AdSlot zone="design" position="bottom" className="px-4 md:px-8 pb-4" />
    </div>
  )
}

// ── Category pill ─────────────────────────────────────────────────────────────

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label:   string
  active:  boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 font-mono text-[10px] tracking-wider uppercase',
        'px-3.5 py-1.5 rounded-full whitespace-nowrap',
        'transition-all duration-200 cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-[#b44dff] focus-visible:outline-offset-2',
      )}
      style={{
        background: active ? 'rgba(180,77,255,0.15)' : 'rgba(180,77,255,0.05)',
        border:     `1px solid ${active ? 'rgba(180,77,255,0.45)' : 'rgba(180,77,255,0.15)'}`,
        color:      active ? '#b44dff'                              : 'rgba(100,60,160,0.7)',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
