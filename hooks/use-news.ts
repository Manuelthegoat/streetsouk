import { useCachedQuery } from "@/hooks/use-cached-query";
import { peek } from "@/lib/cache";
import { supabase } from "@/lib/supabase";
import type { NewsPost } from "@/lib/types";

const EMPTY: NewsPost[] = [];

async function fetchNews() {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return data as NewsPost[];
}

export function useNews() {
  const { data, loading, error, reload } = useCachedQuery("news", fetchNews, {
    ttl: 2 * 60_000,
  });
  return { posts: data ?? EMPTY, loading, error, reload };
}

export function useNewsPost(id?: string) {
  const { data, loading } = useCachedQuery<NewsPost | null>(
    `news-post:${id}`,
    async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id as string)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as NewsPost | null;
    },
    { enabled: !!id },
  );

  // opening an article from a list needs no waiting: use the list's copy
  const fromList = peek<NewsPost[]>("news")?.data.find((p) => p.id === id);
  return {
    post: data !== undefined ? data : (fromList ?? null),
    loading: loading && !fromList,
  };
}