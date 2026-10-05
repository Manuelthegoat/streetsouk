import { C, F, Header } from "@/components/street-souk-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ImageBackground,
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
    time: "14:00\n15:30",
    title: "EARLY ACCESS DROP",
    detail: "IYOO CARTEL",
    place: "HYPE TENT B",
    type: "DROP",
  },
  {
    time: "16:00\n17:00",
    title: "ZAYLEVELTEN PERFORMANCE",
    detail:
      "Performance from the talented ZAYLEVELTEN, featuring a mix of original tracks and remixes.",
    place: "MAIN STAGE",
    type: "STAGE",
  },
  {
    time: "17:30\n19:00",
    title: "DJ SET: SMADA",
    detail: "Surprise guests expected. Main area will reach capacity early.",
    place: "SOUND ARENA",
    live: true,
    type: "DJ",
  },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const { toggleSavedEvent, isEventSaved } = useStreetSoukStore();
  const visibleEvents = useMemo(() => filter === "ALL" ? EVENTS : EVENTS.filter((event) => event.type === filter), [filter]);
  return (
    <SafeAreaView style={s.safe}>
      <Header />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require("@/assets/bgss.png")}
          style={s.heroImage}
          imageStyle={s.heroImageCrop}
        >
          <View style={s.heroOverlay}>
            <Text style={s.official}>OFFICIAL</Text>
            <Text style={s.heroTitle}>LINEUP</Text>
          </View>
        </ImageBackground>
        <View style={s.infoStrip}>
          <Text style={s.infoTitle}>3 DAYS / 24 DROPS</Text>
          <Text style={s.infoText}>Times shown in local time</Text>
        </View>
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
            <View
              key={event.title}
              style={[s.event, event.live && s.liveEvent]}
            >
              <Text style={s.time}>{event.time}</Text>
              <View style={s.eventInfo}>
                {event.live && <Text style={s.live}>LIVE NOW</Text>}
                <Text style={[s.eventTitle, event.live && s.liveTitle]}>
                  {event.title}
                </Text>
                <Text
                  style={[
                    s.detail,
                    event.detail === "NEON SYNDICATE" && s.featureDetail,
                  ]}
                >
                  {event.detail}
                </Text>
                <Pressable
                  onPress={() => router.push("/map")}
                  style={s.location}
                >
                  <Ionicons name="location-outline" size={16} color={C.green} />
                  <Text style={s.locationText}>{event.place}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${isEventSaved(event.title) ? "Remove" : "Save"} ${event.title}`}
                  onPress={() => toggleSavedEvent(event.title)}
                  style={s.saveEvent}
                >
                  <Ionicons name={isEventSaved(event.title) ? "bookmark" : "bookmark-outline"} size={17} color={C.green} />
                  <Text style={s.saveEventText}>{isEventSaved(event.title) ? "SAVED" : "SAVE"}</Text>
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
  content: { padding: 24, paddingBottom: 44 },
  heroImage: {
    width: "100%",
    height: 184,
    marginTop: 18,
    marginBottom: 22,
    borderWidth: 2,
    borderColor: C.line,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroImageCrop: {
    width: "130%",
    height: "130%",
    marginLeft: -30,
    marginTop: -16,
  },
  heroOverlay: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: C.scrim,
    borderTopWidth: 2,
    borderTopColor: C.line,
  },
  official: {
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    color: C.green,
    fontFamily: F.display,
    fontSize: 40,
    letterSpacing: 1,
    lineHeight: 42,
  },
  infoStrip: {
    borderLeftWidth: 4,
    borderLeftColor: C.green,
    backgroundColor: C.panel,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 22,
  },
  infoTitle: { color: C.green, fontFamily: F.mono, fontSize: 12 },
  infoText: { color: C.muted, fontFamily: F.body, fontSize: 14, marginTop: 3 },
  filters: { gap: 8, paddingBottom: 20 },
  filter: { borderWidth: 1, borderColor: C.line, paddingHorizontal: 13, paddingVertical: 9 },
  filterActive: { backgroundColor: C.green, borderColor: C.green },
  filterText: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  filterTextActive: { color: C.ink },
  day: { borderWidth: 2, borderColor: C.line, backgroundColor: C.bg },
  dayHeader: {
    backgroundColor: C.green,
    minHeight: 74,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayTitle: { color: C.ink, fontFamily: F.display, fontSize: 34 },
  dayDate: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
  event: {
    flexDirection: "row",
    padding: 18,
    borderTopWidth: 2,
    borderTopColor: C.line,
    minHeight: 172,
  },
  liveEvent: { backgroundColor: C.panel },
  time: {
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 13,
    lineHeight: 21,
    width: 60,
  },
  eventInfo: { flex: 1 },
  live: { color: C.green, fontFamily: F.mono, fontSize: 10, marginBottom: 7 },
  eventTitle: {
    color: C.paper,
    fontFamily: F.display,
    fontSize: 22,
    lineHeight: 25,
  },
  liveTitle: { color: C.green },
  detail: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 16,
    lineHeight: 21,
    marginTop: 8,
  },
  featureDetail: { color: C.paper, fontFamily: F.mono, fontSize: 12 },
  location: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: C.green,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 14,
  },
  locationText: { color: C.green, fontFamily: F.mono, fontSize: 10 },
  saveEvent: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  saveEventText: { color: C.green, fontFamily: F.mono, fontSize: 9 },
  nextDay: {
    borderWidth: 2,
    borderColor: C.line,
    padding: 19,
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  nextDayTitle: {
    color: C.paper,
    fontFamily: F.display,
    fontSize: 30,
    flex: 1,
  },
  nextDayDate: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
});
