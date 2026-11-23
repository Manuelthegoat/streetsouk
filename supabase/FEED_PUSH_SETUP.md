# Live event feed push notifications

When a feed post for an event is first published as live, opted-in users with a
registered device token receive one push notification. The database trigger
calls `send-feed-push`; edits to a post that is already live do not send another
notification.

## Supabase setup

1. Create one shared secret and save it as an Edge Function secret:

   ```sh
   supabase secrets set LIVE_FEED_PUSH_WEBHOOK_SECRET=<random-secret>
   ```

2. In the Supabase SQL Editor, save the project URL, publishable key, and same
   shared secret in Vault. Replace the placeholders and run these once per
   Supabase project:

   ```sql
   select vault.create_secret('https://<project-ref>.supabase.co', 'streetsouk_project_url');
   select vault.create_secret('<publishable-key>', 'streetsouk_publishable_key');
   select vault.create_secret('<same-random-secret>', 'streetsouk_live_feed_push_secret');
   ```

3. Apply the migration and deploy the Edge Function:

   ```sh
   supabase db push
   supabase functions deploy send-feed-push
   ```

The migration installs a database trigger for `feed_posts`. It calls the
function only when a post with an `event_id` becomes both published and live.
The function accepts either this Vault-authenticated database call or an
authenticated admin call. It sends to profiles with `push_updates = true` and
registered rows in `push_tokens`.

## Test it

1. Install a development or production build on the iOS or Android device and
   enable **Settings → Festival Alerts**. Expo Go does not support remote push
   notifications on Android from SDK 53 onward.
2. Confirm the signed-in user has `push_updates = true` in `profiles` and a
   device token row in `push_tokens`.
3. Create a published feed post with an `event_id` and `is_live = true`, or
   change an event feed post from not-live to live.
4. Check the `send-feed-push` Edge Function logs and `feed_push_deliveries` for
   the post. A delivery row prevents repeat notifications for the same post.

The iOS and Android app builds also need valid APNs and FCM credentials
configured for the Expo project. See the [Expo push notification setup guide](https://docs.expo.dev/push-notifications/push-notifications-setup/).
