create table if not exists public.ticket_attendees (
  id uuid primary key default gen_random_uuid(),
  reference text not null,
  recipient_index integer not null,
  event_id text,
  event_slug text not null,
  event_name text not null,
  sku text,
  ticket_name text,
  quantity integer not null default 1 check (quantity > 0),
  amount bigint,
  formatted_amount text,
  attendee_first_name text,
  attendee_last_name text,
  attendee_email text,
  attendee_phone text,
  paid_at timestamptz,
  received_at timestamptz not null default now(),
  unique (reference, recipient_index)
);

create index if not exists ticket_attendees_event_received_idx
  on public.ticket_attendees (event_slug, received_at desc);

create index if not exists ticket_attendees_email_idx
  on public.ticket_attendees (attendee_email);

alter table public.ticket_attendees enable row level security;

revoke all on table public.ticket_attendees from anon, authenticated;
grant select on table public.ticket_attendees to authenticated;

create policy "Admins can read ticket attendees"
  on public.ticket_attendees
  for select
  to authenticated
  using ((select public.is_admin()));
