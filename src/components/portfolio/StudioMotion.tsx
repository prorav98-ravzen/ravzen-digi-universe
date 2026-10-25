'use client'

import { useEffect } from 'react'

/** Progressive enhancement: never hides content when JavaScript is unavailable. */
export default function StudioMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.studio-home')
    if (!root) return
    const progress = document.createElement('div')
    progress.className = 'studio-scroll-progress'
    progress.setAttribute('aria-hidden', 'true')
    document.body.appendChild(progress)
    let raf = 0
    const updateProgress = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`
    }
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(updateProgress) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    updateProgress()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); window.cancelAnimationFrame(raf); progress.remove() }

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

    return () => { observer?.disconnect(); cleanups.forEach(cleanup => cleanup()); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); window.cancelAnimationFrame(raf); progress.remove() }
  }, [])
  return null
}
