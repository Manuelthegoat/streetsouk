import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export type ShopProduct = Product & {
  vendors: { slug: string; name: string; category: string };
};

const EMPTY: ShopProduct[] = [];

async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, vendors!inner(slug, name, category)")
    .order("created_at", { ascending: false })
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data as unknown as ShopProduct[];
}

export function useProducts() {
  const { data, loading, error, reload } = useCachedQuery(
    "products",
    fetchProducts,
  );
  return { products: data ?? EMPTY, loading, error, reload };
}