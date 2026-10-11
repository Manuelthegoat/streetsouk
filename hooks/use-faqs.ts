import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Faq } from "@/lib/types";

const EMPTY: Faq[] = [];

async function fetchFaqs(eventId?: string) {
  let query = supabase.from("faqs").select("*");
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query.order("sort_order");
  if (error) throw new Error(error.message);
  return data as Faq[];
}

export function useFaqs(eventId?: string | null) {
  const waiting = eventId === null;
  const { data, loading } = useCachedQuery(
    `faqs:${eventId ?? "all"}`,
    () => fetchFaqs(eventId ?? undefined),
    { enabled: !waiting },
  );
  return {
    faqs: waiting ? EMPTY : (data ?? EMPTY),
    loading: waiting || loading,
  };
}