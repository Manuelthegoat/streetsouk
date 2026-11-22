# Jetron ticket buyers setup

The mobile My Tickets page calls Jetron's attendee-ticket lookup through the
`jetron-attendee-tickets` Supabase Edge Function. The function validates the
signed-in Supabase user, takes the email from that verified account, and calls
Jetron with `JETRON_PRIVATE_API_KEY`. The private key never goes to the app.
Ticket QR codes are fetched fresh whenever the screen opens and are not saved.

The separate `jetron-ticket-webhook` function verifies Jetron's signed
`TICKET_PURCHASED` webhooks and stores purchase attendee rows for the admin
Ticket buyers page. Those rows do not contain the current scannable QR codes.

## Deploy

1. Confirm the Street Souk mobile app and admin app point to the same Supabase
   project.
2. From this repository, apply the migrations with `supabase db push`.
3. Deploy both functions:
   `supabase functions deploy jetron-ticket-webhook` and
   `supabase functions deploy jetron-attendee-tickets`.
4. In the Supabase project dashboard, add `JETRON_PRIVATE_API_KEY` as an Edge
   Function secret. Use the Jetron private API key; never put it in either
   client app or a checked-in environment file.
5. In the Jetron event's Integrations settings, register the webhook:
   `https://<project-ref>.supabase.co/functions/v1/jetron-ticket-webhook`
6. Send Jetron's test webhook and confirm it succeeds. New purchases will then
   appear under Ticket buyers in the admin site and in My Tickets after lookup.

The receiver is public at the HTTP layer so Jetron can call it, but it stores
nothing unless the HMAC signature is valid. Duplicate deliveries are safely
upserted by purchase reference and recipient index.

Jetron's lookup returns tickets bought by or transferred to the signed-in email,
including valid, used, locked, and transfer-pending states. It also covers
private events for this host. Jetron does not return refunded, cancelled, or
transferred-away tickets. A verified email is required because the lookup trusts
the calling server to identify the attendee.
