/**
 * Public experience layout.
 *
 * Wraps the experience in:
 *   1. ExperienceProvider — drives the stage state machine
 *   2. SessionHeartbeatMount — keeps Universe Activity live
 */

import { ExperienceProvider }     from '@/store/experienceStore'
import SessionHeartbeatMount      from '@/components/analytics/SessionHeartbeatMount'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExperienceProvider>
      <SessionHeartbeatMount />
      {children}
    </ExperienceProvider>
  )
}
