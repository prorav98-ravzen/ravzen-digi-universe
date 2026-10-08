-- ─────────────────────────────────────────────────────────────────────────────
-- RAVZEN DIGI UNIVERSE — Initial Database Schema
-- Migration: 001_initial_schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Types / Enums ─────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR');
CREATE TYPE publish_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE zone_key AS ENUM ('design', 'android', 'software', 'system');
CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'GBP', 'NGN', 'AED', 'INR', 'free');
CREATE TYPE ad_position AS ENUM ('top', 'bottom', 'left', 'right', 'center', 'custom');
CREATE TYPE ad_media_type AS ENUM ('image', 'video', 'text');
CREATE TYPE ad_animation_type AS ENUM ('fade', 'slide', 'none');
CREATE TYPE analytics_event_type AS ENUM (
  'zone_visit', 'project_view', 'app_view', 'software_view', 'system_view',
  'download_click', 'whatsapp_click', 'email_click', 'cta_click', 'ad_click'
);
CREATE TYPE entity_type AS ENUM ('design', 'android', 'software', 'system', 'advertisement');
CREATE TYPE service_model_type AS ENUM ('saas', 'one-time', 'custom');
CREATE TYPE project_status_type AS ENUM ('active', 'beta', 'coming-soon', 'archived');

-- ── Profiles ──────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'EDITOR',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Categories ────────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone        zone_key NOT NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (zone, slug)
);

CREATE INDEX idx_categories_zone ON categories(zone);

-- ── Design Projects ───────────────────────────────────────────────────────────

CREATE TABLE design_projects (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  short_description TEXT,
  full_description  TEXT,
  cover_image_url   TEXT,
  gallery_urls      TEXT[] DEFAULT '{}',
  screenshot_urls   TEXT[] DEFAULT '{}',
  video_url         TEXT,
  price             NUMERIC(10,2),
  currency          currency_type,
  year              SMALLINT,
  client_name       TEXT,
  external_url      TEXT,
  whatsapp_number   TEXT,
  email_contact     TEXT,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  status            publish_status NOT NULL DEFAULT 'draft',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_design_projects_status ON design_projects(status);
CREATE INDEX idx_design_projects_featured ON design_projects(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_design_projects_category ON design_projects(category_id);
CREATE INDEX idx_design_projects_sort ON design_projects(sort_order, created_at DESC);

-- ── Android Apps ──────────────────────────────────────────────────────────────

CREATE TABLE android_apps (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  category_id           UUID REFERENCES categories(id) ON DELETE SET NULL,
  short_description     TEXT,
  full_description      TEXT,
  icon_url              TEXT,
  cover_image_url       TEXT,
  screenshot_urls       TEXT[] DEFAULT '{}',
  video_url             TEXT,
  apk_url               TEXT,
  play_store_url        TEXT,
  version               TEXT,
  min_android_version   TEXT,
  target_android_version TEXT,
  file_size_mb          NUMERIC(8,2),
  features              TEXT[] DEFAULT '{}',
  permissions           TEXT[] DEFAULT '{}',
  changelog             JSONB DEFAULT '{}',
  price                 NUMERIC(10,2),
  currency              currency_type,
  is_free               BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,
  status                publish_status NOT NULL DEFAULT 'draft',
  sort_order            INTEGER NOT NULL DEFAULT 0,
  whatsapp_number       TEXT,
  email_contact         TEXT,
  demo_request_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_android_apps_status ON android_apps(status);
CREATE INDEX idx_android_apps_featured ON android_apps(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_android_apps_sort ON android_apps(sort_order, created_at DESC);

-- ── Software Products ─────────────────────────────────────────────────────────

CREATE TABLE software_products (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  category_id           UUID REFERENCES categories(id) ON DELETE SET NULL,
  short_description     TEXT,
  full_description      TEXT,
  cover_image_url       TEXT,
  screenshot_urls       TEXT[] DEFAULT '{}',
  gallery_urls          TEXT[] DEFAULT '{}',
  video_url             TEXT,
  download_url          TEXT,
  demo_url              TEXT,
  version               TEXT,
  supported_os          TEXT[] DEFAULT '{}',
  requirements          TEXT,
  features              TEXT[] DEFAULT '{}',
  installation_info     TEXT,
  changelog             JSONB DEFAULT '{}',
  price                 NUMERIC(10,2),
  currency              currency_type,
  is_free               BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,
  status                publish_status NOT NULL DEFAULT 'draft',
  sort_order            INTEGER NOT NULL DEFAULT 0,
  whatsapp_number       TEXT,
  email_contact         TEXT,
  demo_request_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_software_products_status ON software_products(status);
CREATE INDEX idx_software_products_featured ON software_products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_software_products_sort ON software_products(sort_order, created_at DESC);

-- ── Systems ───────────────────────────────────────────────────────────────────

CREATE TABLE systems (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  short_description TEXT,
  full_description  TEXT,
  cover_image_url   TEXT,
  screenshot_urls   TEXT[] DEFAULT '{}',
  diagram_urls      TEXT[] DEFAULT '{}',
  video_url         TEXT,
  features          TEXT[] DEFAULT '{}',
  tech_stack        TEXT[] DEFAULT '{}',
  service_model     service_model_type,
  project_status    project_status_type,
  price             NUMERIC(10,2),
  currency          currency_type,
  external_url      TEXT,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  status            publish_status NOT NULL DEFAULT 'draft',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  whatsapp_number   TEXT,
  email_contact     TEXT,
  contact_for_quote BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_systems_status ON systems(status);
CREATE INDEX idx_systems_featured ON systems(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_systems_sort ON systems(sort_order, created_at DESC);

-- ── Media ─────────────────────────────────────────────────────────────────────

CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  bucket      TEXT NOT NULL,
  path        TEXT NOT NULL,
  public_url  TEXT NOT NULL,
  filename    TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  BIGINT NOT NULL,
  width       INTEGER,
  height      INTEGER,
  alt_text    TEXT,
  entity_type TEXT,  -- loosely typed for flexibility
  entity_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bucket, path)
);

CREATE INDEX idx_media_entity ON media(entity_type, entity_id);
CREATE INDEX idx_media_uploader ON media(uploader_id);

-- ── Ad Slots ──────────────────────────────────────────────────────────────────
-- 10 pre-defined slots: 2 for universe, 2 per zone (4 zones)

CREATE TABLE ad_slots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone        TEXT NOT NULL, -- 'universe' | zone_key
  position    ad_position NOT NULL DEFAULT 'bottom',
  label       TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ad_slots_zone ON ad_slots(zone);

-- ── Advertisements ────────────────────────────────────────────────────────────

CREATE TABLE advertisements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id        UUID NOT NULL REFERENCES ad_slots(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  body_text      TEXT,
  media_url      TEXT,
  media_type     ad_media_type NOT NULL DEFAULT 'image',
  cta_text       TEXT,
  cta_url        TEXT,
  animation_type ad_animation_type NOT NULL DEFAULT 'fade',
  priority       SMALLINT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at      TIMESTAMPTZ,
  ends_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ads_slot ON advertisements(slot_id);
CREATE INDEX idx_ads_active ON advertisements(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_ads_dates ON advertisements(starts_at, ends_at);

-- ── Analytics Events ──────────────────────────────────────────────────────────

CREATE TABLE analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  TEXT NOT NULL,
  event_type  analytics_event_type NOT NULL,
  entity_id   UUID,
  entity_type entity_type,
  referrer    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partition by month in production; for now a simple table with indexes
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- ── Active Sessions ───────────────────────────────────────────────────────────

CREATE TABLE active_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token  TEXT NOT NULL UNIQUE,
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_active_sessions_last_seen ON active_sessions(last_seen_at DESC);

-- Auto-clean stale sessions (older than 5 minutes = inactive)
-- This is handled by API rather than a trigger to avoid lock contention.

-- ── Site Settings ─────────────────────────────────────────────────────────────

CREATE TABLE site_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO site_settings (key, value, description) VALUES
  ('activity_multiplier', '3', 'Multiplier applied to raw active session count for public display'),
  ('whatsapp_primary', '', 'Primary WhatsApp contact number'),
  ('email_primary', '', 'Primary email contact address'),
  ('site_status', 'active', 'Site operational status: active | maintenance'),
  ('universe_intro_skip_enabled', 'true', 'Whether visitors can skip the intro animation');

-- ── Updated_at triggers ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_design_projects_updated_at
  BEFORE UPDATE ON design_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_android_apps_updated_at
  BEFORE UPDATE ON android_apps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_software_products_updated_at
  BEFORE UPDATE ON software_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_systems_updated_at
  BEFORE UPDATE ON systems
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_advertisements_updated_at
  BEFORE UPDATE ON advertisements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
