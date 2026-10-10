import { C, F } from "@/components/street-souk-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useStreetSoukStore } from "@/context/street-souk-store";
import { useVendors } from "@/hooks/use-vendors";
import { vendorImage } from "@/lib/vendor-assets";
import { groupByDay, useSchedule } from "@/hooks/use-schedule";
import { useFaqs } from "@/hooks/use-faqs";
import { formatTimeRange } from "@/lib/format";
import { scheduleImage } from "@/lib/vendor-assets";
import {
  FaqSkeleton,
  ImageRowSkeleton,
  ScheduleSkeleton,
} from "@/components/skeleton";

const tabs = ["Event Map", "Schedule", "Marketplace", "Lineup", "FAQ"] as const;
type EventTab = (typeof tabs)[number];

export default function EventDetailScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EventTab>("Event Map");
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to events"
          onPress={() => router.back()}
          style={s.headerAction}
        >
          <Ionicons name="arrow-back" size={23} color={C.paper} />
        </Pressable>
        <Image
          accessibilityLabel="Street Souk"
          source={require("@/assets/images/sslogo.png")}
          contentFit="contain"
          style={s.logo}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open cart"
          onPress={() => router.push("/cart")}
          style={[s.headerAction, s.cart]}
        >
          <Ionicons name="cart-outline" size={23} color={C.paper} />
        </Pressable>
      </View>
      <ScrollView
        horizontal
        style={s.tabs}
        contentContainerStyle={s.tabsContent}
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            onPress={() => setActiveTab(tab)}
            style={[s.tab, activeTab === tab && s.tabActive]}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab !== "Marketplace" && (
          <>
            <Text style={s.eventName}>STREET SOUK CONVENTION</Text>
            <Text style={s.eventMeta}>LAGOS, NIGERIA / DATE TBA</Text>
            <View style={s.rule} />
          </>
        )}
        {activeTab === "Event Map" && (
          <Feature
            icon="map-outline"
            eyebrow="PLAN YOUR VISIT"
            title="EVENT MAP"
            body="Explore the Convention floor plan and find your way around."
            action="OPEN EVENT MAP"
            onPress={() => router.push("/map")}
          />
        )}
        {activeTab === "Schedule" && <ScheduleContent />}
        {activeTab === "Marketplace" && <MarketplaceContent />}
        {activeTab === "Lineup" && (
          <View style={s.coming}>
            <Ionicons name="musical-notes-outline" size={27} color={C.neon} />
            <Text style={s.comingTitle}>LINEUP COMING SOON</Text>
            <Text style={s.body}>
              We’ll share performers, sets and appearances here as they’re
              announced.
            </Text>
          </View>
        )}
        {activeTab === "FAQ" && <Faq />}
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({
  icon,
  eyebrow,
  title,
  body,
  action,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  eyebrow: string;
  title: string;
  body: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={s.feature}>
      <View style={s.featureIcon}>
        <Ionicons name={icon} size={25} color={C.neon} />
      </View>
      <Text style={s.eyebrow}>{eyebrow}</Text>
      <Text style={s.featureTitle}>{title}</Text>
      <Text style={s.body}>{body}</Text>
      <Pressable style={s.button} onPress={onPress}>
        <Text style={s.buttonText}>{action}</Text>
        <Ionicons name="arrow-forward" size={18} color={C.ink} />
      </Pressable>
    </View>
  );
}



function ScheduleContent() {
  const [filter, setFilter] = useState("ALL");
  const { toggleSavedEvent, isEventSaved } = useStreetSoukStore();
  const { items, loading, error, reload } = useSchedule();
  const days = groupByDay(
    filter === "ALL" ? items : items.filter((i) => i.category === filter),
  );
  return (
    <View>
      <Text style={s.sectionEyebrow}>TIMES SHOWN IN LOCAL TIME</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scheduleFilters}
      >
        {["ALL", "DROP", "STAGE", "DJ"].map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[
              s.scheduleFilter,
              filter === item && s.scheduleFilterActive,
            ]}
          >
            <Text
              style={[
                s.scheduleFilterText,
                filter === item && s.scheduleFilterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
     {loading && <ScheduleSkeleton />}
      {error && (
        <Pressable onPress={reload}>
          <Text style={s.sectionEyebrow}>COULD NOT LOAD SCHEDULE. TAP TO RETRY.</Text>
        </Pressable>
      )}
      {days.map((day) => (
        <View key={day.day}>
          <View style={s.scheduleDay}>
            <Text style={s.scheduleDayTitle}>DAY {day.day}</Text>
            {day.label && <Text style={s.scheduleDayDate}>{day.label}</Text>}
          </View>
          {day.items.map((item) => (
            <View key={item.id} style={s.scheduleItem}>
              <Text style={s.scheduleTime}>
                {formatTimeRange(item.start_time, item.end_time)}
              </Text>
              <View style={s.scheduleCard}>
                <Image
                  source={scheduleImage(item.category, item.image_url)}
                  style={s.scheduleImage}
                  contentFit="cover"
                />
                <View style={s.scheduleCopy}>
                  <Text style={s.scheduleTitle}>{item.title}</Text>
                  <View style={s.scheduleLocation}>
                    <Ionicons name="location-outline" size={13} color={C.neon} />
                    <Text numberOfLines={1} style={s.schedulePlace}>
                      {item.place}
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${isEventSaved(item.id) ? "Unsave" : "Save"} ${item.title}`}
                  accessibilityState={{ selected: isEventSaved(item.id) }}
                  onPress={() => toggleSavedEvent(item.id)}
                  style={s.scheduleStar}
                >
                  <Ionicons
                    name={isEventSaved(item.id) ? "star" : "star-outline"}
                    size={21}
                    color={isEventSaved(item.id) ? C.neon : C.paper}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}



function MarketplaceContent() {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useStreetSoukStore();
  const { vendors, loading, error, reload } = useVendors();
  const [filter, setFilter] = useState<"ALL" | "FAVORITES" | "SPONSORS">("ALL");
  const [query, setQuery] = useState("");
  const filtered = vendors.filter((vendor) => {
    const matchesFilter =
      filter === "ALL" ||
      (filter === "FAVORITES" ? isFavorite(vendor.slug) : vendor.is_sponsor);
    const matchesSearch =
      `${vendor.name} ${vendor.category} ${vendor.booth ?? ""} ${vendor.detail ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    return matchesFilter && matchesSearch;
  });
  return (
    <View style={s.marketplace}>
      <View style={s.filterRow}>
        <View style={s.filterSpacer} />
        {(["ALL", "FAVORITES", "SPONSORS"] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === item }}
            onPress={() => setFilter(item)}
            style={[s.marketFilter, filter === item && s.marketFilterActive]}
          >
            <Text
              style={[
                s.marketFilterText,
                filter === item && s.marketFilterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.marketSearch}>
        <Ionicons name="search" size={19} color={C.muted} />
        <TextInput
          accessibilityLabel="Search for vendors and brands"
          value={query}
          onChangeText={setQuery}
          placeholder="Search for vendors & brands"
          placeholderTextColor={C.muted}
          style={s.marketSearchInput}
        />
        {query.length > 0 && (
          <Pressable
            accessibilityLabel="Clear search"
            onPress={() => setQuery("")}
          >
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </Pressable>
        )}
      </View>
     {loading && <ImageRowSkeleton count={4} />}
      <View style={s.marketList}>
        {filtered.map((vendor) => (
          <View key={vendor.id} style={s.brandCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${vendor.name}`}
              onPress={() =>
                router.push({
                  pathname: "/vendor/[slug]",
                  params: { slug: vendor.slug },
                })
              }
              style={s.brandCardMain}
            >
              <Image
                source={vendorImage(vendor.slug, "campaign", vendor.campaign_url)}
                contentFit="cover"
                style={s.brandCardImage}
              />
              <View style={s.brandCardCopy}>
                <Text numberOfLines={1} style={s.brandCardName}>
                  {vendor.name}
                </Text>
                {vendor.booth && (
                  <View style={s.brandLocation}>
                    <Ionicons name="location-outline" size={12} color={C.neon} />
                    <Text style={s.brandLocationText}>
                      BOOTH {vendor.booth}
                    </Text>
                  </View>
                )}
                <Text numberOfLines={2} style={s.brandDescription}>
                  {vendor.detail}
                </Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${isFavorite(vendor.slug) ? "Remove" : "Add"} ${vendor.name} ${isFavorite(vendor.slug) ? "from" : "to"} favorites`}
              accessibilityState={{ selected: isFavorite(vendor.slug) }}
              onPress={() => toggleFavorite(vendor.slug)}
              style={s.brandStar}
            >
              <Ionicons
                name={isFavorite(vendor.slug) ? "star" : "star-outline"}
                size={21}
                color={isFavorite(vendor.slug) ? C.neon : C.paper}
              />
            </Pressable>
          </View>
        ))}
        {error && (
          <Pressable style={s.empty} onPress={reload}>
            <Text style={s.emptyText}>COULD NOT LOAD BRANDS. TAP TO RETRY.</Text>
          </Pressable>
        )}
        {!loading && !error && filtered.length === 0 && (
          <View style={s.empty}>
            <Ionicons
              name={filter === "SPONSORS" ? "ribbon-outline" : "search-outline"}
              size={23}
              color={C.muted}
            />
            <Text style={s.emptyText}>
              {filter === "SPONSORS"
                ? "SPONSOR BRANDS WILL BE LISTED HERE."
                : "NO BRANDS MATCH YOUR SEARCH."}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Faq() {
  const { faqs, loading } = useFaqs();
  const [open, setOpen] = useState<string | null | undefined>(undefined);
  const current = open === undefined ? faqs[0]?.id : open;
  return (
    <View>
      <Text style={s.faqTitle}>FREQUENTLY ASKED QUESTIONS</Text>
      {loading && <FaqSkeleton />}
      {faqs.map((faq) => (
        <Pressable
          key={faq.id}
          onPress={() => setOpen(current === faq.id ? null : faq.id)}
          style={s.faqRow}
        >
          <View style={s.faqQuestion}>
            <Text style={s.question}>{faq.question}</Text>
            <Ionicons
              name={current === faq.id ? "remove" : "add"}
              size={20}
              color={C.neon}
            />
          </View>
          {current === faq.id && <Text style={s.answer}>{faq.answer}</Text>}
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 58,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerAction: { width: 45, height: 42, justifyContent: "center" },
  cart: { alignItems: "flex-end" },
  logo: { width: 92, height: 38 },
  tabs: {
    height: 49,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexGrow: 0,
  },
  tabsContent: { paddingHorizontal: 14, gap: 23, alignItems: "stretch" },
  tab: {
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    paddingHorizontal: 2,
  },
  tabActive: { borderBottomColor: C.neon },
  tabText: { color: C.muted, fontFamily: F.display, fontSize: 13 },
  tabTextActive: { color: C.neon },
  content: { padding: 18, paddingBottom: 40 },
  eventName: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 26,
    marginTop: 9,
  },
  eventMeta: { color: C.neon, fontFamily: F.mono, fontSize: 9, marginTop: 5 },
  rule: { height: 1, backgroundColor: C.line, marginTop: 17, marginBottom: 21 },
  feature: {
    minHeight: 280,
    justifyContent: "center",
    padding: 19,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  featureIcon: {
    width: 49,
    height: 49,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  eyebrow: { color: C.neon, fontFamily: F.mono, fontSize: 9 },
  featureTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 29,
    marginTop: 6,
  },
  body: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6,
  },
  button: {
    marginTop: 22,
    backgroundColor: C.green,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonText: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
  sectionEyebrow: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
  scheduleFilters: { gap: 8, paddingVertical: 15 },
  scheduleFilter: {
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scheduleFilterActive: { backgroundColor: C.neon, borderColor: C.neon },
  scheduleFilterText: { color: C.paper, fontFamily: F.mono, fontSize: 9 },
  scheduleFilterTextActive: { color: C.ink },
  scheduleDay: {
    minHeight: 43,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    marginBottom: 15,
  },
  scheduleDayTitle: { color: C.neon, fontFamily: F.display, fontSize: 21 },
  scheduleDayDate: { color: C.muted, fontFamily: F.mono, fontSize: 8 },
  scheduleItem: { marginBottom: 16 },
  scheduleTime: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 11,
    marginBottom: 7,
    marginLeft: 2,
  },
  scheduleCard: {
    minHeight: 88,
    padding: 8,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scheduleImage: { width: 68, height: 68, backgroundColor: C.bg },
  scheduleCopy: { flex: 1, justifyContent: "center" },
  scheduleTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 14,
    lineHeight: 17,
  },
  scheduleLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 7,
  },
  schedulePlace: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 8,
    flexShrink: 1,
  },
  scheduleStar: {
    width: 32,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  marketplace: { gap: 13 },
  filterRow: { flexDirection: "row", justifyContent: "flex-end", gap: 6 },
  filterSpacer: { flex: 1 },
  marketFilter: {
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  marketFilterActive: { backgroundColor: C.neon, borderColor: C.neon },
  marketFilterText: { color: C.paper, fontFamily: F.mono, fontSize: 8 },
  marketFilterTextActive: { color: C.ink },
  marketSearch: {
    height: 46,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  marketSearchInput: {
    flex: 1,
    color: C.paper,
    fontFamily: F.body,
    fontSize: 15,
    paddingVertical: 0,
  },
  marketList: { gap: 10 },
  brandCard: {
    minHeight: 105,
    padding: 9,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandCardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  brandCardImage: { width: 78, height: 84, backgroundColor: C.bg },
  brandCardCopy: { flex: 1, justifyContent: "center" },
  brandCardName: { color: C.neon, fontFamily: F.display, fontSize: 15 },
  brandLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  brandLocationText: { color: C.neon, fontFamily: F.mono, fontSize: 8 },
  brandDescription: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 13,
    lineHeight: 16,
    marginTop: 4,
  },
  brandStar: {
    width: 34,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
  },
  emptyText: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 9,
    textAlign: "center",
  },
  coming: {
    minHeight: 245,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  comingTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 24,
    marginTop: 14,
  },
  faqTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 20,
    marginBottom: 10,
  },
  faqRow: { borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 16 },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },
  question: { color: C.neon, fontFamily: F.display, fontSize: 17, flex: 1 },
  answer: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 11,
  },
});
