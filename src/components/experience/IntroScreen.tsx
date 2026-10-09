'use client'

/**
 * IntroScreen — Phase 1 entrance experience.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Stage: 'intro'                                             │
 * │                                                             │
 * │  Background: near-white (#f0f2ff) — clean, premium, minimal │
 * │                                                             │
 * │  Sequence (GSAP timeline):                                  │
 * │    0.0s  Subtle futuristic grid fades in                    │
 * │    0.3s  Ambient particles drift upward                     │
 * │    0.6s  Title letters reveal from centre outward           │
 * │    2.0s  Light sweep across the title                       │
 * │    2.8s  Portal icon pulses in                              │
 * │    3.2s  "TAP / CLICK TO ENTER" CTA fades in               │
 * │    3.5s  "Skip intro" link fades in                         │
 * │                                                             │
 * │  Reduced motion: instant reveal, no GSAP, static layout    │
 * │  Keyboard: Enter / Space fires handleEnter                  │
 * │  Touch: onPointerUp fires handleEnter                       │
 * └─────────────────────────────────────────────────────────────┘
 */

import {
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { useExperience } from '@/store/experienceStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import PortalIcon from './PortalIcon'
import { INTRO_TEXT, ENTER_TEXT } from '@/config/site'
import { cn } from '@/lib/utils/cn'

// ── Particle seed (deterministic, no Math.random at SSR) ─────────────────────

interface Particle {
  id: number
  x: number   // % from left
  y: number   // % from top
  size: number   // px
  delay: number   // animation-delay s
  dur: number   // animation-duration s
  color: string
}

const PARTICLES: Particle[] = Array.from({ length: 18 }, (_, i) => {
  const colors = [
    'rgba(77,127,255,0.45)',
    'rgba(124,92,252,0.4)',
    'rgba(0,212,255,0.35)',
    'rgba(77,127,255,0.3)',
  ]
  return {
    id: i,
    x: ((i * 73 + 11) % 89) + 5,          // 5–94 %
    y: ((i * 47 + 17) % 78) + 10,          // 10–88 %
    size: 1.5 + ((i * 13) % 20) / 10,         // 1.5–3.5 px
    delay: (i * 0.28) % 5,
    dur: 3 + ((i * 17) % 30) / 10,           // 3–6 s
    color: colors[i % colors.length],
  }
})

// ── Letter split helper ───────────────────────────────────────────────────────

function LetterSplit({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-label={text} className={className}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="letter inline-block"
          aria-hidden="true"
          // Preserve spaces
          style={{ display: ch === ' ' ? 'inline' : 'inline-block' }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IntroScreen() {
  const { enterPortal, skipToHub } = useExperience()
  const reduced = useReducedMotion()
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)')

  // Prevent double-trigger if user clicks multiple times quickly
  const enteringRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)


  // ── Entry handler ───────────────────────────────────────────────────────

  const handleEnter = useCallback(() => {
    if (enteringRef.current) return
    enteringRef.current = true

    // Kill the intro timeline so it doesn't fight the exit
    timelineRef.current?.kill()

    enterPortal()
  }, [enterPortal])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleEnter()
      }
    },
    [handleEnter]
  )

  // ── GSAP animation ──────────────────────────────────────────────────────

  useEffect(() => {
    if (reduced) {
      return
    }

    let tl: gsap.core.Timeline

    async function run() {
      const { gsap } = await import('gsap')
      const el = containerRef.current
      if (!el) return

      const grid = el.querySelector<HTMLElement>('.intro-grid')
      const particles = el.querySelectorAll<HTMLElement>('.intro-particle')
      const letters = el.querySelectorAll<HTMLElement>('.letter')
      const sweep = el.querySelector<HTMLElement>('.intro-sweep')
      const icon = el.querySelector<HTMLElement>('.intro-icon')
      const cta = el.querySelector<HTMLElement>('.intro-cta')
      const skip = el.querySelector<HTMLElement>('.intro-skip')

      tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timelineRef.current = tl

      // 0: grid fades in
      tl.fromTo(grid, { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0)

      // 0.3: particles drift up
      tl.fromTo(
        particles,
        { opacity: 0, y: 18, scale: 0 },
        { opacity: 1, y: 0, scale: 1, duration: 1.6, stagger: 0.07 },
        0.3
      )

      // 0.6: letters reveal from centre outward
      tl.fromTo(
        letters,
        { opacity: 0, y: 12, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.55,
          stagger: { amount: 1.4, from: 'center' },
        },
        0.6
      )

      // 2.0: light sweep
      tl.fromTo(
        sweep,
        { x: '-115%' },
        { x: '115%', duration: 1.1, ease: 'power2.inOut' },
        2.0
      )

      // 2.8: portal icon scales in
      tl.fromTo(
        icon,
        { opacity: 0, scale: 0.5, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.8)' },
        2.8
      )

      // 3.2: CTA
      tl.fromTo(
        cta,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6 },
        3.2
      )

      // 3.5: skip
      tl.fromTo(
        skip,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        3.5
      )
    }

    run()

    return () => {
      timelineRef.current?.kill()
    }
  }, [reduced])

  // ── Render ──────────────────────────────────────────────────────────────

  const enterLabel = isTouch ? ENTER_TEXT.mobile : ENTER_TEXT.desktop

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: 'linear-gradient(145deg, #f4f6ff 0%, #eef0fa 50%, #f2f0ff 100%)' }}
      role="main"
    >
      {/* ── Skip to main content (accessibility) ───────────────────── */}
      <a
        href="#intro-cta"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:fixed focus:top-4 focus:left-4 focus:z-[70]',
          'focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-mono',
          'focus:bg-[var(--color-energy-blue)] focus:text-white'
        )}
      >
        Skip to enter button
      </a>

      {/* ── Futuristic grid ────────────────────────────────────────── */}
      <div
        className="intro-grid absolute inset-0 pointer-events-none"
        style={{ opacity: reduced ? 0.7 : 0 }}
        aria-hidden="true"
      >
        {/* Fine dot-grid using SVG pattern — more premium than CSS gradients */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="0.8" cy="0.8" r="0.8" fill="rgba(77,127,255,0.18)" />
            </pattern>
            <pattern id="grid-lines" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path
                d="M 120 0 L 0 0 0 120"
                fill="none"
                stroke="rgba(77,127,255,0.07)"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-lines)" />
          <rect width="100%" height="100%" fill="url(#grid-dots)" />
        </svg>
      </div>

      {/* ── Ambient corner glows ───────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 55% 45% at 5% 10%, rgba(77,127,255,0.07) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 55% at 95% 90%, rgba(124,92,252,0.06) 0%, transparent 70%)',
          ].join(', '),
        }}
      />

      {/* ── Floating particles ─────────────────────────────────────── */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="intro-particle absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: reduced ? p.size / 6 : 0, // visible immediately in reduced mode
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            ...(reduced
              ? {}
              : {
                animation: `float-slow ${p.dur}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }),
          }}
        />
      ))}

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-4xl w-full">

        {/* Title */}
        <div className="relative overflow-visible">
          {/* Light sweep overlay (sibling to title, absolute) */}
          <div
            className="intro-sweep absolute inset-y-[-10%] w-[35%] pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(77,127,255,0.12) 30%, rgba(255,255,255,0.35) 50%, rgba(77,127,255,0.12) 70%, transparent 100%)',
              transform: 'skewX(-12deg)',
              // hidden initially — GSAP moves it across
              translate: '-115% 0',
              opacity: reduced ? 0 : 1,
            }}
          />

          <h1
            className={cn(
              'font-display font-bold tracking-[0.05em] leading-tight',
              'text-[var(--color-mid)]',
            )}
            style={{
              fontSize: 'clamp(1rem, 3.8vw, 3.2rem)',
              textShadow: '0 0 40px rgba(77,127,255,0.08)',
            }}
          >
            {reduced ? (
              INTRO_TEXT
            ) : (
              <LetterSplit text={INTRO_TEXT} />
            )}
          </h1>
        </div>

        {/* Portal icon + CTA group */}
        <div className="flex flex-col items-center gap-5">
          {/* Animated portal icon */}
          <div
            className="intro-icon"
            style={{ opacity: reduced ? 1 : 0 }}
          >
            <PortalIcon size={72} />
          </div>

          {/* Primary CTA button */}
          <div
            id="intro-cta"
            className="intro-cta"
            style={{ opacity: reduced ? 1 : 0 }}
          >
            <button
              type="button"
              onClick={handleEnter}
              onKeyDown={handleKeyDown}
              className={cn(
                'group relative font-display font-semibold tracking-[0.22em] uppercase',
                'px-8 py-3.5 rounded-xl border transition-all duration-300',
                'text-[var(--color-mid)] text-sm',
                'border-[rgba(77,127,255,0.3)]',
                'hover:border-[rgba(77,127,255,0.7)]',
                'hover:text-[var(--color-energy-blue)]',
                'hover:shadow-[0_0_28px_rgba(77,127,255,0.22)]',
                'focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)] focus-visible:outline-offset-4',
                'cursor-pointer active:scale-[0.97]',
              )}
              aria-label="Enter the RAVZEN DIGI UNIVERSE"
            >
              {/* Hover fill */}
              <span
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(77,127,255,0.07) 0%, rgba(124,92,252,0.07) 100%)',
                }}
                aria-hidden="true"
              />
              <span className="relative">{enterLabel}</span>
            </button>
          </div>

          {/* Skip intro */}
          <div
            className="intro-skip"
            style={{ opacity: reduced ? 1 : 0 }}
          >
            <button
              type="button"
              onClick={skipToHub}
              className={cn(
                'text-xs font-mono tracking-widest uppercase',
                'text-[rgba(10,15,46,0.35)] hover:text-[rgba(10,15,46,0.65)]',
                'underline underline-offset-4 decoration-[rgba(10,15,46,0.2)]',
                'transition-colors duration-200 cursor-pointer',
                'focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)] focus-visible:outline-offset-2',
              )}
              aria-label="Skip the intro animation and go directly to the Universe Hub"
            >
              Skip intro
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
