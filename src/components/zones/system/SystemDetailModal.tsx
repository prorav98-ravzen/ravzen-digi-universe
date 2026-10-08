'use client'

/**
 * SystemDetailModal — Full detail overlay for a system project.
 *
 * Sections:
 *   Header       — name, category, status chip, close button
 *   Media tabs   — Screenshots tab | Diagrams tab (switch between galleries)
 *   Meta grid    — status, service model, industry, year
 *   Tech stack   — all tech tags
 *   Features     — bulleted checklist
 *   Description  — full text
 *   Requirements — deployment / system requirements
 *   Video        — demo video link
 *   Changelog    — accordion per version
 *   Actions      — Demo, WhatsApp, Email
 *
 * Accessibility: dialog, aria-modal, labelledby, focus-to-close,
 *   Escape closes, click-outside closes, body scroll locked.
 *
 * Animation: Framer Motion spring slide-up; reduced = opacity only.
 */

import {
  useEffect, useRef, useCallback, useState,
  type KeyboardEvent,
} from 'react'
import Image                       from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Play, MessageCircle, Mail,
  ChevronDown, Check, ChevronLeft, ChevronRight,
  Monitor, GitBranch,
} from 'lucide-react'
import { cn }                      from '@/lib/utils/cn'
import {
  SYSTEM_CATEGORIES, PROJECT_STATUS_LABELS,
  type SystemProject, type ChangelogEntry,
} from '@/types/system'
import { useReducedMotion }         from '@/hooks/useReducedMotion'

interface Props {
  system:  SystemProject | null
  onClose: () => void
}

// ── Animation variants ────────────────────────────────────────────────────────

const overlayV = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
const panelV = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 26, stiffness: 280 } },
  exit:    { opacity: 0, y: 24, transition: { duration: 0.2 } },
}
const reducedV = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0, transition: { duration: 0.14 } },
}

// ── Status style ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  'active':      '#00ff87',
  'beta':        '#4d7fff',
  'coming-soon': '#ffb800',
  'archived':    'rgba(248,250,255,0.4)',
}

const SERVICE_LABELS: Record<string, string> = {
  'one-time': 'One-time',
  'saas':     'SaaS',
  'custom':   'Custom Build',
}

// ── WA helper ─────────────────────────────────────────────────────────────────

function waUrl(phone: string, name: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi RAVZEN! Interested in: ${name}`)}`
}

// ── Changelog accordion ───────────────────────────────────────────────────────

function ChangelogItem({ entry }: { entry: ChangelogEntry }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,184,0,0.12)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer text-left"
        style={{ background: open ? 'rgba(255,184,0,0.06)' : 'rgba(255,184,0,0.02)' }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold" style={{ color: '#ffb800' }}>
            v{entry.version}
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'rgba(248,250,255,0.35)' }}>
            {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{ color: 'rgba(255,184,0,0.5)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-1.5">
          {entry.notes.map((note, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check size={11} style={{ color: '#ffb800', marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
              <span className="text-xs" style={{ color: 'rgba(248,250,255,0.6)' }}>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Meta pill ─────────────────────────────────────────────────────────────────

function MetaPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl"
      style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.12)' }}>
      <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,184,0,0.55)' }}>
        {label}
      </span>
      <span className="font-display font-semibold text-xs" style={{ color: color ?? 'var(--color-energy-white)' }}>
        {value}
      </span>
    </div>
  )
}

// ── Image gallery ─────────────────────────────────────────────────────────────

function ImageGallery({ images, name, emptyLabel }: { images: string[]; name: string; emptyLabel: string }) {
  const [idx, setIdx] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,184,0,0.15)' }}>
        <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,184,0,0.3)' }}>
          {emptyLabel}
        </p>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: '52%', background: 'rgba(0,0,0,0.5)' }}
      aria-label={`Image ${idx + 1} of ${images.length}`}>
      <Image
        key={images[idx]}
        src={images[idx]}
        alt={`${name} — image ${idx + 1}`}
        fill
        sizes="(max-width: 640px) 100vw, 672px"
        className="object-cover"
        priority={idx === 0}
      />
      {images.length > 1 && (
        <>
          <button type="button" onClick={() => setIdx((i) => Math.max(i - 1, 0))}
            disabled={idx === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer disabled:opacity-30"
            style={{ background: 'rgba(0,0,0,0.6)' }} aria-label="Previous">
            <ChevronLeft size={16} color="white" />
          </button>
          <button type="button" onClick={() => setIdx((i) => Math.min(i + 1, images.length - 1))}
            disabled={idx === images.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer disabled:opacity-30"
            style={{ background: 'rgba(0,0,0,0.6)' }} aria-label="Next">
            <ChevronRight size={16} color="white" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5" aria-hidden="true">
            {images.map((_, i) => (
              <button key={i} type="button" onClick={() => setIdx(i)}
                className="cursor-pointer rounded-full transition-all duration-200"
                style={{ width: i === idx ? 18 : 6, height: 6, background: i === idx ? '#ffb800' : 'rgba(255,255,255,0.35)' }}
                aria-label={`Image ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SystemDetailModal({ system, onClose }: Props) {
  const reduced     = useReducedMotion()
  const closeRef    = useRef<HTMLButtonElement>(null)
  const panel       = reduced ? reducedV : panelV
  const [mediaTab, setMediaTab] = useState<'screenshots' | 'diagrams'>('screenshots')

  const category = SYSTEM_CATEGORIES.find((c) => c.key === system?.category)?.label ?? ''
  const statusColor = system ? (STATUS_COLOR[system.status] ?? 'white') : 'white'
  const statusLabel = system ? PROJECT_STATUS_LABELS[system.status] : ''

  useEffect(() => { if (system) { setMediaTab('screenshots'); closeRef.current?.focus() } }, [system])

  useEffect(() => {
    if (!system) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [system])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  return (
    <AnimatePresence>
      {system && (
        <motion.div
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ zIndex: 'var(--z-modal)' as unknown as number, background: 'rgba(0,0,0,0.82)' }}
          variants={overlayV}
          initial="hidden" animate="visible" exit="exit"
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="relative w-full sm:max-w-2xl max-h-[96dvh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{
              background: 'linear-gradient(160deg, #130a00 0%, #03040a 100%)',
              border:     '1px solid rgba(255,184,0,0.2)',
              boxShadow:  '0 0 60px rgba(255,184,0,0.1), 0 24px 80px rgba(0,0,0,0.75)',
            }}
            variants={panel}
            initial="hidden" animate="visible" exit="exit"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sys-modal-title"
            tabIndex={-1}
          >
            {/* ── Sticky header ─────────────────────────────── */}
            <div
              className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4"
              style={{
                background:     'rgba(19,10,0,0.92)',
                backdropFilter: 'blur(12px)',
                borderBottom:   '1px solid rgba(255,184,0,0.1)',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,184,0,0.6)' }}>
                    {category}
                  </p>
                  <span
                    className="font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded"
                    style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}40`, color: statusColor }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <h2
                  id="sys-modal-title"
                  className="font-display font-bold text-base leading-tight truncate"
                  style={{ color: 'var(--color-energy-white)' }}
                >
                  {system.name}
                </h2>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer',
                  'text-[rgba(248,250,255,0.45)] hover:text-[var(--color-energy-white)]',
                  'hover:bg-[rgba(255,184,0,0.08)] transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-[#ffb800] focus-visible:outline-offset-2',
                )}
                aria-label="Close system details"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Media tabs ────────────────────────────────── */}
            <div className="px-5 pt-5 space-y-3">
              {/* Tab row */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMediaTab('screenshots')}
                  className={cn(
                    'flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[#ffb800] focus-visible:outline-offset-2',
                  )}
                  style={{
                    background: mediaTab === 'screenshots' ? 'rgba(255,184,0,0.12)' : 'rgba(255,184,0,0.03)',
                    border:     `1px solid ${mediaTab === 'screenshots' ? 'rgba(255,184,0,0.35)' : 'rgba(255,184,0,0.1)'}`,
                    color:      mediaTab === 'screenshots' ? '#ffb800' : 'rgba(255,184,0,0.4)',
                  }}
                  aria-pressed={mediaTab === 'screenshots'}
                >
                  <Monitor size={11} aria-hidden="true" /> Screenshots
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('diagrams')}
                  className={cn(
                    'flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[#ffb800] focus-visible:outline-offset-2',
                  )}
                  style={{
                    background: mediaTab === 'diagrams' ? 'rgba(255,184,0,0.12)' : 'rgba(255,184,0,0.03)',
                    border:     `1px solid ${mediaTab === 'diagrams' ? 'rgba(255,184,0,0.35)' : 'rgba(255,184,0,0.1)'}`,
                    color:      mediaTab === 'diagrams' ? '#ffb800' : 'rgba(255,184,0,0.4)',
                  }}
                  aria-pressed={mediaTab === 'diagrams'}
                >
                  <GitBranch size={11} aria-hidden="true" /> Diagrams
                </button>
              </div>

              {/* Gallery */}
              {mediaTab === 'screenshots' ? (
                <ImageGallery
                  images={system.screenshots}
                  name={system.name}
                  emptyLabel="No screenshots available"
                />
              ) : (
                <ImageGallery
                  images={system.diagrams}
                  name={`${system.name} architecture`}
                  emptyLabel="No diagrams available"
                />
              )}
            </div>

            {/* ── Content ───────────────────────────────────── */}
            <div className="px-5 pb-6 space-y-6 mt-4">

              {/* Tagline + price */}
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(248,250,255,0.65)' }}>
                  {system.tagline}
                </p>
                <span
                  className="shrink-0 font-display font-bold text-lg"
                  style={{ color: system.contactForQuote ? 'rgba(248,250,255,0.5)' : '#ffd166' }}
                >
                  {system.price.label}
                </span>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <MetaPill label="Status"   value={statusLabel}                       color={statusColor} />
                <MetaPill label="Model"    value={SERVICE_LABELS[system.serviceModel] ?? system.serviceModel} />
                <MetaPill label="Industry" value={system.clientIndustry ?? '—'}       />
                <MetaPill label="Year"     value={system.projectYear ? String(system.projectYear) : '—'} />
              </div>

              {/* Tech stack */}
              {system.techStack.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(255,184,0,0.55)' }}>
                    Technology Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {system.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(255,184,0,0.07)', border: '1px solid rgba(255,184,0,0.18)', color: 'rgba(255,209,102,0.85)' }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {system.features.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(255,184,0,0.55)' }}>
                    Features
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {system.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={11} className="shrink-0 mt-0.5" style={{ color: '#ffb800' }} aria-hidden="true" />
                        <span className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,255,0.7)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(255,184,0,0.55)' }}>
                  About
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,255,0.65)' }}>
                  {system.fullDesc}
                </p>
              </div>

              {/* Requirements */}
              {system.requirements && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(255,184,0,0.55)' }}>
                    Deployment / Requirements
                  </h3>
                  <p
                    className="text-xs leading-relaxed font-mono"
                    style={{ color: 'rgba(248,250,255,0.5)', background: 'rgba(255,184,0,0.04)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,184,0,0.1)' }}
                  >
                    {system.requirements}
                  </p>
                </div>
              )}

              {/* Video */}
              {system.videoUrl && (
                <a
                  href={system.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-mono"
                  style={{ color: '#ff6b35' }}
                >
                  <Play size={13} aria-hidden="true" />
                  Watch demo video
                </a>
              )}

              {/* Changelog */}
              {system.changelog.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(255,184,0,0.55)' }}>
                    Changelog
                  </h3>
                  <div className="space-y-2">
                    {system.changelog.map((entry) => (
                      <ChangelogItem key={entry.version} entry={entry} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Actions ───────────────────────────────── */}
              <div
                className="flex flex-wrap gap-3 pt-2"
                style={{ borderTop: '1px solid rgba(255,184,0,0.08)' }}
              >
                {system.demoUrl && (
                  <a
                    href={system.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-[#ffb800] focus-visible:outline-offset-2',
                    )}
                    style={{ background: 'linear-gradient(135deg, #ffb800, #ff6b35)', color: '#0d0800' }}
                    aria-label={`Try ${system.name} demo`}
                  >
                    <Play size={14} aria-hidden="true" /> View Demo
                  </a>
                )}

                {system.whatsapp && (
                  <a
                    href={waUrl(system.whatsapp, system.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                    )}
                    style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366' }}
                    aria-label={`Contact about ${system.name} via WhatsApp`}
                  >
                    <MessageCircle size={14} aria-hidden="true" /> WhatsApp
                  </a>
                )}

                {system.email && (
                  <a
                    href={`mailto:${system.email}?subject=${encodeURIComponent(`Inquiry: ${system.name}`)}`}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                    )}
                    style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)', color: '#ffb800' }}
                    aria-label={`Email about ${system.name}`}
                  >
                    <Mail size={14} aria-hidden="true" /> Email
                  </a>
                )}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
