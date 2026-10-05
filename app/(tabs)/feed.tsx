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
import { C, F } from "@/components/street-souk-ui";

type FeedCategory = "ALL" | "DROPS" | "SCHEDULE" | "CROWD";
type FeedItem = {
  category: Exclude<FeedCategory, "ALL"> | "INFO";
  age: string;
  title: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  urgent?: boolean;
  live?: boolean;
  soldOut?: boolean;
};

const feedItems: FeedItem[] = [
  {
    category: "DROPS",
    age: "JUST NOW",
    title: "WAF EXCLUSIVE TEE DROP AT BOOTH 42",
    detail:
      "Only 50 pieces available. Line is already forming near the main stage. Get there before it’s gone.",
    icon: "flash",
    urgent: true,
    live: true,
  },
  {
    category: "SCHEDULE",
    age: "10 MINS AGO",
    title: "DJ OBI SET DELAYED",
    detail: "Due to technical difficulties, DJ Obi’s set will now start at 4:30 PM. Stay tuned.",
    icon: "time-outline",
  },
  {
    category: "CROWD",
    age: "25 MINS AGO",
    title: "FOOD COURT AT CAPACITY",
    detail:
      "The main food area is currently packed. We recommend checking out the food trucks near the East Entrance for shorter lines.",
    icon: "people-outline",
  },
  {
    category: "INFO",
    age: "1 HOUR AGO",
    title: "FREE RED BULL AT THE VIP LOUNGE",
    detail:
      "Show your festival wristband at the Red Bull tent for a complimentary energy boost. While supplies last.",
    icon: "information-circle-outline",
  },
  {
    category: "DROPS",
    age: "2 HOURS AGO",
    title: "VIVENDI X STREET SOUK HOODIE",
    detail: "All sizes are completely sold out. Thanks for the massive support!",
    icon: "storefront-outline",
    soldOut: true,
  },
];

const filters: FeedCategory[] = ["ALL", "DROPS", "SCHEDULE", "CROWD"];

export default function FeedScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FeedCategory>("ALL");
  const visibleItems = useMemo(
    () =>
      activeFilter === "ALL"
        ? feedItems
        : feedItems.filter((item) => item.category === activeFilter),
    [activeFilter],
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => router.push("/settings")}
          style={s.headerAction}
        >
          <Ionicons name="menu" size={28} color={C.green} />
        </Pressable>
        <Image
          accessibilityLabel="Street Souk"
          source={require("@/assets/images/sslogo.png")}
          style={s.logo}
          resizeMode="contain"
        />
        <View style={s.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search vendors"
            onPress={() => router.push("/(tabs)/vendors")}
            style={s.headerAction}
          >
            <Ionicons name="search" size={25} color={C.green} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open alerts"
            onPress={() => router.push("/alerts")}
            style={s.headerAction}
          >
            <Ionicons name="notifications-outline" size={21} color={C.green} />
            <View style={s.alertDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <View style={s.titleBlock}>
          <Text style={s.title}>LIVE FEED</Text>
          <Text style={s.subtitle}>STAY UPDATED. DON’T MISS SH*T.</Text>
        </View>

        <View style={s.filters}>
          {filters.map((filter) => {
            const selected = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveFilter(filter)}
                style={[s.filter, selected && s.filterActive]}
              >
                <Text style={[s.filterText, selected && s.filterTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={s.rule} />

        <View style={s.feedList}>
          {visibleItems.map((item) => (
            <FeedCard key={item.title} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.category}: ${item.title}`}
      onPress={() => router.push({ pathname: "/feed/[id]", params: { id: item.title, category: item.category, age: item.age, detail: item.detail } })}
      style={[s.card, item.urgent && s.urgentCard, item.category === "INFO" && s.infoCard]}
    >
      <View style={s.cardTop}>
        <View style={s.ageRow}>
          <Ionicons
            name={item.icon}
            size={22}
            color={item.category === "INFO" ? C.ink : C.muted}
          />
          <Text style={[s.age, item.category === "INFO" && s.inkText]}>
            {item.age}
          </Text>
        </View>
        <View style={[s.tag, item.urgent && s.urgentTag, item.category === "INFO" && s.infoTag]}>
          <Text style={[s.tagText, item.category === "INFO" && s.infoTagText]}>
            {item.urgent ? "URGENT / FLASH DROP" : item.category}
          </Text>
        </View>
      </View>
      <Text style={[s.cardTitle, item.category === "INFO" && s.inkText]}>
        {item.title}
      </Text>
      <Text style={[s.cardDetail, item.category === "INFO" && s.infoDetail]}>
        {item.detail}
      </Text>
      {item.live && (
        <View style={s.livePill}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>HAPPENING NOW</Text>
        </View>
      )}
      {item.soldOut && (
        <View style={s.soldPill}>
          <Text style={s.soldText}>SOLD OUT</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 72,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: C.line,
  },
  headerAction: { width: 36, height: 36, justifyContent: "center", position: "relative" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 2 },
  alertDot: { position: "absolute", width: 7, height: 7, borderRadius: 4, backgroundColor: C.green, right: 1, top: 3 },
  logo: { width: 142, height: 48 },
  content: { padding: 20, paddingBottom: 48 },
  titleBlock: { marginTop: 30, marginBottom: 28 },
  title: { color: C.paper, fontFamily: F.display, fontSize: 48, lineHeight: 52 },
  subtitle: { color: C.green, fontFamily: F.mono, fontSize: 11, letterSpacing: 1, marginTop: 8 },
  filters: { flexDirection: "row", gap: 9 },
  filter: { flex: 1, height: 46, borderWidth: 2, borderColor: C.panel, alignItems: "center", justifyContent: "center" },
  filterActive: { backgroundColor: C.green, borderColor: C.green },
  filterText: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  filterTextActive: { color: C.ink },
  rule: { height: 5, backgroundColor: C.green, marginTop: 19, marginBottom: 30 },
  feedList: { gap: 16 },
  card: { borderWidth: 2, borderColor: C.paper, backgroundColor: C.panel, padding: 18 },
  urgentCard: { borderColor: C.green, borderBottomWidth: 8, paddingTop: 64 },
  infoCard: { backgroundColor: C.paper, borderColor: C.paper },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  ageRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  age: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  tag: { borderWidth: 2, borderColor: C.paper, paddingHorizontal: 9, paddingVertical: 8 },
  urgentTag: { position: "absolute", right: -18, top: -48, backgroundColor: C.green, borderColor: C.green },
  infoTag: { backgroundColor: C.ink, borderColor: C.ink },
  tagText: { color: C.paper, fontFamily: F.mono, fontSize: 9 },
  infoTagText: { color: C.paper },
  cardTitle: { color: C.paper, fontFamily: F.display, fontSize: 25, lineHeight: 29, marginTop: 23 },
  cardDetail: { color: C.muted, fontFamily: F.body, fontSize: 16, lineHeight: 24, marginTop: 21 },
  infoDetail: { color: C.ink },
  inkText: { color: C.ink },
  livePill: { alignSelf: "flex-start", backgroundColor: C.green, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 8, marginTop: 24 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.ink },
  liveText: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
  soldPill: { alignSelf: "flex-start", backgroundColor: C.green, paddingHorizontal: 10, paddingVertical: 7, marginTop: 22 },
  soldText: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
});
