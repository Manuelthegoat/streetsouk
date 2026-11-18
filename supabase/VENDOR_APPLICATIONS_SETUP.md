# Vendor applications

The standalone vendor form writes submissions to `event_vendor_applications` and uploads images to the public `vendor-applications` Storage bucket. New rows are pending. Only approved applications appear in that event's marketplace.

## Set up Supabase

Run `supabase/migrations/20261110120000_event_vendor_applications.sql` in the Supabase SQL Editor for the project shared with Streetsouk.

Run `supabase/migrations/20261110130000_admin_review_vendor_applications.sql` as well to let signed-in Streetsouk admins review applications from the admin site. The migration uses the existing `public.is_admin()` check.

Run `supabase/migrations/20261110140000_vendor_application_booths.sql` to add booth assignment for approved applications in the admin Marketplace.

Run `supabase/migrations/20261110150000_removable_event_vendors.sql` to enable removing an approved vendor from the event while retaining the application for possible restoration.

The public form uses only the project's public URL and anon/publishable key. Set these in the Vite form's `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

The form is fixed to the event titled `STREET SOUK CONVENTION`; it resolves that event internally and does not ask applicants to choose an event. Keep the event title exact in the `events` table.

## Review submissions

Sign in to the Streetsouk admin site and open **Vendor Applications** under **Everything Else**. Review the logo, campaign image, description, and product lineup, then choose **Approve** or **Reject**. Approved entries appear in **Marketplace**, where you can assign a booth or remove a vendor from the event. Removed vendors remain in the **Removed** tab on Vendor Applications and can be restored. Only approved applications appear in the event marketplace; the public form cannot review applications, assign booths, or remove vendors.
