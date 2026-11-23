import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useProfile } from "@/context/profile-context";
import { supabase } from "@/lib/supabase";

type FeedPostChange = {
  id?: string;
  event_id?: string | null;
  title?: string;
  detail?: string | null;
  is_live?: boolean;
  is_published?: boolean;
  is_urgent?: boolean;
};

export default function LiveFeedLocalNotifications() {
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (Platform.OS === "web" || loading || !profile?.push_updates) return;
    let active = true;
    let stop: (() => void) | undefined;
    const seenPostIds = new Set<string>();

    async function start() {
      const permission = await Notifications.getPermissionsAsync();
      if (!active || !permission.granted) return;

      const { data: existingPosts } = await supabase
        .from("feed_posts")
        .select("id")
        .eq("is_live", true)
        .eq("is_published", true);
      if (!active) return;
      for (const post of existingPosts ?? []) seenPostIds.add(post.id);

      const channel = supabase
        .channel("live-feed-local-notifications")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "feed_posts" },
          (change) => {
            if (!active || AppState.currentState !== "active") return;
            const post = change.new as FeedPostChange;
            if (
              !post.id ||
              !post.event_id ||
              post.is_live !== true ||
              post.is_published !== true ||
              seenPostIds.has(post.id)
            ) return;

            seenPostIds.add(post.id);
            const title = post.title ?? "Live feed update";
            void Notifications.scheduleNotificationAsync({
              content: {
                title: post.is_urgent ? `⚡ ${title}` : title,
                body: post.detail ?? "A new live update is happening now.",
                sound: "default",
                data: {
                  url: `/feed/${post.id}?event=${encodeURIComponent(post.event_id)}`,
                },
              },
              trigger: null,
            }).catch((error) => {
              console.warn("Could not show local live feed notification", error);
            });
          },
        )
        .subscribe();

      stop = () => void supabase.removeChannel(channel);
      if (!active) stop();
    }

    void start();
    return () => {
      active = false;
      stop?.();
    };
  }, [loading, profile?.push_updates]);

  return null;
}
