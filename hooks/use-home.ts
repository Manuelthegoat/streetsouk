import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Topic } from "@/lib/types";

const EMPTY: Topic[] = [];

async function fetchTopics() {
  const { data, error } = await supabase
    .from("home_tabs")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw new Error(error.message);
  return data as Topic[];
}

export function useTopics() {
  const { data, loading } = useCachedQuery("topics", fetchTopics);
  return { topics: data ?? EMPTY, loading };
}