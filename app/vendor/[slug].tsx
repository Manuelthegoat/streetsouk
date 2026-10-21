import VendorView from "@/components/vendor-view";
import { useBrandProducts } from "@/hooks/use-catalog";
import { useVendor } from "@/hooks/use-vendor";
import { vendorImage } from "@/lib/vendor-assets";
import { useLocalSearchParams } from "expo-router";

const FALLBACK = require("@/assets/images/sslogo.png");

export default function BrandScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { vendor, loading, error, reload } = useVendor(slug);
  const { products, loading: productsLoading } = useBrandProducts(vendor?.name);

  return (
    <VendorView
      label="BRAND"
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
    />
  );
}