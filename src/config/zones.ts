/**
 * RAVZEN DIGI UNIVERSE — Zone Registry
 *
 * The single source of truth for zone identity.
 * Adding a new zone (AI, Photography, etc.) only requires adding an entry here.
 * Nothing else in the codebase hard-codes zone identities.
 */

export type ZoneKey = 'design' | 'android' | 'software' | 'system'

export interface ZoneConfig {
  key:          ZoneKey
  label:        string          // Display name: "DESIGN"
  tagline:      string          // Short identity: "Visual Intelligence"
  description:  string          // One-sentence for tooltips / meta
  gradientFrom: string          // CSS colour stop 1
  gradientTo:   string          // CSS colour stop 2
  glowColor:    string          // rgba string for box-shadow glow
  /** Lucide icon name — resolved dynamically in ZoneCard */
  icon:         string
  route:        string          // App Router path for deep-link
}

export const ZONES: ZoneConfig[] = [
  {
    key:          'design',
    label:        'DESIGN',
    tagline:      'Visual Intelligence',
    description:  'Logos, branding, UI/UX, illustrations, and creative work.',
    gradientFrom: '#b44dff',
    gradientTo:   '#ff4d9d',
    glowColor:    'rgba(180, 77, 255, 0.35)',
    icon:         'Palette',
    route:        '/zones/design',
  },
  {
    key:          'android',
    label:        'ANDROID',
    tagline:      'Mobile Universe',
    description:  'Android apps, APKs, and mobile experiences.',
    gradientFrom: '#00ff87',
    gradientTo:   '#00d4ff',
    glowColor:    'rgba(0, 255, 135, 0.35)',
    icon:         'Smartphone',
    route:        '/zones/android',
  },
  {
    key:          'software',
    label:        'SOFTWARE',
    tagline:      'Digital Engines',
    description:  'Desktop apps, web tools, SaaS products, and automation.',
    gradientFrom: '#4d7fff',
    gradientTo:   '#7c5cfc',
    glowColor:    'rgba(77, 127, 255, 0.35)',
    icon:         'Monitor',
    route:        '/zones/software',
  },
  {
    key:          'system',
    label:        'SYSTEM',
    tagline:      'Systems Architecture',
    description:  'POS, business, management, and custom enterprise systems.',
    gradientFrom: '#ffb800',
    gradientTo:   '#ff6b35',
    glowColor:    'rgba(255, 184, 0, 0.35)',
    icon:         'Network',
    route:        '/zones/system',
  },
]

/** Lookup a zone by key — returns undefined if key is invalid */
export const ZONE_MAP = Object.fromEntries(
  ZONES.map((z) => [z.key, z])
) as Record<ZoneKey, ZoneConfig>

export function getZoneConfig(key: string): ZoneConfig | undefined {
  return ZONE_MAP[key as ZoneKey]
}
