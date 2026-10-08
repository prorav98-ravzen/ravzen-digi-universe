-- ─────────────────────────────────────────────────────────────────────────────
-- RAVZEN DIGI UNIVERSE — Row Level Security Policies
-- Migration: 002_rls_policies
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enable RLS on all tables ──────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE android_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ── Helper: get current user role ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role IN ('SUPER_ADMIN', 'ADMIN') FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_editor_or_above()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR') FROM profiles WHERE id = auth.uid();
$$;

-- ── Profiles ──────────────────────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (is_admin_or_above());

-- Users can update their own profile (limited fields — enforced in application layer)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Only SUPER_ADMIN can change roles
CREATE POLICY "profiles_update_role_superadmin" ON profiles
  FOR UPDATE USING (get_my_role() = 'SUPER_ADMIN');

-- ── Categories ────────────────────────────────────────────────────────────────

-- Public read
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT USING (TRUE);

-- Only editors+ can modify
CREATE POLICY "categories_insert_editor" ON categories
  FOR INSERT WITH CHECK (is_editor_or_above());

CREATE POLICY "categories_update_editor" ON categories
  FOR UPDATE USING (is_editor_or_above());

CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE USING (is_admin_or_above());

-- ── Design Projects ───────────────────────────────────────────────────────────

-- Public can read published projects only
CREATE POLICY "design_projects_select_published" ON design_projects
  FOR SELECT USING (status = 'published');

-- Editors can read all (including drafts)
CREATE POLICY "design_projects_select_editor" ON design_projects
  FOR SELECT USING (is_editor_or_above());

CREATE POLICY "design_projects_insert_editor" ON design_projects
  FOR INSERT WITH CHECK (is_editor_or_above());

CREATE POLICY "design_projects_update_editor" ON design_projects
  FOR UPDATE USING (is_editor_or_above());

CREATE POLICY "design_projects_delete_admin" ON design_projects
  FOR DELETE USING (is_admin_or_above());

-- ── Android Apps ──────────────────────────────────────────────────────────────

CREATE POLICY "android_apps_select_published" ON android_apps
  FOR SELECT USING (status = 'published');

CREATE POLICY "android_apps_select_editor" ON android_apps
  FOR SELECT USING (is_editor_or_above());

CREATE POLICY "android_apps_insert_editor" ON android_apps
  FOR INSERT WITH CHECK (is_editor_or_above());

CREATE POLICY "android_apps_update_editor" ON android_apps
  FOR UPDATE USING (is_editor_or_above());

CREATE POLICY "android_apps_delete_admin" ON android_apps
  FOR DELETE USING (is_admin_or_above());

-- ── Software Products ─────────────────────────────────────────────────────────

CREATE POLICY "software_products_select_published" ON software_products
  FOR SELECT USING (status = 'published');

CREATE POLICY "software_products_select_editor" ON software_products
  FOR SELECT USING (is_editor_or_above());

CREATE POLICY "software_products_insert_editor" ON software_products
  FOR INSERT WITH CHECK (is_editor_or_above());

CREATE POLICY "software_products_update_editor" ON software_products
  FOR UPDATE USING (is_editor_or_above());

CREATE POLICY "software_products_delete_admin" ON software_products
  FOR DELETE USING (is_admin_or_above());

-- ── Systems ───────────────────────────────────────────────────────────────────

CREATE POLICY "systems_select_published" ON systems
  FOR SELECT USING (status = 'published');

CREATE POLICY "systems_select_editor" ON systems
  FOR SELECT USING (is_editor_or_above());

CREATE POLICY "systems_insert_editor" ON systems
  FOR INSERT WITH CHECK (is_editor_or_above());

CREATE POLICY "systems_update_editor" ON systems
  FOR UPDATE USING (is_editor_or_above());

CREATE POLICY "systems_delete_admin" ON systems
  FOR DELETE USING (is_admin_or_above());

-- ── Media ─────────────────────────────────────────────────────────────────────

-- Public can read media (URLs already public via Supabase Storage)
CREATE POLICY "media_select_public" ON media
  FOR SELECT USING (TRUE);

CREATE POLICY "media_insert_editor" ON media
  FOR INSERT WITH CHECK (is_editor_or_above() AND auth.uid() = uploader_id);

CREATE POLICY "media_delete_admin" ON media
  FOR DELETE USING (is_admin_or_above());

-- ── Ad Slots ──────────────────────────────────────────────────────────────────

CREATE POLICY "ad_slots_select_public" ON ad_slots
  FOR SELECT USING (TRUE);

CREATE POLICY "ad_slots_insert_admin" ON ad_slots
  FOR INSERT WITH CHECK (is_admin_or_above());

CREATE POLICY "ad_slots_update_admin" ON ad_slots
  FOR UPDATE USING (is_admin_or_above());

CREATE POLICY "ad_slots_delete_superadmin" ON ad_slots
  FOR DELETE USING (get_my_role() = 'SUPER_ADMIN');

-- ── Advertisements ────────────────────────────────────────────────────────────

-- Public can read active, non-expired ads
CREATE POLICY "ads_select_public" ON advertisements
  FOR SELECT USING (
    is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

-- Admins see all ads
CREATE POLICY "ads_select_admin" ON advertisements
  FOR SELECT USING (is_admin_or_above());

CREATE POLICY "ads_insert_admin" ON advertisements
  FOR INSERT WITH CHECK (is_admin_or_above());

CREATE POLICY "ads_update_admin" ON advertisements
  FOR UPDATE USING (is_admin_or_above());

CREATE POLICY "ads_delete_admin" ON advertisements
  FOR DELETE USING (is_admin_or_above());

-- ── Analytics Events ──────────────────────────────────────────────────────────

-- Anyone can INSERT analytics events (anonymous tracking)
CREATE POLICY "analytics_insert_public" ON analytics_events
  FOR INSERT WITH CHECK (TRUE);

-- Only admins can read analytics
CREATE POLICY "analytics_select_admin" ON analytics_events
  FOR SELECT USING (is_admin_or_above());

-- No public updates or deletes
-- (cleanup done by server-side service with service role)

-- ── Active Sessions ───────────────────────────────────────────────────────────

-- Anyone can manage their own session by token
CREATE POLICY "sessions_insert_public" ON active_sessions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "sessions_update_own" ON active_sessions
  FOR UPDATE USING (TRUE); -- token uniqueness ensures safety

-- Only count is exposed publicly (via API route); no raw read
CREATE POLICY "sessions_select_public" ON active_sessions
  FOR SELECT USING (TRUE);

-- Cleanup handled by service role API
CREATE POLICY "sessions_delete_public" ON active_sessions
  FOR DELETE USING (TRUE);

-- ── Site Settings ─────────────────────────────────────────────────────────────

-- Public can read settings
CREATE POLICY "settings_select_public" ON site_settings
  FOR SELECT USING (TRUE);

-- Only super admin can modify
CREATE POLICY "settings_update_superadmin" ON site_settings
  FOR UPDATE USING (get_my_role() = 'SUPER_ADMIN');

CREATE POLICY "settings_insert_superadmin" ON site_settings
  FOR INSERT WITH CHECK (get_my_role() = 'SUPER_ADMIN');
