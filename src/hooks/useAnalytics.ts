'use client'

/**
 * useAnalytics — Fire-and-forget analytics event tracking.
 *
 * Architecture:
 *   - Session token: anonymous UUID in sessionStorage.
 *     Cleared on tab close — never persists to localStorage.
 *   - Events are sent to POST /api/analytics.
 *   - Never throws — analytics must not break the UX.
 *   - No batching: each event is sent immediately (network is cheap).
 *
 * Privacy:
 *   - No IP address, no user agent, no cookies.
 *   - Session token is ephemeral and random.
 *   - Only event type + entity reference + timestamp recorded.
 */

import { useCallback, useEffect, useRef } from 'react'

type EventType =
  | 'zone_visit'
  | 'project_view'
  | 'app_view'
  | 'software_view'
  | 'system_view'
  | 'download_click'
  | 'whatsapp_click'
  | 'email_click'
  | 'cta_click'
  | 'ad_click'

type EntityType = 'design' | 'android' | 'software' | 'system' | 'advertisement'

interface TrackPayload {
  event_type:   EventType
  entity_id?:   string
  entity_type?: EntityType
}

const SESSION_KEY = 'ravzen_session_id'

function getOrCreateSession(): string {
  if (typeof window === 'undefined') return ''
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function useAnalytics() {
  const sessionRef = useRef<string>('')

  useEffect(() => {
    sessionRef.current = getOrCreateSession()
  }, [])

  const track = useCallback(async (payload: TrackPayload) => {
    const sessionId = sessionRef.current
    if (!sessionId) return

    try {
      await fetch('/api/analytics', {
        method:    'POST',
        headers:   { 'Content-Type': 'application/json' },
        body:      JSON.stringify({ ...payload, session_id: sessionId }),
        keepalive: true, // survives page transitions
      })
    } catch {
      // Silent — analytics must never surface to the user
    }
  }, [])

  return { track }
}
