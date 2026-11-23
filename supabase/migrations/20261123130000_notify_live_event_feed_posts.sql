create schema if not exists extensions;
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_live_event_feed_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  project_url text;
  publishable_key text;
  webhook_secret text;
  previous_record jsonb := null;
begin
  if new.is_live is distinct from true
    or new.is_published is distinct from true
    or new.event_id is null then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.is_live is true
    and old.is_published is true
    and old.event_id is not distinct from new.event_id then
    return new;
  end if;

  select decrypted_secret into project_url
  from vault.decrypted_secrets
  where name = 'streetsouk_project_url'
  limit 1;

  select decrypted_secret into publishable_key
  from vault.decrypted_secrets
  where name = 'streetsouk_publishable_key'
  limit 1;

  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'streetsouk_live_feed_push_secret'
  limit 1;

  if project_url is null or publishable_key is null or webhook_secret is null then
    raise warning 'Live feed push secrets are missing from Supabase Vault.';
    return new;
  end if;

  if tg_op = 'UPDATE' then
    previous_record := to_jsonb(old);
  end if;

  perform net.http_post(
    url := rtrim(project_url, '/') || '/functions/v1/send-feed-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', publishable_key,
      'x-live-feed-push-secret', webhook_secret
    ),
    body := jsonb_build_object(
      'type', tg_op,
      'table', 'feed_posts',
      'schema', 'public',
      'record', to_jsonb(new),
      'old_record', previous_record
    )
  );

  return new;
end;
$$;

revoke all on function public.notify_live_event_feed_post() from public;
revoke all on function public.notify_live_event_feed_post() from anon;
revoke all on function public.notify_live_event_feed_post() from authenticated;

drop trigger if exists notify_live_event_feed_post on public.feed_posts;
create trigger notify_live_event_feed_post
  after insert or update on public.feed_posts
  for each row execute function public.notify_live_event_feed_post();
