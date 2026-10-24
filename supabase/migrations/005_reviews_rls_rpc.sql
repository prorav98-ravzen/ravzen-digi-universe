-- Review API without server service-role credentials.
-- Authenticated inserts use RLS; public listing exposes safe fields via security-definer RPC.
create or replace function public.review_is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and is_active=true and role::text in ('SUPER_ADMIN','ADMIN'))
$$;
revoke all on function public.review_is_admin() from public;
grant execute on function public.review_is_admin() to authenticated;
create or replace function public.review_public_list(p_artwork uuid,p_image integer default 0)
returns table(id uuid,reviewer_name text,rating smallint,body text,admin_reply text,verified_client boolean,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select r.id,r.reviewer_name,r.rating,r.body,r.admin_reply,r.verified_client,r.created_at
 from public.artwork_reviews r
 where r.artwork_id=p_artwork and r.artwork_image_index=p_image and r.status='approved'
 order by r.created_at desc limit 100
$$;
revoke all on function public.review_public_list(uuid,integer) from public;
grant execute on function public.review_public_list(uuid,integer) to anon,authenticated;
grant select,insert,update on public.artwork_reviews to authenticated;
drop policy if exists review_insert_own on public.artwork_reviews;
create policy review_insert_own on public.artwork_reviews for insert to authenticated with check (
 reviewer_id=auth.uid() and reviewer_email=(auth.jwt()->>'email') and status='pending'
 and admin_reply is null and verified_client=false
 and exists(select 1 from public.design_projects p where p.id=artwork_id and p.status='published')
);
drop policy if exists review_admin_read on public.artwork_reviews;
create policy review_admin_read on public.artwork_reviews for select to authenticated using ((select public.review_is_admin()));
drop policy if exists review_admin_update on public.artwork_reviews;
create policy review_admin_update on public.artwork_reviews for update to authenticated
 using ((select public.review_is_admin())) with check ((select public.review_is_admin()));
