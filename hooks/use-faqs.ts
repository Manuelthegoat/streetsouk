import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Faq } from "@/lib/types";

export function useFaqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("faqs")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setFaqs((data as Faq[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { faqs, loading };
}