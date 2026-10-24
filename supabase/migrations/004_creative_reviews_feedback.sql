-- Creative Reviews & Feedback: server-only access, moderated and email-verified
-- Applied to Supabase via migrations creative_reviews_feedback + artwork_image_specific_reviews.
create table if not exists public.artwork_reviews (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.design_projects(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewer_name text not null check (char_length(trim(reviewer_name)) between 2 and 100),
  reviewer_email text not null,
  reviewer_phone text check (reviewer_phone is null or char_length(reviewer_phone) <= 25),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(trim(body)) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_reply text check (admin_reply is null or char_length(admin_reply) <= 2000),
  verified_client boolean not null default false,
  artwork_image_index integer not null default 0 check (artwork_image_index between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artwork_reviews_artwork_reviewer_image_unique unique (artwork_id,reviewer_id,artwork_image_index)
);
alter table public.artwork_reviews add column if not exists artwork_image_index integer not null default 0 check (artwork_image_index between 0 and 100);
alter table public.artwork_reviews drop constraint if exists artwork_reviews_artwork_id_reviewer_id_key;
create unique index if not exists artwork_reviews_artwork_reviewer_image_unique_idx on public.artwork_reviews(artwork_id,reviewer_id,artwork_image_index);
create index if not exists artwork_reviews_artwork_image_idx on public.artwork_reviews(artwork_id,artwork_image_index,created_at desc) where status='approved';
create index if not exists artwork_reviews_moderation_idx on public.artwork_reviews(status,created_at desc);
alter table public.artwork_reviews enable row level security;
revoke all on public.artwork_reviews from anon,authenticated;
-- Reviews are read and written only by server-side endpoints using the service-role client.
-- Never expose reviewer_email or reviewer_phone in a public endpoint.
