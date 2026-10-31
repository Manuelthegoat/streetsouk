import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

export async function registerForPushNotifications(): Promise<string> {
  if (Platform.OS === "web") {
    throw new Error("Push notifications are available in the iOS and Android apps.");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Festival updates",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#39FF14",
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted
    ? current
    : await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Allow notifications in your device settings to receive festival updates.");
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error("The Expo project ID is missing from the app configuration.");

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

export async function savePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      expo_push_token: token,
      platform: Platform.OS === "ios" ? "ios" : "android",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "expo_push_token" },
  );
  if (error) throw new Error(error.message);
}

export async function removePushTokens(userId: string): Promise<void> {
  const { error } = await supabase.from("push_tokens").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function removePushToken(token: string): Promise<void> {
  const { error } = await supabase.from("push_tokens").delete().eq("expo_push_token", token);
  if (error) throw new Error(error.message);
}
