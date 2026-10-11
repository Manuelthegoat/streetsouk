import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Faq } from "@/lib/types";

const EMPTY: Faq[] = [];

async function fetchFaqs(eventId: string) {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data as Faq[];
}

// eventId null = still waiting for the event to load
export function useFaqs(eventId: string | null) {
  const waiting = eventId === null;
  const { data, loading } = useCachedQuery(
    `faqs:${eventId}`,
    () => fetchFaqs(eventId as string),
    { enabled: !waiting },
  );
  return {
    faqs: waiting ? EMPTY : (data ?? EMPTY),
    loading: waiting || loading,
  };
}