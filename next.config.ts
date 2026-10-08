import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

// Demo image host — used in local development and staging with demo data.
// Excluded automatically in production builds.
const devImagePatterns = isProd
  ? []
  : [
      {
        protocol: 'https' as const,
        hostname: 'picsum.photos',
        port:     '',
        pathname: '/**',
      },
    ]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — allow all project subdomains
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port:     '',
        pathname: '/storage/v1/object/public/**',
      },
      // Picsum excluded in production (see devImagePatterns above)
      ...devImagePatterns,
    ],
    formats:              ['image/avif', 'image/webp'],
    deviceSizes:          [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:           [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL:      60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG:  false,
    contentSecurityPolicy:"default-src 'self'; script-src 'none'; sandbox;",
  },

  // Three.js requires transpiling for Next.js SSR compatibility
  transpilePackages: ['three'],

  experimental: {
    optimizePackageImports:       ['lucide-react', 'framer-motion', '@radix-ui/react-dialog'],
    optimisticClientCache:        true,
  },

  // Production compression
  compress: true,

  // Reduce bundle size — remove console in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options',        value: 'DENY' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          // Feature policy
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // XSS protection (legacy browsers)
          { key: 'X-XSS-Protection',       value: '1; mode=block' },
          // HSTS — 1 year, include subdomains
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
      // Long-lived cache for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Images
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },

  // Redirect old zone paths if someone navigates directly
  async redirects() {
    return [
      {
        source:      '/zones/:zone',
        destination: '/',
        permanent:   false,
      },
    ]
  },
}

export default nextConfig
