import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Vendor } from "@/lib/types";

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) {
      setError(error.message);
    } else {
      setVendors(data as Vendor[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { vendors, loading, error, reload: load };
}