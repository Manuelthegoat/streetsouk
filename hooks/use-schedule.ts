import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ScheduleItem } from "@/lib/types";

export function useSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("schedule_items")
      .select("*")
      .order("day_number")
      .order("start_time");
    if (error) {
      setError(error.message);
    } else {
      setItems(data as ScheduleItem[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, reload: load };
}

export function groupByDay(items: ScheduleItem[]) {
  const days = new Map<
    number,
    { day: number; label: string | null; items: ScheduleItem[] }
  >();
  for (const item of items) {
    const entry = days.get(item.day_number) ?? {
      day: item.day_number,
      label: null,
      items: [],
    };
    entry.label = entry.label ?? item.day_label;
    entry.items.push(item);
    days.set(item.day_number, entry);
  }
  return Array.from(days.values()).sort((a, b) => a.day - b.day);
}