'use client'

/**
 * NebulaLayer — Soft cosmic colour washes with pointer-driven parallax.
 *
 * Three nebula blobs at different depths shift slightly as the pointer
 * moves across the hub. Each layer moves at a different speed (parallax
 * factor) giving a convincing sense of depth without WebGL.
 *
 * Implementation:
 *   - Three absolutely-positioned divs with radial-gradient backgrounds.
 *   - On pointermove the container records normalised cursor position
 *     and CSS custom properties (--nx, --ny) drive translate().
 *   - CSS transition: 1.2s ease-out on transform smooths the motion.
 *   - On touch devices the same listener fires on touchmove.
 *   - Reduced motion: no transform applied, blobs remain static.
 *
 * Performance:
 *   - Only CSS transform (no layout properties change).
 *   - One event listener on the parent container.
 *   - No requestAnimationFrame loop.
 */

import { useRef, useCallback, useEffect } from 'react'
import { useReducedMotion }               from '@/hooks/useReducedMotion'

interface NebulaBlob {
  /** Parallax factor: how many px the blob shifts per 100% cursor movement */
  factor: number
  style:  React.CSSProperties
}

const BLOBS: NebulaBlob[] = [
  {
    // Deep purple — top-left
    factor: 18,
    style: {
      position: 'absolute',
      width:  '70%',
      height: '65%',
      top:    '-15%',
      left:   '-15%',
      background:
        'radial-gradient(ellipse 60% 55% at 40% 45%, rgba(124,92,252,0.09) 0%, transparent 70%)',
      transition: 'transform 1.4s ease-out',
      willChange: 'transform',
    },
  },
  {
    // Cyan — top-right
    factor: 12,
    style: {
      position: 'absolute',
      width:  '65%',
      height: '60%',
      top:    '-5%',
      right:  '-10%',
      background:
        'radial-gradient(ellipse 55% 60% at 60% 35%, rgba(0,212,255,0.07) 0%, transparent 70%)',
      transition: 'transform 1.8s ease-out',
      willChange: 'transform',
    },
  },
  {
    // Blue — bottom-centre
    factor: 8,
    style: {
      position: 'absolute',
      width:  '60%',
      height: '55%',
      bottom: '-10%',
      left:   '20%',
      background:
        'radial-gradient(ellipse 50% 45% at 50% 60%, rgba(77,127,255,0.06) 0%, transparent 70%)',
      transition: 'transform 2.2s ease-out',
      willChange: 'transform',
    },
  },
]

export default function NebulaLayer() {
  const reduced   = useReducedMotion()
  const ref       = useRef<HTMLDivElement>(null)
  const blobRefs  = useRef<(HTMLDivElement | null)[]>([])

  const applyParallax = useCallback(
    (nx: number, ny: number) => {
      // nx, ny: normalised -0.5 … +0.5 relative to container centre
      BLOBS.forEach((blob, i) => {
        const el = blobRefs.current[i]
        if (!el) return
        const dx = nx * blob.factor
        const dy = ny * blob.factor
        el.style.transform = `translate(${dx}px, ${dy}px)`
      })
    },
    []
  )

  useEffect(() => {
    if (reduced) return

    const el = ref.current
    if (!el) return

    function onPointerMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect()
      const nx   = (e.clientX - rect.left)  / rect.width  - 0.5
      const ny   = (e.clientY - rect.top)   / rect.height - 0.5
      applyParallax(nx, ny)
    }

    function onPointerLeave() {
      applyParallax(0, 0)
    }

    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerleave', onPointerLeave)

    return () => {
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [reduced, applyParallax])

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          ref={(el) => { blobRefs.current[i] = el }}
          style={blob.style}
        />
      ))}
    </div>
  )
}
