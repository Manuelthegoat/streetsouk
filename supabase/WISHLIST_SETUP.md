# Product wishlist setup

The product wishlist is tied to signed-in users and stores Zappie product IDs
in the Supabase project shared by the mobile app.

## Apply the database change

In the Supabase dashboard, open **SQL Editor** for the project used by the app
and run the contents of:

`supabase/migrations/20261031200000_add_wishlisted_products.sql`

The table uses row-level security so each signed-in user can only view, add, or
remove their own wishlist entries.

## Use the wishlist

Open a product and tap the heart in the top bar to save it. Saved products
appear in **MY SOUK → WISHLIST**. Tapping a saved product opens its product page;
tap its heart on MY SOUK to remove it.
