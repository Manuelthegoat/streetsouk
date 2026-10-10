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
import { C, F } from "@/components/street-souk-ui";
import { useFeed } from "@/hooks/use-feed";
import { timeAgo } from "@/lib/format";
import type { FeedPost } from "@/lib/types";
import { FeedSkeleton } from "@/components/skeleton";

type FeedCategory = "ALL" | "DROPS" | "SCHEDULE" | "CROWD";
const filters: FeedCategory[] = ["ALL", "DROPS", "SCHEDULE", "CROWD"];

const categoryIcons: Record<
  FeedPost["category"],
  keyof typeof Ionicons.glyphMap
> = {
  DROPS: "storefront-outline",
  SCHEDULE: "time-outline",
  CROWD: "people-outline",
  INFO: "information-circle-outline",
};

export default function FeedScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FeedCategory>("ALL");
  const { posts, loading, error, reload } = useFeed();
  const visibleItems = useMemo(
    () =>
      activeFilter === "ALL"
        ? posts
        : posts.filter((item) => item.category === activeFilter),
    [posts, activeFilter],
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
          <Ionicons name="menu" size={28} color={C.neon} />
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
            onPress={() => router.push("/vendors")}
            style={s.headerAction}
          >
            <Ionicons name="search" size={25} color={C.neon} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open alerts"
            onPress={() => router.push("/alerts")}
            style={s.headerAction}
          >
            <Ionicons name="notifications-outline" size={21} color={C.neon} />
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

       {loading && <FeedSkeleton />}
        {error && (
          <Pressable onPress={reload}>
            <Text
              style={{
                color: C.muted,
                fontFamily: F.mono,
                textAlign: "center",
                marginTop: 30,
              }}
            >
              COULD NOT LOAD FEED. TAP TO RETRY.
            </Text>
          </Pressable>
        )}

        <View style={s.feedList}>
          {visibleItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </View>

        {!loading && !error && visibleItems.length === 0 && (
          <Text
            style={{
              color: C.muted,
              fontFamily: F.mono,
              textAlign: "center",
              marginTop: 30,
            }}
          >
            NOTHING POSTED YET.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedCard({ item }: { item: FeedPost }) {
  const router = useRouter();
  const isInfo = item.category === "INFO";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.category}: ${item.title}`}
      onPress={() =>
        router.push({ pathname: "/feed/[id]", params: { id: item.id } })
      }
      style={[s.card, item.is_urgent && s.urgentCard, isInfo && s.infoCard]}
    >
      <View style={s.cardTop}>
        <View style={s.ageRow}>
          <Ionicons
            name={item.is_urgent ? "flash" : categoryIcons[item.category]}
            size={22}
            color={isInfo ? C.ink : C.muted}
          />
          <Text style={[s.age, isInfo && s.inkText]}>
            {timeAgo(item.published_at)}
          </Text>
        </View>
        <View
          style={[s.tag, item.is_urgent && s.urgentTag, isInfo && s.infoTag]}
        >
          <Text style={[s.tagText, isInfo && s.infoTagText]}>
            {item.is_urgent ? "URGENT / FLASH DROP" : item.category}
          </Text>
        </View>
      </View>
      <Text style={[s.cardTitle, isInfo && s.inkText]}>{item.title}</Text>
      <Text style={[s.cardDetail, isInfo && s.infoDetail]}>{item.detail}</Text>
      {item.is_live && (
        <View style={s.livePill}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>HAPPENING NOW</Text>
        </View>
      )}
      {item.is_sold_out && (
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
  headerAction: {
    width: 36,
    height: 36,
    justifyContent: "center",
    position: "relative",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 2 },
  alertDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.neon,
    right: 1,
    top: 3,
  },
  logo: { width: 142, height: 48 },
  content: { padding: 20, paddingBottom: 48 },
  titleBlock: { marginTop: 30, marginBottom: 28 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 48, lineHeight: 52 },
  subtitle: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 8,
  },
  filters: { flexDirection: "row", gap: 9 },
  filter: {
    flex: 1,
    height: 46,
    borderWidth: 2,
    borderColor: C.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  filterActive: { backgroundColor: C.neon, borderColor: C.neon },
  filterText: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  filterTextActive: { color: C.ink },
  rule: { height: 5, backgroundColor: C.neon, marginTop: 19, marginBottom: 30 },
  feedList: { gap: 16 },
  card: {
    borderWidth: 2,
    borderColor: C.paper,
    backgroundColor: C.panel,
    padding: 18,
  },
  urgentCard: { borderColor: C.neon, borderBottomWidth: 8, paddingTop: 64 },
  infoCard: { backgroundColor: C.paper, borderColor: C.paper },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  ageRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  age: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  tag: {
    borderWidth: 2,
    borderColor: C.paper,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  urgentTag: {
    position: "absolute",
    right: -18,
    top: -48,
    backgroundColor: C.neon,
    borderColor: C.neon,
  },
  infoTag: { backgroundColor: C.ink, borderColor: C.ink },
  tagText: { color: C.paper, fontFamily: F.mono, fontSize: 9 },
  infoTagText: { color: C.paper },
  cardTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 25,
    lineHeight: 29,
    marginTop: 23,
  },
  cardDetail: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 21,
  },
  infoDetail: { color: C.ink },
  inkText: { color: C.ink },
  livePill: {
    alignSelf: "flex-start",
    backgroundColor: C.neon,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 24,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.ink },
  liveText: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
  soldPill: {
    alignSelf: "flex-start",
    backgroundColor: C.neon,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 22,
  },
  soldText: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
});
