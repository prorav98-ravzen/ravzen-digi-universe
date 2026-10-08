/**
 * Admin ads toggle - PATCH /api/admin/ads/[id]
 * Auth: requires ADMIN+
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireEditor } from '@/lib/auth/requireEditor'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role === 'EDITOR') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

  const { id } = await params
  try {
    const body = await request.json()
    const { error } = await supabase.from('advertisements').update(body).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}
