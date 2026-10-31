create table if not exists public.wishlisted_products (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlisted_products enable row level security;

drop policy if exists "Users can view their wishlisted products"
  on public.wishlisted_products;
create policy "Users can view their wishlisted products"
  on public.wishlisted_products for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add their wishlisted products"
  on public.wishlisted_products;
create policy "Users can add their wishlisted products"
  on public.wishlisted_products for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their wishlisted products"
  on public.wishlisted_products;
create policy "Users can remove their wishlisted products"
  on public.wishlisted_products for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.wishlisted_products to authenticated;
