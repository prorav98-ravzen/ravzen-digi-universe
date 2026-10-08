'use client'

/**
 * UniverseActivity — Live activity counter for the Universe Hub.
 *
 * Display rules:
 *   - Label: "UNIVERSE ACTIVITY" — never "visitors" or "users"
 *   - Count: raw × multiplier (enforced server-side)
 *   - Polls /api/activity every 30 seconds
 *   - Loading: shimmer skeleton
 *   - Error: renders nothing (never shows broken state)
 *
 * Accessibility:
 *   - aria-live="polite" so screen readers announce updates quietly
 *   - Tooltip on hover explains what the indicator means
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import type { ActivityData }  from '@/lib/activity/activitySource'

type FetchState = 'loading' | 'ready' | 'error'

const POLL_MS = 30_000

export default function UniverseActivity() {
  const [data,  setData]  = useState<ActivityData | null>(null)
  const [state, setState] = useState<FetchState>('loading')
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef        = useRef(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/activity', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as ActivityData
      if (mountedRef.current) { setData(json); setState('ready') }
    } catch {
      if (mountedRef.current) setState('error')
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    load()
    intervalRef.current = setInterval(load, POLL_MS)
    return () => {
      mountedRef.current = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load])

  if (state === 'error') return null

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2 rounded-full"
      style={{
        background:     'rgba(255,255,255,0.04)',
        border:         '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      aria-live="polite"
      aria-atomic="true"
      aria-label={
        state === 'ready' && data
          ? `Universe Activity: ${data.displayed.toLocaleString()} active connections`
          : 'Universe Activity loading'
      }
      title="Active connections in the RAVZEN Universe right now"
    >
      {/* Live pulse dot */}
      <span className="relative flex items-center shrink-0" aria-hidden="true">
        <span
          className="absolute inline-flex rounded-full"
          style={{
            width:      8,
            height:     8,
            background: 'var(--color-energy-green)',
            opacity:    0.45,
            animation:  'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }}
        />
        <span
          className="relative inline-flex rounded-full"
          style={{
            width:      8,
            height:     8,
            background: 'var(--color-energy-green)',
            boxShadow:  '0 0 6px rgba(0,255,135,0.6)',
          }}
        />
      </span>

      {/* Label */}
      <span
        className="font-mono text-[10px] tracking-[0.3em] uppercase"
        style={{ color: 'rgba(248,250,255,0.45)' }}
        aria-hidden="true"
      >
        Universe Activity
      </span>

      {/* Count */}
      {state === 'loading' ? (
        <span
          className="skeleton rounded"
          style={{ width: 28, height: 14, display: 'inline-block' }}
          aria-hidden="true"
        />
      ) : (
        <span
          className="font-display font-bold text-sm tabular-nums"
          style={{ color: 'var(--color-energy-green)' }}
        >
          {data!.displayed.toLocaleString()}
        </span>
      )}
    </div>
  )
}
