import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Entry = { channel: RealtimeChannel; handlers: Set<() => void> };
const channels = new Map<string, Entry>();

export function onTableChange(table: string, handler: () => void) {
  let entry = channels.get(table);
  if (!entry) {
    const handlers = new Set<() => void>();
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => handlers.forEach((h) => h()),
      )
      .subscribe();
    entry = { channel, handlers };
    channels.set(table, entry);
  }
  const current = entry;
  current.handlers.add(handler);

  return () => {
    current.handlers.delete(handler);
    if (current.handlers.size === 0) {
      supabase.removeChannel(current.channel);
      channels.delete(table);
    }
  };
}