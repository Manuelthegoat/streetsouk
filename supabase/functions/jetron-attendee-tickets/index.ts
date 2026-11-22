import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders, "Cache-Control": "no-store", ...headers },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const authorization = request.headers.get("Authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) return json({ error: "Sign in to view your tickets." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const privateApiKey = Deno.env.get("JETRON_PRIVATE_API_KEY");
  if (!supabaseUrl || !anonKey || !privateApiKey) {
    console.error("Ticket lookup is missing server configuration.");
    return json({ error: "Ticket lookup is not configured." }, 500);
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  const attendeeEmail = authData.user?.email;
  if (authError || !attendeeEmail || !authData.user?.email_confirmed_at) {
    return json({ error: "Sign in with a verified email to view your tickets." }, 401);
  }

  let body: { used?: unknown; cursor?: unknown; limit?: unknown; eventSlug?: unknown };
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ error: "Invalid request body." }, 400);
    }
    body = parsed as { used?: unknown; cursor?: unknown; limit?: unknown; eventSlug?: unknown };
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  if (body.used !== undefined && typeof body.used !== "boolean") {
    return json({ error: "The used filter must be true or false." }, 400);
  }
  if (body.cursor !== undefined && (typeof body.cursor !== "string" || body.cursor.length > 4096)) {
    return json({ error: "Invalid ticket page cursor." }, 400);
  }
  if (body.eventSlug !== undefined && (
    typeof body.eventSlug !== "string" ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,254}$/.test(body.eventSlug)
  )) {
    return json({ error: "Invalid event slug." }, 400);
  }
  if (body.limit !== undefined && (!Number.isInteger(body.limit) || Number(body.limit) < 1 || Number(body.limit) > 100)) {
    return json({ error: "Ticket page size must be between 1 and 100." }, 400);
  }

  const lookupResponse = await fetch(
    "https://fluid.jetronticket.com/api/v1/attendees/tickets/lookup",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${privateApiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: attendeeEmail,
        ...(body.used !== undefined ? { used: body.used } : {}),
        ...(typeof body.eventSlug === "string" ? { eventSlug: body.eventSlug } : {}),
        ...(typeof body.cursor === "string" ? { cursor: body.cursor } : {}),
        ...(typeof body.limit === "number" ? { limit: body.limit } : {}),
      }),
    },
  ).catch((error: unknown) => {
    console.error("Could not reach Jetron ticket lookup.", error);
    return null;
  });

  if (!lookupResponse) return json({ error: "Jetron could not be reached. Try again." }, 502);
  const payload = await lookupResponse.json().catch(() => null);
  if (!lookupResponse.ok) {
    const message = typeof payload?.message === "string"
      ? payload.message
      : "Jetron could not load your tickets. Try again.";
    const retryAfter = lookupResponse.headers.get("Retry-After");
    return json(
      { error: message },
      lookupResponse.status,
      retryAfter ? { "Retry-After": retryAfter } : {},
    );
  }

  return json(payload?.data ?? payload);
});
