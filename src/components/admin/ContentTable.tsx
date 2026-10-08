'use client'

/**
 * ContentTable — reusable admin content list with publish/unpublish/delete.
 *
 * Used by all four zone admin pages (Design, Android, Software, Systems).
 * Actions call the corresponding API route via fetch.
 */

import { useState, useTransition, useCallback } from 'react'
import Link                                     from 'next/link'
import { useRouter }                            from 'next/navigation'
import { Eye, EyeOff, Edit2, Trash2, Star, Plus } from 'lucide-react'
import { cn }                                   from '@/lib/utils/cn'

export interface ContentRow {
  id:         string
  name:       string       // title for design, name for others
  slug:       string
  status:     string
  isFeatured: boolean
  sortOrder:  number
  category:   string | null
  createdAt:  string
}

interface ContentTableProps {
  rows:       ContentRow[]
  zone:       string        // 'design' | 'android' | 'software' | 'systems'
  label:      string        // "Design Projects"
  newHref:    string
  accentColor:string
}

export default function ContentTable({
  rows: initialRows,
  zone,
  label,
  newHref,
  accentColor,
}: ContentTableProps) {
  const router          = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  const togglePublish = useCallback(async (id: string, current: string) => {
    setBusyId(id)
    const newStatus = current === 'published' ? 'draft' : 'published'
    await fetch(`/api/admin/content/${zone}/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: newStatus }),
    })
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r))
    setBusyId(null)
    startTransition(() => router.refresh())
  }, [zone, router])

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setBusyId(id)
    await fetch(`/api/admin/content/${zone}/${id}`, { method: 'DELETE' })
    setRows((prev) => prev.filter((r) => r.id !== id))
    setBusyId(null)
    startTransition(() => router.refresh())
  }, [zone, router])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--color-energy-white)' }}>
            {label}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,255,0.4)' }}>
            {rows.length} item{rows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href={newHref}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)`, color: '#fff' }}
        >
          <Plus size={14} aria-hidden="true" /> New
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: 'rgba(248,250,255,0.35)' }}>
          No {label.toLowerCase()} yet.{' '}
          <Link href={newHref} style={{ color: accentColor }}>Create the first one.</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Category', 'Status', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase"
                    style={{ color: 'rgba(248,250,255,0.4)', textAlign: i === 3 ? 'right' : 'left' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isPublished = row.status === 'published'
                const busy        = busyId === row.id
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.isFeatured && (
                          <Star size={11} style={{ color: '#ffb800' }} aria-label="Featured" />
                        )}
                        <span className="font-medium truncate max-w-[220px]" style={{ color: 'var(--color-energy-white)' }}>
                          {row.name}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(248,250,255,0.3)' }}>
                        {row.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'rgba(248,250,255,0.4)' }}>
                        {row.category ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded"
                        style={{
                          background: isPublished ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.05)',
                          border:     `1px solid ${isPublished ? 'rgba(0,255,135,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          color:      isPublished ? '#00ff87' : 'rgba(248,250,255,0.4)',
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => togglePublish(row.id, row.status)}
                          disabled={busy}
                          className={cn('p-1.5 rounded transition-colors cursor-pointer disabled:opacity-40')}
                          style={{ color: 'rgba(248,250,255,0.4)' }}
                          title={isPublished ? 'Unpublish' : 'Publish'}
                          aria-label={isPublished ? `Unpublish ${row.name}` : `Publish ${row.name}`}
                        >
                          {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link
                          href={`/admin/${zone}/${row.id}/edit`}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: 'rgba(248,250,255,0.4)' }}
                          aria-label={`Edit ${row.name}`}
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id, row.name)}
                          disabled={busy}
                          className="p-1.5 rounded transition-colors cursor-pointer disabled:opacity-40 hover:text-red-400"
                          style={{ color: 'rgba(248,250,255,0.4)' }}
                          aria-label={`Delete ${row.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
