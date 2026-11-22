create table if not exists public.event_gallery_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists event_gallery_images_order_idx
  on public.event_gallery_images (event_id, sort_order, created_at);

alter table public.event_gallery_images enable row level security;

create policy "Public can view event gallery images"
  on public.event_gallery_images
  for select
  to anon, authenticated
  using (true);

create policy "Admins can manage event gallery images"
  on public.event_gallery_images
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.event_gallery_images to anon, authenticated;
grant insert, update, delete on public.event_gallery_images to authenticated;
