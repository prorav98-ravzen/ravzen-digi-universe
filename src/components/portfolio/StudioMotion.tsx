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

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const cards = finePointer ? Array.from(root.querySelectorAll<HTMLElement>('.studio-glow-card')) : []
    const cleanups = cards.map(card => {
      let pointerFrame = 0
      let x = 50
      let y = 50
      const render = () => {
        pointerFrame = 0
        card.style.setProperty('--glow-x', x + '%')
        card.style.setProperty('--glow-y', y + '%')
        card.style.setProperty('--magnet-x', ((x - 50) / 50 * 4).toFixed(2) + 'px')
        card.style.setProperty('--magnet-y', ((y - 50) / 50 * 4).toFixed(2) + 'px')
      }
      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect()
        x = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))
        y = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100))
        if (!pointerFrame) pointerFrame = window.requestAnimationFrame(render)
      }
      const enter = () => card.classList.add('studio-glow-active')
      const leave = () => {
        card.classList.remove('studio-glow-active')
        card.style.removeProperty('--magnet-x')
        card.style.removeProperty('--magnet-y')
      }
      card.addEventListener('pointerenter', enter)
      card.addEventListener('pointermove', move, { passive: true })
      card.addEventListener('pointerleave', leave)
      return () => {
        window.cancelAnimationFrame(pointerFrame)
        card.removeEventListener('pointerenter', enter)
        card.removeEventListener('pointermove', move)
        card.removeEventListener('pointerleave', leave)
      }
    })

    return () => { observer?.disconnect(); cleanups.forEach(cleanup => cleanup()); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); window.cancelAnimationFrame(raf); progress.remove() }
  }, [])
  return null
}
