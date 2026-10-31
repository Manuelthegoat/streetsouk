import { C, F, Header } from "@/components/street-souk-ui";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const rows = [
  ["MY SOUK", "Wishlist, saved brands & plans", "heart-outline", "/my-souk"],
  [
    "SS PASSPORT",
    "Your convention brand stamps",
    "qr-code-outline",
    "/passport",
  ],
  ["ORDERS", "Your StreetSouk purchases", "bag-outline", "/my-souk"],
  [
    "NOTIFICATIONS",
    "The latest from the Souk",
    "notifications-outline",
    "/alerts",
  ],
  ["SETTINGS", "Make the app yours", "settings-outline", "/settings"],
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You can sign back in any time with a new code.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() },
    ]);

  return (
    <SafeAreaView style={s.safe}>
      <Header title="PROFILE" />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.kicker}>YOUR STREET SOUK</Text>
        <Text style={s.title}>PROFILE</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={user ? "Edit profile" : "Sign in"}
          onPress={() => router.push(user ? "/edit-profile" : "/sign-in")}
          style={s.identity}
        >
          <View style={s.identityTop}>
            <Text style={s.identityEyebrow}>YOUR STREET SOUK ID</Text>
            <Ionicons name="arrow-up-right" size={19} color={C.neon} />
          </View>
          <View style={[s.avatar, { overflow: "hidden" }]}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Ionicons
                name="person"
                size={31}
                color={user ? C.neon : C.muted}
              />
            )}
          </View>
          <Text style={s.identityUsername} numberOfLines={1}>
            {user
              ? profile?.username
                ? `@${profile.username}`
                : "CHOOSE A USERNAME"
              : "SIGN IN TO CREATE YOUR PROFILE"}
          </Text>
          <Text style={s.name} numberOfLines={1}>
            {user ? fullName || "ADD YOUR DISPLAY NAME" : "WELCOME TO THE SOUK"}
          </Text>
          <Text style={s.identityAction}>VIEW OR EDIT PROFILE</Text>
        </Pressable>

        <Text style={s.section}>YOUR ACCOUNT</Text>
        {user && (
          <Pressable style={s.row} onPress={() => router.push("/edit-profile")}>
            <Ionicons name="create-outline" size={22} color={C.paper} />
            <View style={s.copy}>
              <Text style={s.rowTitle}>EDIT PROFILE</Text>
              <Text style={s.rowDetail}>Picture, name, username and bio</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={C.muted} />
          </Pressable>
        )}
        {rows.map(([title, detail, icon, path]) => (
          <Pressable
            key={title}
            style={s.row}
            onPress={() => router.push(path)}
          >
            <Ionicons name={icon} size={22} color={C.paper} />
            <View style={s.copy}>
              <Text style={s.rowTitle}>{title}</Text>
              <Text style={s.rowDetail}>{detail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={C.muted} />
          </Pressable>
        ))}
        {user && (
          <Pressable style={s.row} onPress={confirmSignOut}>
            <Ionicons name="log-out-outline" size={22} color={C.paper} />
            <View style={s.copy}>
              <Text style={s.rowTitle}>SIGN OUT</Text>
              <Text style={s.rowDetail}>{user.email}</Text>
            </View>
          </Pressable>
        )}
        <Text style={s.section}>THE STREET SOUK COMMUNITY</Text>
        <Pressable
          style={s.community}
          onPress={() => router.push("/(tabs)/events")}
        >
          <Text style={s.communityTitle}>SHOW UP FOR THE CULTURE.</Text>
          <Text style={s.communityDetail}>
            Explore the convention, find a new label, and make the city yours.
          </Text>
          <Text style={s.communityLink}>EXPLORE EVENTS ↗</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 18, paddingBottom: 38 },
  kicker: { color: C.neon, fontFamily: F.mono, fontSize: 9, marginTop: 20 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 43, marginTop: 4 },
  identity: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 19,
    backgroundColor: C.panel,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.line,
  },
  identityTop: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  identityEyebrow: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 9,
    letterSpacing: 1,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: C.neon,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  identityUsername: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 11,
    letterSpacing: 0.7,
    textAlign: "center",
  },
  name: {
    color: C.paper,
    fontFamily: F.display,
    fontSize: 25,
    textAlign: "center",
    marginTop: 5,
  },
  identityAction: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 8,
    letterSpacing: 0.8,
    marginTop: 12,
  },
  section: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 9,
    marginTop: 30,
    marginBottom: 8,
  },
  row: {
    minHeight: 68,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  copy: { flex: 1 },
  rowTitle: { color: C.neon, fontFamily: F.display, fontSize: 16 },
  rowDetail: { color: C.muted, fontFamily: F.body, fontSize: 13, marginTop: 2 },
  community: {
    backgroundColor: C.panel,
    borderLeftWidth: 3,
    borderLeftColor: C.neon,
    padding: 16,
  },
  communityTitle: { color: C.neon, fontFamily: F.display, fontSize: 19 },
  communityDetail: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  communityLink: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 9,
    marginTop: 13,
  },
});
