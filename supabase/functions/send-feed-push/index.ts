import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-live-feed-push-secret",
};

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const body = await req.json();
    const expectedWebhookSecret = Deno.env.get("LIVE_FEED_PUSH_WEBHOOK_SECRET") ?? "";
    const suppliedWebhookSecret = req.headers.get("x-live-feed-push-secret") ?? "";
    const isDatabaseWebhook =
      expectedWebhookSecret.length > 0 &&
      constantTimeEqual(suppliedWebhookSecret, expectedWebhookSecret);

    if (isDatabaseWebhook) {
      if (
        body.schema !== "public" ||
        body.table !== "feed_posts" ||
        !["INSERT", "UPDATE"].includes(body.type)
      ) {
        return json({ error: "Unsupported database webhook payload" }, 400);
      }
      const record = body.record;
      const oldRecord = body.old_record;
      const becameLive =
        record?.is_live === true &&
        record?.is_published === true &&
        typeof record?.event_id === "string" &&
        (body.type === "INSERT" ||
          oldRecord?.is_live !== true ||
          oldRecord?.is_published !== true ||
          oldRecord?.event_id !== record.event_id);
      if (!becameLive) return json({ sent: 0, skipped: "post_not_newly_live_for_event" });
    } else {
      const authorization = req.headers.get("Authorization");
      if (!authorization) return json({ error: "Unauthorized" }, 401);

      const caller = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authorization } },
      });
      const { data: userData, error: userError } = await caller.auth.getUser();
      if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);
      const { data: isAdmin, error: adminError } = await caller.rpc("is_admin");
      if (adminError || isAdmin !== true) return json({ error: "Forbidden" }, 403);
    }

    const postId = isDatabaseWebhook
      ? body.record.id
      : typeof body.post_id === "string"
        ? body.post_id
        : "";
    if (!postId) return json({ error: "post_id is required" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: post, error: postError } = await admin
      .from("feed_posts")
      .select("id, event_id, category, title, detail, is_urgent, is_published, is_live")
      .eq("id", postId)
      .maybeSingle();
    if (postError) throw postError;
    if (!post || !post.is_published) return json({ error: "Published post not found" }, 404);
    if (!post.is_live || !post.event_id) {
      return json({ sent: 0, skipped: "post_is_not_live_for_an_event" });
    }

    const { data: previousDelivery, error: deliveryCheckError } = await admin
      .from("feed_push_deliveries")
      .select("post_id")
      .eq("post_id", post.id)
      .maybeSingle();
    if (deliveryCheckError) throw deliveryCheckError;
    if (previousDelivery) return json({ sent: 0, already_sent: true });

    const { data: optedInProfiles, error: profilesError } = await admin
      .from("profiles")
      .select("id")
      .eq("push_updates", true);
    if (profilesError) throw profilesError;
    const userIds = (optedInProfiles ?? []).map((profile) => profile.id);
    if (!userIds.length) {
      const { error } = await admin.from("feed_push_deliveries").insert({ post_id: post.id });
      if (error && error.code !== "23505") throw error;
      return json({ sent: 0 });
    }

    const { data: tokens, error: tokenError } = await admin
      .from("push_tokens")
      .select("user_id, expo_push_token")
      .in("user_id", userIds);
    if (tokenError) throw tokenError;

    const url = `/feed/${post.id}${post.event_id ? `?event=${encodeURIComponent(post.event_id)}` : ""}`;
    const messages = (tokens ?? []).map(({ expo_push_token }) => ({
      to: expo_push_token,
      title: post.is_urgent ? `⚡ ${post.title}` : post.title,
      body: (post.detail ?? "").length > 180 ? `${post.detail.slice(0, 177)}…` : post.detail ?? "",
      sound: "default",
      data: { url, postId: post.id, category: post.category },
      priority: post.is_urgent ? "high" : "default",
      channelId: "default",
    }));

    let sent = 0;
    const invalidTokens: string[] = [];
    for (let index = 0; index < messages.length; index += 100) {
      const chunk = messages.slice(index, index + 100);
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chunk),
      });
      if (!response.ok) throw new Error(`Expo push service returned ${response.status}`);
      const result = await response.json();
      for (let i = 0; i < (result.data ?? []).length; i++) {
        const ticket = result.data[i];
        if (ticket.status === "ok") sent++;
        if (ticket.details?.error === "DeviceNotRegistered") {
          invalidTokens.push(chunk[i].to);
        } else if (ticket.status === "error") {
          throw new Error(`Expo push failed: ${ticket.message ?? ticket.details?.error ?? "Unknown error"}`);
        }
      }
    }

    if (invalidTokens.length) {
      await admin.from("push_tokens").delete().in("expo_push_token", invalidTokens);
    }
    const { error: deliveryError } = await admin
      .from("feed_push_deliveries")
      .insert({ post_id: post.id });
    if (deliveryError && deliveryError.code !== "23505") throw deliveryError;
    return json({ sent, targeted: messages.length });
  } catch (error) {
    console.error("send-feed-push failed", error);
    return json({ error: error instanceof Error ? error.message : "Push delivery failed" }, 500);
  }
});
