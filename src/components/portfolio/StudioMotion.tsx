'use client'

import { useEffect } from 'react'

/** Progressive enhancement: never hides content when JavaScript is unavailable. */
export default function StudioMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.studio-home')
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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


    // Premium interactions, desktop pointer only; no motion on reduced-motion devices.
    const buttons = finePointer ? Array.from(root.querySelectorAll<HTMLElement>('a[href="#work"], a[href="#inquiry"], .studio-contact-options a')) : []
    const buttonCleanup = buttons.map(button => {
      button.classList.add('ravzen-magnetic')
      const move = (event: PointerEvent) => {
        const rect = button.getBoundingClientRect()
        const dx = (event.clientX - rect.left - rect.width / 2) * .10
        const dy = (event.clientY - rect.top - rect.height / 2) * .13
        button.style.setProperty('--button-x', dx.toFixed(1) + 'px')
        button.style.setProperty('--button-y', dy.toFixed(1) + 'px')
      }
      const leave = () => {button.style.removeProperty('--button-x');button.style.removeProperty('--button-y')}
      button.addEventListener('pointermove', move, {passive:true})
      button.addEventListener('pointerleave', leave)
      return () => {button.removeEventListener('pointermove',move);button.removeEventListener('pointerleave',leave);leave()}
    })
    const headings = Array.from(root.querySelectorAll<HTMLElement>('#work h2, #services h2, #inquiry h2'))
    headings.forEach(h => h.classList.add('ravzen-kinetic-heading'))
    const artworkCards = Array.from(root.querySelectorAll<HTMLElement>('#work article.studio-glow-card'))
    artworkCards.forEach(card => card.classList.add('ravzen-artwork-reveal'))
    const viewed = new Set<HTMLElement>()
    const artworkObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('ravzen-artwork-visible')
        artworkObserver.unobserve(entry.target)
      }
    }), {threshold:.12})
    artworkCards.forEach(card => artworkObserver.observe(card))

    // Reveal contact option only after meaningful artwork exploration.
    let seen = 0
    const contact = root.querySelector<HTMLElement>('.studio-contact-dock')
    const onArtworkClick = (event: Event) => {
      const target = event.target as Element
      const card = target.closest('#work article.studio-glow-card') as HTMLElement | null
      if (!card || viewed.has(card)) return
      viewed.add(card)
      seen++
      if (seen >= 3 && contact) contact.classList.add('ravzen-contact-attention')
    }
    root.addEventListener('click', onArtworkClick)
    const spotlight = document.createElement('div')
    spotlight.className = 'ravzen-ambient-spotlight'
    spotlight.setAttribute('aria-hidden','true')
    if (finePointer) root.appendChild(spotlight)
    let spotFrame = 0
    const onPointer = (event: PointerEvent) => {
      if (spotFrame) return
      spotFrame = requestAnimationFrame(() => {
        spotFrame = 0
        const rect = root.getBoundingClientRect()
        spotlight.style.left = event.clientX - rect.left + 'px'
        spotlight.style.top = event.clientY - rect.top + 'px'
      })
    }
    if (finePointer) root.addEventListener('pointermove',onPointer,{passive:true})

    return () => { artworkObserver.disconnect(); buttonCleanup.forEach(fn=>fn()); root.removeEventListener('click',onArtworkClick); root.removeEventListener('pointermove',onPointer); cancelAnimationFrame(spotFrame); spotlight.remove(); observer?.disconnect(); cleanups.forEach(cleanup => cleanup());  }
  }, [])
  return null
}
