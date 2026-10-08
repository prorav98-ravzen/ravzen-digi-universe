/**
 * Admin settings update - PATCH /api/admin/settings/[key]
 * Auth: requires ADMIN+
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireEditor } from '@/lib/auth/requireEditor'
import { SiteSettingsUpdateSchema } from '@/lib/validation/schemas'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role === 'EDITOR') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

  const { key } = await params
  try {
    const body = await request.json()
    const parsed = SiteSettingsUpdateSchema.safeParse({ ...body, key })
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { error } = await supabase.from('site_settings').update({ value: parsed.data.value, updated_by: user.id }).eq('key', parsed.data.key)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}
