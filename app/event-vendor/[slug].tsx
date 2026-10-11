import VendorView from "@/components/vendor-view";
import { useEvent } from "@/hooks/use-events";
import { useEventVendors } from "@/hooks/use-event-vendors";
import { useVendor } from "@/hooks/use-vendor";
import { useLocalSearchParams } from "expo-router";

export default function EventVendorScreen() {
  const { slug, event: eventSlug } = useLocalSearchParams<{
    slug: string;
    event?: string;
  }>();
  const { vendor, loading, error, reload } = useVendor(slug);
  const { event } = useEvent(eventSlug);
  const { vendors } = useEventVendors(event?.id ?? null);
  // the booth for THIS event
  const booth = vendors.find((v) => v.slug === slug)?.booth ?? null;

  return (
    <VendorView
      vendor={vendor}
      loading={loading}
      error={error}
      reload={reload}
      label="VENDOR PROFILE"
      convention
      booth={booth}
      eventTitle={event?.title}
    />
  );
}