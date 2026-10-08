import { createClient }  from '@/lib/supabase/server'
import { SITE_CONFIG }   from '@/config/site'

export const metadata = { title: 'Analytics — RAVZEN Admin' }

export default async function AdminAnalyticsPage() {
  const supabase   = await createClient()
  const threshold  = new Date(Date.now() - SITE_CONFIG.staleSessionMinutes * 60 * 1000).toISOString()
  const week       = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: activeSessions },
    { count: totalEvents    },
    { data: recentEvents    },
    { data: weeklyZoneVisits},
    { data: topAds          },
  ] = await Promise.all([
    supabase.from('active_sessions').select('*', { count: 'exact', head: true }).gte('last_seen_at', threshold),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
    supabase.from('analytics_events').select('event_type').limit(1000),
    supabase.from('analytics_events').select('event_type, entity_type').eq('event_type', 'zone_visit').gte('created_at', week),
    supabase.from('analytics_events').select('entity_id, entity_type').eq('event_type', 'ad_click').gte('created_at', week).limit(100),
  ])

  // Aggregate event counts
  const eventCounts: Record<string, number> = {}
  for (const row of recentEvents ?? []) {
    eventCounts[row.event_type] = (eventCounts[row.event_type] ?? 0) + 1
  }

  // Zone visit breakdown (last 7 days)
  const zoneVisits: Record<string, number> = {}
  for (const row of weeklyZoneVisits ?? []) {
    const zone = (row.entity_type as string) ?? 'unknown'
    zoneVisits[zone] = (zoneVisits[zone] ?? 0) + 1
  }

  // Ad click count
  const adClicks = topAds?.length ?? 0

  const raw       = activeSessions ?? 0
  const displayed = raw * SITE_CONFIG.activityMultiplier

  // Click-type events
  const clickEvents = ['download_click','whatsapp_click','email_click','cta_click','ad_click']
  const totalClicks = clickEvents.reduce((sum, k) => sum + (eventCounts[k] ?? 0), 0)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--color-energy-white)' }}>Analytics</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(248,250,255,0.4)' }}>
          Privacy-conscious engagement data. No personally identifiable information stored.
        </p>
      </div>

      {/* ── Live activity ───────────────────────────────────────────── */}
      <section>
        <h2 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--color-energy-white)' }}>
          Universe Activity (live)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Active Sessions (raw)"  value={raw.toString()}               color="#4d7fff" />
          <Stat label={`Public ×${SITE_CONFIG.activityMultiplier}`} value={displayed.toString()} color="#00ff87" note="No fake records" />
          <Stat label="Total Events (all time)" value={(totalEvents ?? 0).toLocaleString()} color="#ffb800" />
          <Stat label="Clicks (all time)"        value={totalClicks.toLocaleString()} color="#b44dff" />
        </div>
      </section>

      {/* ── Zone visits (last 7 days) ───────────────────────────────── */}
      {Object.keys(zoneVisits).length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--color-energy-white)' }}>
            Zone Visits — last 7 days
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'design',   label: 'Design',   color: '#b44dff' },
              { key: 'android',  label: 'Android',  color: '#00ff87' },
              { key: 'software', label: 'Software', color: '#4d7fff' },
              { key: 'system',   label: 'System',   color: '#ffb800' },
            ].map(({ key, label, color }) => (
              <Stat key={key} label={label} value={(zoneVisits[key] ?? 0).toString()} color={color} />
            ))}
          </div>
        </section>
      )}

      {/* ── Ad performance ──────────────────────────────────────────── */}
      <section>
        <h2 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--color-energy-white)' }}>
          Ad Performance (last 7 days)
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Ad Clicks" value={adClicks.toLocaleString()} color="#ff6b35" />
          <Stat label="CTA Clicks" value={(eventCounts['cta_click'] ?? 0).toLocaleString()} color="#ff4d9d" />
        </div>
      </section>

      {/* ── Full event breakdown ─────────────────────────────────────── */}
      <section>
        <h2 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--color-energy-white)' }}>
          Event Breakdown (all time)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <div key={type} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-display font-bold text-lg" style={{ color: 'var(--color-energy-white)' }}>{count}</p>
              <p className="text-[10px] font-mono tracking-wide mt-0.5" style={{ color: 'rgba(248,250,255,0.4)' }}>
                {type.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
        {Object.keys(eventCounts).length === 0 && (
          <p className="text-sm" style={{ color: 'rgba(248,250,255,0.35)' }}>No events tracked yet.</p>
        )}
      </section>

      {/* ── Privacy notice ───────────────────────────────────────────── */}
      <p className="text-[10px] font-mono" style={{ color: 'rgba(248,250,255,0.2)' }}>
        ⚠ No IP addresses, device fingerprints, or personally identifiable information are stored.
        Session tokens are anonymous and ephemeral (cleared on tab close).
      </p>
    </div>
  )
}

function Stat({ label, value, color, note }: { label: string; value: string; color: string; note?: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,255,0.4)' }}>{label}</p>
      {note && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(248,250,255,0.25)' }}>{note}</p>}
    </div>
  )
}
