import { Linking } from "react-native";
import type { useRouter } from "expo-router";

const routes: Record<string, string> = {
  events: "/(tabs)/events",
  shop: "/(tabs)/shop",
  "ss-tv": "/ss-tv",
  sessions: "/sessions",
  map: "/map",
  schedule: "/schedule",
  vendors: "/vendors",
  feed: "/feed",
  tickets: "/tickets",
  passport: "/passport",
};

// a target is either a screen name from the list above or an https:// link
export function openTarget(
  router: ReturnType<typeof useRouter>,
  target: string | null | undefined,
) {
  if (!target) return;
  if (/^https?:\/\//i.test(target)) {
    Linking.openURL(target).catch(() => undefined);
    return;
  }
  const path = routes[target];
  if (path) router.push(path as never);
}
