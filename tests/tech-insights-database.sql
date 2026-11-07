-- Run in a transaction; these fixtures never become public or persist.
begin;
do $$
begin
 perform public.tech_insights_publish('invalid','claim',current_date,gen_random_uuid(),'{}');
 raise exception 'TEST FAILED: token accepted';
exception when insufficient_privilege then null;
end $$;
insert into public.tech_articles(week,slug,title,excerpt,category,sections,takeaways,source_url,source_title,source_name,source_published_at,published_at,content_hash,reading_minutes)
values('2099-01-03','internal-rollback-test','Internal test','Test excerpt','AI','[]','[]','https://blog.google/internal-rollback-test','Test','Test',now(),now()+interval '1 day','test-content-hash',1);
do $$ begin
 begin
  insert into public.tech_articles select gen_random_uuid(),week,'another-slug',title,excerpt,category,sections,takeaways,'https://blog.google/another-test',source_title,source_name,source_published_at,published_at,'another-hash',reading_minutes,created_at from public.tech_articles where slug='internal-rollback-test';
  raise exception 'TEST FAILED: duplicate week accepted';
 exception when unique_violation then null; end;
 begin
  insert into public.tech_articles select gen_random_uuid(),week+7,'another-slug',title,excerpt,category,sections,takeaways,source_url,source_title,source_name,source_published_at,published_at,'another-hash',reading_minutes,created_at from public.tech_articles where slug='internal-rollback-test';
  raise exception 'TEST FAILED: duplicate source accepted';
 exception when unique_violation then null; end;
 begin
  insert into public.tech_articles select gen_random_uuid(),week+7,'another-slug',title,excerpt,category,sections,takeaways,'https://blog.google/another-test',source_title,source_name,source_published_at,published_at,content_hash,reading_minutes,created_at from public.tech_articles where slug='internal-rollback-test';
  raise exception 'TEST FAILED: duplicate content accepted';
 exception when unique_violation then null; end;
end $$;
set local role anon;
do $$ begin
 if exists(select 1 from public.tech_articles where slug='internal-rollback-test') then raise exception 'TEST FAILED: embargo bypassed'; end if;
 begin
  insert into public.tech_articles(week) values(current_date);
  raise exception 'TEST FAILED: anonymous insert allowed';
 exception when insufficient_privilege then null; end;
 if has_schema_privilege('anon','ravzen_private','USAGE') then raise exception 'TEST FAILED: private publisher schema accessible'; end if;
end $$;
rollback;
