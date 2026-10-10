import { C, F } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";
import { useSchedule } from "@/hooks/use-schedule";
import { useVendors } from "@/hooks/use-vendors";
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
import { ListRowSkeleton } from "@/components/skeleton";

export default function MySoukScreen() {
  const router = useRouter();
  const { favorites, savedEvents, startingPoint } = useStreetSoukStore();
  const { vendors, loading: vendorsLoading } = useVendors();
  const favoriteVendors = vendors.filter((v) => favorites.includes(v.slug));
  const { items: scheduleItems, loading: scheduleLoading } = useSchedule();
  const savedScheduleItems = scheduleItems.filter((i) =>
    savedEvents.includes(i.id),
  );

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
            <Text style={s.statValue}>{favoriteVendors.length}</Text>
            <Text style={s.statLabel}>SAVED VENDORS</Text>
          </View>
          <View>
            <Text style={s.statValue}>{savedScheduleItems.length}</Text>
            <Text style={s.statLabel}>SAVED EVENTS</Text>
          </View>
        </View>
        <Text style={s.section}>SAVED VENDORS</Text>
        {vendorsLoading && favorites.length > 0 ? (
  <ListRowSkeleton count={Math.min(favorites.length, 3)} />
) : favoriteVendors.length ? (
          favoriteVendors.map((vendor) => (
            <Pressable
              key={vendor.id}
              style={s.row}
              onPress={() =>
                router.push({
                  pathname: "/vendor/[slug]",
                  params: { slug: vendor.slug },
                })
              }
            >
              <Ionicons name="heart" size={19} color={C.neon} />
              <Text style={s.rowText}>{vendor.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </Pressable>
          ))
        ) : (
          <Empty text="SAVE VENDORS FROM THE DIRECTORY TO SEE THEM HERE." />
        )}
        <Text style={s.section}>SAVED EVENTS</Text>
        {scheduleLoading && savedEvents.length > 0 ? (
  <ListRowSkeleton count={Math.min(savedEvents.length, 3)} />
) : savedScheduleItems.length ? (
          savedScheduleItems.map((event) => (
            <Pressable
              key={event.id}
              style={s.row}
              onPress={() => router.push("/schedule")}
            >
              <Ionicons name="bookmark" size={19} color={C.neon} />
              <Text style={s.rowText}>{event.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </Pressable>
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
    fontSize: 20,
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
