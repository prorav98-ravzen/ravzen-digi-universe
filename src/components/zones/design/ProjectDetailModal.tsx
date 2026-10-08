'use client'

/**
 * ProjectDetailModal — Full-screen overlay for a single design project.
 *
 * Sections:
 *   Header    — title, category, close button
 *   Gallery   — cover image + additional images with left/right navigation
 *   Meta bar  — price, year, client
 *   Body      — full description
 *   Actions   — WhatsApp CTA, Email CTA, external link
 *
 * Accessibility:
 *   - role="dialog", aria-modal="true", aria-labelledby
 *   - Focus trap: first focusable element receives focus on open;
 *     Escape key closes; click outside overlay closes.
 *   - Close button is always visible.
 *
 * Animation:
 *   Framer Motion fade + slide up on enter, fade + slide down on exit.
 *   Reduced motion: no translate, only opacity.
 */

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  type KeyboardEvent,
} from 'react'
import Image                     from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ChevronLeft, ChevronRight,
  MessageCircle, Mail, ExternalLink,
} from 'lucide-react'
import { cn }                    from '@/lib/utils/cn'
import { DESIGN_CATEGORIES }     from '@/types/design'
import { useReducedMotion }       from '@/hooks/useReducedMotion'
import type { DesignProject }    from '@/types/design'

interface ProjectDetailModalProps {
  project:  DesignProject | null
  onClose:  () => void
}

// ── Animation variants ────────────────────────────────────────────────────────

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
}

const panelVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 300 } },
  exit:    { opacity: 0, y: 20, transition: { duration: 0.22 } },
}

const reducedPanelVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

// ── WhatsApp helper ───────────────────────────────────────────────────────────

function buildWhatsAppUrl(phone: string, title: string) {
  const msg = encodeURIComponent(`Hi RAVZEN! I'm interested in: ${title}`)
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const reduced      = useReducedMotion()
  const closeRef     = useRef<HTMLButtonElement>(null)
  const [galleryIdx, setGalleryIdx] = useState(0)

  const allImages = project
    ? [project.coverImage, ...project.gallery].filter(Boolean)
    : []

  const categoryLabel =
    DESIGN_CATEGORIES.find((c) => c.key === project?.category)?.label ?? ''

  // Reset gallery index when project changes
  useEffect(() => { setGalleryIdx(0) }, [project?.id])

  // Focus close button on open
  useEffect(() => {
    if (project) closeRef.current?.focus()
  }, [project])

  // Keyboard: Escape = close; arrow keys = gallery navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowRight') setGalleryIdx((i) => Math.min(i + 1, allImages.length - 1))
      if (e.key === 'ArrowLeft')  setGalleryIdx((i) => Math.max(i - 1, 0))
    },
    [onClose, allImages.length]
  )

  // Prevent body scroll while open
  useEffect(() => {
    if (!project) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [project])

  const panel = reduced ? reducedPanelVariants : panelVariants

  return (
    <AnimatePresence>
      {project && (
        /* ── Backdrop ─────────────────────────────────────────────── */
        <motion.div
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ zIndex: 'var(--z-modal)' as unknown as number, background: 'rgba(0,0,0,0.75)' }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          {/* ── Panel ──────────────────────────────────────────────── */}
          <motion.div
            className="relative w-full sm:max-w-2xl max-h-[96dvh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{
              background:   'linear-gradient(160deg, #0d0720 0%, #060918 100%)',
              border:       '1px solid rgba(180,77,255,0.2)',
              boxShadow:    '0 0 60px rgba(180,77,255,0.15), 0 24px 80px rgba(0,0,0,0.7)',
            }}
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
          >
            {/* ── Sticky header ──────────────────────────────────── */}
            <div
              className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4"
              style={{
                background:     'rgba(6,9,24,0.92)',
                backdropFilter: 'blur(12px)',
                borderBottom:   '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="min-w-0">
                <p
                  className="font-mono text-[9px] tracking-widest uppercase mb-0.5"
                  style={{ color: 'rgba(180,77,255,0.7)' }}
                >
                  {categoryLabel}
                </p>
                <h2
                  id="modal-title"
                  className="font-display font-bold text-base leading-tight"
                  style={{ color: 'var(--color-energy-white)' }}
                >
                  {project.title}
                </h2>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 flex items-center justify-center w-9 h-9 rounded-xl',
                  'text-[rgba(248,250,255,0.5)] hover:text-[var(--color-energy-white)]',
                  'hover:bg-[rgba(255,255,255,0.08)]',
                  'transition-colors duration-200 cursor-pointer',
                  'focus-visible:outline-2 focus-visible:outline-[#b44dff] focus-visible:outline-offset-2',
                )}
                aria-label="Close project details"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Gallery ────────────────────────────────────────── */}
            {allImages.length > 0 && (
              <div
                className="relative w-full"
                style={{ paddingBottom: '56.25%', background: 'rgba(0,0,0,0.5)' }}
                aria-label={`Image ${galleryIdx + 1} of ${allImages.length}`}
              >
                <Image
                  key={allImages[galleryIdx]}
                  src={allImages[galleryIdx]}
                  alt={`${project.title} — image ${galleryIdx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 672px"
                  className="object-cover"
                  priority={galleryIdx === 0}
                />

                {/* Gallery navigation */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setGalleryIdx((i) => Math.max(i - 1, 0))}
                      disabled={galleryIdx === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-sm cursor-pointer disabled:opacity-30 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.55)' }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={16} color="white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryIdx((i) => Math.min(i + 1, allImages.length - 1))}
                      disabled={galleryIdx === allImages.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-sm cursor-pointer disabled:opacity-30 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.55)' }}
                      aria-label="Next image"
                    >
                      <ChevronRight size={16} color="white" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" aria-hidden="true">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setGalleryIdx(i)}
                          className="cursor-pointer rounded-full transition-all duration-200"
                          style={{
                            width:      i === galleryIdx ? 18 : 6,
                            height:     6,
                            background: i === galleryIdx ? '#b44dff' : 'rgba(255,255,255,0.35)',
                          }}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Content ────────────────────────────────────────── */}
            <div className="px-5 py-5 space-y-5">

              {/* Meta bar */}
              <div className="flex flex-wrap gap-3">
                {/* Price */}
                <span
                  className="font-display font-bold text-lg"
                  style={{
                    color: project.price.amount === 0
                      ? 'var(--color-energy-green)'
                      : project.price.amount === null
                      ? 'rgba(248,250,255,0.6)'
                      : '#e8b4ff',
                  }}
                >
                  {project.price.label}
                </span>

                {project.year && (
                  <span
                    className="self-center font-mono text-xs px-2.5 py-1 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color:      'rgba(248,250,255,0.5)',
                    }}
                  >
                    {project.year}
                  </span>
                )}

                {project.client && (
                  <span
                    className="self-center font-mono text-xs px-2.5 py-1 rounded-lg"
                    style={{
                      background: 'rgba(180,77,255,0.08)',
                      border:     '1px solid rgba(180,77,255,0.2)',
                      color:      'rgba(180,77,255,0.8)',
                    }}
                  >
                    {project.client}
                  </span>
                )}
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5" aria-label="Tags">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color:      'rgba(248,250,255,0.4)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <h3
                  className="font-mono text-[10px] tracking-widest uppercase mb-2"
                  style={{ color: 'rgba(180,77,255,0.6)' }}
                >
                  About this project
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(248,250,255,0.7)' }}
                >
                  {project.fullDesc}
                </p>
              </div>

              {/* ── Action buttons ────────────────────────────────── */}
              <div
                className="flex flex-wrap gap-3 pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
              >
                {project.whatsapp && (
                  <a
                    href={buildWhatsAppUrl(project.whatsapp, project.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400',
                    )}
                    style={{
                      background: 'rgba(37,211,102,0.12)',
                      border:     '1px solid rgba(37,211,102,0.3)',
                      color:      '#25d366',
                    }}
                    aria-label={`Contact via WhatsApp about ${project.title}`}
                  >
                    <MessageCircle size={15} aria-hidden="true" />
                    WhatsApp
                  </a>
                )}

                {project.email && (
                  <a
                    href={`mailto:${project.email}?subject=${encodeURIComponent(`Inquiry: ${project.title}`)}`}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
                    )}
                    style={{
                      background: 'rgba(77,127,255,0.12)',
                      border:     '1px solid rgba(77,127,255,0.3)',
                      color:      'var(--color-energy-blue)',
                    }}
                    aria-label={`Email about ${project.title}`}
                  >
                    <Mail size={15} aria-hidden="true" />
                    Email
                  </a>
                )}

                {project.externalUrl && (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400',
                    )}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border:     '1px solid rgba(255,255,255,0.12)',
                      color:      'rgba(248,250,255,0.7)',
                    }}
                    aria-label="View external link"
                  >
                    <ExternalLink size={15} aria-hidden="true" />
                    View
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
