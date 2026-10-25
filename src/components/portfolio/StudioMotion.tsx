'use client'

import { useEffect } from 'react'

/** Progressive enhancement: never hides content when JavaScript is unavailable. */
export default function StudioMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.studio-home')
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-studio-reveal]'))
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('studio-revealed')
              observer?.unobserve(entry.target)
            }
          })
        }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' })
      : null

    items.forEach(item => {
      if (observer) observer.observe(item)
      else item.classList.add('studio-revealed')
    })

    const cards = Array.from(root.querySelectorAll<HTMLElement>('.studio-glow-card'))
    const cleanups = cards.map(card => {
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--glow-x', `${event.clientX - rect.left}px`)
        card.style.setProperty('--glow-y', `${event.clientY - rect.top}px`)
      }
      card.addEventListener('pointermove', move, { passive: true })
      return () => card.removeEventListener('pointermove', move)
    })

    return () => { observer?.disconnect(); cleanups.forEach(cleanup => cleanup()) }
  }, [])
  return null
}
