import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";

export type ShowcaseProduct = { name: string; image_url: string };
export type EventVendorApplication = {
  id: string;
  brand_name: string;
  description: string;
  logo_url: string;
  campaign_image_url: string;
  booth: string | null;
  showcase_products: ShowcaseProduct[];
};

export function useEventVendorApplication(
  applicationId?: string,
  eventId?: string | null,
) {
  const enabled = !!applicationId && !!eventId;
  const { data, loading, error, reload } = useCachedQuery<EventVendorApplication | null>(
    `event-vendor-application:${eventId}:${applicationId}`,
    async () => {
      const { data, error } = await supabase
        .from("event_vendor_applications")
        .select("id, brand_name, description, logo_url, campaign_image_url, showcase_products, booth")
        .eq("id", applicationId as string)
        .eq("event_id", eventId as string)
        .eq("status", "approved")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as EventVendorApplication | null;
    },
    { enabled },
  );
  return { application: data ?? null, loading: enabled && loading, error, reload };
}
