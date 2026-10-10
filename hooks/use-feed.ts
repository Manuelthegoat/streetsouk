import { useEffect, useState } from "react";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { peek } from "@/lib/cache";
import { onTableChange } from "@/lib/realtime";
import { supabase } from "@/lib/supabase";
import type { FeedPost } from "@/lib/types";

const EMPTY: FeedPost[] = [];

async function fetchFeed() {
  const { data, error } = await supabase
    .from("feed_posts")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data as FeedPost[];
}

export function useFeed() {
  // ttl 0: show saved posts instantly, but always check for newer ones
  const { data, loading, error, reload } = useCachedQuery("feed", fetchFeed, {
    ttl: 0,
  });
  const [, setTick] = useState(0);

  useEffect(() => {
    // any post added, edited or removed => refresh the list and the saved copy
    const stop = onTableChange("feed_posts", reload);
    // keep "10 MINS AGO" labels fresh
    const timer = setInterval(() => setTick((n) => n + 1), 30000);
    return () => {
      stop();
      clearInterval(timer);
    };
  }, [reload]);

  return { posts: data ?? EMPTY, loading, error, reload };
}

export function useFeedPost(id?: string) {
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

  // opening a post from the feed list needs no waiting: use the list's copy
  const fromFeed = peek<FeedPost[]>("feed")?.data.find((p) => p.id === id);
  return {
    post: data !== undefined ? data : (fromFeed ?? null),
    loading: loading && !fromFeed,
  };
}
