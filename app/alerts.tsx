import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { C, F, PageTitle } from "@/components/street-souk-ui";

const notices = [
  [
    "STAGE 1",
    "Performance starting in 10 minutes",
    "Main arena is open. Entry through the north gate.",
    "volume-high",
  ],
  [
    "DROP ALERT",
    "Yeezy x Gap live now",
    "Limited stock available at Booth 12 in the Main Hall.",
    "flash",
  ],
  [
    "SITE INFO",
    "Keep your pass visible",
    "Security checks are active at all venue entrances.",
    "information-circle",
  ],
] as const;

export default function AlertsScreen() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);

  const toggleNotifications = async () => {
    if (!enabled) {
      const permission = await Notifications.requestPermissionsAsync();
      setEnabled(permission.granted);
      return;
    }
    setEnabled(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.stackHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={s.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={C.paper} />
        </Pressable>
        <View style={s.stackTitleWrap}>
          <Image
            accessibilityLabel="Street Souk"
            source={require("@/assets/images/sslogo.png")}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.stackTitle}>ALERTS</Text>
        </View>
        <View style={s.headerStatus}>
          <View style={s.headerStatusDot} />
          <Ionicons name="notifications" size={17} color={C.neon} />
        </View>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <PageTitle eyebrow="LIVE UPDATES // ON SITE" title="ALERTS" />
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}
          onPress={toggleNotifications}
          style={[s.status, !enabled && s.statusOff]}
        >
          <View style={[s.statusDot, !enabled && s.statusDotOff]} />
          <Text style={[s.statusText, !enabled && s.statusTextOff]}>
            NOTIFICATIONS ARE {enabled ? "ON" : "OFF"}
          </Text>
          <Ionicons
            name={enabled ? "notifications" : "notifications-off-outline"}
            size={20}
            color={enabled ? C.ink : C.paper}
          />
        </Pressable>
        {notices.map(([label, title, detail, icon]) => (
          <Pressable key={title} style={s.notice}>
            <View style={s.icon}>
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={25}
                color={C.neon}
              />
            </View>
            <View style={s.noticeBody}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.noticeTitle}>{title}</Text>
              <Text style={s.detail}>{detail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={21} color={C.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  stackHeader: {
    height: 78,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stackTitleWrap: { alignItems: "center", justifyContent: "center" },
  logo: { width: 108, height: 32 },
  stackTitle: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
  },
  headerStatus: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerStatusDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.neon,
    top: 7,
    right: 7,
  },
  content: { padding: 24 },
  status: {
    backgroundColor: C.neon,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  statusOff: { backgroundColor: C.panel, borderWidth: 2, borderColor: C.line },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink },
  statusDotOff: { backgroundColor: C.paper },
  statusText: { color: C.ink, fontFamily: F.mono, fontSize: 11, flex: 1 },
  statusTextOff: { color: C.paper },
  notice: {
    borderWidth: 2,
    borderColor: C.paper,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 16,
  },
  icon: {
    width: 46,
    height: 46,
    borderWidth: 2,
    borderColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeBody: { flex: 1 },
  label: { color: C.neon, fontFamily: F.mono, fontSize: 10 },
  noticeTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 19,
    marginTop: 5,
  },
  detail: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },
});
