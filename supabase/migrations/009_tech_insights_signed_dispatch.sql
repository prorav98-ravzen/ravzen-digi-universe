create or replace function ravzen_private.dispatch_tech_insights() returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_secret text; v_id bigint; v_timestamp text; v_signature text;
begin
 select decrypted_secret into v_secret from vault.decrypted_secrets where name='ravzen_tech_insights_secret';
 if v_secret is null then raise exception 'Publisher is not configured'; end if;
 v_timestamp := floor(extract(epoch from now()))::bigint::text;
 v_signature := encode(extensions.hmac(v_timestamp || ':tech-insights', v_secret, 'sha256'),'hex');
 select net.http_post(url := 'https://ravzen.vercel.app/api/cron/tech-insights', headers := jsonb_build_object('Content-Type','application/json','x-ravzen-timestamp',v_timestamp,'x-ravzen-signature',v_signature), body := '{}'::jsonb, timeout_milliseconds := 290000) into v_id;
 return v_id;
end $$;
revoke all on function ravzen_private.dispatch_tech_insights() from public, anon, authenticated;
