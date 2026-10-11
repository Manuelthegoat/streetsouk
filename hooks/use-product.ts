import { useCachedQuery } from "@/hooks/use-cached-query";
import type { ShopProduct } from "@/hooks/use-products";
import { peek } from "@/lib/cache";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export type ProductDetail = Product & {
  vendors: {
    slug: string;
    name: string;
    category: string;
    logo_url?: string | null;
  };
};

export function useProduct(id?: string) {
  const { data, loading, error, reload } = useCachedQuery<ProductDetail | null>(
    `product:${id}`,
    async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, vendors!inner(slug, name, category, logo_url)")
        .eq("id", id as string)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as unknown as ProductDetail | null;
    },
    { enabled: !!id },
  );

  // opening a product from the shop needs no waiting: use the list's copy
  const fromList = peek<ShopProduct[]>("products")?.data.find(
    (p) => p.id === id,
  );
  return {
    product:
      data !== undefined ? data : ((fromList as ProductDetail | undefined) ?? null),
    loading: loading && !fromList,
    error,
    reload,
  };
}