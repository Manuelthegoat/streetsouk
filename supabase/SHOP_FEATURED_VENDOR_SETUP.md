# Shop featured vendor setup

The Shop page reads the featured flag from the shared `vendors` table and
matches that vendor to its Zappie brand to show the vendor's live products.

## Apply the database change

In the Supabase dashboard for the project used by both apps, open **SQL Editor**
and run the contents of:

`supabase/migrations/20261031100000_add_featured_vendor.sql`

This adds `vendors.is_featured` and enforces one featured Shop vendor at a time.

## Feature a vendor

In the Streetsouk admin app, open **Vendors** and click **FEATURE** on a
published vendor. The app uses that vendor's name to match its products from
Zappie. Use **SEE ALL** on the Shop page to open the full brand listing.

The **New Arrivals** tab uses a Zappie menu named `New Arrivals` when one
exists. If there is no such menu, it shows the first available catalog items in
Zappie's order; create and curate that menu in Zappie for an explicit arrivals
selection.
