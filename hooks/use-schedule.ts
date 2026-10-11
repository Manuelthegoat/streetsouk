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

// ONE event's schedule.
// eventId: a string = that event, null = still waiting for the event to load,
// undefined = there is no such event (empty, not loading)
export function useSchedule(eventId: string | null | undefined) {
  const ready = typeof eventId === "string";
  const { data, loading, error, reload } = useCachedQuery(
    `schedule:${eventId}`,
    () => fetchSchedule(eventId as string),
    { ttl: 60_000, enabled: ready },
  );
  return {
    items: ready ? (data ?? EMPTY) : EMPTY,
    loading: eventId === null || (ready && loading),
    error: ready ? error : null,
    reload,
  };
}

// every event's items together; only for looking up saved items by id
export function useAllSchedule() {
  const { data, loading } = useCachedQuery(
    "schedule:all",
    () => fetchSchedule(),
    { ttl: 60_000 },
  );
  return { items: data ?? EMPTY, loading };
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