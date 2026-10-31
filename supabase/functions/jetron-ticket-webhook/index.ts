import { createClient } from "npm:@supabase/supabase-js@2";

type JetronWebhookOrder = {
  sku?: string;
  amount?: number;
  formattedAmount?: string;
  quantity?: number;
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
};

type JetronPurchase = {
  eventId?: string;
  reference?: string;
  amount?: number;
  formattedAmount?: string;
  paidAt?: string;
  orders?: JetronWebhookOrder[];
  metadata?: {
    eventSlug?: string;
    eventName?: string;
    ticketNames?: Record<string, string>;
  };
};

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function verifyJetronSignature(rawBody: string, signature: string | null) {
  const privateKey = Deno.env.get("JETRON_PRIVATE_API_KEY");
  if (!privateKey) throw new Error("JETRON_PRIVATE_API_KEY is not configured.");
  if (!signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(privateKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );

  return constantTimeEqual(toHex(new Uint8Array(digest)), signature.trim().toLowerCase());
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const rawBody = await request.text();
  let verified: boolean;
  try {
    verified = await verifyJetronSignature(
      rawBody,
      request.headers.get("x-jetron-signature"),
    );
  } catch (error) {
    console.error("Jetron webhook verification is not configured.", error);
    return Response.json({ error: "Webhook verification is unavailable." }, { status: 500 });
  }

  if (!verified) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: { eventType?: string; data?: JetronPurchase | { reference?: string } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.eventType === "WEBHOOK_TEST") {
    return Response.json({ ok: true });
  }
  if (body.eventType !== "TICKET_PURCHASED") {
    return Response.json({ ok: true, ignored: true });
  }

  const purchase = body.data as JetronPurchase | undefined;
  if (!purchase?.reference || !Array.isArray(purchase.orders)) {
    return Response.json({ error: "Purchase payload is incomplete." }, { status: 400 });
  }

  const eventSlug = purchase.metadata?.eventSlug ?? "streetsouk-2026";
  const eventName = purchase.metadata?.eventName ?? "Street Souk 2026";
  const ticketNames = purchase.metadata?.ticketNames ?? {};
  const zeroDate = "0001-01-01T00:00:00Z";
  const paidAt = purchase.paidAt && purchase.paidAt !== zeroDate
    ? purchase.paidAt
    : null;
  const rows = purchase.orders.map((order, recipientIndex) => ({
    reference: purchase.reference,
    recipient_index: recipientIndex,
    event_id: purchase.eventId ?? null,
    event_slug: eventSlug,
    event_name: eventName,
    sku: order.sku ?? null,
    ticket_name: (order.sku && ticketNames[order.sku]) || order.sku || null,
    quantity: Math.max(1, Math.floor(order.quantity ?? 1)),
    amount: order.amount ?? purchase.amount ?? null,
    formatted_amount: order.formattedAmount ?? purchase.formattedAmount ?? null,
    attendee_first_name: order.customer?.firstName ?? null,
    attendee_last_name: order.customer?.lastName ?? null,
    attendee_email: order.customer?.email ?? null,
    attendee_phone: order.customer?.phone ?? null,
    paid_at: paidAt,
  }));

  if (rows.length === 0) return Response.json({ ok: true, recorded: 0 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase service credentials are not configured.");
    return Response.json({ error: "Ticket storage is unavailable." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase
    .from("ticket_attendees")
    .upsert(rows, { onConflict: "reference,recipient_index" });

  if (error) {
    console.error("Could not store Jetron ticket attendees.", error.message);
    return Response.json({ error: "Ticket storage failed." }, { status: 500 });
  }

  return Response.json({ ok: true, recorded: rows.length });
});
