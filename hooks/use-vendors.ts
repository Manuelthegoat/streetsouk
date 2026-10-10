import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Vendor } from "@/lib/types";

const EMPTY: Vendor[] = [];

async function fetchVendors() {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return data as Vendor[];
}

export function useVendors() {
  const { data, loading, error, reload } = useCachedQuery(
    "vendors",
    fetchVendors,
  );
  return { vendors: data ?? EMPTY, loading, error, reload };
}