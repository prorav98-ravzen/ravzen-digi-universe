import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { SITE_CONFIG } from '@/config/site'

// ── Fonts ─────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
  preload:  true,
})

const orbitron = Orbitron({
  subsets:  ['latin'],
  variable: '--font-orbitron',
  display:  'swap',
  weight:   ['400', '500', '600', '700', '800', '900'],
  preload:  true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-jetbrains-mono',
  display:  'swap',
  weight:   ['400', '500'],
  preload:  false, // Not above the fold — defer
})

// ── SEO metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  keywords: [
    'RAVZEN', 'digital universe', 'interactive portfolio', 'Android apps',
    'software development', 'system development', 'UI/UX design', 'branding',
    'Nigeria tech', 'custom software', 'mobile apps', 'web systems',
  ],
  authors: [{ name: 'RAVZEN', url: SITE_CONFIG.url }],
  creator: 'RAVZEN',
  publisher: 'RAVZEN',
  category: 'technology',
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:          SITE_CONFIG.url,
    siteName:     SITE_CONFIG.name,
    title:       `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description:  SITE_CONFIG.description,
    images: [
      {
        url:    SITE_CONFIG.ogImage,
        width:  1200,
        height: 630,
        alt:    `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
        type:   'image/jpeg',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description:  SITE_CONFIG.description,
    images:      [{ url: SITE_CONFIG.ogImage, alt: SITE_CONFIG.name }],
    creator:      SITE_CONFIG.twitterHandle,
    site:         SITE_CONFIG.twitterHandle,
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:                true,
      follow:               true,
      'max-image-preview':  'large',
      'max-snippet':        -1,
      'max-video-preview':  -1,
    },
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  icons: {
    icon: '/images/ravzen-logo.png',
    shortcut: '/images/ravzen-logo.png',
    apple: '/images/ravzen-logo.png',
  },
  // Prevent browser translation prompts — this is a branded experience
  other: {
    'google':        'notranslate',
    'apple-mobile-web-app-capable':           'yes',
    'apple-mobile-web-app-status-bar-style':  'black-translucent',
    'apple-mobile-web-app-title':             'RAVZEN',
    'mobile-web-app-capable':                 'yes',
    'format-detection':                       'telephone=no',
  },
}

export const viewport: Viewport = {
  themeColor:             SITE_CONFIG.themeColor,
  colorScheme:            'dark',
  width:                  'device-width',
  initialScale:           1,
  maximumScale:           5,
  userScalable:           true,   // accessibility
}

// ── Structured data ───────────────────────────────────────────────────────────

const structuredData = {
  '@context': 'https://schema.org',
  '@type':    'Organization',
  name:        SITE_CONFIG.name,
  url:         SITE_CONFIG.url,
  description: SITE_CONFIG.description,
  sameAs:     [],
}

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className="bg-[var(--color-void)] text-[var(--color-energy-white)] antialiased"
      >
        {/* Global skip link for keyboard accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
