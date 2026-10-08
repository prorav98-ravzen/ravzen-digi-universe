'use client'

/**
 * ExperienceStore — Universe experience state machine.
 *
 * Stages:
 *   intro      → White screen, letter reveal, entry CTA
 *   portal     → Four-panel dimensional portal opening
 *   hub        → Universe Hub — space environment, zone cards
 *   zone-enter → Zone activation cinematic (design only in Phase 3)
 *   zone       → Inside a zone (content visible)
 *   zone-exit  → Return transition back to hub
 *
 * activeZone: which zone is currently activating or active.
 *   null   = on hub or earlier stage
 *   'design' | 'android' | 'software' | 'system'
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { ExperienceStage } from '@/types/animations'
import type { ZoneKey }         from '@/config/zones'

// ── Session storage ───────────────────────────────────────────────────────────

const SEEN_KEY = 'ravzen_intro_seen'

function markIntroSeen() {
  if (typeof window !== 'undefined') {
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* incognito */ }
  }
}

function hasSeenIntro(): boolean {
  if (typeof window === 'undefined') return false
  try { return sessionStorage.getItem(SEEN_KEY) === '1' } catch { return false }
}

// ── State ─────────────────────────────────────────────────────────────────────

interface ExperienceState {
  stage:         ExperienceStage
  activeZone:    ZoneKey | null
  hasInteracted: boolean
}

type ExperienceAction =
  | { type: 'ENTER_PORTAL' }
  | { type: 'ENTER_HUB' }
  | { type: 'SKIP_TO_HUB' }
  | { type: 'ENTER_ZONE';   zone: ZoneKey }
  | { type: 'ZONE_READY' }
  | { type: 'EXIT_ZONE' }
  | { type: 'RETURN_TO_HUB' }
  | { type: 'OPEN_CLOSING' }   // Trigger the closing experience

function reducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  switch (action.type) {
    case 'ENTER_PORTAL':
      if (state.stage !== 'intro') return state
      return { ...state, stage: 'portal', hasInteracted: true }

    case 'ENTER_HUB':
      if (state.stage !== 'portal') return state
      return { ...state, stage: 'hub', activeZone: null, hasInteracted: true }

    case 'SKIP_TO_HUB':
      return { ...state, stage: 'hub', activeZone: null, hasInteracted: true }

    case 'ENTER_ZONE':
      // Can only enter from hub
      if (state.stage !== 'hub') return state
      return { ...state, stage: 'zone-enter', activeZone: action.zone }

    case 'ZONE_READY':
      if (state.stage !== 'zone-enter') return state
      return { ...state, stage: 'zone' }

    case 'EXIT_ZONE':
      if (state.stage !== 'zone') return state
      return { ...state, stage: 'zone-exit' }

    case 'RETURN_TO_HUB':
      return { ...state, stage: 'hub', activeZone: null }

    case 'OPEN_CLOSING':
      return { ...state, stage: 'closing' }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ExperienceContextValue {
  stage:         ExperienceStage
  activeZone:    ZoneKey | null
  hasInteracted: boolean
  enterPortal:   () => void
  enterHub:      () => void
  skipToHub:     () => void
  enterZone:     (zone: ZoneKey) => void
  zoneReady:     () => void
  exitZone:      () => void
  returnToHub:   () => void
  /** Open the closing experience from the hub */
  openClosing:   () => void
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function ExperienceProvider({
  children,
  _forceStage,
}: {
  children:    ReactNode
  _forceStage?: ExperienceStage
}) {
  const [state, dispatch] = useReducer(reducer, {
    stage:         _forceStage ?? 'intro',
    activeZone:    null,
    hasInteracted: false,
  })

  useEffect(() => {
    if (_forceStage) return
    if (hasSeenIntro()) dispatch({ type: 'SKIP_TO_HUB' })
  }, [_forceStage])

  const enterPortal  = useCallback(() => dispatch({ type: 'ENTER_PORTAL' }),                              [])
  const enterHub     = useCallback(() => { dispatch({ type: 'ENTER_HUB' }); markIntroSeen() },            [])
  const skipToHub    = useCallback(() => { dispatch({ type: 'SKIP_TO_HUB' }); markIntroSeen() },          [])
  const enterZone    = useCallback((zone: ZoneKey) => dispatch({ type: 'ENTER_ZONE', zone }),              [])
  const zoneReady    = useCallback(() => dispatch({ type: 'ZONE_READY' }),                                 [])
  const exitZone     = useCallback(() => dispatch({ type: 'EXIT_ZONE' }),                                  [])
  const returnToHub  = useCallback(() => dispatch({ type: 'RETURN_TO_HUB' }),                             [])
  const openClosing  = useCallback(() => dispatch({ type: 'OPEN_CLOSING' }),                              [])

  return (
    <ExperienceContext.Provider
      value={{
        stage:      state.stage,
        activeZone: state.activeZone,
        hasInteracted: state.hasInteracted,
        enterPortal, enterHub, skipToHub,
        enterZone, zoneReady, exitZone, returnToHub, openClosing,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  )
}

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext)
  if (!ctx) throw new Error('useExperience must be called inside <ExperienceProvider>')
  return ctx
}
