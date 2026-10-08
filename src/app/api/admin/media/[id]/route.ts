/**
 * Admin media delete - DELETE /api/admin/media/[id]
 * Auth: requires ADMIN+
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireEditor } from '@/lib/auth/requireEditor'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role === 'EDITOR') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

  const { id } = await params
  const { data: media, error: fetchError } = await supabase.from('media').select('path, bucket').eq('id', id).single()
  if (fetchError || !media) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (media.path) {
    await supabase.storage.from(media.bucket).remove([media.path])
  }
  const { error } = await supabase.from('media').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
