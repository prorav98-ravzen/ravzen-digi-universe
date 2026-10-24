'use client'
import { useEffect, useState } from 'react'

type Stats = { today: number; month: number; total: number }
export default function VisitorCounters() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let id = localStorage.getItem('ravzen_visitor_id')
        if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
          id = crypto.randomUUID()
          localStorage.setItem('ravzen_visitor_id', id)
        }
        const res = await fetch('/api/visitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorId: id }), cache: 'no-store' })
        if (!res.ok) throw new Error('Tracking unavailable')
        const data = await res.json() as Stats
        if (!cancelled) setStats(data)
      } catch {
        try {
          const res = await fetch('/api/visitors', { cache: 'no-store' })
          if (res.ok && !cancelled) setStats(await res.json() as Stats)
        } catch { /* keep unavailable indicator */ }
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])
  return <section aria-label="Website visitors" className="mx-auto max-w-7xl px-5 pb-20 md:px-10">
    <p className="mb-5 text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Studio audience · Sri Lanka time</p>
    <div className="grid grid-cols-3 gap-3 md:gap-6">
      {([{ label: 'Today visitors', key: 'today' }, { label: 'This month visitors', key: 'month' }, { label: 'Total visitors', key: 'total' }] as const).map(item =>
        <div key={item.key} className="rounded-2xl border border-fuchsia-400/20 bg-white/[.035] p-4 text-center md:p-7">
          <p className="text-2xl font-black text-fuchsia-300 md:text-5xl" aria-live="polite">{stats ? stats[item.key].toLocaleString('en-LK') : '—'}</p>
          <p className="mt-3 text-xs text-white/65 md:text-sm">{item.label}</p>
        </div>
      )}
    </div>
    <p className="mt-3 text-xs text-white/40">Approximate unique browsers · Refreshes are not counted again on the same day.</p>
  </section>
}
