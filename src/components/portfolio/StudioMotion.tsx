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

    // Layered warm wisps rise, curl and disperse without intercepting input.
    const fineSmokePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const smokeMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const smokeLayer = document.createElement('div')
    smokeLayer.dataset.ravzenSmoke = 'rising-cloud'
    smokeLayer.setAttribute('aria-hidden', 'true')
    Object.assign(smokeLayer.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', overflow: 'hidden',
      zIndex: '35', contain: 'layout style paint',
    })
    document.body.appendChild(smokeLayer)
    const smokeAnimations = new Set<Animation>()
    const clearSmoke = () => {
      smokeAnimations.forEach(animation => animation.cancel())
      smokeAnimations.clear()
      smokeLayer.replaceChildren()
    }
    const onSmokeVisibility = () => { if (document.hidden) clearSmoke() }
    const onSmokeMotion = () => { if (smokeMotion.matches) clearSmoke() }
    document.addEventListener('visibilitychange', onSmokeVisibility)
    smokeMotion.addEventListener('change', onSmokeMotion)
    let lastSmoke = -Infinity
    let smokeIndex = 0
    let lastX = -100
    let lastY = -100
    const emitSmoke = (x: number, y: number, kind: 'mouse' | 'touch' | 'wheel', burst = false) => {
      if (document.hidden || smokeMotion.matches || typeof Element.prototype.animate !== 'function') return
      const now = performance.now()
      const interval = kind === 'mouse' ? 140 : 180
      if (!burst && now - lastSmoke < interval) return
      if (!burst && kind !== 'wheel' && Math.hypot(x - lastX, y - lastY) < 18) return
      const limit = fineSmokePointer ? 24 : 16
      const count = burst ? (fineSmokePointer ? 4 : 3) : 2
      if (smokeLayer.childElementCount + count > limit) return
      lastSmoke = now
      lastX = x
      lastY = y
      smokeIndex++
      for (let i = 0; i < count; i++) {
        const wisp = document.createElement('div')
        const size = (burst ? 120 : 86) + i * 17 + (smokeIndex % 3) * 9
        const direction = (smokeIndex + i) % 2 ? 1 : -1
        const drift = direction * (30 + i * 19)
        const rise = (burst ? 170 : 110) + i * 27
        const rotation = direction * (18 + i * 9)
        Object.assign(wisp.style, {
          position: 'absolute', left: x + 'px', top: y + 'px',
          width: size + 'px', height: size * 1.12 + 'px',
          borderRadius: '46% 54% 62% 38% / 55% 38% 62% 45%',
          pointerEvents: 'none', opacity: '0', willChange: 'transform, opacity',
          // Uneven overlapping lobes keep the cloud from looking like a round flash.
          background: 'radial-gradient(ellipse at 42% 76%, rgba(255,215,100,.62), rgba(255,153,36,.32) 24%, transparent 51%), radial-gradient(ellipse at 66% 48%, rgba(255,168,38,.42), rgba(246,92,25,.24) 32%, transparent 62%), radial-gradient(ellipse at 32% 30%, rgba(235,65,35,.36), rgba(181,32,35,.15) 34%, transparent 65%)',
          filter: fineSmokePointer ? 'blur(10px)' : 'blur(8px)',
          transform: 'translate(-50%, -50%) scale(.28)',
        })
        smokeLayer.appendChild(wisp)
        const pose = (dx: number, dy: number, scale: number, angle: number) =>
          `translate(calc(-50% + ${dx}px), calc(-50% - ${dy}px)) rotate(${angle}deg) scale(${scale})`
        const animation = wisp.animate([
          { opacity: 0, transform: pose(0, 0, .28, -rotation) },
          { opacity: burst ? .78 : .48, offset: .16, transform: pose(-drift * .15, rise * .08, .65, 0) },
          { opacity: burst ? .55 : .32, offset: .43, transform: pose(drift * .5, rise * .35, 1.05, rotation * .4) },
          { opacity: .17, offset: .72, transform: pose(-drift * .2, rise * .68, 1.45, rotation) },
          { opacity: 0, transform: pose(drift, rise, 1.85, rotation * 1.4) },
        ], { duration: (burst ? 2100 : 1600) + i * 160, delay: i * 65, easing: 'ease-out', fill: 'both' })
        smokeAnimations.add(animation)
        const remove = () => { smokeAnimations.delete(animation); wisp.remove() }
        animation.onfinish = remove
        animation.oncancel = remove
      }
    }
    const onWheelSmoke = (event: WheelEvent) => {
      if (fineSmokePointer && Math.abs(event.deltaY) > 2) emitSmoke(event.clientX, event.clientY, 'wheel')
    }
    const onSmokePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') emitSmoke(event.clientX, event.clientY, 'mouse')
      else if (event.pointerType === 'touch' && event.pressure > 0) emitSmoke(event.clientX, event.clientY, 'touch')
    }
    const onSmokePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      emitSmoke(event.clientX, event.clientY, event.pointerType === 'mouse' ? 'mouse' : 'touch', true)
    }
    window.addEventListener('wheel', onWheelSmoke, { passive: true })
    window.addEventListener('pointermove', onSmokePointerMove, { passive: true })
    window.addEventListener('pointerdown', onSmokePointerDown, { passive: true })

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
    return () => { clearSmoke(); document.removeEventListener('visibilitychange', onSmokeVisibility); smokeMotion.removeEventListener('change', onSmokeMotion); window.removeEventListener('wheel', onWheelSmoke); window.removeEventListener('pointermove', onSmokePointerMove); window.removeEventListener('pointerdown', onSmokePointerDown); smokeLayer.remove(); root.removeEventListener('pointermove',onCursorMove); cursorLabel.remove(); artworkObserver.disconnect(); buttonCleanup.forEach(fn=>fn()); root.removeEventListener('click',onArtworkClick); root.removeEventListener('pointermove',onPointer); cancelAnimationFrame(spotFrame); spotlight.remove(); observer?.disconnect(); cleanups.forEach(cleanup => cleanup());  }
  }, [])
  return null
}
