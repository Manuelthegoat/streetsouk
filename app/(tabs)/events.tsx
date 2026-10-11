import { EventCardSkeleton } from "@/components/skeleton";
import { C, F, Header } from "@/components/street-souk-ui";
import { useEvents } from "@/hooks/use-events";
import { isPastEvent } from "@/lib/event-dates";
import type { FestivalEvent } from "@/lib/types";
import { ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function EventCard({ event, past }: { event: FestivalEvent; past: boolean }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.title}${past ? " (past event)" : ""}`}
      style={{ marginBottom: 18 }}
      onPress={() =>
        router.push({ pathname: "/events/[id]", params: { id: event.slug } })
      }
    >
      <ImageBackground
        source={
          event.cover_url
            ? { uri: event.cover_url }
            : require("@/assets/brands/bolacampaign.jpg")
        }
        imageStyle={[s.image, past && s.pastImage]}
        style={s.card}
      >
        <View style={s.overlay}>
          {past ? (
            <View style={s.pastBadge}>
              <Text style={s.badgeText}>PAST EVENT</Text>
            </View>
          ) : event.badge ? (
            <View style={s.badge}>
              <Text style={s.badgeText}>{event.badge}</Text>
            </View>
          ) : (
            <View />
          )}
          <View>
            <Text style={s.title}>{event.title}</Text>
            <View style={s.footer}>
              <Text style={s.date}>
                {[event.location, event.date_label].filter(Boolean).join(" / ")}
              </Text>
              <Text style={s.arrow}>↗</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

export default function EventsScreen() {
  const { events, loading, error, reload } = useEvents();
  const upcoming = events.filter((e) => !isPastEvent(e));
  const past = events.filter((e) => isPastEvent(e));
  const note = {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 11,
    textAlign: "center" as const,
    marginTop: 30,
  };

  return (
    <SafeAreaView style={s.safe}>
      <Header title="EVENTS" />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.heading}>UPCOMING EVENTS</Text>

        {loading && <EventCardSkeleton />}
        {error && (
          <Pressable onPress={reload}>
            <Text style={note}>COULD NOT LOAD EVENTS. TAP TO RETRY.</Text>
          </Pressable>
        )}

        {upcoming.map((event) => (
          <EventCard key={event.id} event={event} past={false} />
        ))}

        {!loading && !error && upcoming.length === 0 && (
          <Text style={note}>
            {events.length === 0
              ? "NO EVENTS ANNOUNCED YET."
              : "NO UPCOMING EVENTS RIGHT NOW."}
          </Text>
        )}

        {past.length > 0 && (
          <>
            <Text style={[s.heading, { marginTop: 14 }]}>PAST EVENTS</Text>
            {past.map((event) => (
              <EventCard key={event.id} event={event} past />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingTop: 20 },
  heading: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 23,
    marginBottom: 14,
  },
  card: {
    height: 420,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.paper,
  },
  image: { opacity: 0.68 },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: C.paper,
  },
  badgeText: { color: C.ink, fontFamily: F.mono, fontSize: 9 },
  pastBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: C.muted,
  },
  pastImage: { opacity: 0.3 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 36, lineHeight: 39 },
  footer: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: C.paper,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: { color: C.paper, fontFamily: F.mono, fontSize: 9 },
  arrow: { color: C.neon, fontSize: 23 },
});
