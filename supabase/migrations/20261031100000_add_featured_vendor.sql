alter table public.vendors
  add column if not exists is_featured boolean not null default false;

create unique index if not exists vendors_single_featured_shop_vendor
  on public.vendors (is_featured)
  where is_featured;
