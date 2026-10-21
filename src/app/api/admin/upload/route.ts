import { NextRequest, NextResponse } from 'next/server'
import { requireEditor } from '@/lib/auth/requireEditor'

export const runtime = 'nodejs'

const MAX_SIZE = 4 * 1024 * 1024
const ALLOWED = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

export async function POST(request: NextRequest) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Please sign in as an administrator.' }, { status: 401 })

  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'No image selected.' }, { status: 400 })
    const extension = ALLOWED.get(file.type)
    if (!extension) return NextResponse.json({ error: 'Only JPG, PNG, WebP or GIF images are supported.' }, { status: 415 })
    if (!file.size || file.size > MAX_SIZE) return NextResponse.json({ error: 'Image must be smaller than 4 MB.' }, { status: 413 })

    const entityType = String(form.get('entity_type') ?? 'general').slice(0, 40)
    const filename = file.name.slice(0, 240)
    const path = `portfolio/${user.id}/${crypto.randomUUID()}.${extension}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const { error: uploadError } = await supabase.storage.from('media').upload(path, bytes, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })
    if (uploadError) return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 })

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
    const { data: record, error: recordError } = await supabase.from('media').insert({
      uploader_id: user.id,
      bucket: 'media',
      path,
      public_url: urlData.publicUrl,
      filename,
      mime_type: file.type,
      size_bytes: file.size,
      entity_type: entityType,
    }).select('id,public_url,filename,mime_type,created_at').single()

    if (recordError) {
      await supabase.storage.from('media').remove([path])
      return NextResponse.json({ error: `Media record failed: ${recordError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      id: record.id,
      publicUrl: record.public_url,
      filename: record.filename,
      mimeType: record.mime_type,
      createdAt: record.created_at,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Upload could not be processed. Please retry.' }, { status: 500 })
  }
}
