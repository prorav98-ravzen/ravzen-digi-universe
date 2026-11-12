'use client'

import { useEffect, useRef, useState } from 'react'

export default function AnimatedStudioStat({ value }: { value: string }) {
  const match = value.trim().match(/^([0-9,]+)(.*)$/)
  const target = match ? Number(match[1].replace(/,/g, '')) : NaN
  const suffix = match ? match[2] : ''
  const valid = Number.isFinite(target) && target >= 0
  const [display, setDisplay] = useState(0)
  const element = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!valid) return
    const node = element.current
    if (!node) return
    let frame = 0
    let started = false
    const start = () => {
      if (started) return
      started = true
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplay(target)
        return
      }
      const begin = performance.now()
      const duration = 950
      const tick = (now: number) => {
        const progress = Math.min(1, (now - begin) / duration)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.round(target * eased))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }
    if (!('IntersectionObserver' in window)) start()
    else {
      const observer = new IntersectionObserver(entries => {
        if (entries[0]?.isIntersecting) {
          start()
          observer.disconnect()
        }
      }, { threshold: 0.1 })
      observer.observe(node)
      return () => { observer.disconnect(); cancelAnimationFrame(frame) }
    }
    return () => cancelAnimationFrame(frame)
  }, [target, valid])

  return <span ref={element} aria-label={value} className="tabular-nums">{valid ? display.toLocaleString('en-LK') + suffix : value}</span>
}
