import { useEffect, useState } from "react";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { peek } from "@/lib/cache";
import { onTableChange } from "@/lib/realtime";
import { supabase } from "@/lib/supabase";
import type { FeedPost } from "@/lib/types";

const EMPTY: FeedPost[] = [];

async function fetchFeed(eventId?: string) {
  let query = supabase.from("feed_posts").select("*");
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data as FeedPost[];
}

// eventId: an event's id = that event's feed, undefined = every event,
// null = still waiting for the event id
export function useFeed(eventId?: string | null) {
  const waiting = eventId === null;
  const { data, loading, error, reload } = useCachedQuery(
    `feed:${eventId ?? "all"}`,
    () => fetchFeed(eventId ?? undefined),
    { ttl: 0, enabled: !waiting },
  );
  const [, setTick] = useState(0);

  useEffect(() => {
    if (waiting) return;
    // any post added, edited or removed => refresh the list and the saved copy
    const stop = onTableChange("feed_posts", reload);
    // keep "10 MINS AGO" labels fresh
    const timer = setInterval(() => setTick((n) => n + 1), 30000);
    return () => {
      stop();
      clearInterval(timer);
    };
  }, [reload, waiting]);

  return {
    posts: waiting ? EMPTY : (data ?? EMPTY),
    loading: waiting || loading,
    error,
    reload,
  };
}

export function useFeedPost(id?: string, eventId?: string) {
  const { data, loading } = useCachedQuery<FeedPost | null>(
    `feed-post:${id}`,
    async () => {
      const { data, error } = await supabase
        .from("feed_posts")
        .select("*")
        .eq("id", id as string)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as FeedPost | null;
    },
    { enabled: !!id },
  );

  // opening a post from a feed list needs no waiting: use the list's copy
  const fromFeed = peek<FeedPost[]>(`feed:${eventId ?? "all"}`)?.data.find(
    (p) => p.id === id,
  );
  return {
    post: data !== undefined ? data : (fromFeed ?? null),
    loading: loading && !fromFeed,
  };
}