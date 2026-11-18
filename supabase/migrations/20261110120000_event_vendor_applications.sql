create table if not exists public.event_vendor_applications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  brand_name text not null check (length(btrim(brand_name)) between 1 and 100),
  description text not null check (length(btrim(description)) between 1 and 1200),
  logo_url text not null,
  campaign_image_url text not null,
  showcase_products jsonb not null default '[]'::jsonb
    check (jsonb_typeof(showcase_products) = 'array' and jsonb_array_length(showcase_products) between 1 and 20),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists event_vendor_applications_event_approved_idx
  on public.event_vendor_applications (event_id, created_at)
  where status = 'approved';

alter table public.event_vendor_applications enable row level security;

create policy "Public can submit pending vendor applications"
  on public.event_vendor_applications
  for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "Public can view approved event vendor applications"
  on public.event_vendor_applications
  for select
  to anon, authenticated
  using (status = 'approved');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-applications',
  'vendor-applications',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can upload vendor application images"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'vendor-applications'
    and (storage.foldername(name))[1] is not null
  );
