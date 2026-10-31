create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

drop policy if exists "Users manage their own push tokens" on public.push_tokens;
create policy "Users manage their own push tokens"
  on public.push_tokens
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.push_tokens to authenticated;
