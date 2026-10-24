create table if not exists public.studio_visits (
  visitor_id uuid not null,
  visit_day date not null,
  first_seen timestamptz not null default now(),
  primary key (visitor_id, visit_day)
);
alter table public.studio_visits enable row level security;
revoke all on public.studio_visits from anon, authenticated;
create or replace function public.record_studio_visit(p_visitor uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if p_visitor is null then return; end if;
  insert into public.studio_visits(visitor_id, visit_day)
  values (p_visitor, (now() at time zone 'Asia/Colombo')::date)
  on conflict do nothing;
end $$;
create or replace function public.studio_visitor_stats()
returns table(today_visitors bigint, month_visitors bigint, total_visitors bigint)
language sql stable security definer set search_path=public as $$
select
  count(distinct visitor_id) filter(where visit_day=(now() at time zone 'Asia/Colombo')::date),
  count(distinct visitor_id) filter(where visit_day>=date_trunc('month',now() at time zone 'Asia/Colombo')::date),
  count(distinct visitor_id)
from public.studio_visits
$$;
revoke all on function public.record_studio_visit(uuid) from public;
revoke all on function public.studio_visitor_stats() from public;
grant execute on function public.record_studio_visit(uuid) to anon, authenticated;
grant execute on function public.studio_visitor_stats() to anon, authenticated;
