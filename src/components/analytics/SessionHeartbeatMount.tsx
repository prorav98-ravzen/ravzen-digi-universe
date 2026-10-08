'use client'

/**
 * SessionHeartbeatMount — Invisible client component that starts
 * the session heartbeat. Mounted once in the public layout.
 */

import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat'

export default function SessionHeartbeatMount() {
  useSessionHeartbeat()
  return null
}
