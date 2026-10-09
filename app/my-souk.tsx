import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { C, F } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";

export default function MySoukScreen() {
  const router = useRouter();
  const { favorites, savedEvents, startingPoint } = useStreetSoukStore();
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
        <Text style={s.headerTitle}>MY SOUK</Text>
        <View style={s.spacer} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.kicker}>YOUR FESTIVAL SHORTLIST</Text>
        <Text style={s.title}>MY SOUK</Text>
        <View style={s.rule} />
        <View style={s.stats}>
          <View>
            <Text style={s.statValue}>{favorites.length}</Text>
            <Text style={s.statLabel}>SAVED VENDORS</Text>
          </View>
          <View>
            <Text style={s.statValue}>{savedEvents.length}</Text>
            <Text style={s.statLabel}>SAVED EVENTS</Text>
          </View>
        </View>
        <Text style={s.section}>SAVED VENDORS</Text>
        {favorites.length ? (
          favorites.map((vendor) => (
            <View key={vendor} style={s.row}>
              <Ionicons name="heart" size={19} color={C.neon} />
              <Text style={s.rowText}>{vendor}</Text>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </View>
          ))
        ) : (
          <Empty text="SAVE VENDORS FROM THE DIRECTORY TO SEE THEM HERE." />
        )}
        <Text style={s.section}>SAVED EVENTS</Text>
        {savedEvents.length ? (
          savedEvents.map((event) => (
            <View key={event} style={s.row}>
              <Ionicons name="bookmark" size={19} color={C.neon} />
              <Text style={s.rowText}>{event}</Text>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </View>
          ))
        ) : (
          <Empty text="SAVE SCHEDULE EVENTS TO BUILD YOUR DAY." />
        )}
        <View style={s.start}>
          <Text style={s.startLabel}>STARTING POINT</Text>
          <Text style={s.startValue}>{startingPoint}</Text>
          <Pressable onPress={() => router.push("/map")}>
            <Text style={s.change}>CHANGE ON MAP →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <Ionicons name="add-circle-outline" size={21} color={C.muted} />
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  spacer: { width: 40 },
  content: { padding: 22, paddingBottom: 48 },
  kicker: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 44, marginTop: 5 },
  rule: { height: 3, backgroundColor: C.neon, marginTop: 15, marginBottom: 25 },
  stats: { flexDirection: "row", gap: 10, marginBottom: 30 },
  statValue: { color: C.neon, fontFamily: F.display, fontSize: 32 },
  statLabel: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
  section: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 19,
    marginTop: 14,
    marginBottom: 10,
  },
  row: {
    minHeight: 54,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowText: { color: C.paper, fontFamily: F.mono, fontSize: 11, flex: 1 },
  empty: {
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  emptyText: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 9,
    lineHeight: 14,
    flex: 1,
  },
  start: {
    backgroundColor: C.panel,
    borderLeftWidth: 4,
    borderLeftColor: C.neon,
    padding: 16,
    marginTop: 30,
  },
  startLabel: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
  startValue: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 20,
    marginTop: 5,
  },
  change: { color: C.neon, fontFamily: F.mono, fontSize: 10, marginTop: 14 },
});
