'use client'

import { useEffect, useRef, useState } from 'react'

const sections = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'resources', label: 'Resources' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

export default function SwipeSectionNav() {
  const [active, setActive] = useState('')
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({})

  useEffect(() => {
    const update = () => {
      const threshold = 190
      let current = ''
      for (const section of sections) {
        const node = document.getElementById(section.id)
        if (node && node.getBoundingClientRect().top <= threshold) current = section.id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    refs.current[active]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [active])

  return (
    <div className="min-w-0 w-full border-t border-white/10 md:w-auto md:border-t-0">
      <div aria-label="Website sections — swipe sideways to explore" className="flex w-full snap-x snap-mandatory items-center gap-2 overflow-x-auto overscroll-x-contain px-1 py-3 text-[11px] font-semibold uppercase tracking-wider [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-1 md:overflow-visible md:py-0 md:text-xs">
        {sections.map(section => (
          <a key={section.id} ref={node => { refs.current[section.id] = node }} href={`#${section.id}`}
            aria-current={active === section.id ? 'location' : undefined}
            onClick={() => setActive(section.id)}
            className={`shrink-0 snap-center whitespace-nowrap rounded-full px-4 py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300 md:px-3 ${active === section.id ? 'bg-fuchsia-300 text-[#130c1a]' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
            {section.label}
          </a>
        ))}
      </div>
    </div>
  )
}
