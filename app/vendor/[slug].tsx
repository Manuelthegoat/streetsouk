import VendorView from "@/components/vendor-view";
import { useVendor } from "@/hooks/use-vendor";
import { useLocalSearchParams } from "expo-router";

export default function BrandScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { vendor, loading, error, reload } = useVendor(slug);
  return (
    <VendorView
      vendor={vendor}
      loading={loading}
      error={error}
      reload={reload}
      label="BRAND"
    />
  );
}