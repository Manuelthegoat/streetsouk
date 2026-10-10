import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { Faq } from "@/lib/types";

const EMPTY: Faq[] = [];

async function fetchFaqs() {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data as Faq[];
}

export function useFaqs() {
  const { data, loading } = useCachedQuery("faqs", fetchFaqs);
  return { faqs: data ?? EMPTY, loading };
}