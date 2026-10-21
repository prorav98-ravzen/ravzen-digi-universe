'use client'

/**
 * MediaManager — Admin media library grid with upload capability.
 *
 * Upload: POST /api/admin/upload with FormData (file + entity_type)
 * Delete: DELETE /api/admin/media/[id]
 * Display: grid of thumbnails with alt text and filename.
 */

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MediaItem {
  id:         string
  public_url: string
  filename:   string
  mime_type:  string
  alt_text:   string | null
  created_at: string
}

interface MediaManagerProps {
  items: MediaItem[]
  projects: { id: string; title: string }[]
}

export default function MediaManager({ items: initialItems, projects }: MediaManagerProps) {
  const [items, setItems]     = useState(initialItems)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [projectId, setProjectId] = useState('')
  const [attachStatus, setAttachStatus] = useState('')
  const [attachBusy, setAttachBusy] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [setCover, setSetCover] = useState(false)

  const attachImages = useCallback(async (mediaIds: string[]) => {
    if (!projectId || mediaIds.length === 0) return
    setAttachBusy(true)
    setAttachStatus('')
    try {
      const response = await fetch('/api/admin/media/attach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, mediaIds, setCover }),
      })
      const result = await response.json() as { error?: string; galleryCount?: number }
      if (!response.ok) throw new Error(result.error ?? 'Could not attach images')
      setAttachStatus(`Linked successfully — ${result.galleryCount} gallery images in project.`)
      setSelectedIds([])
    } catch (error) {
      setAttachStatus(`Link failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally { setAttachBusy(false) }
  }, [projectId, setCover])

  const handleUpload = useCallback(async (files: FileList) => {
    setUploading(true)
    setUploadError('')
    const uploaded: MediaItem[] = []
    const failures: string[] = []
    const selected = Array.from(files)
    try {
      for (const [index, file] of selected.entries()) {
        setUploadProgress(`Uploading ${index + 1} of ${selected.length}: ${file.name}`)
        if (file.size > 4 * 1024 * 1024) {
          failures.push(`${file.name}: exceeds 4 MB limit`)
          continue
        }
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('entity_type', 'design')
          const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
          const json = await res.json() as { id?: string; publicUrl?: string; filename?: string; mimeType?: string; createdAt?: string; error?: string }
          if (!res.ok || !json.id || !json.publicUrl) {
            failures.push(`${file.name}: ${json.error ?? `HTTP ${res.status}`}`)
            continue
          }
          uploaded.push({
            id: json.id,
            public_url: json.publicUrl,
            filename: json.filename ?? file.name,
            mime_type: json.mimeType ?? file.type,
            alt_text: null,
            created_at: json.createdAt ?? new Date().toISOString(),
          })
        } catch {
          failures.push(`${file.name}: network error`)
        }
      }
      setItems(prev => [...uploaded, ...prev])
      if (projectId && uploaded.length) await attachImages(uploaded.map(item => item.id))
      if (failures.length) setUploadError(failures.join(' | '))
    } finally {
      setUploading(false)
      setUploadProgress('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [projectId, attachImages])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this media file?')) return
    setDeletingId(id)
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((m) => m.id !== id))
    setDeletingId(null)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl" style={{ color: 'var(--color-energy-white)' }}>Media</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(248,250,255,0.4)' }}>{items.length} files</p>
        </div>
        <label
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono cursor-pointer',
            'transition-opacity duration-200',
            uploading && 'opacity-50 pointer-events-none'
          )}
          style={{ background: 'linear-gradient(135deg, #4d7fff, #7c5cfc)', color: '#fff' }}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Upload size={14} aria-hidden="true" />}
          {uploading ? 'Uploading…' : 'Upload'}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files) }}
          />
        </label>
      </div>

      <div className="rounded-xl border border-white/10 p-4 space-y-3">
        <label className="block text-sm text-white/80" htmlFor="media-project">Attach images to project</label>
        <select id="media-project" value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full rounded-lg bg-zinc-900 border border-white/20 p-3 text-white">
          <option value="">Media Library only (do not attach)</option>
          {projects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}
        </select>
        <label className="flex gap-2 text-sm text-white/70 items-center"><input type="checkbox" checked={setCover} onChange={e => setSetCover(e.target.checked)} />Use first selected/uploaded image as project cover</label>
        <p className="text-xs text-white/50">Choose a project before uploading to link new photos automatically. Or select existing thumbnails below and click Attach selected.</p>
        <button type="button" disabled={!projectId || !selectedIds.length || attachBusy} onClick={() => attachImages(selectedIds)} className="px-4 py-2 rounded-lg bg-violet-600 text-white disabled:opacity-40">Attach selected ({selectedIds.length})</button>
        {attachStatus && <p role="status" className="text-sm text-cyan-300">{attachStatus}</p>}
      </div>
      {uploadProgress && <p role="status" className="text-sm text-cyan-300">{uploadProgress}</p>}
      {uploadError && <p role="alert" className="text-sm text-red-400 break-words">Upload issues: {uploadError}</p>}
      {items.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: 'rgba(248,250,255,0.35)' }}>
          No media uploaded yet. Click Upload to add images or videos.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl overflow-hidden"
              style={{
                aspectRatio: '1',
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {item.mime_type.startsWith('image/') ? (
                <Image
                  src={item.public_url}
                  alt={item.alt_text ?? item.filename}
                  fill
                  sizes="120px"
                  className="object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(248,250,255,0.4)' }}>VIDEO</span>
                </div>
              )}
              <label className="absolute top-2 left-2 z-10 bg-black/75 rounded-md p-1 text-white text-xs flex items-center gap-1">
                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id))} />
                Select
              </label>
              {/* Hover actions */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/50">
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-2 rounded-lg cursor-pointer disabled:opacity-30"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
                  aria-label={`Delete ${item.filename}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
