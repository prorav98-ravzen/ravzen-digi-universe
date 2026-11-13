import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google'
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

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['600'],
})

// ── SEO metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  'RAVZEN Graphic | Graphic Design & Branding Sri Lanka',
    template: '%s | RAVZEN',
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  verification: {
    google: 'VO23LmvT5amaby8GHNPkaoN15YEZC8qphmNFEn3GSg0',
  },
  keywords: [
    'RAVZEN Graphic', 'RAVZEN Graphics', 'RAVZEN', 'RAVZEN DiGi Universe', 'creative studio', 'graphic design', 'logo design',
    'brand identity', 'packaging design', 'UI/UX design', 'branding',
    'Sri Lanka', 'product advertising', 'social media design',
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
        width:  1024,
        height: 801,
        alt:    `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
        type:   'image/png',
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
  // Canonical URLs belong to individual routes; a root canonical incorrectly
  // tells search engines that every service and article is the homepage.
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
  name:        'RAVZEN Graphic',
  alternateName: ['RAVZEN', 'RAVZEN DiGi Universe', 'RAVZEN Graphic Design'],
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
      className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} ${jakarta.variable}`}
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
        {/* Lightweight, accessible global click/touch ripple */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){
          if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
          document.addEventListener('pointerdown',function(e){
            if(e.button!==0 || e.isPrimary===false)return;
            var x=e.clientX,y=e.clientY;
            var ripple=document.createElement('span');
            ripple.setAttribute('aria-hidden','true');
            ripple.style.cssText='position:fixed;left:'+x+'px;top:'+y+'px;width:12px;height:12px;border:1.5px solid rgba(255,82,0,.6);border-radius:50%;background:radial-gradient(circle,rgba(34,211,238,.12),transparent 70%);pointer-events:none;z-index:2147483646;transform:translate(-50%,-50%) scale(.2);opacity:.8;';
            document.body.appendChild(ripple);
            var animation=ripple.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:.8},{transform:'translate(-50%,-50%) scale(18)',opacity:0}],{duration:650,easing:'cubic-bezier(.15,.65,.2,1)'});
            animation.onfinish=function(){ripple.remove()};
          },{passive:true});
        })();` }} />
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
