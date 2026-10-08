/**
 * RAVZEN DIGI UNIVERSE — Site Configuration
 *
 * Centralised constants used across layout, SEO, and runtime.
 * All env-var reads happen here — components never read process.env directly.
 */

export const SITE_CONFIG = {
  name:        'RAVZEN DIGI UNIVERSE',
  tagline:     'Where Ideas Come Alive.',
  description:
    "An interactive digital universe where RAVZEN's creative work, Android apps, software, and systems come alive through cinematic experiences.",
  url:          process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ravzen.com',
  locale:       'en',
  themeColor:   '#03040a',
  ogImage:      '/images/og-image.jpg',
  twitterHandle:'@ravzen',

  // Contact — override via environment or DB settings in later phases
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '',
  email:    process.env.NEXT_PUBLIC_EMAIL    ?? '',

  // Universe Activity multiplier (displayed = raw × multiplier)
  // Never creates fake records — only transforms the displayed metric.
  activityMultiplier: Number(process.env.NEXT_PUBLIC_ACTIVITY_MULTIPLIER ?? '3'),

  // Session heartbeat — how often client pings to update last_seen_at (ms)
  sessionHeartbeatMs: 30_000,

  // Sessions older than this are considered inactive
  staleSessionMinutes: 5,
} as const

// Intro / entry text — used by the Intro Experience component
export const INTRO_TEXT  = 'YOU ARE IN THE RAVZEN DIGI UNIVERSE' as const
export const ENTER_TEXT = {
  desktop: 'CLICK TO ENTER',
  mobile:  'TAP TO ENTER',
} as const
