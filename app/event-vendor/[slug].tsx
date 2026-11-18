import VendorView from "@/components/vendor-view";
import { useBrandProducts } from "@/hooks/use-catalog";
import { useEvent } from "@/hooks/use-events";
import { useEventVendorApplication } from "@/hooks/use-event-vendor-application";
import { useVendor } from "@/hooks/use-vendor";
import { vendorImage } from "@/lib/vendor-assets";
import { useLocalSearchParams } from "expo-router";

const FALLBACK = require("@/assets/images/ss-logo.png");

export default function EventVendorScreen() {
  const { slug, event: eventSlug } = useLocalSearchParams<{
    slug: string;
    event?: string;
  }>();
  const applicationId = slug?.startsWith("app-") ? slug.slice(4) : undefined;
  const { vendor, loading: vendorLoading, error: vendorError, reload: reloadVendor } = useVendor(
    applicationId ? undefined : slug,
  );
  const { event } = useEvent(eventSlug);
  const {
    application,
    loading: applicationLoading,
    error: applicationError,
    reload: reloadApplication,
  } = useEventVendorApplication(applicationId, event?.id ?? null);
  const activeVendor = applicationId ? null : vendor;
  const { products, loading: productsLoading } = useBrandProducts(activeVendor?.name);
  const booth = application?.booth ?? null;
  const loading = applicationId ? applicationLoading || !event : vendorLoading;
  const error = applicationId ? applicationError : vendorError;
  const reload = applicationId ? reloadApplication : reloadVendor;

  return (
    <VendorView
      label="VENDOR PROFILE"
      name={application?.brand_name ?? activeVendor?.name ?? ""}
      kicker={application ? "EVENT VENDOR" : activeVendor?.category}
      logo={
        application
          ? { uri: application.logo_url }
          : activeVendor
            ? vendorImage(activeVendor.slug, "logo", activeVendor.logo_url)
            : FALLBACK
      }
      campaign={
        application
          ? { uri: application.campaign_image_url }
          : activeVendor
            ? vendorImage(activeVendor.slug, "campaign", activeVendor.campaign_url)
            : FALLBACK
      }
      about={application?.description ?? activeVendor?.about}
      favoriteSlug={application ? `app-${application.id}` : activeVendor?.slug}
      products={application ? [] : products}
      loading={loading}
      productsLoading={application ? false : productsLoading}
      showcaseProducts={application?.showcase_products}
      notFound={!loading && !(applicationId ? application : activeVendor)}
      error={error}
      reload={reload}
      convention
      booth={booth}
      eventTitle={event?.title}
    />
  );
}
