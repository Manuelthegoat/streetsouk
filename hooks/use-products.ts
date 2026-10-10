import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export type ShopProduct = Product & {
  vendors: { slug: string; name: string; category: string };
};

export function useProducts() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    // vendors!inner hides products whose vendor is unpublished
    const { data, error } = await supabase
      .from("products")
      .select("*, vendors!inner(slug, name, category)")
      .order("created_at", { ascending: false })
      .order("sort_order");
    if (error) {
      setError(error.message);
    } else {
      setProducts(data as unknown as ShopProduct[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { products, loading, error, reload: load };
}