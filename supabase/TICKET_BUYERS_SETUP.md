# Jetron ticket buyers setup

Ticket attendee records are written only after Jetron sends a signed
`TICKET_PURCHASED` webhook. The webhook function verifies the raw request body
with `JETRON_PRIVATE_API_KEY`, then uses the Supabase service role to upsert
attendee rows. The admin browser reads those rows through the authenticated
Supabase client; row-level security permits reads only when `is_admin()` is
true.

## Deploy

1. Confirm the Street Souk mobile app and admin app point to the same Supabase
   project.
2. From this repository, apply the migration with `supabase db push`.
3. Deploy the function with `supabase functions deploy jetron-ticket-webhook`.
4. In the Supabase project dashboard, add `JETRON_PRIVATE_API_KEY` as an Edge
   Function secret. Use the Jetron private API key; never put it in either
   client app or a checked-in environment file.
5. In the Jetron event's Integrations settings, register:
   `https://<project-ref>.supabase.co/functions/v1/jetron-ticket-webhook`
6. Send Jetron's test webhook and confirm it succeeds. Real attendee purchases
   will then appear under Ticket buyers in the admin site.

The receiver is public at the HTTP layer so Jetron can call it, but it stores
nothing unless the HMAC signature is valid. Duplicate deliveries are safely
upserted by purchase reference and recipient index.

Jetron sends purchase webhooks for completed attendee purchases. Complimentary
and admin-generated orders are not included, and the webhook does not backfill
past purchases. Those records must be imported separately if they are needed.
