'use client'

/**
 * ClosingExperience — The final chapter of the RAVZEN DIGI UNIVERSE.
 *
 * Triggered when the visitor has explored at least one zone and
 * clicks the closing prompt in HubNav.
 *
 * Sequence:
 *   1. Elegant fade in over the dark universe background
 *   2. "YOU HAVE EXPLORED THE RAVZEN DIGI UNIVERSE"  (Orbitron, glow)
 *   3. Beat / pause
 *   4. "BUT THIS UNIVERSE IS STILL EXPANDING..."      (lighter, italic feel)
 *   5. "CREATE SOMETHING WITH RAVZEN"                 (call to action)
 *   6. Three action buttons: WHATSAPP · EMAIL · REQUEST A PROJECT
 *   7. Subtle "Return to Universe" escape link — never traps the visitor
 *
 * Design:
 *   - Dark space background matching the hub
 *   - Stars subtly visible behind the text
 *   - Glow text with centre-outward GSAP reveal
 *   - Buttons styled with energy-pulse micro-interaction on hover
 *
 * Reduced motion: everything renders immediately, no GSAP.
 * All CTAs functional — WhatsApp/email links use SITE_CONFIG values.
 */

import { useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Mail, Zap, ArrowLeft } from 'lucide-react'
import { useExperience }   from '@/store/experienceStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SITE_CONFIG }     from '@/config/site'
import { useAnalytics }    from '@/hooks/useAnalytics'
import { cn }              from '@/lib/utils/cn'

const WA_URL = SITE_CONFIG.whatsapp
  ? `https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi RAVZEN! I want to create something.')}`
  : 'https://wa.me/2348000000000'

const EMAIL_URL = SITE_CONFIG.email
  ? `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent('I want to create something with RAVZEN')}`
  : 'mailto:hello@ravzen.com'

export default function ClosingExperience() {
  const { returnToHub }  = useExperience()
  const reduced          = useReducedMotion()
  const containerRef     = useRef<HTMLDivElement>(null)
  const tlRef            = useRef<gsap.core.Timeline | null>(null)
  const { track }        = useAnalytics()

  // GSAP reveal sequence
  useEffect(() => {
    if (reduced) return
    let cancelled = false

    async function run() {
      const { gsap } = await import('gsap')
      if (cancelled) return
      const el = containerRef.current
      if (!el) return

      const logo    = el.querySelector<HTMLElement>('.cl-logo')
      const line2   = el.querySelector<HTMLElement>('.cl-line2')
      const line3   = el.querySelector<HTMLElement>('.cl-line3')
      const buttons = el.querySelector<HTMLElement>('.cl-buttons')
      const escape  = el.querySelector<HTMLElement>('.cl-escape')
      const stars   = el.querySelector<HTMLElement>('.cl-stars')

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tlRef.current = tl

      // Background stars drift in
      tl.fromTo(stars, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0)

      // Official Logo fade and scale in
      tl.fromTo(logo, { opacity: 0, y: 14, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0.1)

      // Line 1 — character stagger from centre
      const chars1 = el.querySelectorAll('.cl-char1')
      tl.fromTo(
        chars1,
        { opacity: 0, y: 12, filter: 'blur(4px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.5,
          stagger: { amount: 1.2, from: 'center' },
        },
        0.4
      )

      // Line 2 — fade up after pause
      tl.fromTo(line2,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        2.0
      )

      // Line 3 — CTA
      tl.fromTo(line3,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6 },
        2.9
      )

      // Buttons stagger
      tl.fromTo(buttons,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        3.5
      )

      // Escape link
      tl.fromTo(escape,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        4.2
      )
    }

    run()
    return () => {
      cancelled = true
      tlRef.current?.kill()
    }
  }, [reduced])

  const handleCTAClick = useCallback((type: 'whatsapp' | 'email' | 'project') => {
    track({ event_type: 'cta_click', entity_type: 'design' })
    if (type === 'project') {
      // Scroll to contact or open a project request flow
      window.open(EMAIL_URL.replace('I want to create something with RAVZEN', 'Request a Project'), '_blank', 'noopener')
    }
  }, [track])

  const LINE1 = 'YOU HAVE EXPLORED THE RAVZEN DIGI UNIVERSE'
  const ready = (opacity: number) => ({ opacity: reduced ? 1 : opacity })

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #060918 0%, #03040a 100%)',
        zIndex: 'var(--z-overlay)' as unknown as number,
      }}
      role="main"
      aria-label="RAVZEN Closing Experience"
    >
      {/* Subtle star field */}
      <div
        className="cl-stars absolute inset-0 pointer-events-none"
        style={{ ...ready(0) }}
        aria-hidden="true"
      >
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left:       `${((i * 73 + 11) % 89) + 5}%`,
              top:        `${((i * 47 + 17) % 78) + 5}%`,
              width:      `${0.5 + ((i * 13) % 20) / 10}px`,
              height:     `${0.5 + ((i * 13) % 20) / 10}px`,
              background: 'rgba(248,250,255,0.6)',
              opacity:    0.1 + ((i * 19) % 40) / 100,
            }}
          />
        ))}
      </div>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(77,127,255,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 50% at 20% 70%, rgba(124,92,252,0.04) 0%, transparent 70%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-6 md:gap-8 max-w-3xl w-full">

        {/* Brand Logo Emblem */}
        <div className="cl-logo" style={{ ...ready(0) }}>
          <img
            src="/images/ravzen-logo.png"
            alt="RAVZEN Official Emblem"
            width={56}
            height={56}
            className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-[0_0_24px_rgba(77,127,255,0.4)] select-none"
          />
        </div>

        {/* Line 1 */}
        <div className="cl-line1 space-y-1" style={{ ...ready(0) }}>
          <p
            className="font-mono text-[9px] tracking-[0.4em] uppercase"
            style={{ color: 'rgba(77,127,255,0.5)' }}
          >
            RAVZEN DIGI UNIVERSE
          </p>
          <h1
            className="font-display font-bold leading-tight"
            style={{
              fontSize:   'clamp(1.0rem, 3vw, 2.2rem)',
              color:      'var(--color-energy-white)',
              textShadow: '0 0 40px rgba(77,127,255,0.25), 0 0 80px rgba(77,127,255,0.08)',
              letterSpacing: '0.06em',
            }}
            aria-label={LINE1}
          >
            {reduced ? LINE1 : LINE1.split('').map((ch, i) => (
              <span
                key={i}
                className="cl-char1 inline-block"
                aria-hidden="true"
                style={{ display: ch === ' ' ? 'inline' : 'inline-block', opacity: 0 }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </h1>
        </div>

        {/* Divider line */}
        <div
          className="w-16 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(77,127,255,0.4), transparent)' }}
          aria-hidden="true"
        />

        {/* Line 2 */}
        <p
          className="cl-line2 font-display font-medium tracking-wider"
          style={{
            fontSize:   'clamp(0.9rem, 2.5vw, 1.6rem)',
            color:      'rgba(248,250,255,0.55)',
            letterSpacing: '0.05em',
            ...ready(0),
          }}
        >
          BUT THIS UNIVERSE IS STILL EXPANDING...
        </p>

        {/* Line 3 — CTA heading */}
        <p
          className="cl-line3 font-display font-semibold tracking-widest uppercase"
          style={{
            fontSize:   'clamp(0.8rem, 2vw, 1.1rem)',
            color:      'var(--color-energy-blue)',
            letterSpacing: '0.18em',
            textShadow: '0 0 20px rgba(77,127,255,0.4)',
            ...ready(0),
          }}
        >
          CREATE SOMETHING WITH RAVZEN
        </p>

        {/* Action buttons */}
        <div
          className="cl-buttons flex flex-wrap items-center justify-center gap-3 w-full"
          style={{ ...ready(0) }}
        >
          {/* WhatsApp */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCTAClick('whatsapp')}
            className={cn(
              'group flex items-center gap-2.5 px-6 py-3.5 rounded-xl',
              'font-display font-semibold text-sm tracking-widest uppercase',
              'transition-all duration-300 cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-[#25d366] focus-visible:outline-offset-3',
            )}
            style={{
              background: 'rgba(37,211,102,0.1)',
              border:     '1px solid rgba(37,211,102,0.3)',
              color:      '#25d366',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(37,211,102,0.3)'
              e.currentTarget.style.borderColor = 'rgba(37,211,102,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(37,211,102,0.3)'
            }}
            aria-label="Contact RAVZEN via WhatsApp"
          >
            <MessageCircle size={16} aria-hidden="true" />
            WHATSAPP
          </a>

          {/* Email */}
          <a
            href={EMAIL_URL}
            onClick={() => handleCTAClick('email')}
            className={cn(
              'group flex items-center gap-2.5 px-6 py-3.5 rounded-xl',
              'font-display font-semibold text-sm tracking-widest uppercase',
              'transition-all duration-300 cursor-pointer',
              'focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)] focus-visible:outline-offset-3',
            )}
            style={{
              background: 'rgba(77,127,255,0.1)',
              border:     '1px solid rgba(77,127,255,0.3)',
              color:      'var(--color-energy-blue)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(77,127,255,0.3)'
              e.currentTarget.style.borderColor = 'rgba(77,127,255,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(77,127,255,0.3)'
            }}
            aria-label="Email RAVZEN"
          >
            <Mail size={16} aria-hidden="true" />
            EMAIL
          </a>

          {/* Request a Project */}
          <a
            href={`mailto:${SITE_CONFIG.email || 'hello@ravzen.com'}?subject=${encodeURIComponent('Request a Project — RAVZEN DIGI UNIVERSE')}&body=${encodeURIComponent('Hi RAVZEN,\n\nI would like to request a project.\n\nProject details:\n')}`}
            onClick={() => handleCTAClick('project')}
            className={cn(
              'group flex items-center gap-2.5 px-6 py-3.5 rounded-xl',
              'font-display font-semibold text-sm tracking-widest uppercase',
              'transition-all duration-300 cursor-pointer energy-ripple',
              'focus-visible:outline-2 focus-visible:outline-offset-3',
              'focus-visible:outline-[var(--color-energy-purple)]',
            )}
            style={{
              background: 'linear-gradient(135deg, rgba(180,77,255,0.15) 0%, rgba(255,77,157,0.12) 100%)',
              border:     '1px solid rgba(180,77,255,0.35)',
              color:      '#e8b4ff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 28px rgba(180,77,255,0.3)'
              e.currentTarget.style.borderColor = 'rgba(180,77,255,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(180,77,255,0.35)'
            }}
            aria-label="Request a project from RAVZEN"
          >
            <Zap size={16} aria-hidden="true" />
            REQUEST A PROJECT
          </a>
        </div>

        {/* Escape — never trap the visitor */}
        <div className="cl-escape space-y-3" style={{ ...ready(0) }}>
          <button
            type="button"
            onClick={returnToHub}
            className={cn(
              'flex items-center gap-2 text-xs font-mono tracking-widest uppercase cursor-pointer',
              'transition-colors duration-200',
              'text-[rgba(248,250,255,0.25)] hover:text-[rgba(248,250,255,0.6)]',
              'focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)] focus-visible:outline-offset-3 focus-visible:rounded',
            )}
            aria-label="Return to the Universe Hub"
          >
            <ArrowLeft size={12} aria-hidden="true" />
            Return to Universe
          </button>
        </div>

      </div>
    </div>
  )
}
