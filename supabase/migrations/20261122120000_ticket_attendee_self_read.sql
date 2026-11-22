drop policy if exists "Buyers can read tickets sent to their email"
  on public.ticket_attendees;

create policy "Buyers can read tickets sent to their email"
  on public.ticket_attendees
  for select
  to authenticated
  using (
    (select auth.jwt() ->> 'email') is not null
    and lower(attendee_email) = lower((select auth.jwt() ->> 'email'))
  );
