import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { LineupArtist } from "@/lib/types";

const EMPTY: LineupArtist[] = [];

async function fetchLineup(eventId: string) {
  const { data, error } = await supabase
    .from("lineup")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data as LineupArtist[];
}

// eventId: a string = that event, null = still waiting for the event to load,
// undefined = there is no such event (empty, not loading)
export function useLineup(eventId: string | null | undefined) {
  const ready = typeof eventId === "string";
  const { data, loading, error, reload } = useCachedQuery(
    `lineup:${eventId}`,
    () => fetchLineup(eventId as string),
    { enabled: ready },
  );
  return {
    artists: ready ? (data ?? EMPTY) : EMPTY,
    loading: eventId === null || (ready && loading),
    error: ready ? error : null,
    reload,
  };
}