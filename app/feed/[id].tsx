import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { C, F } from "@/components/street-souk-ui";

export default function FeedDetailScreen() {
  const router = useRouter();
  const { id, category = "INFO", age = "JUST NOW", detail = "More information will be posted here as the festival develops." } = useLocalSearchParams<{ id: string; category: string; age: string; detail: string }>();
  const title = id ?? "LIVE UPDATE";
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={22} color={C.paper} /></Pressable>
        <Text style={s.headerTitle}>LIVE FEED / UPDATE</Text>
        <View style={s.headerMark}><View style={s.dot} /></View>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.kickerRow}><Text style={s.category}>{category}</Text><Text style={s.age}>{age}</Text></View>
        <Text style={s.title}>{title}</Text>
        <View style={s.rule} />
        <Text style={s.detail}>{detail}</Text>
        <View style={s.actions}>
          <Pressable onPress={() => router.push("/map")} style={s.action}><Ionicons name="map-outline" size={20} color={C.ink} /><Text style={s.actionText}>OPEN MAP</Text></Pressable>
          <Pressable onPress={() => router.push("/schedule")} style={[s.action, s.secondaryAction]}><Ionicons name="calendar-outline" size={20} color={C.neon} /><Text style={s.secondaryText}>VIEW SCHEDULE</Text></Pressable>
        </View>
        <View style={s.note}><Ionicons name="radio-outline" size={22} color={C.neon} /><Text style={s.noteText}>LIVE UPDATES ARE SUBJECT TO CHANGE ON SITE. KEEP THIS FEED OPEN.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { height: 64, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: C.line, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 40, height: 40, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: C.neon, fontFamily: F.mono, fontSize: 10, letterSpacing: 1 },
  headerMark: { width: 40, height: 40, borderWidth: 1, borderColor: C.neon, alignItems: "center", justifyContent: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.neon },
  content: { padding: 22, paddingBottom: 44 },
  kickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  category: { color: C.ink, backgroundColor: C.neon, fontFamily: F.mono, fontSize: 10, paddingHorizontal: 10, paddingVertical: 8 },
  age: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 43, lineHeight: 48, marginTop: 32 },
  rule: { height: 4, backgroundColor: C.neon, marginVertical: 28 },
  detail: { color: C.muted, fontFamily: F.body, fontSize: 20, lineHeight: 29 },
  actions: { gap: 10, marginTop: 34 },
  action: { minHeight: 57, backgroundColor: C.green, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  actionText: { color: C.ink, fontFamily: F.display, fontSize: 18 },
  secondaryAction: { backgroundColor: C.panel, borderWidth: 2, borderColor: C.neon },
  secondaryText: { color: C.neon, fontFamily: F.display, fontSize: 18 },
  note: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, paddingVertical: 18, flexDirection: "row", gap: 12, marginTop: 34 },
  noteText: { color: C.muted, fontFamily: F.mono, fontSize: 9, lineHeight: 16, flex: 1 },
});
