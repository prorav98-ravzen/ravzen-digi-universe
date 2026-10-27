'use client'
import { useState } from 'react'
import { categories, CatalogSchema, type Resource } from '@/lib/resources/catalog'

const inputClass = 'mt-2 w-full rounded-lg border border-white/20 bg-[#161620] px-3 py-2.5 text-sm text-white focus:border-fuchsia-300'
export default function ResourcesManager({ initial }: { initial: Resource[] }) {
  const [items, setItems] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  function update(id: string, patch: Partial<Resource>) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item)); setDirty(true); setMessage('')
  }
  async function save() {
    setError(''); setMessage('')
    const parsed = CatalogSchema.safeParse(items)
    if (!parsed.success) { setError(parsed.error.issues.map(i => `Product ${Number(i.path[0]) + 1}: ${i.message}`).join(' · ')); return }
    setSaving(true)
    try {
      const response = await fetch('/api/admin/resources', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: parsed.data }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Save failed')
      setItems(parsed.data); setMessage('Saved successfully. Your resources are now updated on the website.'); setDirty(false)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save. Please retry.') } finally { setSaving(false) }
  }
  return <div className="max-w-5xl space-y-6 text-white">
    <div><h1 className="text-2xl font-bold">Digital Resources</h1><p className="mt-3 text-sm leading-7 text-white/60">Add PDF courses, eBooks, templates and digital products. Free downloads open your cloud link. Paid products open WhatsApp using the number in Site Settings.</p><p className="mt-2 text-sm leading-7 text-amber-200/80">Keep paid file links private and send them to buyers after payment. Every saved item is public, including Coming soon items. Use a direct image URL from Media for cover images.</p></div>
    <fieldset disabled={saving} className="space-y-6 disabled:opacity-60">
      {items.map((item, index) => <div key={item.id} className="rounded-2xl border border-white/15 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">{index + 1}. {item.title || 'New resource'}</h2><button type="button" className="text-sm text-red-300 underline" onClick={() => { if (window.confirm('Remove this resource? Save changes to publish the removal.')) { setItems(prev => prev.filter(p => p.id !== item.id)); setDirty(true); setMessage('') } }}>Remove</button></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm">Product / course title<input className={inputClass} value={item.title} maxLength={160} onChange={e => update(item.id, {title: e.target.value})} /></label>
          <label className="text-sm">Category<select className={inputClass} value={item.category} onChange={e => update(item.id, { category: e.target.value as Resource['category'] })}>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
          <label className="text-sm md:col-span-2">Description<textarea rows={3} maxLength={1200} className={inputClass} value={item.description} onChange={e => update(item.id, {description: e.target.value})} /></label>
          <label className="text-sm">Access<select className={inputClass} value={item.access} onChange={e => update(item.id, {access: e.target.value as Resource['access'], downloadUrl: '', price: 0})}><option value="free">Free</option><option value="paid">Paid</option></select></label>
          <label className="text-sm">Availability<select className={inputClass} value={item.status} onChange={e => update(item.id, { status: e.target.value as Resource['status'] })}><option value="coming-soon">Coming soon</option><option value="available">Available now</option></select></label>
          {item.access === 'paid' && <label className="text-sm">Price (LKR)<input type="number" min="0" step="0.01" className={inputClass} value={item.price} onChange={e => update(item.id, {price: Number(e.target.value)})} /></label>}
          <label className="text-sm">Cover image URL (optional)<input type="url" className={inputClass} placeholder="https://…" value={item.coverUrl} onChange={e => update(item.id, {coverUrl: e.target.value})} /></label>
          {item.access === 'free' && <label className="text-sm md:col-span-2">Public download link (Google Drive / MEGA / MediaFire)<input type="url" className={inputClass} placeholder="https://…" value={item.downloadUrl} onChange={e => update(item.id, {downloadUrl: e.target.value})} /><span className="mt-2 block text-xs text-white/50">Enable sharing for anyone with the link. MEGA links must include the decryption key.</span></label>}
        </div>
      </div>)}
      <button type="button" disabled={items.length >= 100} className="rounded-xl border border-fuchsia-300/50 px-5 py-3 text-sm font-semibold disabled:opacity-50" onClick={() => { setItems(prev => [...prev, {id: crypto.randomUUID(), title: '', description: '', category: 'PDF Course', access: 'free', status: 'coming-soon', price: 0, coverUrl: '', downloadUrl: ''}]); setDirty(true); setMessage('') }}>+ Add resource</button>
    </fieldset>
    <div className="sticky bottom-3 rounded-xl border border-white/20 bg-[#101018] p-4">
      {error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}
      {message && <p role="status" className="mb-3 text-sm text-emerald-300">{message}</p>}
      <div className="flex flex-wrap items-center gap-4"><button type="button" disabled={saving || !dirty} onClick={save} className="rounded-xl bg-fuchsia-300 px-6 py-3 text-sm font-bold text-black disabled:opacity-40">{saving ? 'Saving…' : 'Save changes'}</button>{dirty && <span className="text-xs text-amber-200">Unsaved changes</span>}<a href="/#resources" target="_blank" rel="noopener noreferrer" className="text-sm text-fuchsia-200 underline">View public section ↗</a></div>
    </div>
  </div>
}
