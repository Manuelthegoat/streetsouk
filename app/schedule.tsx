import { C, F, Header } from "@/components/street-souk-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useStreetSoukStore } from "@/context/street-souk-store";
import { groupByDay, useSchedule } from "@/hooks/use-schedule";
import { formatTimeRange } from "@/lib/format";
import { scheduleImage } from "@/lib/vendor-assets";

export default function ScheduleScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const { toggleSavedEvent, isEventSaved } = useStreetSoukStore();
  const { items, loading, error, reload } = useSchedule();
  const days = useMemo(
    () =>
      groupByDay(
        filter === "ALL" ? items : items.filter((i) => i.category === filter),
      ),
    [items, filter],
  );
  const note = { color: C.muted, fontFamily: F.mono, textAlign: "center" as const, marginTop: 30 };

  return (
    <SafeAreaView style={s.safe}>
      <Header title="SCHEDULE" />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.pageTitle}>SCHEDULE</Text>
        <Text style={s.pageSubtitle}>TIMES SHOWN IN LOCAL TIME</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          {["ALL", "DROP", "STAGE", "DJ"].map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[s.filter, filter === item && s.filterActive]}
            >
              <Text
                style={[s.filterText, filter === item && s.filterTextActive]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading && <ActivityIndicator color={C.neon} style={{ marginTop: 30 }} />}
        {error && (
          <Pressable onPress={reload}>
            <Text style={note}>COULD NOT LOAD SCHEDULE. TAP TO RETRY.</Text>
          </Pressable>
        )}

        {days.map((day) => (
          <View key={day.day} style={s.day}>
            <View style={s.dayHeader}>
              <Text style={s.dayTitle}>DAY {day.day}</Text>
              {day.label && <Text style={s.dayDate}>{day.label}</Text>}
            </View>
            {day.items.map((event) => (
              <View key={event.id} style={s.scheduleItem}>
                <Text style={s.time}>
                  {formatTimeRange(event.start_time, event.end_time)}
                </Text>
                <View style={[s.eventCard, event.is_live && s.liveEvent]}>
                  <Image
                    source={scheduleImage(event.category, event.image_url)}
                    style={s.eventImage}
                    resizeMode="cover"
                  />
                  <View style={s.eventInfo}>
                    {event.is_live && <Text style={s.live}>LIVE NOW</Text>}
                    <Text style={[s.eventTitle, event.is_live && s.liveTitle]}>
                      {event.title}
                    </Text>
                    <Pressable
                      onPress={() => router.push("/map")}
                      style={s.location}
                    >
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={C.neon}
                      />
                      <Text numberOfLines={1} style={s.locationText}>
                        {event.place}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${isEventSaved(event.id) ? "Unsave" : "Save"} ${event.title}`}
                    accessibilityState={{ selected: isEventSaved(event.id) }}
                    onPress={() => toggleSavedEvent(event.id)}
                    style={s.saveEvent}
                  >
                    <Ionicons
                      name={isEventSaved(event.id) ? "star" : "star-outline"}
                      size={21}
                      color={isEventSaved(event.id) ? C.neon : C.paper}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))}

        {!loading && !error && days.length === 0 && (
          <Text style={note}>NOTHING SCHEDULED YET.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 18, paddingBottom: 44 },
  pageTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 30,
    marginTop: 17,
  },
  pageSubtitle: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 9,
    marginTop: 4,
    marginBottom: 18,
  },
  filters: { gap: 8, paddingBottom: 17 },
  filter: {
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  filterActive: { backgroundColor: C.neon, borderColor: C.neon },
  filterText: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  filterTextActive: { color: C.ink },
  day: { backgroundColor: C.bg },
  dayHeader: {
    minHeight: 53,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    marginBottom: 16,
  },
  dayTitle: { color: C.neon, fontFamily: F.display, fontSize: 24 },
  dayDate: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
  scheduleItem: { marginBottom: 17 },
  time: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 12,
    marginBottom: 7,
    marginLeft: 2,
  },
  eventCard: {
    minHeight: 94,
    padding: 9,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  liveEvent: { borderColor: C.neon },
  eventImage: { width: 76, height: 76, backgroundColor: C.bg },
  eventInfo: { flex: 1, justifyContent: "center" },
  live: { color: C.neon, fontFamily: F.mono, fontSize: 8, marginBottom: 4 },
  eventTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 16,
    lineHeight: 19,
  },
  liveTitle: { color: C.neon },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 7,
  },
  locationText: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 8,
    flexShrink: 1,
  },
  saveEvent: {
    width: 34,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  nextDay: {
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  nextDayTitle: { color: C.neon, fontFamily: F.display, fontSize: 25, flex: 1 },
  nextDayDate: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
});
