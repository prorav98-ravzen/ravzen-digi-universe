import { createClient }   from '@/lib/supabase/server'
import ContentTable, { type ContentRow } from '@/components/admin/ContentTable'

export const metadata = { title: 'Software â€” RAVZEN Admin' }

export default async function AdminSoftwarePage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('software_products')
    .select('id, name, slug, status, is_featured, sort_order, created_at, category:categories(name)')
    .order('sort_order').order('created_at', { ascending: false })

  if (error) return <p className="text-sm text-red-400">Failed to load: {error.message}</p>

  const rows: ContentRow[] = (data ?? []).map((r) => ({
    id: r.id, name: r.name, slug: r.slug, status: r.status,
    isFeatured: r.is_featured, sortOrder: r.sort_order,
    category: (r.category as unknown as { name: string } | null)?.name ?? null,
    createdAt: r.created_at,
  }))

  return <ContentTable rows={rows} zone="software" label="Software Products" newHref="/admin/software/new" accentColor="#4d7fff" />
}
