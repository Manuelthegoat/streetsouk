const API_BASE = "https://fluid.jetronticket.com/api/v1";
const API_KEY = process.env.EXPO_PUBLIC_JETRON_API_KEY;
const CHECKOUT_CALLBACK_URL = "streetsouk://tickets";

export type JetronEvent = {
  slug: string;
  name: string;
  poster?: string | null;
  imageURL?: string | null;
  startsAt?: string | null;
  date?: string | null;
  location?: string | null;
  venue?: string | null;
  currency?: string | null;
  [key: string]: unknown;
};

export type JetronTicket = {
  id?: string;
  sku?: string;
  name: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  quantityLeft?: number | null;
  maximumPurchasableTicketCount?: number | null;
  status?: string | null;
  [key: string]: unknown;
};

export type JetronReservation = {
  reservationToken: string;
  quoteReference: string;
  total: number;
  totalFees?: number;
  discount?: number;
  promoCode?: string | null;
  clientExpiresAt?: string;
};

export type JetronOrder = {
  status: "pending_payment" | "confirmed" | string;
  checkoutUrl?: string;
  reference?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_KEY) {
    throw new Error("Tickets are not configured yet. Please try again later.");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body?.message === "string"
        ? body.message
        : `Jetron request failed (${response.status}).`;
    throw new Error(message);
  }
  return (body?.data ?? body) as T;
}

export async function listJetronEvents() {
  const result = await request<{ items?: JetronEvent[] } | JetronEvent[]>(
    "/events?limit=100",
  );
  return Array.isArray(result) ? result : result.items ?? [];
}

export async function getJetronEvent(slug: string) {
  return request<JetronEvent>(`/events/${encodeURIComponent(slug)}`);
}

export async function listJetronTickets(slug: string) {
  const result = await request<{ items?: JetronTicket[] } | JetronTicket[]>(
    `/events/${encodeURIComponent(slug)}/tickets`,
  );
  return Array.isArray(result) ? result : result.items ?? [];
}

export async function reserveJetronTickets(
  slug: string,
  items: { sku: string; quantity: number }[],
  deviceId: string,
  promoCode?: string,
) {
  return request<JetronReservation>(
    `/events/${encodeURIComponent(slug)}/reservations`,
    {
      method: "POST",
      headers: { "X-Device-ID": deviceId },
      body: JSON.stringify({ items, ...(promoCode ? { promoCode } : {}) }),
    },
  );
}

export async function createJetronOrder(
  slug: string,
  reservation: JetronReservation,
  buyer: {
    email: string;
    firstName: string;
    lastName: string;
    eventName?: string;
    ticketNames?: Record<string, string>;
  },
) {
  const { eventName, ticketNames, ...customer } = buyer;
  return request<JetronOrder>(`/events/${encodeURIComponent(slug)}/orders`, {
    method: "POST",
    headers: { "X-Device-ID": reservation.reservationToken },
    body: JSON.stringify({
      quoteReference: reservation.quoteReference,
      ...customer,
      callbackUrl: CHECKOUT_CALLBACK_URL,
      metadata: {
        eventSlug: slug,
        eventName: eventName ?? slug,
        ticketNames: ticketNames ?? {},
      },
    }),
  });
}
