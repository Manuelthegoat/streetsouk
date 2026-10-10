import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Product, Vendor } from "@/lib/types";

export type VendorWithProducts = Vendor & { products: Product[] };

export function useVendor(slug?: string) {
  const { data, loading, error, reload } = useCachedQuery<VendorWithProducts | null>(
    `vendor:${slug}`,
    async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*, products(*)")
        .eq("slug", slug as string)
        .order("sort_order", { referencedTable: "products" })
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as VendorWithProducts | null;
    },
    { enabled: !!slug },
  );
  return { vendor: data ?? null, loading, error, reload };
}