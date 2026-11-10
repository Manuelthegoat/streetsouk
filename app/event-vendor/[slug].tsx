import VendorView from "@/components/vendor-view";
import { useBrandProducts } from "@/hooks/use-catalog";
import { useEvent } from "@/hooks/use-events";
import { useEventVendors } from "@/hooks/use-event-vendors";
import { useVendor } from "@/hooks/use-vendor";
import { vendorImage } from "@/lib/vendor-assets";
import { useLocalSearchParams } from "expo-router";

const FALLBACK = require("@/assets/images/ss-logo.png");

export default function EventVendorScreen() {
  const { slug, event: eventSlug } = useLocalSearchParams<{
    slug: string;
    event?: string;
  }>();
  const { vendor, loading, error, reload } = useVendor(slug);
  const { event } = useEvent(eventSlug);
  const { vendors } = useEventVendors(event?.id ?? null);
  const { products, loading: productsLoading } = useBrandProducts(vendor?.name);
  // the booth for THIS event
  const booth = vendors.find((v) => v.slug === slug)?.booth ?? null;

  return (
    <VendorView
      label="VENDOR PROFILE"
      name={vendor?.name ?? ""}
      kicker={vendor?.category}
      logo={vendor ? vendorImage(vendor.slug, "logo", vendor.logo_url) : FALLBACK}
      campaign={
        vendor ? vendorImage(vendor.slug, "campaign", vendor.campaign_url) : FALLBACK
      }
      about={vendor?.about}
      favoriteSlug={vendor?.slug}
      products={products}
      loading={loading}
      productsLoading={productsLoading}
      notFound={!loading && !vendor}
      error={error}
      reload={reload}
      convention
      booth={booth}
      eventTitle={event?.title}
    />
  );
}