/**
 * Admin content CRUD - PATCH and DELETE for all zones.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireEditor }              from '@/lib/auth/requireEditor'

const ZONE_TABLE: Record<string, string> = {
  design:   'design_projects',
  android:  'android_apps',
  software: 'software_products',
  systems:  'systems',
}

export async function PATCH(
  request:  NextRequest,
  { params }: { params: Promise<{ zone: string; id: string }> }
) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { zone, id } = await params
  const table = ZONE_TABLE[zone]
  if (!table) return NextResponse.json({ error: 'Invalid zone' }, { status: 400 })
  try {
    const body = await request.json()
    const safeFields = ['status','is_featured','sort_order','title','name','short_description','full_description','cover_image_url','video_url','price','currency','is_free','whatsapp_number','email_contact','category_id','external_url','apk_url','play_store_url','demo_url','download_url','version','features','tech_stack','service_model','project_status','contact_for_quote','gallery_urls','screenshot_urls','diagram_urls','supported_os','requirements','client_name','year','icon_url','min_android_version','target_android_version','file_size_mb','permissions','installation_info','demo_request_enabled']
    const update: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (safeFields.includes(key)) update[key] = value
    }
    if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
    const { error } = await supabase.from(table as 'design_projects').update(update).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ zone: string; id: string }> }
) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { zone, id } = await params
  const table = ZONE_TABLE[zone]
  if (!table) return NextResponse.json({ error: 'Invalid zone' }, { status: 400 })
  const { error } = await supabase.from(table as 'design_projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
