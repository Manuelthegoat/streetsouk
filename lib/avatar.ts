import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";

type Result = { url?: string; error?: string; cancelled?: boolean };

export async function pickAndUploadAvatar(userId: string): Promise<Result> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { error: "Allow photo access in your phone settings to choose a picture." };
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled) return { cancelled: true };

  const asset = result.assets[0];
  const contentType = asset.mimeType ?? "image/jpeg";
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const buffer = await (await fetch(asset.uri)).arrayBuffer();
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { contentType });
  if (error) return { error: error.message };

  return { url: supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl };
}