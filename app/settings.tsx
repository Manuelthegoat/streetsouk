import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { C, F } from "@/components/street-souk-ui";
import { Image as CachedImage } from "expo-image";
import { clearCache } from "@/lib/cache";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import {
  registerForPushNotifications,
  removePushToken,
  removePushTokens,
  savePushToken,
} from "@/lib/push-notifications";

function SettingRow({
  icon,
  title,
  detail,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={s.row}
    >
      <View style={s.rowIcon}>
        <Ionicons name={icon} size={20} color={value ? C.neon : C.muted} />
      </View>
      <View style={s.rowCopy}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowDetail}>{detail}</Text>
      </View>
      <View style={[s.toggle, value && s.toggleOn]}>
        <View style={[s.toggleKnob, value && s.toggleKnobOn]} />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, save } = useProfile();
  const displayName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [guidance, setGuidance] = useState(true);
  const [motion, setMotion] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function togglePushUpdates() {
    if (!user) {
      Alert.alert("Sign in required", "Sign in to connect festival alerts to your account.", [
        { text: "Not now", style: "cancel" },
        { text: "Sign in", onPress: () => router.push("/sign-in") },
      ]);
      return;
    }
    if (savingNotifications) return;
    setSavingNotifications(true);
    try {
      if (profile?.push_updates) {
        const error = await save({ push_updates: false });
        if (error) throw new Error(error);
        await removePushTokens(user.id);
      } else {
        const token = await registerForPushNotifications();
        await savePushToken(user.id, token);
        const error = await save({ push_updates: true });
        if (error) {
          await removePushToken(token);
          throw new Error(error);
        }
      }
    } catch (error) {
      Alert.alert(
        "Notification setting not updated",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSavingNotifications(false);
    }
  }

  async function handleClearCache() {
    setClearing(true);
    await clearCache();
    await CachedImage.clearDiskCache();
    await CachedImage.clearMemoryCache();
    setClearing(false);
    Alert.alert("Cache cleared", "Fresh content is loading.");
  }
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={s.back}
        >
          <Ionicons name="arrow-back" size={22} color={C.paper} />
        </Pressable>
        <Text style={s.headerTitle}>SETTINGS</Text>
        <View style={s.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.kicker}>STREET SOUK / SETTINGS</Text>
        <Text style={s.title}>YOUR ACCOUNT</Text>
        <View style={s.rule} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          onPress={() => router.push("/edit-profile")}
          style={s.profileCard}
        >
          <View style={s.profileImageFrame}>
            {profile?.avatar_url ? (
              <CachedImage
                source={{ uri: profile.avatar_url }}
                contentFit="cover"
                style={s.profileImage}
              />
            ) : (
              <View style={s.profileImagePlaceholder}>
                <Ionicons name="person" size={42} color={C.muted} />
              </View>
            )}
          </View>
          <Text style={s.profileUsername}>
            {profile?.username ? `@${profile.username}` : "CHOOSE A USERNAME"}
          </Text>
          <Text style={s.profileDisplayName}>
            {displayName || (user ? "ADD YOUR DISPLAY NAME" : "YOUR PROFILE")}
          </Text>
          <View style={s.profileEdit}>
            <Text style={s.profileEditText}>EDIT PROFILE</Text>
            <Ionicons name="arrow-forward" size={15} color={C.neon} />
          </View>
        </Pressable>
        <Pressable onPress={() => router.push("/my-souk")} style={s.mySouk}>
          <Ionicons name="heart-outline" size={20} color={C.ink} />
          <Text style={s.mySoukText}>OPEN MY SOUK</Text>
          <Ionicons name="arrow-forward" size={18} color={C.ink} />
        </Pressable>
        <Text style={s.section}>ACCOUNT PREFERENCES</Text>
        <SettingRow
          icon="notifications-outline"
          title="FESTIVAL ALERTS"
          detail={savingNotifications ? "Updating notification permission…" : "Get live updates about drops and stages."}
          value={profile?.push_updates ?? false}
          onPress={togglePushUpdates}
        />
        <SettingRow
          icon="navigate-outline"
          title="ROUTE GUIDANCE"
          detail="Keep route instructions visible on the map."
          value={guidance}
          onPress={() => setGuidance((v) => !v)}
        />
        <SettingRow
          icon="pause-outline"
          title="REDUCED MOTION"
          detail="Use calmer transitions throughout the app."
          value={motion}
          onPress={() => setMotion((v) => !v)}
        />
        <Text style={s.section}>SUPPORT</Text>
        <Pressable onPress={() => router.push("/scan")} style={s.action}>
          <Ionicons name="qr-code-outline" size={20} color={C.neon} />
          <View style={s.rowCopy}>
            <Text style={s.rowTitle}>SCAN A VENUE QR</Text>
            <Text style={s.rowDetail}>
              Set your starting point from a venue marker.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.muted} />
        </Pressable>
        <Pressable style={s.action}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={C.neon}
          />
          <View style={s.rowCopy}>
            <Text style={s.rowTitle}>ABOUT STREET SOUK</Text>
            <Text style={s.rowDetail}>
              Festival map data and app information.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.muted} />
        </Pressable>
        <Text style={s.section}>PRIVACY</Text>
        <View style={s.privacyNote}>
          <Ionicons name="lock-closed-outline" size={20} color={C.neon} />
          <Text style={s.rowDetail}>
            Manage saved app data on this device. Clearing the cache removes saved content and images; they reload when you browse again.
          </Text>
        </View>
        <Pressable
          onPress={handleClearCache}
          disabled={clearing}
          style={s.action}
        >
          <Ionicons name="trash-outline" size={20} color={C.neon} />
          <View style={s.rowCopy}>
            <Text style={s.rowTitle}>{clearing ? "CLEARING..." : "CLEAR SAVED APP DATA"}</Text>
            <Text style={s.rowDetail}>Remove cached content and images from this device.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.muted} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 72,
    borderBottomWidth: 2,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  back: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: C.neon, fontFamily: F.display, fontSize: 22 },
  headerSpacer: { width: 40 },
  content: { padding: 24, paddingBottom: 44 },
  kicker: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 38, marginTop: 5 },
  rule: { height: 2, backgroundColor: C.line, marginTop: 10, marginBottom: 30 },
  profileCard: {
    alignItems: "center",
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 17,
    marginBottom: 20,
  },
  profileImageFrame: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: C.neon,
    overflow: "hidden",
    marginBottom: 14,
  },
  profileImage: { width: "100%", height: "100%" },
  profileImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
  },
  profileUsername: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 12,
    letterSpacing: 0.7,
  },
  profileDisplayName: {
    color: C.paper,
    fontFamily: F.display,
    fontSize: 24,
    textAlign: "center",
    marginTop: 5,
  },
  profileEdit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },
  profileEditText: { color: C.neon, fontFamily: F.mono, fontSize: 9 },
  mySouk: {
    backgroundColor: C.green,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  mySoukText: { color: C.ink, fontFamily: F.display, fontSize: 18, flex: 1 },
  section: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 10,
    marginBottom: 10,
    marginTop: 8,
  },
  row: {
    minHeight: 78,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: { flex: 1 },
  rowTitle: { color: C.paper, fontFamily: F.mono, fontSize: 11 },
  rowDetail: { color: C.muted, fontFamily: F.body, fontSize: 14, marginTop: 4 },
  toggle: {
    width: 42,
    height: 23,
    borderWidth: 1,
    borderColor: C.muted,
    padding: 3,
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: C.neon, borderColor: C.neon },
  toggleKnob: { width: 15, height: 15, backgroundColor: C.muted },
  toggleKnobOn: { backgroundColor: C.ink, alignSelf: "flex-end" },
  action: {
    minHeight: 78,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
});
