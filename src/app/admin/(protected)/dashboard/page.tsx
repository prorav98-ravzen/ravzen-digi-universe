import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG }  from '@/config/site'
import Link             from 'next/link'

export const metadata = { title: 'Dashboard — RAVZEN Admin' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: designCount   },
    { count: androidCount  },
    { count: softwareCount },
    { count: systemCount   },
    { count: sessionCount  },
    { count: eventCount    },
  ] = await Promise.all([
    supabase.from('design_projects').select('*',  { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('android_apps').select('*',     { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('software_products').select('*',{ count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('systems').select('*',          { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('active_sessions').select('*',  { count: 'exact', head: true }),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
  ])

  const raw      = sessionCount ?? 0
  const displayed= raw * SITE_CONFIG.activityMultiplier

  const sections = [
    { label: 'Design Projects', count: designCount  ?? 0, href: '/admin/design',    color: '#b44dff', emoji: '🎨' },
    { label: 'Android Apps',    count: androidCount ?? 0, href: '/admin/android',   color: '#00ff87', emoji: '📱' },
    { label: 'Software',        count: softwareCount ?? 0,href: '/admin/software',  color: '#4d7fff', emoji: '💻' },
    { label: 'Systems',         count: systemCount  ?? 0, href: '/admin/systems',   color: '#ffb800', emoji: '⚙️' },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--color-energy-white)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(248,250,255,0.4)' }}>
          RAVZEN DIGI UNIVERSE control panel
        </p>
      </div>

      {/* Universe Activity */}
      <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--color-energy-white)' }}>
          Universe Activity
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Active Sessions (raw)"       value={raw.toString()}            color="#4d7fff" />
          <Stat label={`Public Display (×${SITE_CONFIG.activityMultiplier})`} value={displayed.toString()} color="#00ff87" note="Presentation multiplier — no fake records" />
          <Stat label="Total Events"               value={(eventCount ?? 0).toLocaleString()} color="#ffb800" />
        </div>
      </div>

      {/* Content stats */}
      <div>
        <h2 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--color-energy-white)' }}>
          Published Content
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="p-4 rounded-2xl block hover:opacity-80 transition-opacity"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
              <p className="font-display font-bold text-2xl mt-2" style={{ color: s.color }}>
                {s.count}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(248,250,255,0.4)' }}>
                {s.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--color-energy-white)' }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/design/new',   label: '+ Design Project' },
            { href: '/admin/android/new',  label: '+ Android App'    },
            { href: '/admin/software/new', label: '+ Software'       },
            { href: '/admin/systems/new',  label: '+ System'         },
            { href: '/admin/ads',          label: 'Manage Ads'       },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="px-4 py-2 rounded-lg text-xs font-mono transition-colors"
              style={{ background: 'rgba(77,127,255,0.1)', border: '1px solid rgba(77,127,255,0.3)', color: '#4d7fff' }}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color, note }: { label: string; value: string; color: string; note?: string }) {
  return (
    <div>
      <p className="font-display font-bold text-xl" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,255,0.4)' }}>{label}</p>
      {note && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,255,0.25)' }}>{note}</p>}
    </div>
  )
}
