import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { LineupArtist } from "@/lib/types";

const EMPTY: LineupArtist[] = [];

async function fetchLineup() {
  const { data, error } = await supabase
    .from("lineup")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data as LineupArtist[];
}

export function useLineup() {
  const { data, loading, error, reload } = useCachedQuery(
    "lineup",
    fetchLineup,
  );
  return { artists: data ?? EMPTY, loading, error, reload };
}