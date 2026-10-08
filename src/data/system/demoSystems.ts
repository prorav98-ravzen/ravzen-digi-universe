/**
 * System Zone — structured demo data.
 *
 * ISOLATION CONTRACT:
 *   SystemZone.tsx imports from '@/data/system/demoSystems' TODAY.
 *   Phase 7 replaces this with a Supabase data-access call → SystemProject[].
 *   Nothing in the UI changes — only the import source.
 *
 * IMAGES: picsum.photos deterministic seeds for stable previews.
 *   Replace with Supabase Storage URLs in Phase 7.
 *
 * Seven systems — one per SystemCategory.
 */

import type { SystemProject } from '@/types/system'

function price(amount: number | null, currency = 'USD'): SystemProject['price'] {
  if (amount === null) return { amount: null, currency, label: 'Contact for quote' }
  if (amount === 0)    return { amount: 0,    currency, label: 'Free'              }
  const sym: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' }
  return { amount, currency, label: `${sym[currency] ?? currency}${amount.toLocaleString()}` }
}

const WA    = '2348000000000'
const EMAIL = 'systems@ravzen.com'

export const DEMO_SYSTEMS: SystemProject[] = [

  // ── POS ─────────────────────────────────────────────────────────────────────
  {
    id:            'sys-001',
    slug:          'quicksell-pos',
    name:          'QuickSell POS',
    tagline:       'Fast, offline-capable point-of-sale for retail and hospitality.',
    category:      'pos',
    shortDesc:     'Touch-screen POS with inventory, receipts, and daily reporting.',
    fullDesc:      'QuickSell POS is a full-featured point-of-sale system designed for retail shops, restaurants, pharmacies, and supermarkets. Runs on Windows tablets and Android touchscreen devices. Core features include barcode scanning, real-time inventory deduction, customer loyalty tracking, staff PIN login, thermal and A4 receipt printing, end-of-day reports, and multi-location synchronisation over local network or cloud. Works fully offline during internet outages and syncs when reconnected.',
    coverImage:    'https://picsum.photos/seed/quicksell-cover/800/500',
    screenshots:   [
      'https://picsum.photos/seed/quicksell-s1/800/500',
      'https://picsum.photos/seed/quicksell-s2/800/500',
      'https://picsum.photos/seed/quicksell-s3/800/500',
    ],
    diagrams:      ['https://picsum.photos/seed/quicksell-diag/800/500'],
    videoUrl:      null,
    techStack:     ['Electron', 'React', 'SQLite', 'Node.js', 'Android (WebView)'],
    features:      [
      'Barcode scanner support (USB & Bluetooth)',
      'Real-time inventory deduction',
      'Customer loyalty & discount system',
      'Staff PIN login with role-based access',
      'Thermal and A4 receipt printing',
      'End-of-day cash reconciliation report',
      'Multi-location inventory sync',
      'Full offline mode with cloud sync',
      'Sales analytics dashboard',
    ],
    requirements:  'Windows 10+ or Android 8.0+ · 4 GB RAM · 10 GB disk space · Local network or internet for sync',
    status:        'active',
    serviceModel:  'one-time',
    clientIndustry:'Retail / Hospitality',
    projectYear:   2023,
    demoUrl:       null,
    contactUrl:    null,
    price:         price(null),
    contactForQuote: true,
    changelog:     [
      { version: '3.1.0', date: '2024-11-10', notes: ['New analytics dashboard', 'Bluetooth receipt printer support', 'Bug fixes'] },
      { version: '3.0.0', date: '2024-07-15', notes: ['Complete Android port', 'Cloud sync engine', 'Customer loyalty module'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    true,
    isNew:         false,
    publishedAt:   '2024-11-10',
  },

  // ── Business ────────────────────────────────────────────────────────────────
  {
    id:            'sys-002',
    slug:          'biz360-suite',
    name:          'Biz360 Suite',
    tagline:       'All-in-one business management: CRM, invoicing, HR, and inventory.',
    category:      'business',
    shortDesc:     'Integrated suite for SMEs covering sales, HR, accounting, and operations.',
    fullDesc:      'Biz360 Suite is an integrated business management platform purpose-built for small and medium enterprises in emerging markets. It unifies CRM (leads, pipeline, deals), invoicing and payments, payroll and HR records, multi-warehouse inventory, and financial reporting in a single web-based application. Modules are individually activatable — organisations only pay for and see what they need. Available as SaaS or self-hosted on a local server.',
    coverImage:    'https://picsum.photos/seed/biz360-cover/800/500',
    screenshots:   [
      'https://picsum.photos/seed/biz360-s1/800/500',
      'https://picsum.photos/seed/biz360-s2/800/500',
      'https://picsum.photos/seed/biz360-s3/800/500',
    ],
    diagrams:      ['https://picsum.photos/seed/biz360-arch/800/500'],
    videoUrl:      null,
    techStack:     ['Next.js', 'PostgreSQL', 'Prisma', 'Node.js', 'Redis', 'Docker'],
    features:      [
      'CRM: leads, pipeline, deals, follow-ups',
      'Invoicing with multi-currency and tax support',
      'Payroll and HR records management',
      'Multi-warehouse inventory with purchase orders',
      'Financial reports: P&L, balance sheet, cash flow',
      'Role-based access control',
      'SaaS or self-hosted deployment',
      'Modular: activate only what you need',
    ],
    requirements:  'Web browser or self-hosted: Ubuntu 22.04 · 8 GB RAM · 50 GB disk space · PostgreSQL 15+',
    status:        'active',
    serviceModel:  'saas',
    clientIndustry:'SME / Multi-sector',
    projectYear:   2024,
    demoUrl:       null,
    contactUrl:    null,
    price:         price(null),
    contactForQuote: true,
    changelog:     [
      { version: '2.3.0', date: '2024-12-01', notes: ['New financial reports module', 'Multi-currency invoicing', 'Docker compose deployment guide'] },
      { version: '2.2.0', date: '2024-10-05', notes: ['Payroll module launch', 'Improved CRM pipeline view'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    true,
    isNew:         false,
    publishedAt:   '2024-12-01',
  },

  // ── Management ──────────────────────────────────────────────────────────────
  {
    id:            'sys-003',
    slug:          'schoolhive',
    name:          'SchoolHive',
    tagline:       'School management system for admissions to graduation.',
    category:      'management',
    shortDesc:     'Complete school management: admissions, timetables, grades, and fees.',
    fullDesc:      'SchoolHive is a web-based school management system designed for primary schools, secondary schools, and tertiary institutions. It covers the full student lifecycle: admissions and enrolment, class and timetable management, teacher and subject assignment, attendance tracking, exam results and transcript generation, fee collection and payment history, and communication with parents via SMS and email. The parent portal lets guardians check results, outstanding fees, and attendance without visiting the school.',
    coverImage:    'https://picsum.photos/seed/schoolhive-cover/800/500',
    screenshots:   [
      'https://picsum.photos/seed/schoolhive-s1/800/500',
      'https://picsum.photos/seed/schoolhive-s2/800/500',
    ],
    diagrams:      [],
    videoUrl:      null,
    techStack:     ['Laravel', 'MySQL', 'Vue.js', 'Tailwind CSS', 'Pusher'],
    features:      [
      'Student admissions and enrolment workflow',
      'Timetable and class scheduling',
      'Attendance tracking (teacher-facing)',
      'Exam results and transcript generator',
      'Fee collection with payment tracking',
      'Parent portal (results, fees, attendance)',
      'SMS and email notification system',
      'Bulk data import from Excel',
    ],
    requirements:  'Web hosting: PHP 8.1+ · MySQL 8+ · 2 GB RAM minimum',
    status:        'active',
    serviceModel:  'one-time',
    clientIndustry:'Education',
    projectYear:   2023,
    demoUrl:       null,
    contactUrl:    null,
    price:         price(null),
    contactForQuote: true,
    changelog:     [
      { version: '1.5.0', date: '2024-09-20', notes: ['Parent portal launch', 'SMS notification integration', 'Bulk import from Excel'] },
      { version: '1.4.0', date: '2024-06-10', notes: ['Fee collection module', 'Improved transcript generator'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    false,
    isNew:         false,
    publishedAt:   '2024-09-20',
  },

  // ── Web System ──────────────────────────────────────────────────────────────
  {
    id:            'sys-004',
    slug:          'propertylist-ng',
    name:          'PropertyList NG',
    tagline:       'Full-stack real estate listing and agency management platform.',
    category:      'web-system',
    shortDesc:     'Property listings portal with agent dashboard and lead capture.',
    fullDesc:      'PropertyList NG is a full-stack real estate web platform built for property agencies and individual agents in Nigeria. Public-facing: a searchable, filterable property listings portal with map integration. Agent-facing: a dashboard for listing management, lead inbox, appointment scheduling, and analytics. Admin-facing: agency account management, subscription billing, and platform-wide analytics. Includes automatic watermarking of uploaded property images and WhatsApp lead-forwarding.',
    coverImage:    'https://picsum.photos/seed/propertylist-cover/800/500',
    screenshots:   [
      'https://picsum.photos/seed/propertylist-s1/800/500',
      'https://picsum.photos/seed/propertylist-s2/800/500',
      'https://picsum.photos/seed/propertylist-s3/800/500',
    ],
    diagrams:      ['https://picsum.photos/seed/propertylist-arch/800/500'],
    videoUrl:      null,
    techStack:     ['Next.js', 'Supabase', 'PostgreSQL', 'Google Maps API', 'Cloudinary', 'Stripe'],
    features:      [
      'Searchable and filterable property portal',
      'Google Maps integration with property pins',
      'Agent dashboard: listings, leads, calendar',
      'Automatic property image watermarking',
      'WhatsApp lead-forwarding integration',
      'Subscription billing (Paystack / Stripe)',
      'Admin panel with platform analytics',
      'SEO-optimised listing pages',
    ],
    requirements:  'Hosted on Vercel + Supabase. Custom domain required.',
    status:        'active',
    serviceModel:  'saas',
    clientIndustry:'Real Estate',
    projectYear:   2024,
    demoUrl:       null,
    contactUrl:    null,
    price:         price(null),
    contactForQuote: true,
    changelog:     [
      { version: '1.2.0', date: '2024-11-05', notes: ['WhatsApp lead forwarding', 'Map clustering for dense areas', 'Agent analytics v2'] },
      { version: '1.1.0', date: '2024-08-18', notes: ['Subscription billing integration', 'Image watermarking', 'SEO improvements'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    true,
    isNew:         false,
    publishedAt:   '2024-11-05',
  },

  // ── Automation ──────────────────────────────────────────────────────────────
  {
    id:            'sys-005',
    slug:          'orderpulse',
    name:          'OrderPulse',
    tagline:       'Automated order processing and fulfilment for e-commerce.',
    category:      'automation',
    shortDesc:     'Connects your store, warehouse, and courier into one automated flow.',
    fullDesc:      'OrderPulse is an order automation engine that connects an e-commerce store (Shopify, WooCommerce, or custom API) to a warehouse management system and courier dispatch network. When an order is placed, OrderPulse automatically assigns a warehouse picker, generates a packing slip, books a courier, and updates the customer with a tracking link — all without human intervention. Exception handling routes failed or problematic orders to a human review queue. Built for high-volume sellers processing 500+ orders per day.',
    coverImage:    'https://picsum.photos/seed/orderpulse-cover/800/500',
    screenshots:   [
      'https://picsum.photos/seed/orderpulse-s1/800/500',
      'https://picsum.photos/seed/orderpulse-s2/800/500',
    ],
    diagrams:      ['https://picsum.photos/seed/orderpulse-arch/800/500'],
    videoUrl:      null,
    techStack:     ['Node.js', 'BullMQ', 'Redis', 'PostgreSQL', 'Shopify API', 'DHL/FedEx API'],
    features:      [
      'Auto-assignment of warehouse pickers',
      'Automatic courier booking (DHL, FedEx, local)',
      'Customer tracking link notification (SMS + email)',
      'Exception queue for failed or anomalous orders',
      'Shopify, WooCommerce, and custom API connectors',
      'Real-time order fulfilment dashboard',
      'SLA monitoring and alert system',
      'Daily fulfilment performance reports',
    ],
    requirements:  'Self-hosted: Ubuntu 22.04 · 4 GB RAM · Redis 7+ · PostgreSQL 15+',
    status:        'active',
    serviceModel:  'custom',
    clientIndustry:'E-Commerce / Logistics',
    projectYear:   2024,
    demoUrl:       null,
    contactUrl:    null,
    price:         price(null),
    contactForQuote: true,
    changelog:     [
      { version: '2.0.0', date: '2024-10-22', notes: ['New local courier integrations (Nigeria)', 'SLA monitoring dashboard', 'Exception queue redesign'] },
      { version: '1.5.0', date: '2024-07-08', notes: ['WooCommerce connector', 'Real-time dashboard', 'Performance improvements for 1000+ orders/day'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    false,
    isNew:         true,
    publishedAt:   '2024-10-22',
  },

  // ── Custom ───────────────────────────────────────────────────────────────────
  {
    id:            'sys-006',
    slug:          'medtrack-emr',
    name:          'MedTrack EMR',
    tagline:       'Custom electronic medical records for clinics and hospitals.',
    category:      'custom',
    shortDesc:     'EMR system with patient records, prescriptions, lab, and billing.',
    fullDesc:      'MedTrack EMR is a custom-built electronic medical records system delivered for a private hospital group. It manages patient registration, GP consultations, nurse triage notes, prescription writing, lab requests and result tracking, radiology referrals, inpatient ward management, discharge summaries, and itemised billing with insurance claim generation. Designed to HL7 FHIR data standards for future interoperability. Available to other healthcare providers as a customised deployment.',
    coverImage:    'https://picsum.photos/seed/medtrack-cover/800/500',
    screenshots:   [
      'https://picsum.photos/seed/medtrack-s1/800/500',
      'https://picsum.photos/seed/medtrack-s2/800/500',
    ],
    diagrams:      ['https://picsum.photos/seed/medtrack-arch/800/500'],
    videoUrl:      null,
    techStack:     ['React', 'Node.js', 'PostgreSQL', 'FHIR R4', 'Keycloak (SSO)', 'Docker'],
    features:      [
      'Patient registration and demographic records',
      'GP consultation notes and history',
      'Prescription writing with drug interaction checks',
      'Lab request and result tracking',
      'Inpatient ward management and bed allocation',
      'Discharge summaries and referral letters',
      'Itemised billing and insurance claim generation',
      'HL7 FHIR R4 data standards compliance',
    ],
    requirements:  'Self-hosted on hospital servers or private cloud. Hardware specs provided on request.',
    status:        'active',
    serviceModel:  'custom',
    clientIndustry:'Healthcare',
    projectYear:   2023,
    demoUrl:       null,
    contactUrl:    null,
    price:         price(null),
    contactForQuote: true,
    changelog:     [
      { version: '1.3.0', date: '2024-08-30', notes: ['Insurance claim generation', 'Drug interaction database update', 'Performance improvements'] },
      { version: '1.2.0', date: '2024-04-15', notes: ['Ward management module', 'Discharge summaries', 'FHIR R4 compliance'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    false,
    isNew:         false,
    publishedAt:   '2024-08-30',
  },

  // ── Special ──────────────────────────────────────────────────────────────────
  {
    id:            'sys-007',
    slug:          'votechain',
    name:          'VoteChain',
    tagline:       'Tamper-resistant digital voting for organisations and institutions.',
    category:      'special',
    shortDesc:     'Cryptographically verifiable e-voting for elections and referenda.',
    fullDesc:      'VoteChain is a special-purpose digital voting platform built for organisations, professional associations, student unions, and government agencies that need auditable, tamper-evident elections. Voters authenticate via one-time tokens sent to verified contact details. Votes are encrypted and stored with an append-only audit log. Independent observers can verify results without seeing individual votes. Supports ranked-choice, approval, and first-past-the-post voting methods. Deployable as a managed service or air-gapped on-premises for maximum security.',
    coverImage:    'https://picsum.photos/seed/votechain-cover/800/500',
    screenshots:   [
      'https://picsum.photos/seed/votechain-s1/800/500',
      'https://picsum.photos/seed/votechain-s2/800/500',
      'https://picsum.photos/seed/votechain-s3/800/500',
    ],
    diagrams:      ['https://picsum.photos/seed/votechain-arch/800/500'],
    videoUrl:      null,
    techStack:     ['Next.js', 'PostgreSQL', 'Argon2', 'AES-256', 'Node.js', 'Audit log'],
    features:      [
      'One-time token voter authentication',
      'End-to-end encrypted ballot storage',
      'Immutable append-only audit log',
      'Real-time result tallying',
      'Independent observer verification portal',
      'Ranked-choice, approval, and FPTP methods',
      'Managed service or air-gapped on-premises',
      'Exportable audit report (PDF + JSON)',
    ],
    requirements:  'Managed cloud deployment or air-gapped server. Security briefing required before deployment.',
    status:        'active',
    serviceModel:  'custom',
    clientIndustry:'Governance / Institutions',
    projectYear:   2024,
    demoUrl:       null,
    contactUrl:    null,
    price:         price(null),
    contactForQuote: true,
    changelog:     [
      { version: '1.1.0', date: '2024-09-15', notes: ['Ranked-choice voting support', 'Observer verification portal', 'Air-gapped deployment guide'] },
      { version: '1.0.0', date: '2024-05-01', notes: ['Initial production release for student union elections'] },
    ],
    whatsapp:      WA,
    email:         EMAIL,
    isFeatured:    true,
    isNew:         true,
    publishedAt:   '2024-09-15',
  },
]

export const DEMO_SYSTEM_MAP = Object.fromEntries(
  DEMO_SYSTEMS.map((s) => [s.slug, s])
)
