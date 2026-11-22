alter table public.events
  add column if not exists status text;

update public.events
set status = case
  when coalesce(ends_on, starts_on) < current_date then 'past'
  else 'upcoming'
end
where status is null;

alter table public.events
  alter column status set default 'upcoming',
  alter column status set not null;

alter table public.events
  add constraint events_status_check
  check (status in ('upcoming', 'live', 'past'));
