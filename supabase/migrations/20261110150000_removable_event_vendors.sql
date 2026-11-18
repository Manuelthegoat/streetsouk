alter table public.event_vendor_applications
  drop constraint if exists event_vendor_applications_status_check;

alter table public.event_vendor_applications
  add constraint event_vendor_applications_status_check
  check (status in ('pending', 'approved', 'rejected', 'removed'));
