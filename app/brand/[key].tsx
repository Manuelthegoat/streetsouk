import VendorView from "@/components/vendor-view";
import { toGrid, useCatalog } from "@/hooks/use-catalog";
import { useVendors } from "@/hooks/use-vendors";
import { brandKey } from "@/lib/brand";
import { vendorImage } from "@/lib/vendor-assets";
import { useLocalSearchParams } from "expo-router";

const FALLBACK = require("@/assets/images/sslogo.png");

export default function ZappieBrandScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { catalog, loading, error, reload } = useCatalog();
  const { vendors } = useVendors();

  const brand = catalog?.brands.find((b) => b.key === key);
  // your own brand page for this brand, if there is one (matched by name)
  const vendor = vendors.find(
    (v) => brandKey(v.name) === key || brandKey(v.slug) === key,
  );
  const firstImage = brand?.products[0]?.images[0];
  const photo = firstImage ? { uri: firstImage } : FALLBACK;

  return (
    <VendorView
      label="BRAND"
      name={vendor?.name ?? brand?.name ?? ""}
      kicker={vendor?.category}
      logo={vendor ? vendorImage(vendor.slug, "logo", vendor.logo_url) : photo}
      campaign={
        vendor ? vendorImage(vendor.slug, "campaign", vendor.campaign_url) : photo
      }
      about={vendor?.about}
      favoriteSlug={vendor?.slug}
      products={brand ? brand.products.map(toGrid) : []}
      loading={loading}
      notFound={!loading && !brand && !vendor}
      error={error}
      reload={reload}
    />
  );
}