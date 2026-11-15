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

    // Glossy gradient bubbles float upward without intercepting input.
    const fineBubblePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const bubbleMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const bubbleLayer = document.createElement('div')
    bubbleLayer.dataset.ravzenBubble = 'rising-bubbles'
    bubbleLayer.setAttribute('aria-hidden', 'true')
    Object.assign(bubbleLayer.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', overflow: 'hidden',
      zIndex: '35', contain: 'layout style paint',
    })
    document.body.appendChild(bubbleLayer)
    const bubbleAnimations = new Set<Animation>()
    const clearBubble = () => {
      bubbleAnimations.forEach(animation => animation.cancel())
      bubbleAnimations.clear()
      bubbleLayer.replaceChildren()
    }
    const onBubbleVisibility = () => { if (document.hidden) clearBubble() }
    const onBubbleMotion = () => { if (bubbleMotion.matches) clearBubble() }
    document.addEventListener('visibilitychange', onBubbleVisibility)
    bubbleMotion.addEventListener('change', onBubbleMotion)
    let lastBubble = -Infinity
    let bubbleIndex = 0
    let lastX = -100
    let lastY = -100
    const emitBubble = (x: number, y: number, kind: 'mouse' | 'touch' | 'wheel', burst = false) => {
      if (document.hidden || bubbleMotion.matches || typeof Element.prototype.animate !== 'function') return
      const now = performance.now()
      const interval = kind === 'mouse' ? 140 : 180
      if (!burst && now - lastBubble < interval) return
      if (!burst && kind !== 'wheel' && Math.hypot(x - lastX, y - lastY) < 18) return
      const limit = fineBubblePointer ? 24 : 16
      const count = burst ? (fineBubblePointer ? 6 : 4) : 2
      if (bubbleLayer.childElementCount + count > limit) return
      lastBubble = now
      lastX = x
      lastY = y
      bubbleIndex++
      for (let i = 0; i < count; i++) {
        const bubble = document.createElement('div')
        const size = (burst ? 20 : 12) + ((bubbleIndex * 7 + i * 11) % 25)
        const direction = (bubbleIndex + i) % 2 ? 1 : -1
        const drift = direction * (24 + i * 16)
        const rise = (burst ? 160 : 95) + i * 22
        const rotation = direction * (18 + i * 9)
        Object.assign(bubble.style, {
          position: 'absolute', left: x + 'px', top: y + 'px',
          width: size + 'px', height: size + 'px',
          borderRadius: '50%',
          pointerEvents: 'none', opacity: '0', willChange: 'transform, opacity',
          // Bright reflections and a crisp rim give each translucent bubble depth.
          background: 'radial-gradient(ellipse at 28% 22%, rgba(255,255,255,.95) 0%, rgba(255,250,215,.65) 7%, transparent 22%), radial-gradient(ellipse at 72% 80%, rgba(255,213,79,.5), transparent 48%), linear-gradient(145deg, rgba(255,215,75,.68), rgba(255,142,28,.4) 38%, rgba(255,178,40,.28) 58%, rgba(236,53,49,.62))',
          border: '1px solid rgba(255,216,128,.65)',
          boxShadow: 'inset 2px 2px 5px rgba(255,248,205,.3), inset -2px -3px 6px rgba(200,44,35,.28), 0 0 9px rgba(255,157,39,.16)',
          transform: 'translate(-50%, -50%) scale(.28)',
        })
        bubbleLayer.appendChild(bubble)
        const pose = (dx: number, dy: number, scale: number, angle: number) =>
          `translate(calc(-50% + ${dx}px), calc(-50% - ${dy}px)) rotate(${angle}deg) scale(${scale})`
        const animation = bubble.animate([
          { opacity: 0, transform: pose(0, 0, .35, -rotation) },
          { opacity: burst ? .9 : .6, offset: .16, transform: pose(-drift * .15, rise * .08, .9, 0) },
          { opacity: burst ? .8 : .48, offset: .43, transform: pose(drift * .5, rise * .35, 1, rotation * .4) },
          { opacity: .42, offset: .72, transform: pose(-drift * .2, rise * .68, 1.06, rotation) },
          { opacity: 0, transform: pose(drift, rise, 1.15, rotation * 1.4) },
        ], { duration: (burst ? 2400 : 1800) + i * 160, delay: i * 65, easing: 'ease-out', fill: 'both' })
        bubbleAnimations.add(animation)
        const remove = () => { bubbleAnimations.delete(animation); bubble.remove() }
        animation.onfinish = remove
        animation.oncancel = remove
      }
    }
    const onWheelBubble = (event: WheelEvent) => {
      if (fineBubblePointer && Math.abs(event.deltaY) > 2) emitBubble(event.clientX, event.clientY, 'wheel')
    }
    const onBubblePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') emitBubble(event.clientX, event.clientY, 'mouse')
      else if (event.pointerType === 'touch' && event.pressure > 0) emitBubble(event.clientX, event.clientY, 'touch')
    }
    const onBubblePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      emitBubble(event.clientX, event.clientY, event.pointerType === 'mouse' ? 'mouse' : 'touch', true)
    }
    window.addEventListener('wheel', onWheelBubble, { passive: true })
    window.addEventListener('pointermove', onBubblePointerMove, { passive: true })
    window.addEventListener('pointerdown', onBubblePointerDown, { passive: true })

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

    const cursorLabel = document.createElement('div')
    cursorLabel.className = 'ravzen-cursor-label'
    cursorLabel.textContent = 'View project'
    cursorLabel.setAttribute('aria-hidden','true')
    if (finePointer) document.body.appendChild(cursorLabel)
    const onCursorMove = (event: PointerEvent) => {
      const target = event.target as Element
      const artwork = target.closest('#work article.studio-glow-card')
      const interactive = target.closest('button, a')
      cursorLabel.classList.toggle('is-visible',Boolean(artwork && interactive))
      if (artwork && interactive) {
        cursorLabel.textContent = target.closest('a') ? 'Explore project' : 'View artwork'
        cursorLabel.style.left = event.clientX + 'px'
        cursorLabel.style.top = event.clientY + 'px'
      }
    }
    if (finePointer) root.addEventListener('pointermove',onCursorMove,{passive:true})
    return () => { clearBubble(); document.removeEventListener('visibilitychange', onBubbleVisibility); bubbleMotion.removeEventListener('change', onBubbleMotion); window.removeEventListener('wheel', onWheelBubble); window.removeEventListener('pointermove', onBubblePointerMove); window.removeEventListener('pointerdown', onBubblePointerDown); bubbleLayer.remove(); root.removeEventListener('pointermove',onCursorMove); cursorLabel.remove(); artworkObserver.disconnect(); buttonCleanup.forEach(fn=>fn()); root.removeEventListener('click',onArtworkClick); root.removeEventListener('pointermove',onPointer); cancelAnimationFrame(spotFrame); spotlight.remove(); observer?.disconnect(); cleanups.forEach(cleanup => cleanup());  }
  }, [])
  return null
}
