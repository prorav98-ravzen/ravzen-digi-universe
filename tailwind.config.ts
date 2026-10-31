import type { Config } from 'tailwindcss'

/**
 * RAVZEN DIGI UNIVERSE — Tailwind Design System
 *
 * Every token here maps to a CSS variable in globals.css.
 * Components reference tokens by name, never by raw values.
 */
const brandOrange = '#ff5200'
const studioOrange = {
  50: brandOrange, 100: brandOrange, 200: brandOrange, 300: brandOrange,
  400: brandOrange, 500: brandOrange, 600: brandOrange,
  700: '#b83b00', 800: '#822a00', 900: '#521a00', 950: '#290d00',
}

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Colors ───────────────────────────────────────────────────────────
      colors: {
        orange: studioOrange,
        fuchsia: studioOrange,
        purple: studioOrange,
        violet: studioOrange,
        // Universe background palette
        universe: {
          void:   '#03040a', // deepest background
          deep:   '#060918', // card backgrounds
          mid:    '#0a0f2e', // mid-level surfaces
          accent: '#1a2060', // subtle highlights
        },
        // Energy spectrum — used for glows, icons, accents
        energy: {
          white:  '#f8faff',
          blue:   '#4d7fff',
          violet: '#ff5200',
          cyan:   '#00d4ff',
          green:  '#00ff87',
          gold:   '#ffb800',
          orange: '#ff5200',
          pink:   '#ff4d9d',
          purple: '#ff5200',
        },
        // Zone identity colors (future use — defined now so tokens are stable)
        zone: {
          design:   { from: '#ff5200', to: '#ff4d9d' },
          android:  { from: '#00ff87', to: '#00d4ff' },
          software: { from: '#4d7fff', to: '#ff5200' },
          system:   { from: '#ffb800', to: '#ff5200' },
        },
        // Glass morphism surface colors
        glass: {
          light:  'rgba(255,255,255,0.04)',
          mid:    'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.11)',
          border: 'rgba(255,255,255,0.09)',
        },
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        // Body text — Inter
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Display / headings — Orbitron (futuristic)
        display: ['var(--font-orbitron)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        // Code / labels / data — JetBrains Mono
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },

      // ── Spacing extras ────────────────────────────────────────────────────
      spacing: {
        '18':  '4.5rem',
        '88':  '22rem',
        '128': '32rem',
      },

      // ── Transition durations ──────────────────────────────────────────────
      transitionDuration: {
        '400':  '400ms',
        '600':  '600ms',
        '800':  '800ms',
        '1200': '1200ms',
        '2000': '2000ms',
      },

      // ── Z-index layers — predictable stacking context ─────────────────────
      zIndex: {
        universe: '10',
        portal:   '20',
        zone:     '30',
        modal:    '40',
        overlay:  '50',
        hud:      '60',
        toast:    '70',
      },

      // ── Backdrop blur extras ──────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ── Glow box shadows ──────────────────────────────────────────────────
      boxShadow: {
        'glow-blue':   '0 0 20px rgba(77,127,255,0.4),  0 0 60px rgba(77,127,255,0.1)',
        'glow-violet': '0 0 20px rgba(255,82,0,0.4),  0 0 60px rgba(255,82,0,0.1)',
        'glow-cyan':   '0 0 20px rgba(0,212,255,0.4),   0 0 60px rgba(0,212,255,0.1)',
        'glow-green':  '0 0 20px rgba(0,255,135,0.4),   0 0 60px rgba(0,255,135,0.1)',
        'glow-gold':   '0 0 20px rgba(255,184,0,0.4),   0 0 60px rgba(255,184,0,0.1)',
        'glow-pink':   '0 0 20px rgba(255,77,157,0.4),  0 0 60px rgba(255,77,157,0.1)',
        'glow-white':  '0 0 20px rgba(248,250,255,0.15),0 0 60px rgba(248,250,255,0.05)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-hover': '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.13)',
      },

      // ── Gradient backgrounds ──────────────────────────────────────────────
      backgroundImage: {
        'universe-void':    'radial-gradient(ellipse at center, #060918 0%, #03040a 100%)',
        'nebula-purple':    'radial-gradient(ellipse 60% 40% at 20% 50%, rgba(255,82,0,0.07) 0%, transparent 70%)',
        'nebula-cyan':      'radial-gradient(ellipse 50% 60% at 80% 30%, rgba(0,212,255,0.05) 0%, transparent 70%)',
        'gradient-design':  'linear-gradient(135deg, #ff5200 0%, #ff4d9d 100%)',
        'gradient-android': 'linear-gradient(135deg, #00ff87 0%, #00d4ff 100%)',
        'gradient-software':'linear-gradient(135deg, #4d7fff 0%, #ff5200 100%)',
        'gradient-system':  'linear-gradient(135deg, #ffb800 0%, #ff5200 100%)',
        'grid-fine': [
          'linear-gradient(rgba(77,127,255,0.04) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(77,127,255,0.04) 1px, transparent 1px)',
        ].join(', '),
      },

      // ── Border radius extras ──────────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ── Keyframe animations ───────────────────────────────────────────────
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to:   { transform: 'rotate(0deg)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // ── Animation shortcuts ───────────────────────────────────────────────
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float-slow 9s ease-in-out infinite',
        'pulse-glow':   'pulse-glow 3s ease-in-out infinite',
        'spin-slow':    'spin-slow 20s linear infinite',
        'spin-reverse': 'spin-reverse 15s linear infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'fade-in':      'fade-in 0.6s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
