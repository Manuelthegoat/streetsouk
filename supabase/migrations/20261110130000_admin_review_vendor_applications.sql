grant select on public.event_vendor_applications to authenticated;
grant update (status) on public.event_vendor_applications to authenticated;

create policy "Admins can view all vendor applications"
  on public.event_vendor_applications
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can review vendor applications"
  on public.event_vendor_applications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
