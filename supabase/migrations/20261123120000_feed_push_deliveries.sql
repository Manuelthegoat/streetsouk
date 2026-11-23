create table if not exists public.feed_push_deliveries (
  post_id uuid primary key references public.feed_posts(id) on delete cascade,
  sent_at timestamptz not null default now()
);

alter table public.feed_push_deliveries enable row level security;

-- Only the Edge Function's service role can read or write delivery records.
