import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { FeedPost } from "@/lib/types";

export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const channelId = useRef(Math.random().toString(36).slice(2));

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("feed_posts")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) {
      setError(error.message);
    } else {
      setPosts(data as FeedPost[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    // reload whenever a post is added, edited or removed
    const channel = supabase
      .channel(`feed-${channelId.current}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feed_posts" },
        () => load(),
      )
      .subscribe();

    // keep "10 MINS AGO" labels fresh
    const timer = setInterval(() => setTick((n) => n + 1), 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [load]);

  return { posts, loading, error, reload: load };
}

export function useFeedPost(id?: string) {
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    supabase
      .from("feed_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setPost((data as FeedPost) ?? null);
        setLoading(false);
      });
  }, [id]);

  return { post, loading };
}