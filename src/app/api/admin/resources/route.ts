import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireEditor } from '@/lib/auth/requireEditor'
import { CatalogSchema, RESOURCE_KEY } from '@/lib/resources/catalog'

export async function PUT(request: NextRequest) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Only the site owner can manage resources' }, { status: 403 })
  try {
    const body = await request.json()
    const parsed = CatalogSchema.safeParse(body.items)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 400 })
    const value = JSON.stringify(parsed.data)
    const { data, error } = await supabase.from('site_settings').upsert({ key: RESOURCE_KEY, value, updated_by: user.id, description: 'Digital resources catalog — manage through Admin > Digital Resources' }, { onConflict: 'key' }).select('value').single()
    if (error || data?.value !== value) return NextResponse.json({ error: 'Could not save resources. Please retry.' }, { status: 500 })
    revalidatePath('/')
    revalidatePath('/admin/resources')
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
}
