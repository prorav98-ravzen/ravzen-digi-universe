'use client'

/**
 * AdsManager — Full advertisement management panel.
 *
 * Features:
 *   - 10 ad slots displayed, grouped by zone
 *   - Toggle active / inactive per ad
 *   - Create new ad for any slot (inline form)
 *   - Priority, scheduling (start/end date), animation type
 *   - Image URL, body text, CTA text, CTA URL
 *   - Live preview of the ad before saving
 *   - Delete ad
 *   - Zod-validated before POST /api/admin/ads
 */

import {
  useState, useCallback, useRef, type FormEvent,
} from 'react'
import Image from 'next/image'
import {
  Megaphone, ToggleLeft, ToggleRight,
  Plus, Eye, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdSlot {
  id:       string
  zone:     string
  position: string
  label:    string
  is_active:boolean
}

interface Ad {
  id:             string
  slot_id:        string
  title:          string
  body_text:      string | null
  media_url:      string | null
  media_type:     string
  cta_text:       string | null
  cta_url:        string | null
  animation_type: string
  priority:       number
  is_active:      boolean
  starts_at:      string | null
  ends_at:        string | null
  slot: { zone: string; position: string; label: string } | null
}

interface Props {
  slots: AdSlot[]
  ads:   Ad[]
}

// ── Empty form state ──────────────────────────────────────────────────────────

function emptyForm() {
  return {
    title:          '',
    body_text:      '',
    media_url:      '',
    media_type:     'text' as 'image' | 'video' | 'text',
    cta_text:       '',
    cta_url:        '',
    animation_type: 'fade' as 'fade' | 'slide' | 'none',
    priority:       0,
    is_active:      true,
    starts_at:      '',
    ends_at:        '',
  }
}

// ── Zone accent colours ───────────────────────────────────────────────────────

const ZONE_ACCENT: Record<string, string> = {
  universe: '#4d7fff',
  design:   '#b44dff',
  android:  '#00ff87',
  software: '#4d7fff',
  system:   '#ffb800',
}

// ── Ad preview ────────────────────────────────────────────────────────────────

function AdPreview({ form, zone }: { form: ReturnType<typeof emptyForm>; zone: string }) {
  const accent = ZONE_ACCENT[zone] ?? '#4d7fff'
  if (!form.title) return (
    <p className="text-xs text-center py-6" style={{ color: 'rgba(248,250,255,0.25)' }}>
      Fill in the Title field to see a preview.
    </p>
  )
  return (
    <div className="rounded-xl overflow-hidden p-3" style={{ background: `${accent}06`, border: `1px solid ${accent}20` }}>
      <p className="font-mono text-[9px] uppercase mb-2" style={{ color: `${accent}55` }}>Sponsored</p>
      <div className="flex items-center gap-3">
        {form.media_url && form.media_type === 'image' && (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
            <Image src={form.media_url} alt="" fill sizes="48px" className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--color-energy-white)' }}>{form.title}</p>
          {form.body_text && (
            <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,255,0.5)' }}>{form.body_text}</p>
          )}
        </div>
        {form.cta_text && (
          <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent }}>
            {form.cta_text}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Create form ───────────────────────────────────────────────────────────────

function CreateAdForm({
  slotId, zone, onCreated, onCancel,
}: {
  slotId:    string
  zone:      string
  onCreated: (ad: Ad) => void
  onCancel:  () => void
}) {
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const firstRef              = useRef<HTMLInputElement>(null)

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError(null)

    const payload = {
      slot_id:        slotId,
      title:          form.title,
      body_text:      form.body_text || null,
      media_url:      form.media_url || null,
      media_type:     form.media_type,
      cta_text:       form.cta_text || null,
      cta_url:        form.cta_url || null,
      animation_type: form.animation_type,
      priority:       Number(form.priority),
      is_active:      form.is_active,
      starts_at:      form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at:        form.ends_at   ? new Date(form.ends_at).toISOString()   : null,
    }

    const res  = await fetch('/api/admin/ads', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    const json = await res.json() as { id?: string; error?: string }

    if (!res.ok) { setError(json.error ?? 'Save failed'); setSaving(false); return }

    onCreated({ ...payload, id: json.id!, slot: null } as unknown as Ad)
    setSaving(false)
  }, [form, slotId, onCreated])

  const accent = ZONE_ACCENT[zone] ?? '#4d7fff'
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border:     '1px solid rgba(255,255,255,0.1)',
    color:      '#f8faff',
    outline:    'none',
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3" aria-label="Create new advertisement">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            Title <span className="text-red-400">*</span>
          </label>
          <input
            ref={firstRef}
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ad headline"
            maxLength={200}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
            required
            autoFocus
          />
        </div>

        {/* Body text */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            Body text
          </label>
          <input
            type="text"
            value={form.body_text}
            onChange={(e) => set('body_text', e.target.value)}
            placeholder="Short description (optional)"
            maxLength={500}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
          />
        </div>

        {/* Media type */}
        <div>
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            Media type
          </label>
          <select
            value={form.media_type}
            onChange={(e) => set('media_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ ...inputStyle, WebkitAppearance: 'none' }}
          >
            <option value="text" style={{ background: '#060918' }}>Text only</option>
            <option value="image" style={{ background: '#060918' }}>Image</option>
            <option value="video" style={{ background: '#060918' }}>Video</option>
          </select>
        </div>

        {/* Media URL */}
        {(form.media_type === 'image' || form.media_type === 'video') && (
          <div>
            <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
              Media URL
            </label>
            <input
              type="url"
              value={form.media_url}
              onChange={(e) => set('media_url', e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={inputStyle}
            />
          </div>
        )}

        {/* CTA text */}
        <div>
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            CTA text
          </label>
          <input
            type="text"
            value={form.cta_text}
            onChange={(e) => set('cta_text', e.target.value)}
            placeholder="Learn more"
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
          />
        </div>

        {/* CTA URL */}
        <div>
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            CTA URL
          </label>
          <input
            type="url"
            value={form.cta_url}
            onChange={(e) => set('cta_url', e.target.value)}
            placeholder="https://…"
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
          />
        </div>

        {/* Animation */}
        <div>
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            Animation
          </label>
          <select
            value={form.animation_type}
            onChange={(e) => set('animation_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ ...inputStyle, WebkitAppearance: 'none' }}
          >
            <option value="fade"  style={{ background: '#060918' }}>Fade</option>
            <option value="slide" style={{ background: '#060918' }}>Slide</option>
            <option value="none"  style={{ background: '#060918' }}>None</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            Priority (0–100)
          </label>
          <input
            type="number"
            min={0} max={100}
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
          />
        </div>

        {/* Schedule start */}
        <div>
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            Start date (optional)
          </label>
          <input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => set('starts_at', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>

        {/* Schedule end */}
        <div>
          <label className="block text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'rgba(248,250,255,0.45)' }}>
            End date (optional)
          </label>
          <input
            type="datetime-local"
            value={form.ends_at}
            onChange={(e) => set('ends_at', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => set('is_active', e.target.checked)}
          className="accent-[#00ff87]"
        />
        <span className="text-xs font-mono" style={{ color: 'rgba(248,250,255,0.6)' }}>
          Active immediately
        </span>
      </label>

      {/* Preview toggle */}
      <button
        type="button"
        onClick={() => setPreview((p) => !p)}
        className="flex items-center gap-1.5 text-xs font-mono cursor-pointer"
        style={{ color: accent }}
      >
        <Eye size={12} aria-hidden="true" />
        {preview ? 'Hide preview' : 'Show preview'}
      </button>

      {preview && (
        <div>
          <p className="text-[10px] font-mono uppercase mb-2" style={{ color: 'rgba(248,250,255,0.35)' }}>Preview</p>
          <AdPreview form={form} zone={zone} />
        </div>
      )}

      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono cursor-pointer disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, color: '#fff' }}
        >
          {saving ? 'Saving…' : 'Create Ad'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-mono cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(248,250,255,0.5)' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdsManager({ slots, ads: initialAds }: Props) {
  const [ads, setAds]               = useState(initialAds)
  const [busyId, setBusyId]         = useState<string | null>(null)
  const [creatingSlotId, setCreating] = useState<string | null>(null)
  const [expanded, setExpanded]     = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const toggleAd = useCallback(async (id: string, isActive: boolean) => {
    setBusyId(id)
    await fetch(`/api/admin/ads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    setAds((prev) => prev.map((a) => a.id === id ? { ...a, is_active: !isActive } : a))
    setBusyId(null)
  }, [])

  const deleteAd = useCallback(async (id: string) => {
    if (!confirm('Delete this advertisement?')) return
    setBusyId(id)
    await fetch(`/api/admin/ads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: false }) })
    setAds((prev) => prev.filter((a) => a.id !== id))
    setBusyId(null)
  }, [])

  const handleCreated = useCallback((ad: Ad) => {
    setAds((prev) => [...prev, ad])
    setCreating(null)
  }, [])

  // Group ads by slot
  const bySlot = slots.map((slot) => ({
    slot,
    ads: ads.filter((a) => a.slot_id === slot.id),
  }))

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-xl" style={{ color: 'var(--color-energy-white)' }}>
          Advertisements
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,255,0.4)' }}>
          10 slots — 2 Universe + 2 per zone. Ads never block critical navigation.
        </p>
      </div>

      {bySlot.map(({ slot, ads: slotAds }) => {
        const isOpen   = expanded.has(slot.id)
        const accent   = ZONE_ACCENT[slot.zone] ?? '#4d7fff'
        const creating = creatingSlotId === slot.id

        return (
          <div
            key={slot.id}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Slot header */}
            <div
              className="px-5 py-3 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Megaphone size={14} style={{ color: 'rgba(248,250,255,0.4)' }} aria-hidden="true" />
              <span className="font-mono text-sm font-semibold flex-1" style={{ color: 'var(--color-energy-white)' }}>
                {slot.label}
              </span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
              >
                {slot.zone} / {slot.position}
              </span>
              <span
                className="text-[10px] font-mono"
                style={{ color: 'rgba(248,250,255,0.3)' }}
              >
                {slotAds.length} ad{slotAds.length !== 1 ? 's' : ''}
              </span>

              {/* Expand / Add */}
              <button
                type="button"
                onClick={() => toggleExpanded(slot.id)}
                className="p-1 rounded cursor-pointer"
                style={{ color: 'rgba(248,250,255,0.45)' }}
                aria-label={isOpen ? 'Collapse' : 'Expand'}
              >
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Expanded: ads list + create form */}
            {isOpen && (
              <div>
                {/* Ads */}
                {slotAds.length === 0 && !creating && (
                  <p className="px-5 py-3 text-xs" style={{ color: 'rgba(248,250,255,0.3)' }}>
                    No advertisements for this slot.
                  </p>
                )}

                {slotAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center gap-3 px-5 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-energy-white)' }}>
                        {ad.title}
                      </p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(248,250,255,0.35)' }}>
                        Priority {ad.priority} · {ad.media_type} · {ad.animation_type}
                        {ad.starts_at && ` · from ${new Date(ad.starts_at).toLocaleDateString()}`}
                        {ad.ends_at   && ` · until ${new Date(ad.ends_at).toLocaleDateString()}`}
                      </p>
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleAd(ad.id, ad.is_active)}
                      disabled={busyId === ad.id}
                      className="cursor-pointer disabled:opacity-30"
                      aria-label={ad.is_active ? `Deactivate ${ad.title}` : `Activate ${ad.title}`}
                      aria-pressed={ad.is_active}
                    >
                      {ad.is_active
                        ? <ToggleRight size={22} style={{ color: '#00ff87' }} />
                        : <ToggleLeft  size={22} style={{ color: 'rgba(248,250,255,0.3)' }} />}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => deleteAd(ad.id)}
                      disabled={busyId === ad.id}
                      className={cn('p-1 rounded cursor-pointer disabled:opacity-30 hover:text-red-400 transition-colors')}
                      style={{ color: 'rgba(248,250,255,0.3)' }}
                      aria-label={`Delete ${ad.title}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {/* Create form */}
                {creating ? (
                  <CreateAdForm
                    slotId={slot.id}
                    zone={slot.zone}
                    onCreated={handleCreated}
                    onCancel={() => setCreating(null)}
                  />
                ) : (
                  <div className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setCreating(slot.id)}
                      className="flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                      style={{ color: accent }}
                    >
                      <Plus size={12} aria-hidden="true" /> Add advertisement
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
