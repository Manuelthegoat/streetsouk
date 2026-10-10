import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import type { ScheduleItem } from "@/lib/types";

const EMPTY: ScheduleItem[] = [];

async function fetchSchedule() {
  const { data, error } = await supabase
    .from("schedule_items")
    .select("*")
    .order("day_number")
    .order("start_time");
  if (error) throw new Error(error.message);
  return data as ScheduleItem[];
}

export function useSchedule() {
  // schedules change on the day, so keep this one fresher
  const { data, loading, error, reload } = useCachedQuery(
    "schedule",
    fetchSchedule,
    { ttl: 60_000 },
  );
  return { items: data ?? EMPTY, loading, error, reload };
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