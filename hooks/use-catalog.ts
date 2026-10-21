import { useMemo } from "react";
import { useZappieMenus } from "@/hooks/use-zappie";
import { brandKey } from "@/lib/brand";
import type { ZItem } from "@/lib/zappie-types";

export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  price: number; // naira
  previousPrice: number | null;
  available: boolean;
  stockLabel: string | null;
  brand: string;
  brandKey: string;
  item: ZItem;
};

export type CatalogBrand = {
  key: string;
  name: string;
  products: CatalogProduct[];
};

export type CatalogMenu = {
  id: string;
  name: string;
  groups: { name: string; products: CatalogProduct[] }[];
};

export type GridProduct = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  soldOut: boolean;
};

export const toGrid = (p: CatalogProduct): GridProduct => ({
  id: p.id,
  name: p.name,
  price: p.price,
  image: p.images[0] ?? null,
  soldOut: !p.available,
});

const naira = (money: { amount_minor: number }) =>
  Math.round(money.amount_minor / 100);

function toProduct(item: ZItem, brand: string): CatalogProduct {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    images: item.images ?? [],
    price: naira(item.price),
    previousPrice: item.previous_price ? naira(item.previous_price) : null,
    available: item.available,
    stockLabel: item.stock_label ?? null,
    brand,
    brandKey: brandKey(brand),
    item,
  };
}

export function useCatalog() {
  const { menus, branch, loading, error, reload } = useZappieMenus();

  const catalog = useMemo(() => {
    if (!menus) return null;
    const items = menus.items;
    // the menu that holds one category per brand
    const brandsMenu =
      menus.menus.find((m) => /brand/i.test(m.name)) ?? menus.menus[0];

    const brandOf = new Map<string, string>();
    const brands: CatalogBrand[] = [];
    for (const category of brandsMenu?.categories ?? []) {
      const products: CatalogProduct[] = [];
      for (const id of category.item_ids) {
        const item = items[id];
        if (!item) continue;
        if (!brandOf.has(id)) brandOf.set(id, category.name);
        products.push(toProduct(item, category.name));
      }
      if (products.length > 0) {
        brands.push({ key: brandKey(category.name), name: category.name, products });
      }
    }

    const byId = new Map<string, CatalogProduct>();
    for (const [id, item] of Object.entries(items)) {
      byId.set(id, toProduct(item, brandOf.get(id) ?? "Street Souk"));
    }

    // every other Zappie menu becomes its own tab in the shop
    const others: CatalogMenu[] = menus.menus
      .filter((m) => m !== brandsMenu && m.is_active)
      .map((m) => ({
        id: m.id,
        name: m.name,
        groups: m.categories
          .map((c) => ({
            name: c.name,
            products: c.item_ids
              .map((id) => byId.get(id))
              .filter((p): p is CatalogProduct => !!p),
          }))
          .filter((g) => g.products.length > 0),
      }))
      .filter((m) => m.groups.length > 0);

    return { brands, byId, products: Array.from(byId.values()), others };
  }, [menus]);

  return { catalog, branch, loading, error, reload };
}

// a brand's products by name, e.g. for a vendor page that lives in Supabase
export function useBrandProducts(name?: string | null) {
  const { catalog, loading } = useCatalog();
  const products = useMemo(() => {
    if (!name || !catalog) return [];
    const key = brandKey(name);
    return catalog.brands.find((b) => b.key === key)?.products.map(toGrid) ?? [];
  }, [catalog, name]);
  return { products, loading };
}