alter table public.event_vendor_applications
  add column if not exists booth text;

grant update (booth) on public.event_vendor_applications to authenticated;
