'use client'

/**
 * AppDetailModal — Full-screen overlay for a single Android app.
 *
 * Sections:
 *   Header       — icon, name, tagline, category, close
 *   Screenshots  — horizontal scroll with snap (mobile-native feel)
 *   Meta bar     — version, Android compat, file size, price
 *   Features     — bulleted feature list
 *   Description  — full text
 *   Changelog    — accordion-style per version
 *   Actions      — Download APK, Demo, WhatsApp, Email, Play Store
 *
 * Accessibility:
 *   - role="dialog", aria-modal, aria-labelledby
 *   - Focus to close button on open
 *   - Escape key closes
 *   - Click outside closes
 *
 * Animation: Framer Motion spring slide-up; reduced-motion = opacity only.
 */

import {
  useEffect, useRef, useCallback, useState,
  type KeyboardEvent,
} from 'react'
import Image                      from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Download, Play, MessageCircle, Mail,
  ShoppingBag, ChevronDown, Check,
} from 'lucide-react'
import { cn }                     from '@/lib/utils/cn'
import { ANDROID_CATEGORIES }     from '@/types/android'
import { useReducedMotion }        from '@/hooks/useReducedMotion'
import type { AndroidApp, ChangelogEntry } from '@/types/android'

interface AppDetailModalProps {
  app:     AndroidApp | null
  onClose: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildWhatsAppUrl(phone: string, name: string) {
  const msg = encodeURIComponent(`Hi RAVZEN! I'm interested in the app: ${name}`)
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`
}

// ── Animation variants ────────────────────────────────────────────────────────

const overlayV = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }

const panelV = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 26, stiffness: 280 } },
  exit:    { opacity: 0, y: 24, transition: { duration: 0.2 } },
}

const reducedV = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0, transition: { duration: 0.14 } },
}

// ── Changelog entry ───────────────────────────────────────────────────────────

function ChangelogItem({ entry }: { entry: ChangelogEntry }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(0,255,135,0.1)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3',
          'cursor-pointer text-left transition-colors duration-200',
        )}
        style={{ background: open ? 'rgba(0,255,135,0.05)' : 'rgba(0,255,135,0.02)' }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold" style={{ color: '#00ff87' }}>
            v{entry.version}
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'rgba(248,250,255,0.35)' }}>
            {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{
            color:    'rgba(0,255,135,0.5)',
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
              <Check size={11} style={{ color: '#00ff87', marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
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
    <div
      className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl"
      style={{ background: 'rgba(0,255,135,0.05)', border: '1px solid rgba(0,255,135,0.12)' }}
    >
      <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(0,255,135,0.55)' }}>
        {label}
      </span>
      <span className="font-display font-semibold text-xs" style={{ color: 'var(--color-energy-white)' }}>
        {value}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AppDetailModal({ app, onClose }: AppDetailModalProps) {
  const reduced   = useReducedMotion()
  const closeRef  = useRef<HTMLButtonElement>(null)
  const panel     = reduced ? reducedV : panelV
  const category  = ANDROID_CATEGORIES.find((c) => c.key === app?.category)?.label ?? ''

  useEffect(() => { if (app) closeRef.current?.focus() }, [app])

  useEffect(() => {
    if (!app) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [app])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  return (
    <AnimatePresence>
      {app && (
        <motion.div
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ zIndex: 'var(--z-modal)' as unknown as number, background: 'rgba(0,0,0,0.78)' }}
          variants={overlayV}
          initial="hidden" animate="visible" exit="exit"
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="relative w-full sm:max-w-2xl max-h-[96dvh] sm:max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{
              background: 'linear-gradient(160deg, #031a10 0%, #03040a 100%)',
              border:     '1px solid rgba(0,255,135,0.18)',
              boxShadow:  '0 0 60px rgba(0,255,135,0.12), 0 24px 80px rgba(0,0,0,0.7)',
            }}
            variants={panel}
            initial="hidden" animate="visible" exit="exit"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="amd-title"
            tabIndex={-1}
          >
            {/* ── Sticky header ──────────────────────────────── */}
            <div
              className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4"
              style={{
                background:     'rgba(3,26,16,0.92)',
                backdropFilter: 'blur(12px)',
                borderBottom:   '1px solid rgba(0,255,135,0.1)',
              }}
            >
              {/* App icon */}
              <div
                className="relative shrink-0 rounded-xl overflow-hidden"
                style={{ width: 48, height: 48, background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)' }}
              >
                <Image src={app.iconUrl} alt="" fill sizes="48px" className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-mono text-[9px] tracking-widest uppercase mb-0.5" style={{ color: 'rgba(0,255,135,0.6)' }}>
                  {category}
                </p>
                <h2 id="amd-title" className="font-display font-bold text-base leading-tight truncate" style={{ color: 'var(--color-energy-white)' }}>
                  {app.name}
                </h2>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer',
                  'text-[rgba(248,250,255,0.45)] hover:text-[var(--color-energy-white)]',
                  'hover:bg-[rgba(0,255,135,0.08)] transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-[#00ff87] focus-visible:outline-offset-2',
                )}
                aria-label="Close app details"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Screenshots — horizontal scroll ────────────── */}
            {app.screenshots.length > 0 && (
              <div
                className="flex gap-3 overflow-x-auto scrollbar-none px-5 py-4"
                role="region"
                aria-label="App screenshots"
              >
                {[app.coverImage, ...app.screenshots].map((src, i) => (
                  <div
                    key={i}
                    className="relative shrink-0 rounded-xl overflow-hidden"
                    style={{ width: 160, height: 284, background: 'rgba(0,0,0,0.4)' }}
                  >
                    <Image
                      src={src}
                      alt={`${app.name} — screenshot ${i + 1}`}
                      fill
                      sizes="160px"
                      className="object-cover"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── Content ────────────────────────────────────── */}
            <div className="px-5 pb-6 space-y-6">

              {/* Price + tagline */}
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(248,250,255,0.65)' }}>
                  {app.tagline}
                </p>
                <span
                  className="shrink-0 font-display font-bold text-lg"
                  style={{ color: app.isFree ? '#00ff87' : app.price.amount === null ? 'rgba(248,250,255,0.5)' : '#00d4ff' }}
                >
                  {app.price.label}
                </span>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <MetaPill label="Version"    value={`v${app.version}`}    />
                <MetaPill label="Android"    value={app.minAndroid}        />
                <MetaPill label="Size"       value={`${app.fileSizeMb} MB`} />
                <MetaPill label="Target API" value={`Android ${app.targetAndroid}`} />
              </div>

              {/* Features */}
              <div>
                <h3 className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(0,255,135,0.55)' }}>
                  Features
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {app.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={11} className="shrink-0 mt-0.5" style={{ color: '#00ff87' }} aria-hidden="true" />
                      <span className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,255,0.7)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(0,255,135,0.55)' }}>
                  About
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,255,0.65)' }}>
                  {app.fullDesc}
                </p>
              </div>

              {/* Permissions */}
              {app.permissions.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: 'rgba(0,255,135,0.55)' }}>
                    Permissions
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {app.permissions.map((p) => (
                      <span key={p}
                        className="font-mono text-[9px] px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,250,255,0.4)' }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Video link */}
              {app.videoUrl && (
                <a
                  href={app.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-mono"
                  style={{ color: '#00d4ff' }}
                >
                  <Play size={13} aria-hidden="true" />
                  Watch demo video
                </a>
              )}

              {/* Changelog */}
              {app.changelog.length > 0 && (
                <div>
                  <h3 className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(0,255,135,0.55)' }}>
                    Changelog
                  </h3>
                  <div className="space-y-2">
                    {app.changelog.map((entry) => (
                      <ChangelogItem key={entry.version} entry={entry} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Actions ──────────────────────────────────── */}
              <div
                className="flex flex-wrap gap-3 pt-2"
                style={{ borderTop: '1px solid rgba(0,255,135,0.08)' }}
              >
                {app.apkUrl && (
                  <a
                    href={app.apkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-[#00ff87] focus-visible:outline-offset-2',
                    )}
                    style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#03040a' }}
                    aria-label={`Download ${app.name} APK`}
                  >
                    <Download size={14} aria-hidden="true" /> Download APK
                  </a>
                )}

                {app.demoUrl && (
                  <a
                    href={app.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-[#00d4ff] focus-visible:outline-offset-2',
                    )}
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
                    aria-label={`Try ${app.name} demo`}
                  >
                    <Play size={14} aria-hidden="true" /> Try Demo
                  </a>
                )}

                {app.playStoreUrl && (
                  <a
                    href={app.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                    )}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,250,255,0.7)' }}
                    aria-label="View on Play Store"
                  >
                    <ShoppingBag size={14} aria-hidden="true" /> Play Store
                  </a>
                )}

                {app.whatsapp && (
                  <a
                    href={buildWhatsAppUrl(app.whatsapp, app.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                    )}
                    style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366' }}
                    aria-label={`Contact about ${app.name} via WhatsApp`}
                  >
                    <MessageCircle size={14} aria-hidden="true" /> WhatsApp
                  </a>
                )}

                {app.email && (
                  <a
                    href={`mailto:${app.email}?subject=${encodeURIComponent(`Inquiry: ${app.name}`)}`}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold',
                      'transition-all duration-200 cursor-pointer',
                    )}
                    style={{ background: 'rgba(77,127,255,0.1)', border: '1px solid rgba(77,127,255,0.3)', color: '#4d7fff' }}
                    aria-label={`Email about ${app.name}`}
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
