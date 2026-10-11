import { useCachedQuery } from "@/hooks/use-cached-query";
import { peek } from "@/lib/cache";
import { supabase } from "@/lib/supabase";
import type { FestivalEvent } from "@/lib/types";

const EMPTY: FestivalEvent[] = [];

async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data as FestivalEvent[];
}

export function useEvents() {
  const { data, loading, error, reload } = useCachedQuery("events", fetchEvents);
  return { events: data ?? EMPTY, loading, error, reload };
}

export function useEvent(slug?: string) {
  const { data, loading } = useCachedQuery<FestivalEvent | null>(
    `event:${slug}`,
    async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug as string)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as FestivalEvent | null;
    },
    { enabled: !!slug },
  );

  // opening an event from the list needs no waiting: use the list's copy
  const fromList = peek<FestivalEvent[]>("events")?.data.find(
    (e) => e.slug === slug,
  );
  return {
    event: data !== undefined ? data : (fromList ?? null),
    loading: loading && !fromList,
  };
}