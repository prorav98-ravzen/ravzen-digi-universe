import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/config/site'

export const metadata: Metadata = {
  title:       `404 — Sector Not Found | ${SITE_CONFIG.name}`,
  description: 'This coordinate does not exist in the RAVZEN universe.',
  robots:      { index: false },
}

export default function NotFound() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'var(--color-void)' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 grid-bg opacity-25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          width:     '60vmax',
          height:    '60vmax',
          top:       '50%',
          left:      '50%',
          transform: 'translate(-50%, -50%)',
          background:'radial-gradient(circle, rgba(77,127,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 space-y-8 max-w-lg w-full">
        {/* 404 number */}
        <p
          aria-hidden="true"
          className="select-none font-display font-bold"
          style={{
            fontSize:      'clamp(5rem, 18vw, 12rem)',
            color:         'rgba(77,127,255,0.06)',
            lineHeight:    '1',
            letterSpacing: '0.12em',
          }}
        >
          404
        </p>

        <div className="space-y-3 -mt-4">
          <p className="type-label" style={{ color: 'var(--color-energy-blue)' }}>
            {SITE_CONFIG.name}
          </p>
          <h1
            className="type-display"
            style={{ color: 'var(--color-energy-white)' }}
          >
            Sector Not Found
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(248,250,255,0.5)' }}
          >
            This coordinate doesn&apos;t exist in the RAVZEN universe.
            Navigate back to the hub.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="btn-universe inline-flex"
            aria-label="Return to the RAVZEN Universe Hub"
          >
            Return to Universe
          </Link>
        </div>
      </div>
    </div>
  )
}
