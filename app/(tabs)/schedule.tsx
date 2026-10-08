import { C, F, Header } from "@/components/street-souk-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useStreetSoukStore } from "@/context/street-souk-store";

const EVENTS = [
  {
    time: "2:00 PM – 3:30 PM",
    title: "EARLY ACCESS DROP",
    place: "HYPE TENT B",
    type: "DROP",
    image: require("@/assets/brands/iyoocampaign.jpg"),
  },
  {
    time: "4:00 PM – 5:00 PM",
    title: "ZAYLEVELTEN PERFORMANCE",
    place: "MAIN STAGE",
    type: "STAGE",
    image: require("@/assets/brands/bolacampaign.jpg"),
  },
  {
    time: "5:30 PM – 7:00 PM",
    title: "DJ SET: SMADA",
    place: "SOUND ARENA",
    live: true,
    type: "DJ",
    image: require("@/assets/brands/bonfocampaign.jpg"),
  },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const { toggleSavedEvent, isEventSaved } = useStreetSoukStore();
  const visibleEvents = useMemo(() => filter === "ALL" ? EVENTS : EVENTS.filter((event) => event.type === filter), [filter]);
  return (
    <SafeAreaView style={s.safe}>
      <Header title="SCHEDULE" />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.pageTitle}>SCHEDULE</Text>
        <Text style={s.pageSubtitle}>TIMES SHOWN IN LOCAL TIME</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          {["ALL", "DROP", "STAGE", "DJ"].map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[s.filter, filter === item && s.filterActive]}>
              <Text style={[s.filterText, filter === item && s.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={s.day}>
          <View style={s.dayHeader}>
            <Text style={s.dayTitle}>DAY 1</Text>
            <Text style={s.dayDate}>SATURDAY 24TH</Text>
          </View>
          {visibleEvents.map((event) => (
            <View key={event.title} style={s.scheduleItem}>
              <Text style={s.time}>{event.time}</Text>
              <View style={[s.eventCard, event.live && s.liveEvent]}>
                <Image source={event.image} style={s.eventImage} resizeMode="cover" />
                <View style={s.eventInfo}>
                  {event.live && <Text style={s.live}>LIVE NOW</Text>}
                  <Text style={[s.eventTitle, event.live && s.liveTitle]}>{event.title}</Text>
                  <Pressable onPress={() => router.push("/(tabs)/map")} style={s.location}>
                    <Ionicons name="location-outline" size={14} color={C.green} />
                    <Text numberOfLines={1} style={s.locationText}>{event.place}</Text>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${isEventSaved(event.title) ? "Unsave" : "Save"} ${event.title}`}
                  accessibilityState={{ selected: isEventSaved(event.title) }}
                  onPress={() => toggleSavedEvent(event.title)}
                  style={s.saveEvent}
                >
                  <Ionicons name={isEventSaved(event.title) ? "star" : "star-outline"} size={21} color={isEventSaved(event.title) ? C.green : C.paper} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <View style={s.nextDay}>
          <Text style={s.nextDayTitle}>DAY 2</Text>
          <Text style={s.nextDayDate}>SUNDAY 25TH</Text>
          <Ionicons name="arrow-forward" size={22} color={C.muted} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 18, paddingBottom: 44 },
  pageTitle: { color: C.paper, fontFamily: F.display, fontSize: 30, marginTop: 17 },
  pageSubtitle: { color: C.muted, fontFamily: F.mono, fontSize: 9, marginTop: 4, marginBottom: 18 },
  filters: { gap: 8, paddingBottom: 17 },
  filter: { borderWidth: 1, borderColor: C.line, paddingHorizontal: 13, paddingVertical: 9 },
  filterActive: { backgroundColor: C.green, borderColor: C.green },
  filterText: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  filterTextActive: { color: C.ink },
  day: { backgroundColor: C.bg },
  dayHeader: { minHeight: 53, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: C.line, marginBottom: 16 },
  dayTitle: { color: C.paper, fontFamily: F.display, fontSize: 24 },
  dayDate: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
  scheduleItem: { marginBottom: 17 },
  time: { color: C.green, fontFamily: F.mono, fontSize: 12, marginBottom: 7, marginLeft: 2 },
  eventCard: { minHeight: 94, padding: 9, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, flexDirection: "row", alignItems: "center", gap: 11 },
  liveEvent: { borderColor: C.green },
  eventImage: { width: 76, height: 76, backgroundColor: C.bg },
  eventInfo: { flex: 1, justifyContent: "center" },
  live: { color: C.green, fontFamily: F.mono, fontSize: 8, marginBottom: 4 },
  eventTitle: { color: C.paper, fontFamily: F.display, fontSize: 16, lineHeight: 19 },
  liveTitle: { color: C.green },
  location: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 7 },
  locationText: { color: C.muted, fontFamily: F.mono, fontSize: 8, flexShrink: 1 },
  saveEvent: { width: 34, height: 42, alignItems: "center", justifyContent: "center" },
  nextDay: { borderWidth: 1, borderColor: C.line, padding: 16, marginTop: 13, flexDirection: "row", alignItems: "center", gap: 14 },
  nextDayTitle: { color: C.paper, fontFamily: F.display, fontSize: 25, flex: 1 },
  nextDayDate: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
});
