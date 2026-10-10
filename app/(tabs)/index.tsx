import { C, F, Header } from "@/components/street-souk-ui";
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
   import { Image, ImageBackground } from "expo-image";
import { useState } from "react";
import { useFeed } from "@/hooks/use-feed";
import { timeAgo } from "@/lib/format";
import { ListRowSkeleton } from "@/components/skeleton";
import { LineupStripSkeleton } from "@/components/skeleton";
import { useLineup } from "@/hooks/use-lineup";

const categories = [
  "FOR YOU",
  "TOP STORIES",
  "STYLE",
  "SNEAKERS",
  "MUSIC",
] as const;
type HomeCategory = (typeof categories)[number];
const categoryCopy: Record<
  HomeCategory,
  {
    kicker: string;
    title: string;
    intro: string;
    hero: string;
    action: string;
    route: "/(tabs)/events" | "/(tabs)/shop" | "/ss-tv";
  }
> = {
  "FOR YOU": {
    kicker: "CULTURE MOVES HERE / LAGOS",
    title: "THE STREETSOUK\nCULTURE CLUB.",
    intro:
      "Shop independent brands. Watch the culture. Find your people. Pull up when the city comes alive.",
    hero: "THE CITY’S\nCULTURE, IN\nONE PLACE.",
    action: "EXPLORE EVENTS",
    route: "/(tabs)/events",
  },
  "TOP STORIES": {
    kicker: "THE LATEST FROM THE SOUK",
    title: "STORIES FROM\nTHE STREETS.",
    intro: "The people, ideas and moments pushing the culture forward.",
    hero: "CULTURE HAS\nA NEW POINT\nOF VIEW.",
    action: "WATCH SS TV",
    route: "/ss-tv",
  },
  STYLE: {
    kicker: "INDEPENDENT BY NATURE",
    title: "FIND YOUR\nNEXT FAVOURITE.",
    intro:
      "Meet the independent labels and makers shaping what the city wears.",
    hero: "MADE HERE.\nWORN EVERY-\nWHERE.",
    action: "SHOP THE LABELS",
    route: "/(tabs)/shop",
  },
  SNEAKERS: {
    kicker: "THE CITY’S ROTATION",
    title: "GOOD FINDS.\nGREAT STORIES.",
    intro: "Explore standout pieces and the people putting them on the map.",
    hero: "STEP INTO\nTHE STREET\nSOUK WORLD.",
    action: "EXPLORE BRANDS",
    route: "/(tabs)/shop",
  },
  MUSIC: {
    kicker: "SOUND OF THE CITY",
    title: "LAGOS NEVER\nMISSES A BEAT.",
    intro: "Discover the sounds and creative voices moving the city.",
    hero: "TUNE INTO\nWHAT’S NEXT.",
    action: "WATCH SS TV",
    route: "/ss-tv",
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<HomeCategory>("FOR YOU");
  const feature = categoryCopy[category];
  const { posts, loading } = useFeed();
  const { artists, loading: lineupLoading } = useLineup();
  const openLineup = () =>
    router.push({
      pathname: "/events/[id]",
      params: { id: "street-souk-convention", tab: "Lineup" },
    });
  const latest = posts.slice(0, 3);
  return (
    <SafeAreaView style={s.safe}>
      <Header title="HOME" />
      <ScrollView
        horizontal
        style={s.topTabs}
        contentContainerStyle={s.topTabsContent}
        showsHorizontalScrollIndicator={false}
      >
        {categories.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: category === item }}
            onPress={() => setCategory(item)}
            style={[s.topTab, category === item && s.topTabActive]}
          >
            <Text
              style={[s.topTabText, category === item && s.topTabTextActive]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.kicker}>{feature.kicker}</Text>
        <Text style={s.title}>{feature.title}</Text>
        <Text style={s.intro}>{feature.intro}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(feature.route)}
        >
          <ImageBackground
            source={require("@/assets/brands/bolacampaign.jpg")}
            imageStyle={s.heroImage}
            style={s.hero}
          >
            <View style={s.heroShade}>
              <View style={s.live}>
                <View style={s.dot} />
                <Text style={s.liveText}>
                  {category === "FOR YOU"
                    ? "THE STREET SOUK CONVENTION"
                    : category}
                </Text>
              </View>
              <View>
                <Text style={s.heroTitle}>{feature.hero}</Text>
                <View style={s.cta}>
                  <Text style={s.ctaText}>{feature.action}</Text>
                  <Ionicons name="arrow-forward" size={18} color={C.ink} />
                </View>
              </View>
            </View>
          </ImageBackground>
        </Pressable>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>HAPPENING NOW</Text>
          <Pressable onPress={() => router.push("/feed")}>
            <Text style={s.seeAll}>LIVE FEED ↗</Text>
          </Pressable>
        </View>
        {loading ? (
          <ListRowSkeleton count={2} />
        ) : latest.length > 0 ? (
          latest.map((post) => (
            <Action
              key={post.id}
              icon={post.is_urgent ? "flash" : "radio-outline"}
              label={post.title}
              detail={`${post.category} · ${timeAgo(post.published_at)}`}
              onPress={() =>
                router.push({ pathname: "/feed/[id]", params: { id: post.id } })
              }
            />
          ))
        ) : (
          <Action
            icon="radio-outline"
            label="LIVE FEED"
            detail="Real-time updates from the Convention."
            onPress={() => router.push("/feed")}
          />
        )}
        {(lineupLoading || artists.length > 0) && (
          <>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>THE LINEUP</Text>
              <Pressable onPress={openLineup}>
                <Text style={s.seeAll}>SEE ALL ↗</Text>
              </Pressable>
            </View>
            {lineupLoading ? (
              <LineupStripSkeleton />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -18 }}
                contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}
              >
                {artists.map((artist) => (
                  <Pressable
                    key={artist.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${artist.name}, view the lineup`}
                    onPress={openLineup}
                    style={s.lineupTile}
                  >
                    {artist.image_url ? (
                      <Image
                        source={{ uri: artist.image_url }}
                        style={s.lineupTileImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[s.lineupTileImage, s.lineupTileEmpty]}>
                        <Ionicons
                          name="person-outline"
                          size={34}
                          color={C.muted}
                        />
                      </View>
                    )}
                    <View style={s.lineupTileName}>
                      <Text numberOfLines={2} style={s.lineupTileText}>
                        {artist.name}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </>
        )}
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>MORE THAN A MARKET.</Text>
          <Text style={s.sectionNote}>THE STREETSOUK WORLD</Text>
        </View>
        <Action
          icon="bag-outline"
          label="THE STORE"
          detail="Independent labels. New drops."
          onPress={() => router.push("/(tabs)/shop")}
        />
        <Action
          icon="play-circle-outline"
          label="SS TV"
          detail="Films, interviews & stories."
          onPress={() => router.push("/ss-tv")}
        />
        <Action
          icon="people-outline"
          label="SS SESSIONS"
          detail="Uni tour, opportunities & community."
          onPress={() => router.push("/sessions")}
        />
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>ON THE RADAR</Text>
          <Pressable onPress={() => router.push("/(tabs)/events")}>
            <Text style={s.seeAll}>ALL EVENTS ↗</Text>
          </Pressable>
        </View>
        <Pressable
          style={s.eventCard}
          onPress={() => router.push("/(tabs)/events")}
        >
          <Text style={s.eventEyebrow}>THE FLAGSHIP EXPERIENCE</Text>
          <Text style={s.eventTitle}>STREET SOUK{"\n"}CONVENTION</Text>
          <Text style={s.eventDetail}>Brands / music / community / Lagos</Text>
          <Ionicons
            name="arrow-forward"
            size={22}
            color={C.neon}
            style={s.eventArrow}
          />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Action({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.action} onPress={onPress}>
      <View style={s.actionIcon}>
        <Ionicons name={icon} size={22} color={C.neon} />
      </View>
      <View style={s.actionCopy}>
        <Text style={s.actionTitle}>{label}</Text>
        <Text style={s.actionDetail}>{detail}</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color={C.muted} />
    </Pressable>
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
