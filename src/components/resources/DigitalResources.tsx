'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Download, MessageCircle } from 'lucide-react'
import { resourceAction, type Resource } from '@/lib/resources/catalog'
import ShareResource from './ShareResource'

export default function DigitalResources({ items, whatsapp }: { items: Resource[]; whatsapp: string }) {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const toggleDetails = (id: string) => setExpandedIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  const visible = items.filter(item => (filter === 'All' || (filter === 'Coming soon' ? item.status === 'coming-soon' : item.access === filter.toLowerCase())) && `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase()))
  return <section id="resources" className="mx-auto max-w-7xl scroll-mt-40 px-5 py-24 md:px-10">
    <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Learn. Create. Grow.</p>
    <h2 className="mt-4 text-4xl font-black md:text-5xl">Digital resources<span className="text-fuchsia-400">.</span></h2>
    <p className="mt-5 max-w-2xl leading-7 text-white/60">PDF පාඨමාලා, eBooks සහ නිර්මාණශීලී digital products. නොමිලේ ලබාගන්න, නැතිනම් WhatsApp හරහා මිලදී ගන්න.</p>
    <div className="my-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2" aria-label="Filter resources">{['All', 'Free', 'Paid', 'Coming soon'].map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-5 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300 ${filter === value ? 'border-fuchsia-300 bg-fuchsia-300 text-black' : 'border-white/20 text-white/70 hover:border-fuchsia-300'}`}>{value}</button>)}</div>
      <label className="w-full sm:w-72"><span className="sr-only">Search digital resources</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses & products…" className="w-full rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm text-white focus:border-fuchsia-300" /></label>
    </div>
    {visible.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map(item => {
      const action = resourceAction(item, whatsapp)
      const expanded = expandedIds.includes(item.id)
      const hasMore = item.description.length > 170
      return <article id={`resource-${item.id}`} key={item.id} className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]">
        <div className={`relative flex ${item.id === '7ef9d9f5-1cc4-4aa5-9d4d-4e7b3b8730c9' ? 'aspect-[3/2]' : 'aspect-[4/3]'} items-center justify-center overflow-hidden bg-gradient-to-br from-fuchsia-950 via-[#261b13] to-indigo-950`}>
          {item.coverUrl ? <img src={item.coverUrl} alt={item.title} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <BookOpen className="h-16 w-16 text-fuchsia-200/70" aria-hidden="true" />}
          <span className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${item.access === 'free' ? 'bg-emerald-200 text-emerald-950' : 'bg-fuchsia-200 text-fuchsia-950'}`}>{item.access === 'free' ? 'FREE' : 'PAID'}</span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-xs uppercase tracking-widest text-fuchsia-300">{item.category}</p>
          <h3 className="mt-3 break-words text-xl font-bold">{item.title}</h3>
          <div id={`resource-details-${item.id}`} className="mt-3 min-w-0">
            <p className={`whitespace-pre-line break-words text-sm leading-7 text-white/60 ${hasMore && !expanded ? "line-clamp-3" : ""}`}>{item.description}</p>
          </div>
          {hasMore && <button type="button" aria-expanded={expanded} aria-controls={`resource-details-${item.id}`} onClick={() => toggleDetails(item.id)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[.04] px-4 py-2.5 text-sm font-semibold text-fuchsia-200 transition-colors hover:border-fuchsia-300/60 hover:bg-white/[.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300">{expanded ? <>Show Less / අඩුවෙන් පෙන්වන්න <ChevronUp size={16} /></> : <>Read More / වැඩි විස්තර <ChevronDown size={16} /></>}</button>}
          <div className="mt-auto pt-6">
            <p className="mb-4 text-lg font-bold">{item.status === 'coming-soon' ? 'Coming soon · ළඟදීම' : item.access === 'free' ? 'නොමිලේ / Free' : item.id === '7ef9d9f5-1cc4-4aa5-9d4d-4e7b3b8730c9' ? <><span className="mr-3 text-sm font-normal text-white/45 line-through">LKR 1,499</span><span className="text-emerald-300">LKR 300 · විශේෂ මිල</span></> : `LKR ${item.price.toLocaleString('en-LK')}`}</p>
            {action ? <a href={action} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${item.access === 'free' ? 'bg-white text-black hover:bg-fuchsia-100' : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'}`}>
              {item.access === 'free' ? <Download size={18} className="shrink-0" /> : <MessageCircle size={18} className="shrink-0" />}
              {item.access === 'free' ? 'මෙතනින් download කරගන්න' : 'Buy Now / දැන්ම මිලදී ගන්න'}
            </a> : <p className="rounded-xl border border-white/10 p-3 text-center text-sm text-white/50">{item.status === 'coming-soon' ? 'සූදානම් වූ විට මෙහි පළ කරනු ලැබේ.' : 'Contact details will be available soon.'}</p>}
            <div className="mt-3 flex justify-end"><ShareResource id={item.id} title={item.title} /></div>
            {action && <p className="mt-3 text-xs leading-5 text-white/45">{item.access === 'free' ? 'Download page එක නව tab එකක විවෘත වේ.' : 'Chat එක විවෘත වූ පසු message එක යවන්න. ගෙවීම තහවුරු කිරීමෙන් පසු download link එක ලබාදේ.'}</p>}
          </div>
        </div>
      </article>
    })}</div> : <div className="rounded-3xl border border-dashed border-fuchsia-300/25 bg-white/[.025] p-10 text-center">
      <BookOpen className="mx-auto mb-5 h-10 w-10 text-fuchsia-300" aria-hidden="true" />
      <h3 className="text-xl font-bold">{items.length ? 'No matching resources' : 'Your next chapter starts here.'}</h3>
      <p className="mt-3 text-sm leading-7 text-white/60">{items.length ? 'Try another search or filter.' : 'පාඨමාලා සහ digital products සූදානම් වූ විට මෙහි පළ කරනු ලැබේ.'}</p>
    </div>}
  </section>
}
