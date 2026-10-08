-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Advertisement Slots
-- 10 slots total — 2 universe + 2 per zone (4 zones)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO ad_slots (zone, position, label, description) VALUES
  -- Universe Hub
  ('universe', 'top',    'Universe Top Banner',    'Wide banner at the top of the Universe Hub'),
  ('universe', 'bottom', 'Universe Bottom Banner', 'Banner at the bottom of the Universe Hub'),

  -- Design Zone
  ('design', 'top',    'Design Zone Top Banner',    'Banner at the top of the Design Zone'),
  ('design', 'bottom', 'Design Zone Bottom Banner', 'Banner at the bottom of the Design Zone'),

  -- Android Zone
  ('android', 'top',    'Android Zone Top Banner',    'Banner at the top of the Android Zone'),
  ('android', 'bottom', 'Android Zone Bottom Banner', 'Banner at the bottom of the Android Zone'),

  -- Software Zone
  ('software', 'top',    'Software Zone Top Banner',    'Banner at the top of the Software Zone'),
  ('software', 'bottom', 'Software Zone Bottom Banner', 'Banner at the bottom of the Software Zone'),

  -- System Zone
  ('system', 'top',    'System Zone Top Banner',    'Banner at the top of the System Zone'),
  ('system', 'bottom', 'System Zone Bottom Banner', 'Banner at the bottom of the System Zone');

-- ── Seed default categories ───────────────────────────────────────────────────

INSERT INTO categories (zone, name, slug, sort_order) VALUES
  -- Design
  ('design', 'Logo Design', 'logo-design', 1),
  ('design', 'Branding', 'branding', 2),
  ('design', 'Social Media Design', 'social-media', 3),
  ('design', 'Posters', 'posters', 4),
  ('design', 'Product Design', 'product-design', 5),
  ('design', 'UI/UX', 'ui-ux', 6),
  ('design', 'Illustration', 'illustration', 7),
  ('design', 'Artwork', 'artwork', 8),
  ('design', 'Marketing Design', 'marketing', 9),
  ('design', 'Other', 'other', 10),

  -- Android
  ('android', 'Productivity', 'productivity', 1),
  ('android', 'Business', 'business', 2),
  ('android', 'Utility', 'utility', 3),
  ('android', 'Entertainment', 'entertainment', 4),
  ('android', 'Education', 'education', 5),
  ('android', 'Custom', 'custom', 6),

  -- Software
  ('software', 'Desktop Apps', 'desktop', 1),
  ('software', 'Web Tools', 'web-tools', 2),
  ('software', 'SaaS', 'saas', 3),
  ('software', 'Automation', 'automation', 4),
  ('software', 'Data & Analytics', 'data-analytics', 5),

  -- System
  ('system', 'POS Systems', 'pos', 1),
  ('system', 'Business Systems', 'business', 2),
  ('system', 'Management Systems', 'management', 3),
  ('system', 'Web Systems', 'web', 4),
  ('system', 'Automation Systems', 'automation', 5),
  ('system', 'Custom Systems', 'custom', 6);
