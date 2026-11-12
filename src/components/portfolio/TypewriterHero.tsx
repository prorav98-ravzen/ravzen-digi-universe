'use client'

import { useEffect, useRef, useState } from 'react'

const words = ['Imagine.', 'Create.', 'Evolve.'] as const
const full = words.join(' ')

export default function TypewriterHero() {
  const [count, setCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const wrapper = useRef<HTMLSpanElement>(null)
  const orb = useRef<HTMLSpanElement>(null)
  const targets = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(full.length)
      setFinished(true)
      return
    }
    let position = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      position += 1
      setCount(position)
      if (position < full.length) {
        timer = setTimeout(tick, full[position - 1] === '.' ? 320 : 75)
      } else setFinished(true)
    }
    timer = setTimeout(tick, 250)
    return () => clearTimeout(timer)
  }, [])


  useEffect(() => {
    if (!finished || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = wrapper.current, ball = orb.current
    if (!root || !ball) return
    let positions: {x:number,y:number}[] = []
    const measure = () => {
      const base = root.getBoundingClientRect()
      positions = targets.current.map(el => {
        const rect = el?.getBoundingClientRect()
        return rect ? {x:rect.left-base.left+rect.width/2,y:rect.top-base.top-12} : {x:0,y:0}
      })
    }
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(root)
    targets.current.forEach(el => {if (el) resize.observe(el)})
    document.fonts.ready.then(measure).catch(() => {})
    let frame = 0, start = 0
    const path = [0,1,2,1,0], duration = 1150
    const tick = (now:number) => {
      if (!start) start = now
      const phase = ((now-start) % (duration*4))/duration
      const leg = Math.floor(phase), t = phase-leg
      const a = positions[path[leg]], b = positions[path[leg+1]]
      if (a && b) {
        const ease = t*t*(3-2*t)
        const x = a.x+(b.x-a.x)*ease
        const y = a.y+(b.y-a.y)*ease-25*Math.sin(Math.PI*t)
        ball.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`
        ball.style.opacity = '1'
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {cancelAnimationFrame(frame);resize.disconnect()}
  }, [finished])

  let offset = 0
  return <span ref={wrapper} aria-label={full} className="relative inline">
    {words.map((word, index) => {
      const start = offset
      offset += word.length + 1
      const typed = word.slice(0, Math.max(0, Math.min(word.length, count - start)))
      return <span key={word} ref={el => {targets.current[index] = el}} aria-hidden="true" className={`relative inline-block whitespace-nowrap ${index === 1 ? 'italic text-[#E9A46B]' : ''}`}>
        <span className="invisible">{word}</span>
        <span className="absolute inset-0 whitespace-nowrap">{typed}{!finished && count >= start && count <= start + word.length && <span className="ml-[1px] inline-block h-[.8em] w-[2px] animate-pulse bg-current align-[-.05em]" />}</span>
      </span>
    }).reduce<React.ReactNode[]>((parts, word, index) => index === 0 ? [word] : [...parts, ' ', word], [])}
    {finished && <span ref={orb} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 h-3 w-3 rounded-full border border-[#FFD4A2]/70 bg-[#F59A49] opacity-0 shadow-[0_0_9px_3px_rgba(245,154,73,0.5),0_0_22px_7px_rgba(245,154,73,0.2)] motion-reduce:hidden" />}
  </span>
}
