import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Vendor } from "@/lib/types";

const EMPTY: Vendor[] = [];

type Row = {
  booth: string | null;
  is_sponsor: boolean;
  vendors: Vendor;
};

async function fetchEventVendors(eventId: string) {
  // vendors!inner hides vendors that are unpublished
  const { data, error } = await supabase
    .from("event_vendors")
    .select("booth, is_sponsor, sort_order, vendors!inner(*)")
    .eq("event_id", eventId)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data as unknown as Row[]).map((row) => ({
    ...row.vendors,
    // the booth and sponsor flag for THIS event win over the vendor's defaults
    booth: row.booth ?? row.vendors.booth,
    is_sponsor: row.is_sponsor,
  }));
}

// eventId null = still waiting for the event id
export function useEventVendors(eventId: string | null) {
  const waiting = eventId === null;
  const { data, loading, error, reload } = useCachedQuery(
    `event-vendors:${eventId}`,
    () => fetchEventVendors(eventId as string),
    { enabled: !waiting },
  );
  return {
    vendors: waiting ? EMPTY : (data ?? EMPTY),
    loading: waiting || loading,
    error,
    reload,
  };
}