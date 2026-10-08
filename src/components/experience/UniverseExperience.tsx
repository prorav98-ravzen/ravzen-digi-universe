'use client'

/**
 * UniverseExperience — Top-level stage orchestrator.
 *
 * Stage → Component mapping:
 *   intro       → IntroScreen
 *   portal      → PortalDoor
 *   hub         → UniverseHub
 *   zone-enter  → zone-specific activation cinematic
 *   zone        → zone-specific content
 *   zone-exit   → zone-specific return transition
 *
 * All four zones implemented:
 *   design   — Phase 3 ✓
 *   android  — Phase 4 ✓
 *   software — Phase 5 ✓
 *   system   — Phase 6 ✓
 *
 * All stage components are lazy-loaded (ssr: false) to keep the
 * initial bundle minimal. Void/colour fallbacks prevent layout shifts.
 */

import dynamic           from 'next/dynamic'
import { useExperience } from '@/store/experienceStore'

// ── Loading fallbacks ─────────────────────────────────────────────────────────

const VoidFallback   = () => <div className="fixed inset-0" style={{ background: 'var(--color-void)' }} aria-hidden="true" />
const WhiteFallback  = () => <div className="fixed inset-0" style={{ background: '#faf8ff' }} aria-hidden="true" />
const DarkGreenFb    = () => <div className="fixed inset-0" style={{ background: '#031a10' }} aria-hidden="true" />
const DarkBlueFb     = () => <div className="fixed inset-0" style={{ background: '#060820' }} aria-hidden="true" />
const DarkAmberFb    = () => <div className="fixed inset-0" style={{ background: '#130800' }} aria-hidden="true" />

// ── Core flow ─────────────────────────────────────────────────────────────────

const IntroScreen = dynamic(() => import('./IntroScreen'),
  { ssr: false, loading: () => <VoidFallback /> })

const PortalDoor = dynamic(() => import('./PortalDoor'),
  { ssr: false, loading: () => <VoidFallback /> })

const UniverseHub = dynamic(() => import('./UniverseHub'),
  { ssr: false, loading: () => <VoidFallback /> })

const ClosingExperience = dynamic(() => import('./ClosingExperience'),
  { ssr: false, loading: () => <VoidFallback /> })

// ── Design zone (Phase 3) ─────────────────────────────────────────────────────

const DesignActivation = dynamic(
  () => import('@/components/zones/design/DesignActivation'),
  { ssr: false, loading: () => <VoidFallback /> }
)
const DesignZone = dynamic(
  () => import('@/components/zones/design/DesignZone'),
  { ssr: false, loading: () => <WhiteFallback /> }
)
const DesignReturnTransition = dynamic(
  () => import('@/components/zones/design/DesignReturnTransition'),
  { ssr: false, loading: () => <VoidFallback /> }
)

// ── Android zone (Phase 4) ────────────────────────────────────────────────────

const AndroidActivation = dynamic(
  () => import('@/components/zones/android/AndroidActivation'),
  { ssr: false, loading: () => <VoidFallback /> }
)
const AndroidZone = dynamic(
  () => import('@/components/zones/android/AndroidZone'),
  { ssr: false, loading: () => <DarkGreenFb /> }
)
const AndroidReturnTransition = dynamic(
  () => import('@/components/zones/android/AndroidReturnTransition'),
  { ssr: false, loading: () => <VoidFallback /> }
)

// ── Software zone (Phase 5) ───────────────────────────────────────────────────

const SoftwareActivation = dynamic(
  () => import('@/components/zones/software/SoftwareActivation'),
  { ssr: false, loading: () => <VoidFallback /> }
)
const SoftwareZone = dynamic(
  () => import('@/components/zones/software/SoftwareZone'),
  { ssr: false, loading: () => <DarkBlueFb /> }
)
const SoftwareReturnTransition = dynamic(
  () => import('@/components/zones/software/SoftwareReturnTransition'),
  { ssr: false, loading: () => <VoidFallback /> }
)

// ── System zone (Phase 6) ─────────────────────────────────────────────────────

const SystemActivation = dynamic(
  () => import('@/components/zones/system/SystemActivation'),
  { ssr: false, loading: () => <VoidFallback /> }
)
const SystemZone = dynamic(
  () => import('@/components/zones/system/SystemZone'),
  { ssr: false, loading: () => <DarkAmberFb /> }
)
const SystemReturnTransition = dynamic(
  () => import('@/components/zones/system/SystemReturnTransition'),
  { ssr: false, loading: () => <VoidFallback /> }
)

// ── Orchestrator ──────────────────────────────────────────────────────────────

export default function UniverseExperience() {
  const { stage, activeZone } = useExperience()

  return (
    <>
      {/* ── Core flow ─────────────────────────────────────────── */}
      {stage === 'intro'  && <IntroScreen />}
      {stage === 'portal' && <PortalDoor />}

      {/* Hub stays mounted during zone-enter so it's visible under
          the activation overlay. Unmounted once we reach zone/zone-exit. */}
      {(stage === 'hub' || stage === 'zone-enter') && <UniverseHub />}

      {/* ── Design zone ───────────────────────────────────────── */}
      {stage === 'zone-enter' && activeZone === 'design' && <DesignActivation />}
      {stage === 'zone'       && activeZone === 'design' && <DesignZone />}
      {stage === 'zone-exit'  && activeZone === 'design' && <DesignReturnTransition />}

      {/* ── Android zone ──────────────────────────────────────── */}
      {stage === 'zone-enter' && activeZone === 'android' && <AndroidActivation />}
      {stage === 'zone'       && activeZone === 'android' && <AndroidZone />}
      {stage === 'zone-exit'  && activeZone === 'android' && <AndroidReturnTransition />}

      {/* ── Software zone ─────────────────────────────────────── */}
      {stage === 'zone-enter' && activeZone === 'software' && <SoftwareActivation />}
      {stage === 'zone'       && activeZone === 'software' && <SoftwareZone />}
      {stage === 'zone-exit'  && activeZone === 'software' && <SoftwareReturnTransition />}

      {/* ── System zone ───────────────────────────────────────── */}
      {stage === 'zone-enter' && activeZone === 'system' && <SystemActivation />}
      {stage === 'zone'       && activeZone === 'system' && <SystemZone />}
      {stage === 'zone-exit'  && activeZone === 'system' && <SystemReturnTransition />}

      {/* ── Closing experience ────────────────────────────────── */}
      {stage === 'closing' && <ClosingExperience />}
    </>
  )
}
