import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Product, Vendor } from "@/lib/types";

export type VendorWithProducts = Vendor & { products: Product[] };

export function useVendor(slug?: string) {
  const [vendor, setVendor] = useState<VendorWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("vendors")
      .select("*, products(*)")
      .eq("slug", slug)
      .order("sort_order", { referencedTable: "products" })
      .maybeSingle();
    if (error) {
      setError(error.message);
    } else {
      setVendor(data as VendorWithProducts | null);
      setError(null);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return { vendor, loading, error, reload: load };
}