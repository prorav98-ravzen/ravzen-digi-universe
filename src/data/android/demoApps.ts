/**
 * Android Zone — structured demo data.
 *
 * ISOLATION CONTRACT:
 *   AndroidZone.tsx imports from '@/data/android/demoApps' TODAY.
 *   Phase 5 replaces this with a Supabase data-access call returning AndroidApp[].
 *   Nothing in the UI changes — only the import source.
 *
 * IMAGES: picsum.photos deterministic seeds for stable previews.
 *   Replace with Supabase Storage public URLs in Phase 5.
 *
 * Six apps — one per AndroidCategory.
 */

import type { AndroidApp } from '@/types/android'

function price(amount: number | null, currency = 'USD'): AndroidApp['price'] {
  if (amount === null) return { amount: null, currency, label: 'Contact for quote' }
  if (amount === 0)    return { amount: 0,    currency, label: 'Free'              }
  const sym: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' }
  return { amount, currency, label: `${sym[currency] ?? currency}${amount}` }
}

const WA    = '2348000000000'
const EMAIL = 'android@ravzen.com'

export const DEMO_ANDROID_APPS: AndroidApp[] = [

  // ── Productivity ────────────────────────────────────────────────────────────
  {
    id:            'aa-001',
    slug:          'taskflow-pro',
    name:          'TaskFlow Pro',
    tagline:       'Intelligent task & project management for your phone.',
    category:      'productivity',
    shortDesc:     'Smart task management with AI-powered priority suggestions.',
    fullDesc:      'TaskFlow Pro transforms the way you manage work on Android. Built around a clean card-based interface, it supports nested projects, recurring tasks, calendar sync, and an AI assistant that automatically surfaces the three most important things you should do today. Designed for professionals who live in their inbox but want to stay on top of everything.',
    iconUrl:       'https://picsum.photos/seed/taskflow-icon/200/200',
    coverImage:    'https://picsum.photos/seed/taskflow-cover/800/600',
    screenshots:   [
      'https://picsum.photos/seed/taskflow-s1/360/640',
      'https://picsum.photos/seed/taskflow-s2/360/640',
      'https://picsum.photos/seed/taskflow-s3/360/640',
    ],
    videoUrl:      null,
    version:       '3.2.1',
    minAndroid:    '7.0 (Nougat)',
    targetAndroid: '14',
    fileSizeMb:    22.4,
    permissions:   ['Internet', 'Notifications', 'Calendar read/write', 'Contacts read'],
    features:      [
      'AI priority assistant',
      'Nested projects & sub-tasks',
      'Recurring task scheduler',
      'Google Calendar sync',
      'Offline mode with background sync',
      'Dark / light / AMOLED themes',
      'Widget for home screen',
    ],
    apkUrl:        null,
    playStoreUrl:  null,
    demoUrl:       null,
    price:         price(0),
    isFree:        true,
    changelog:     [
      { version: '3.2.1', date: '2024-11-15', notes: ['Fixed calendar sync issue on Android 14', 'Improved widget refresh speed'] },
      { version: '3.2.0', date: '2024-10-02', notes: ['New AI priority assistant', 'Redesigned project overview screen'] },
      { version: '3.1.0', date: '2024-08-20', notes: ['Added AMOLED dark theme', 'Performance improvements'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    true,
    isNew:         false,
    publishedAt:   '2024-11-15',
  },

  // ── Business ────────────────────────────────────────────────────────────────
  {
    id:            'aa-002',
    slug:          'invoicebot',
    name:          'InvoiceBot',
    tagline:       'Create, send & track professional invoices in seconds.',
    category:      'business',
    shortDesc:     'Mobile invoicing with PDF export, payment tracking, and client management.',
    fullDesc:      'InvoiceBot gives freelancers and small businesses a full invoicing workflow in their pocket. Create polished branded invoices in under 30 seconds, convert estimates to invoices, track payment status, send automated reminders, and export PDF copies via WhatsApp, email, or cloud storage. Supports multi-currency, VAT/tax calculations, and multiple business profiles.',
    iconUrl:       'https://picsum.photos/seed/invoicebot-icon/200/200',
    coverImage:    'https://picsum.photos/seed/invoicebot-cover/800/600',
    screenshots:   [
      'https://picsum.photos/seed/invoicebot-s1/360/640',
      'https://picsum.photos/seed/invoicebot-s2/360/640',
      'https://picsum.photos/seed/invoicebot-s3/360/640',
      'https://picsum.photos/seed/invoicebot-s4/360/640',
    ],
    videoUrl:      null,
    version:       '2.0.4',
    minAndroid:    '6.0 (Marshmallow)',
    targetAndroid: '14',
    fileSizeMb:    18.7,
    permissions:   ['Internet', 'Storage read/write', 'Camera (logo scan)', 'Notifications'],
    features:      [
      'Branded invoices with your logo',
      'Estimate → Invoice conversion',
      'Multi-currency & VAT support',
      'Automated payment reminders',
      'Client & item database',
      'PDF export & WhatsApp share',
      'Multiple business profiles',
      'Offline mode',
    ],
    apkUrl:        null,
    playStoreUrl:  null,
    demoUrl:       null,
    price:         price(4.99),
    isFree:        false,
    changelog:     [
      { version: '2.0.4', date: '2024-12-01', notes: ['Bug fix: PDF generation crash on Android 12', 'Faster invoice load times'] },
      { version: '2.0.0', date: '2024-09-10', notes: ['Complete UI redesign', 'Added multi-business support', 'New reminder system'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    true,
    isNew:         false,
    publishedAt:   '2024-12-01',
  },

  // ── Utility ─────────────────────────────────────────────────────────────────
  {
    id:            'aa-003',
    slug:          'clipvault',
    name:          'ClipVault',
    tagline:       'A smart clipboard manager that remembers everything you copy.',
    category:      'utility',
    shortDesc:     'Persistent clipboard history with search, categories, and pinning.',
    fullDesc:      'ClipVault runs silently in the background and stores everything you copy — text, URLs, images, phone numbers — with instant search and smart categorisation. Pin frequently used snippets, create template groups for common replies, and sync across devices via encrypted cloud backup. Essential for power users who copy and paste dozens of times a day.',
    iconUrl:       'https://picsum.photos/seed/clipvault-icon/200/200',
    coverImage:    'https://picsum.photos/seed/clipvault-cover/800/600',
    screenshots:   [
      'https://picsum.photos/seed/clipvault-s1/360/640',
      'https://picsum.photos/seed/clipvault-s2/360/640',
    ],
    videoUrl:      null,
    version:       '1.8.0',
    minAndroid:    '8.0 (Oreo)',
    targetAndroid: '14',
    fileSizeMb:    9.2,
    permissions:   ['Internet', 'Notifications', 'Overlay (quick paste)'],
    features:      [
      'Unlimited clipboard history',
      'Full-text search',
      'Smart auto-categorisation',
      'Pinned snippets & favourites',
      'Template groups for quick replies',
      'Encrypted cloud sync',
      'Quick-paste overlay',
    ],
    apkUrl:        null,
    playStoreUrl:  null,
    demoUrl:       null,
    price:         price(0),
    isFree:        true,
    changelog:     [
      { version: '1.8.0', date: '2024-10-28', notes: ['Added image clipboard support', 'New encrypted sync engine', 'Fixed overlay crash on Samsung devices'] },
      { version: '1.7.2', date: '2024-08-05', notes: ['Performance improvements', 'New quick-paste keyboard shortcut'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    false,
    isNew:         false,
    publishedAt:   '2024-10-28',
  },

  // ── Entertainment ────────────────────────────────────────────────────────────
  {
    id:            'aa-004',
    slug:          'moodcast',
    name:          'MoodCast',
    tagline:       'Personalised ambient soundscapes generated from your mood.',
    category:      'entertainment',
    shortDesc:     'AI-generated ambient music and soundscapes tuned to how you feel.',
    fullDesc:      'MoodCast listens to your mood — through a quick check-in or optional biometric data — and generates a personalised ambient soundscape in real time. Choose from 12 base environments (rain forest, deep ocean, space station, campfire, etc.) and let the AI layer in additional elements based on your current emotional state. Perfect for focus, sleep, meditation, or just unwinding.',
    iconUrl:       'https://picsum.photos/seed/moodcast-icon/200/200',
    coverImage:    'https://picsum.photos/seed/moodcast-cover/800/600',
    screenshots:   [
      'https://picsum.photos/seed/moodcast-s1/360/640',
      'https://picsum.photos/seed/moodcast-s2/360/640',
      'https://picsum.photos/seed/moodcast-s3/360/640',
    ],
    videoUrl:      null,
    version:       '1.3.0',
    minAndroid:    '8.0 (Oreo)',
    targetAndroid: '13',
    fileSizeMb:    34.6,
    permissions:   ['Internet', 'Microphone (optional, for biometrics)', 'Notifications'],
    features:      [
      '12 base ambient environments',
      'AI real-time sound layering',
      'Mood check-in (emoji or text)',
      'Optional biometric mood detection',
      'Sleep timer & fade-out',
      'Offline mode (cached scenes)',
      'Sleep statistics',
    ],
    apkUrl:        null,
    playStoreUrl:  null,
    demoUrl:       null,
    price:         price(0),
    isFree:        true,
    changelog:     [
      { version: '1.3.0', date: '2024-11-08', notes: ['New space station environment', 'Improved AI layering engine', 'Added sleep statistics dashboard'] },
      { version: '1.2.1', date: '2024-09-22', notes: ['Fixed audio glitch during environment transitions', 'Reduced battery usage by 30%'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    false,
    isNew:         true,
    publishedAt:   '2024-11-08',
  },

  // ── Education ────────────────────────────────────────────────────────────────
  {
    id:            'aa-005',
    slug:          'lexora',
    name:          'Lexora',
    tagline:       'Learn any language through real conversations, not drills.',
    category:      'education',
    shortDesc:     'Conversational language learning powered by AI roleplay scenarios.',
    fullDesc:      'Lexora ditches vocabulary drills and grammar tables in favour of real conversations. The AI puts you in practical scenarios — ordering food, negotiating a deal, navigating an airport — and guides you through them naturally. Available in 24 languages with adaptive difficulty and a built-in pronunciation coach. Progress is tracked across Vocabulary, Grammar, Listening, and Speaking dimensions.',
    iconUrl:       'https://picsum.photos/seed/lexora-icon/200/200',
    coverImage:    'https://picsum.photos/seed/lexora-cover/800/600',
    screenshots:   [
      'https://picsum.photos/seed/lexora-s1/360/640',
      'https://picsum.photos/seed/lexora-s2/360/640',
      'https://picsum.photos/seed/lexora-s3/360/640',
    ],
    videoUrl:      null,
    version:       '2.1.0',
    minAndroid:    '7.0 (Nougat)',
    targetAndroid: '14',
    fileSizeMb:    28.1,
    permissions:   ['Internet', 'Microphone (pronunciation coach)', 'Notifications'],
    features:      [
      '24 supported languages',
      'AI conversation scenarios',
      'Real-time pronunciation coach',
      'Adaptive difficulty engine',
      'Offline lesson packs',
      'Progress analytics (4 dimensions)',
      'Streak tracking & reminders',
    ],
    apkUrl:        null,
    playStoreUrl:  null,
    demoUrl:       null,
    price:         price(null),
    isFree:        false,
    changelog:     [
      { version: '2.1.0', date: '2024-12-10', notes: ['Added 4 new languages (Swahili, Bengali, Tamil, Vietnamese)', 'New pronunciation coach engine', 'Offline lesson packs'] },
      { version: '2.0.0', date: '2024-10-01', notes: ['Rebuilt AI conversation engine from scratch', 'New adaptive difficulty system'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    true,
    isNew:         true,
    publishedAt:   '2024-12-10',
  },

  // ── Custom ───────────────────────────────────────────────────────────────────
  {
    id:            'aa-006',
    slug:          'fieldops',
    name:          'FieldOps',
    tagline:       'Custom field operations management for your team.',
    category:      'custom',
    shortDesc:     'Bespoke field-team management: job dispatch, GPS tracking, digital forms.',
    fullDesc:      'FieldOps is a fully customised Android application built for a logistics and facilities management company. It handles real-time job dispatch, two-way GPS tracking for field agents, digital form capture with signature, photo evidence upload, automated status reports, and a supervisor dashboard. Delivered as a white-label product with the client\'s branding. Custom development available — contact RAVZEN to discuss your requirements.',
    iconUrl:       'https://picsum.photos/seed/fieldops-icon/200/200',
    coverImage:    'https://picsum.photos/seed/fieldops-cover/800/600',
    screenshots:   [
      'https://picsum.photos/seed/fieldops-s1/360/640',
      'https://picsum.photos/seed/fieldops-s2/360/640',
      'https://picsum.photos/seed/fieldops-s3/360/640',
    ],
    videoUrl:      null,
    version:       '1.0.7',
    minAndroid:    '8.0 (Oreo)',
    targetAndroid: '13',
    fileSizeMb:    41.3,
    permissions:   ['Internet', 'Location (GPS)', 'Camera', 'Storage', 'Notifications'],
    features:      [
      'Real-time job dispatch board',
      'Two-way GPS agent tracking',
      'Digital forms with e-signature',
      'Photo evidence with geo-tag',
      'Automated PDF status reports',
      'Supervisor analytics dashboard',
      'White-label branding',
      'Offline-capable with sync queue',
    ],
    apkUrl:        null,
    playStoreUrl:  null,
    demoUrl:       null,
    price:         price(null),
    isFree:        false,
    changelog:     [
      { version: '1.0.7', date: '2024-11-29', notes: ['Fixed GPS accuracy on Android 13', 'Added bulk job assignment', 'Improved photo compression'] },
      { version: '1.0.0', date: '2024-06-15', notes: ['Initial production release'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    false,
    isNew:         false,
    publishedAt:   '2024-11-29',
  },
]

export const DEMO_APP_MAP = Object.fromEntries(
  DEMO_ANDROID_APPS.map((a) => [a.slug, a])
)
