'use client'

/**
 * useSessionHeartbeat — Keeps the anonymous session alive.
 *
 * Pings POST /api/sessions every `intervalMs` to update last_seen_at.
 * On page unload, sends DELETE via navigator.sendBeacon to /api/sessions/end.
 *
 * The session token comes from sessionStorage — anonymous, ephemeral,
 * never linked to any user account.
 */

import { useEffect } from 'react'

const SESSION_KEY    = 'ravzen_session_id'
const HEARTBEAT_MS   = 30_000   // 30 s — matches staleSessionMinutes × 60 000 / 10

function getSession(): string {
  if (typeof window === 'undefined') return ''
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return ''
  }
}

export function useSessionHeartbeat() {
  useEffect(() => {
    const token = getSession()
    if (!token) return

    async function heartbeat() {
      try {
        await fetch('/api/sessions', {
          method:    'POST',
          headers:   { 'Content-Type': 'application/json' },
          body:      JSON.stringify({ session_token: token }),
          keepalive: true,
        })
      } catch { /* silent */ }
    }

    // Initial ping immediately
    heartbeat()

    const interval = setInterval(heartbeat, HEARTBEAT_MS)

    // Clean up on unload
    function onUnload() {
      navigator.sendBeacon(
        '/api/sessions/end',
        JSON.stringify({ session_token: token })
      )
    }

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onUnload()
    })
    window.addEventListener('beforeunload', onUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [])
}
