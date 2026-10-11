import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { LineupArtist } from "@/lib/types";

const EMPTY: LineupArtist[] = [];

async function fetchLineup(eventId?: string) {
  let query = supabase.from("lineup").select("*");
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data as LineupArtist[];
}

export function useLineup(eventId?: string | null) {
  const waiting = eventId === null;
  const { data, loading, error, reload } = useCachedQuery(
    `lineup:${eventId ?? "all"}`,
    () => fetchLineup(eventId ?? undefined),
    { enabled: !waiting },
  );
  return {
    artists: waiting ? EMPTY : (data ?? EMPTY),
    loading: waiting || loading,
    error,
    reload,
  };
}