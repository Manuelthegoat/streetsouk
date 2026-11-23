# Live feed push notifications

Apply the `20261123120000_feed_push_deliveries.sql` migration and deploy the
`send-feed-push` Edge Function:

```sh
supabase db push
supabase functions deploy send-feed-push
```

The function uses Supabase's `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` runtime secrets. Supabase provides these to hosted
Edge Functions. It also checks `public.is_admin()` before sending.

When an admin creates a published feed post or publishes a hidden post, the
admin site calls the function. It sends one Expo push to each opted-in profile
with a registered device token. Tapping the push opens that feed post. Editing
or hiding a post does not send a notification, and a post that already sent a
push is not sent again when republished.
