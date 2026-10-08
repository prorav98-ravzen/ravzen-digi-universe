'use client'

/**
 * SoftwareDetailModal — Full detail overlay for a software product.
 *
 * Sections:
 *   Header       — name, category badge, close button
 *   Gallery      — cover + gallery images, dot-nav pager
 *   Meta grid    — version, OS count, price
 *   Features     — bulleted checklist
 *   Description  — full text
 *   Requirements — system requirements text block
 *   OS badges    — all supported OS strings
 *   Video        — link to demo video
 *   Changelog    — accordion per version
 *   Actions      — Download, Demo, WhatsApp, Email
 *
 * Accessibility: dialog role, aria-modal, labelledby, focus-to-close,
 *   Escape closes, click-outside closes, body scroll locked while open.
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
  X, Download, Play, MessageCircle,
  Mail, ChevronDown, Check, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn }                      from '@/lib/utils/cn'
import { SOFTWARE_CATEGORIES }     from '@/types/software'
import { useReducedMotion }         from '@/hooks/useReducedMotion'
import type { SoftwareProduct, ChangelogEntry } from '@/types/software'

interface Props {
  product:  SoftwareProduct | null
  onClose:  () => void
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

// ── WA helper ─────────────────────────────────────────────────────────────────

function waUrl(phone: string, name: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi RAVZEN! Interested in: ${name}`)}`
}

// ── Changelog accordion ───────────────────────────────────────────────────────

function ChangelogItem({ entry }: { entry: ChangelogEntry }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(77,127,255,0.12)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer text-left"
        style={{ background: open ? 'rgba(77,127,255,0.06)' : 'rgba(77,127,255,0.02)' }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold" style={{ color: '#4d7fff' }}>
            v{entry.version}
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'rgba(248,250,255,0.35)' }}>
            {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: 'rgba(77,127,255,0.5)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-1.5">
          {entry.notes.map((note, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check size={11} style={{ color: '#4d7fff', marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
              <span className="text-xs" style={{ color: 'rgba(248,250,255,0.6)' }}>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Meta pill ─────────────────────────────────────────────────────────────────

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl"
      style={{ background: 'rgba(77,127,255,0.05)', border: '1px solid rgba(77,127,255,0.12)' }}>
      <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(77,127,255,0.55)' }}>
        {label}
      </span>
      <span className="font-display font-semibold text-xs" style={{ color: 'var(--color-energy-white)' }}>
        {value}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SoftwareDetailModal({ product, onClose }: Props) {
  const reduced     = useReducedMotion()
  const closeRef    = useRef<HTMLButtonElement>(null)
  const panel       = reduced ? reducedV : panelV
  const [galIdx, setGalIdx] = useState(0)

  const allImages = product
    ? [product.coverImage, ...product.gallery].filter(Boolean)
    : []

  const category = SOFTWARE_CATEGORIES.find((c) => c.key === product?.category)?.label ?? ''

  useEffect(() => { if (product) { setGalIdx(0); closeRef.current?.focus() } }, [product])

  useEffect(() => {
    if (!product) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [product])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape')       { onClose(); return }
    if (e.key === 'ArrowRight')   setGalIdx((i) => Math.min(i + 1, allImages.length - 1))
    if (e.key === 'ArrowLeft')    setGalIdx((i) => Math.max(i - 1, 0))
  }, [onClose, allImages.length])

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ zIndex: 'var(--z-modal)' as unknown as number, background: 'rgba(0,0,0,0.80)' }}
          variants={overlayV}
          initial="hidden" animate="visible" exit="exit"
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="relative w-full sm:max-w-2xl max-h-[96dvh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{
              background: 'linear-gradient(160deg, #080e28 0%, #03040a 100%)',
              border:     '1px solid rgba(77,127,255,0.2)',
              boxShadow:  '0 0 60px rgba(77,127,255,0.12), 0 24px 80px rgba(0,0,0,0.7)',
            }}
            variants={panel}
            initial="hidden" animate="visible" exit="exit"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sw-modal-title"
            tabIndex={-1}
          >
            {/* ── Sticky header ──────────────────────────────── */}
            <div
              className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4"
              style={{
                background:     'rgba(8,14,40,0.92)',
                backdropFilter: 'blur(12px)',
                borderBottom:   '1px solid rgba(77,127,255,0.1)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[9px] tracking-widest uppercase mb-0.5" style={{ color: 'rgba(77,127,255,0.6)' }}>
                  {category}
                </p>
                <h2
                  id="sw-modal-title"
                  className="font-display font-bold text-base leading-tight truncate"
                  style={{ color: 'var(--color-energy-white)' }}
                >
                  {product.name}
                </h2>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer',
                  'text-[rgba(248,250,255,0.45)] hover:text-[var(--color-energy-white)]',
                  'hover:bg-[rgba(77,127,255,0.1)] transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-[#4d7fff] focus-visible:outline-offset-2',
                )}
                aria-label="Close product details"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Gallery ────────────────────────────────────── */}
            {allImages.length > 0 && (
              <div
                className="relative w-full"
                style={{ paddingBottom: '52%', background: 'rgba(0,0,0,0.5)' }}
                aria-label={`Image ${galIdx + 1} of ${allImages.length}`}
              >
                <Image
                  key={allImages[galIdx]}
                  src={allImages[galIdx]}
                  alt={`${product.name} — image ${galIdx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 672px"
                  className="object-cover"
                  priority={galIdx === 0}
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setGalIdx((i) => Math.max(i - 1, 0))}
                      disabled={galIdx === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer disabled:opacity-30"
                      style={{ background: 'rgba(0,0,0,0.6)' }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={16} color="white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalIdx((i) => Math.min(i + 1, allImages.length - 1))}
                      disabled={galIdx === allImages.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer disabled:opacity-30"
                      style={{ background: 'rgba(0,0,0,0.6)' }}
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
                          onClick={() => setGalIdx(i)}
                          className="cursor-pointer rounded-full transition-all duration-200"
                          style={{
                            width:      i === galIdx ? 18 : 6,
                            height:     6,
                            background: i === galIdx ? '#4d7fff' : 'rgba(255,255,255,0.35)',
                          }}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Content ────────────────────────────────────── */}
            <div className="px-5 pb-6 space-y-6">

              {/* Tagline + price */}
              <div className="flex items-start justify-between gap-4 pt-5">
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(248,250,255,0.65)' }}>
                  {product.tagline}
                </p>
                <span
                  className="shrink-0 font-display font-bold text-lg"
                  style={{
                    color: product.isFree ? 'var(--color-energy-green)'
                         : product.price.amount === null ? 'rgba(248,250,255,0.5)'
                         : '#a5b8ff',
                  }}
                >
                  {product.price.label}
                </span>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <MetaPill label="Version"    value={`v${product.version}`}         />
                <MetaPill label="Platforms"  value={`${product.supportedOS.length} OS`} />
                <MetaPill label="Category"   value={category}                       />
              </div>

              {/* OS compatibility */}
              <div>
                <h3 className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(77,127,255,0.55)' }}>
                  Supported Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.supportedOS.map((os) => (
                    <span
                      key={os}
                      className="font-mono text-[10px] px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(77,127,255,0.07)', border: '1px solid rgba(77,127,255,0.18)', color: 'rgba(165,184,255,0.85)' }}
                    >
                      {os}
                    </span>
                  ))}
                </div>
              </div>

              {/* System requirements */}
              {product.requirements && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(77,127,255,0.55)' }}>
                    System Requirements
                  </h3>
                  <p className="text-xs leading-relaxed font-mono" style={{ color: 'rgba(248,250,255,0.5)', background: 'rgba(77,127,255,0.04)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(77,127,255,0.1)' }}>
                    {product.requirements}
                  </p>
                </div>
              )}

              {/* Features */}
              {product.features.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(77,127,255,0.55)' }}>
                    Features
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={11} className="shrink-0 mt-0.5" style={{ color: '#4d7fff' }} aria-hidden="true" />
                        <span className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,255,0.7)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(77,127,255,0.55)' }}>
                  About
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,255,0.65)' }}>
                  {product.fullDesc}
                </p>
              </div>

              {/* Video link */}
              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-mono"
                  style={{ color: '#7c5cfc' }}
                >
                  <Play size={13} aria-hidden="true" />
                  Watch demo video
                </a>
              )}

              {/* Changelog */}
              {product.changelog.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(77,127,255,0.55)' }}>
                    Changelog
                  </h3>
                  <div className="space-y-2">
                    {product.changelog.map((entry) => (
                      <ChangelogItem key={entry.version} entry={entry} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Actions ──────────────────────────────────── */}
              <div
                className="flex flex-wrap gap-3 pt-2"
                style={{ borderTop: '1px solid rgba(77,127,255,0.08)' }}
              >
                {product.downloadUrl && (
                  <a
                    href={product.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-[#4d7fff] focus-visible:outline-offset-2',
                    )}
                    style={{ background: 'linear-gradient(135deg, #4d7fff, #7c5cfc)', color: '#fff' }}
                    aria-label={`Download ${product.name}`}
                  >
                    <Download size={14} aria-hidden="true" /> Download
                  </a>
                )}

                {product.demoUrl && (
                  <a
                    href={product.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-[#7c5cfc] focus-visible:outline-offset-2',
                    )}
                    style={{ background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.3)', color: '#c4b5fd' }}
                    aria-label={`Try ${product.name} demo`}
                  >
                    <Play size={14} aria-hidden="true" /> Try Demo
                  </a>
                )}

                {product.whatsapp && (
                  <a
                    href={waUrl(product.whatsapp, product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                    )}
                    style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366' }}
                    aria-label={`Contact about ${product.name} via WhatsApp`}
                  >
                    <MessageCircle size={14} aria-hidden="true" /> WhatsApp
                  </a>
                )}

                {product.email && (
                  <a
                    href={`mailto:${product.email}?subject=${encodeURIComponent(`Inquiry: ${product.name}`)}`}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                    )}
                    style={{ background: 'rgba(77,127,255,0.1)', border: '1px solid rgba(77,127,255,0.3)', color: '#4d7fff' }}
                    aria-label={`Email about ${product.name}`}
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
