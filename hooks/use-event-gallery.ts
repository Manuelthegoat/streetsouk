import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";

export type EventGalleryImage = {
  id: string;
  event_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

const EMPTY: EventGalleryImage[] = [];

async function fetchEventGallery(eventId: string) {
  const { data, error } = await supabase
    .from("event_gallery_images")
    .select("id, event_id, image_url, sort_order, created_at")
    .eq("event_id", eventId)
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data as EventGalleryImage[];
}

export function useEventGallery(eventId: string | null) {
  const waiting = eventId === null;
  const { data, loading, error, reload } = useCachedQuery(
    `event-gallery:${eventId}`,
    () => fetchEventGallery(eventId as string),
    { enabled: !waiting },
  );
  return {
    images: waiting ? EMPTY : (data ?? EMPTY),
    loading: waiting || loading,
    error,
    reload,
  };
}
