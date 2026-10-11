import { NewsCard, ShopCard } from "@/components/feed-cards";
import { Bone, HomeFeedSkeleton } from "@/components/skeleton";
import { C, F, Header } from "@/components/street-souk-ui";
import { useEvents } from "@/hooks/use-events";
import { useTopics } from "@/hooks/use-home";
import { useNews } from "@/hooks/use-news";
import { useProducts, type ShopProduct } from "@/hooks/use-products";
import { isPastEvent } from "@/lib/event-dates";
import type { NewsPost } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Mode = "All" | "Shop" | "Read";
const modes: Mode[] = ["All", "Shop", "Read"];

type Item =
  | { kind: "shop"; id: string; date: number; product: ShopProduct }
  | { kind: "read"; id: string; date: number; post: NewsPost };

export default function HomeScreen() {
  const router = useRouter();
  const [topicId, setTopicId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("All");
  const { topics } = useTopics();
  const { events, loading: eventsLoading } = useEvents();
  const { products, loading: productsLoading } = useProducts();
  const { posts: news, loading: newsLoading } = useNews();

  const featured = events.find((e) => !isPastEvent(e));
  const meta = featured
    ? [featured.location, featured.date_label].filter(Boolean).join(" / ")
    : "";

  // if a topic was removed in the admin while selected, fall back to FOR YOU
  const activeTopic = topics.some((t) => t.id === topicId) ? topicId : null;
  const topicLabel = (id: string | null) =>
    topics.find((t) => t.id === id)?.label;

  const tabs = [
    { id: null as string | null, label: "FOR YOU" },
    ...topics.map((t) => ({ id: t.id as string | null, label: t.label })),
  ];

  const items = useMemo(() => {
    const shop: Item[] =
      mode === "Read"
        ? []
        : products
            .filter((p) => !activeTopic || p.topic_id === activeTopic)
            .map((p) => ({
              kind: "shop" as const,
              id: p.id,
              date: new Date(p.created_at).getTime(),
              product: p,
            }));
    const read: Item[] =
      mode === "Shop"
        ? []
        : news
            .filter((n) => !activeTopic || n.topic_id === activeTopic)
            .map((n) => ({
              kind: "read" as const,
              id: n.id,
              date: new Date(n.published_at).getTime(),
              post: n,
            }));
    return [...shop, ...read].sort((a, b) => b.date - a.date);
  }, [products, news, activeTopic, mode]);

  const loading =
    (mode !== "Read" && productsLoading) || (mode !== "Shop" && newsLoading);

  return (
    <SafeAreaView style={s.safe}>
      <Header title="HOME" />
      <ScrollView
        horizontal
        style={s.topTabs}
        contentContainerStyle={s.topTabsContent}
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map((item) => {
          const selected = activeTopic === item.id;
          return (
            <Pressable
              key={item.id ?? "for-you"}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setTopicId(item.id)}
              style={[s.topTab, selected && s.topTabActive]}
            >
              <Text style={[s.topTabText, selected && s.topTabTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTopic === null &&
          (eventsLoading && !featured ? (
            <Bone height={320} />
          ) : featured ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${featured.title}`}
              onPress={() =>
                router.push({
                  pathname: "/events/[id]",
                  params: { id: featured.slug },
                })
              }
            >
              <ImageBackground
                source={
                  featured.cover_url
                    ? { uri: featured.cover_url }
                    : require("@/assets/brands/bolacampaign.jpg")
                }
                imageStyle={s.heroImage}
                style={s.hero}
              >
                <View style={s.heroShade}>
                  <View style={s.live}>
                    <View style={s.dot} />
                    <Text style={s.liveText}>
                      {featured.badge ?? "FEATURED EVENT"}
                    </Text>
                  </View>
                  <View>
                    <Text style={s.heroTitle}>{featured.title}</Text>
                    {!!meta && <Text style={s.heroMeta}>{meta}</Text>}
                    <View style={s.cta}>
                      <Text style={s.ctaText}>VIEW EVENT</Text>
                      <Ionicons name="arrow-forward" size={18} color={C.ink} />
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </Pressable>
          ) : null)}

        <View style={s.modeRow}>
          {modes.map((m) => (
            <Pressable
              key={m}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
              onPress={() => setMode(m)}
              style={[s.modeChip, mode === m && s.modeChipActive]}
            >
              <Text style={[s.modeText, mode === m && s.modeTextActive]}>
                {m.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading && items.length === 0 ? (
          <HomeFeedSkeleton />
        ) : items.length > 0 ? (
          <View style={s.feedList}>
            {items.map((item) =>
              item.kind === "shop" ? (
                <ShopCard
                  key={`p-${item.id}`}
                  product={item.product}
                  onPress={() =>
                    router.push({
                      pathname: "/vendor/[slug]",
                      params: { slug: item.product.vendors.slug },
                    })
                  }
                />
              ) : (
                <NewsCard
                  key={`n-${item.id}`}
                  post={item.post}
                  topic={topicLabel(item.post.topic_id)}
                  onPress={() =>
                    router.push({
                      pathname: "/news/[id]",
                      params: { id: item.id },
                    })
                  }
                />
              ),
            )}
          </View>
        ) : (
          <Text style={s.emptyNote}>NOTHING HERE YET. CHECK BACK SOON.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topTabs: {
    height: 49,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexGrow: 0,
  },
  topTabsContent: { paddingHorizontal: 14, alignItems: "stretch", gap: 24 },
  topTab: {
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    paddingHorizontal: 3,
  },
  topTabActive: { borderBottomColor: C.neon },
  topTabText: { color: C.muted, fontFamily: F.display, fontSize: 15 },
  topTabTextActive: { color: C.neon },
  content: { padding: 18, paddingBottom: 38 },
  kicker: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 20,
  },
  title: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 43,
    lineHeight: 47,
    marginTop: 9,
  },
  intro: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 22,
  },
  hero: {
    height: 370,
    backgroundColor: C.panel,
    borderWidth: 2,
    borderColor: C.paper,
  },
  heroImage: { opacity: 0.64 },
  heroShade: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  live: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.bg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 5, backgroundColor: C.green },
  heroMeta: {
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 10,
    marginTop: 8,
  },
  modeRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  modeChip: {
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  modeChipActive: { backgroundColor: C.neon, borderColor: C.neon },
  modeText: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  modeTextActive: { color: C.ink },
  feedList: { gap: 16, marginTop: 16 },
  emptyNote: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 11,
    textAlign: "center",
    marginTop: 34,
  },
  liveText: { color: C.paper, fontFamily: F.mono, fontSize: 9 },
  heroTitle: {
    fontFamily: F.display,
    color: C.neon,
    fontSize: 37,
    lineHeight: 40,
  },
  cta: {
    marginTop: 15,
    backgroundColor: C.green,
    padding: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ctaText: { color: C.ink, fontFamily: F.mono, fontSize: 11 },
  sectionHead: {
    marginTop: 32,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { color: C.neon, fontFamily: F.display, fontSize: 21 },
  sectionNote: { color: C.muted, fontFamily: F.mono, fontSize: 8 },
  action: {
    minHeight: 75,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: { flex: 1 },
  actionTitle: { color: C.neon, fontFamily: F.display, fontSize: 18 },
  actionDetail: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 14,
    marginTop: 2,
  },
  seeAll: { color: C.neon, fontFamily: F.mono, fontSize: 9 },
  lineupTile: {
    width: 150,
    height: 200,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  lineupTileImage: { width: "100%", height: "100%" },
  lineupTileEmpty: { alignItems: "center", justifyContent: "center" },
  lineupTileName: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  lineupTileText: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 16,
    lineHeight: 19,
  },
  eventCard: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    padding: 17,
    position: "relative",
  },
  eventEyebrow: { color: C.neon, fontFamily: F.mono, fontSize: 9 },
  eventTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 29,
    lineHeight: 32,
    marginTop: 10,
  },
  eventDetail: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 14,
    marginTop: 8,
  },
  eventArrow: { position: "absolute", right: 16, bottom: 17 },
});
