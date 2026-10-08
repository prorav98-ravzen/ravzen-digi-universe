/**
 * POST /api/admin/ads — Create a new advertisement.
 * Auth: requires ADMIN+
 * Validates with AdvertisementSchema before insertion.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireEditor }              from '@/lib/auth/requireEditor'
import { AdvertisementSchema }        from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  const { user, supabase } = await requireEditor()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role === 'EDITOR') return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

  try {
    const body   = await request.json()
    const parsed = AdvertisementSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('advertisements')
      .insert(parsed.data)
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}
