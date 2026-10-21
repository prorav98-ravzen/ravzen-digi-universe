import { NextRequest, NextResponse } from 'next/server'
import { requireEditor } from '@/lib/auth/requireEditor'

export async function POST(request: NextRequest) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json() as { projectId?: string; mediaIds?: string[]; setCover?: boolean }
    const ids = [...new Set(body.mediaIds ?? [])]
    if (!body.projectId || ids.length === 0 || ids.length > 50 || ids.some(id => !/^[0-9a-f-]{36}$/i.test(id))) {
      return NextResponse.json({ error: 'Choose a project and 1–50 valid images.' }, { status: 400 })
    }
    const { data: project, error: projectError } = await supabase.from('design_projects')
      .select('id,gallery_urls,cover_image_url').eq('id', body.projectId).single()
    if (projectError || !project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    const { data: media, error: mediaError } = await supabase.from('media')
      .select('id,public_url,mime_type').in('id', ids)
    if (mediaError || !media || media.length !== ids.length || media.some(m => !m.mime_type.startsWith('image/'))) {
      return NextResponse.json({ error: 'Some selected images are unavailable.' }, { status: 400 })
    }
    const urls = ids.map(id => media.find(m => m.id === id)!.public_url)
    const gallery = [...new Set([...(project.gallery_urls ?? []), ...urls])]
    const cover = body.setCover ? urls[0] : (project.cover_image_url || urls[0])
    const { error } = await supabase.from('design_projects').update({
      gallery_urls: gallery, cover_image_url: cover,
    }).eq('id', body.projectId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, galleryCount: gallery.length, coverUrl: cover })
  } catch {
    return NextResponse.json({ error: 'Could not attach images.' }, { status: 400 })
  }
}
