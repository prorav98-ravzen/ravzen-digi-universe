-- Additive migration. Existing portfolio, reviews, auth and settings are untouched.
create schema if not exists ravzen_private;
revoke all on schema ravzen_private from public, anon, authenticated;
create table ravzen_private.tech_publisher_config (id boolean primary key default true check(id), token_hash text not null);
alter table ravzen_private.tech_publisher_config enable row level security;
create table public.tech_articles (
 id uuid primary key default gen_random_uuid(), week date not null unique,
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null, excerpt text not null, category text not null check(category in ('AI','Software','Design','Technology')),
 sections jsonb not null check(jsonb_typeof(sections) = 'array'), takeaways jsonb not null check(jsonb_typeof(takeaways) = 'array'),
 source_url text not null unique check(source_url ~ '^https://'), source_title text not null, source_name text not null,
 source_published_at timestamptz not null, published_at timestamptz not null,
 content_hash text not null unique, reading_minutes integer not null check(reading_minutes between 1 and 30),
 created_at timestamptz not null default now()
);
create index tech_articles_published on public.tech_articles(published_at desc);
alter table public.tech_articles enable row level security;
revoke all on public.tech_articles from anon, authenticated;
grant select on public.tech_articles to anon, authenticated;
create policy tech_articles_public_read on public.tech_articles for select to anon, authenticated using(published_at <= now());
create table ravzen_private.tech_publish_runs (
 week date primary key, run_id uuid not null, status text not null check(status in ('running','published','failed')),
 attempts integer not null default 1, started_at timestamptz not null default now(), finished_at timestamptz, error_code text
);
alter table ravzen_private.tech_publish_runs enable row level security;
-- Intentionally privileged, narrowly scoped publisher. No service-role key is needed in Vercel.
-- Every action validates a 256-bit server secret against a private hash before any access.
create function public.tech_insights_publish(p_token text, p_action text, p_week date, p_run uuid, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_run ravzen_private.tech_publish_runs%rowtype; v_now timestamptz := now(); v_publish timestamptz;
begin
 if length(coalesce(p_token,'')) < 40 or not exists(select 1 from ravzen_private.tech_publisher_config where token_hash = encode(extensions.digest(p_token,'sha256'),'hex')) then
  raise exception 'Unauthorized' using errcode = '42501';
 end if;
 v_publish := (p_week::text || ' 09:00:00 Asia/Colombo')::timestamptz;
 if extract(dow from p_week) <> 6 or v_now < v_publish - interval '15 minutes' or v_now > v_publish + interval '65 minutes' then raise exception 'Outside publication window'; end if;
 perform pg_advisory_xact_lock(831972, p_week - date '2020-01-01');
 select * into v_run from ravzen_private.tech_publish_runs where week = p_week;
 if p_action = 'claim' then
  if exists(select 1 from public.tech_articles where week = p_week) then return jsonb_build_object('claimed',false,'status','already_published'); end if;
  if v_run.status = 'running' and v_run.started_at > v_now - interval '6 minutes' then return jsonb_build_object('claimed',false,'status','already_running'); end if;
  if v_run.attempts >= 8 then return jsonb_build_object('claimed',false,'status','attempt_limit'); end if;
  insert into ravzen_private.tech_publish_runs(week,run_id,status) values(p_week,p_run,'running')
  on conflict(week) do update set run_id=p_run,status='running',attempts=tech_publish_runs.attempts+1,started_at=v_now,finished_at=null,error_code=null;
  return jsonb_build_object('claimed',true,'used_sources',coalesce((select jsonb_agg(source_url) from public.tech_articles),'[]'::jsonb));
 end if;
 if v_run.run_id is distinct from p_run or v_run.status <> 'running' then raise exception 'Stale run'; end if;
 if p_action = 'fail' then
  update ravzen_private.tech_publish_runs set status='failed', finished_at=v_now,error_code=left(p_payload->>'code',100) where week=p_week;
  return jsonb_build_object('status','failed');
 elsif p_action = 'publish' then
  if (p_payload->>'published_at')::timestamptz <> v_publish or (p_payload->>'source_published_at')::timestamptz < v_now - interval '14 days' or (p_payload->>'source_published_at')::timestamptz > v_now then raise exception 'Invalid publication date'; end if;
  if length(p_payload->>'title') not between 15 and 180 or jsonb_array_length(p_payload->'sections') not between 4 and 8 then raise exception 'Invalid article'; end if;
  insert into public.tech_articles(week,slug,title,excerpt,category,sections,takeaways,source_url,source_title,source_name,source_published_at,published_at,content_hash,reading_minutes)
  values(p_week,p_payload->>'slug',p_payload->>'title',p_payload->>'excerpt',p_payload->>'category',p_payload->'sections',p_payload->'takeaways',p_payload->>'source_url',p_payload->>'source_title',p_payload->>'source_name',(p_payload->>'source_published_at')::timestamptz,v_publish,p_payload->>'content_hash',(p_payload->>'reading_minutes')::integer);
  update ravzen_private.tech_publish_runs set status='published',finished_at=v_now,error_code=null where week=p_week;
  return jsonb_build_object('slug',p_payload->>'slug');
 end if;
 raise exception 'Invalid action';
end $$;
revoke all on function public.tech_insights_publish(text,text,date,uuid,jsonb) from public;
grant execute on function public.tech_insights_publish(text,text,date,uuid,jsonb) to anon;
