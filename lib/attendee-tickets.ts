import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

export type AttendeeTicket = {
  id: string;
  name: string;
  date?: string;
  status: "VALID" | "TRANSFER_PENDING" | "USED" | "LOCKED" | string;
  qrCode?: string;
  unlocksAt?: string;
  scannedAt?: string;
};

export type TicketOrder = {
  id: string;
  ticketName: string;
  createdAt: string;
  event: {
    id: string;
    name: string;
    slug: string;
    date?: string;
    closingDate?: string;
    timezone?: string;
  };
  tickets: AttendeeTicket[];
};

export type TicketPage = { items: TicketOrder[]; nextCursor?: string };
const OWNERSHIP_KEY = "jetron-ticket-ownership:v1:";
const LEGACY_PAGE_PREFIX = "jetron-ticket-page:v1:";
const LEGACY_QR_PREFIX = "jetron-ticket-qr:v1:";

export async function lookupAttendeeTickets(options: {
  used: boolean;
  eventSlug?: string;
  cursor?: string;
  limit?: number;
}) {
  const { data, error } = await supabase.functions.invoke<TicketPage>(
    "jetron-attendee-tickets",
    { body: options },
  );
  if (error) throw error;
  if (!data || !Array.isArray(data.items)) {
    throw new Error("Jetron returned an unexpected ticket response.");
  }
  return data;
}

/** Check every Jetron ticket page for this verified buyer and event. */
export async function buyerHasTicketsForEvent(eventSlug: string) {
  for (const used of [false, true]) {
    let cursor: string | undefined;
    for (let pageNumber = 0; pageNumber < 50; pageNumber += 1) {
      const page = await lookupAttendeeTickets({
        used,
        eventSlug,
        ...(cursor ? { cursor } : {}),
        limit: 100,
      });
      if (page.items.some((order) => (order.tickets?.length ?? 0) > 0)) return true;
      if (!page.nextCursor) break;
      cursor = page.nextCursor;
    }
  }
  return false;
}

export async function readTicketOwnership(userId: string): Promise<string[] | null> {
  const raw = await AsyncStorage.getItem(OWNERSHIP_KEY + userId);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export async function saveTicketOwnership(userId: string, eventSlugs: string[]) {
  await AsyncStorage.setItem(OWNERSHIP_KEY + userId, JSON.stringify([...new Set(eventSlugs)]));
}

export async function fetchTicketOwnership(userId: string) {
  const slugs = new Set<string>();
  let cursor: string | undefined;
  // Bound pagination so a malformed cursor cannot keep a startup check running.
  for (let pageNumber = 0; pageNumber < 50; pageNumber += 1) {
    const page = await lookupAttendeeTickets({ used: false, ...(cursor ? { cursor } : {}), limit: 100 });
    for (const order of page.items) {
      if (order.event?.slug && order.tickets?.length) slugs.add(order.event.slug);
    }
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  const result = [...slugs];
  await saveTicketOwnership(userId, result);
  return result;
}

/** Remove QR and ticket detail data written by the previous local-cache version. */
export async function clearLegacyTicketCache() {
  const keys = await AsyncStorage.getAllKeys();
  const pageKeys = keys.filter((key) => key.startsWith(LEGACY_PAGE_PREFIX));
  if (Platform.OS !== "web") {
    const qrKeys = new Set<string>();
    for (const key of pageKeys) {
      const raw = await AsyncStorage.getItem(key);
      try {
        const page = JSON.parse(raw ?? "null")?.page as TicketPage | undefined;
        for (const order of page?.items ?? []) {
          for (const ticket of order.tickets ?? []) qrKeys.add(`${LEGACY_QR_PREFIX}${key.split(":")[3]}:${ticket.id}`);
        }
      } catch {
        // Ignore malformed legacy cache entries while deleting them.
      }
    }
    await Promise.all([...qrKeys].map((key) => SecureStore.deleteItemAsync(key).catch(() => {})));
  }
  if (pageKeys.length) await AsyncStorage.multiRemove(pageKeys);
}
