import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { ScheduleItem } from "@/lib/types";

const EMPTY: ScheduleItem[] = [];

async function fetchSchedule(eventId?: string) {
  let query = supabase.from("schedule_items").select("*");
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query
    .order("day_number")
    .order("start_time");
  if (error) throw new Error(error.message);
  return data as ScheduleItem[];
}

export function useSchedule(eventId?: string | null) {
  const waiting = eventId === null;
  const { data, loading, error, reload } = useCachedQuery(
    `schedule:${eventId ?? "all"}`,
    () => fetchSchedule(eventId ?? undefined),
    { ttl: 60_000, enabled: !waiting },
  );
  return {
    items: waiting ? EMPTY : (data ?? EMPTY),
    loading: waiting || loading,
    error,
    reload,
  };
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