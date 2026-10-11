import type { SizeStock } from "@/lib/types";

type Stocked = { stock: number; size_stock: SizeStock[] };

export function totalStock(p: Stocked) {
  const sizes = p.size_stock ?? [];
  return sizes.length > 0
    ? sizes.reduce((n, s) => n + Math.max(0, s.stock), 0)
    : Math.max(0, p.stock ?? 0);
}

export function isSoldOut(p: Stocked) {
  return totalStock(p) <= 0;
}