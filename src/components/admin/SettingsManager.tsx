'use client'

/**
 * SettingsManager — Edit site settings (key/value pairs).
 * Saves via PATCH /api/admin/settings/[key]
 */

import { useState, useCallback } from 'react'
import { Save }                   from 'lucide-react'

interface Setting {
  id:          string
  key:         string
  value:       string
  description: string | null
}

interface Props {
  settings: Setting[]
}

export default function SettingsManager({ settings: initial }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((s) => [s.key, s.value]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    const updates = Object.entries(values).filter(
      ([key, val]) => val !== initial.find((s) => s.key === key)?.value
    )
    for (const [key, value] of updates) {
      await fetch(`/api/admin/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [values, initial])

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display font-bold text-xl" style={{ color: 'var(--color-energy-white)' }}>Site Settings</h1>

      <div className="space-y-4">
        {initial.map((s) => (
          <div key={s.key} className="space-y-1.5">
            <label className="block text-xs font-mono tracking-wider uppercase" style={{ color: 'rgba(248,250,255,0.5)' }}>
              {s.key.replace(/_/g, ' ')}
              {s.key === 'activity_multiplier' && (
                <span className="ml-2" style={{ color: 'rgba(255,184,0,0.7)' }}>
                  ⚠ Presentation multiplier — does not create fake records
                </span>
              )}
            </label>
            {s.description && (
              <p className="text-[10px]" style={{ color: 'rgba(248,250,255,0.3)' }}>{s.description}</p>
            )}
            <input
              type="text"
              value={values[s.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8faff', outline: 'none' }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-mono font-semibold cursor-pointer disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #4d7fff, #7c5cfc)', color: '#fff' }}
      >
        <Save size={14} aria-hidden="true" />
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
