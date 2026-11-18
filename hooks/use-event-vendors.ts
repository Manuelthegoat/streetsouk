import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Vendor } from "@/lib/types";

const EMPTY: Vendor[] = [];

type ApprovedApplication = {
  id: string;
  brand_name: string;
  description: string;
  logo_url: string;
  campaign_image_url: string;
  booth: string | null;
  created_at: string;
};

async function fetchEventVendors(eventId: string) {
  const { data, error } = await supabase
    .from("event_vendor_applications")
    .select("id, brand_name, description, logo_url, campaign_image_url, booth, created_at")
    .eq("event_id", eventId)
    .eq("status", "approved")
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data as ApprovedApplication[]).map((application, index) => ({
    id: application.id,
    slug: `app-${application.id}`,
    name: application.brand_name,
    category: "EVENT VENDOR",
    booth: application.booth,
    detail: application.description,
    about: application.description,
    logo_url: application.logo_url,
    campaign_url: application.campaign_image_url,
    is_sponsor: false,
    is_featured: false,
    is_published: true,
    sort_order: index,
  } satisfies Vendor));
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
