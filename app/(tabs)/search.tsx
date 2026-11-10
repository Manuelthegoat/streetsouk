import { C, F, Header } from "@/components/street-souk-ui";
import { useCatalog, type CatalogProduct } from "@/hooks/use-catalog";
import { useEvents } from "@/hooks/use-events";
import { useNews } from "@/hooks/use-news";
import { useVendors } from "@/hooks/use-vendors";
import { brandKey } from "@/lib/brand";
import { formatNaira } from "@/lib/format";
import { vendorImage } from "@/lib/vendor-assets";
import { Ionicons } from "@expo/vector-icons";
import { Image, type ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const explore = [
  ["BRANDS", "Independent labels & makers", "storefront-outline", "/vendors"],
  ["EVENTS", "Shows, pop-ups & convention", "ticket-outline", "/(tabs)/events"],
  ["SS TV", "Films, interviews & culture", "play-circle-outline", "/ss-tv"],
  ["SHOP", "Products from Street Souk brands", "bag-outline", "/(tabs)/shop"],
  ["CONVENTION MAP", "Plan your day on the floor", "map-outline", "/map"],
] as const;

const matches = (query: string, ...values: (string | null | undefined)[]) => {
  const needle = query.trim().toLocaleLowerCase();
  return !!needle && values.some((value) => value?.toLocaleLowerCase().includes(needle));
};

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { catalog, loading: productsLoading } = useCatalog();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { events, loading: eventsLoading } = useEvents();
  const { posts, loading: newsLoading } = useNews();
  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    const products = (catalog?.products ?? []).filter((p) => matches(query, p.name, p.brand, p.description));
    const brands = (catalog?.brands ?? [])
      .map((brand) => ({ ...brand, vendor: vendors.find((v) => brandKey(v.name) === brand.key || brandKey(v.slug) === brand.key) }))
      .filter(({ name, vendor }) => matches(query, name, vendor?.name, vendor?.category, vendor?.detail, vendor?.about));
    // Include directory brands that do not have products in the live catalog.
    const listed = new Set(brands.map(({ key }) => key));
    const directoryBrands = vendors
      .filter((vendor) => matches(query, vendor.name, vendor.category, vendor.detail, vendor.about))
      .filter((vendor) => !listed.has(brandKey(vendor.name)) && !listed.has(brandKey(vendor.slug)));
    const eventResults = events.filter((event) => matches(query, event.title, event.badge, event.location, event.date_label, event.description));
    const stories = posts.filter((post) => matches(query, post.title, post.excerpt, post.body));
    return { products, brands, directoryBrands, events: eventResults, stories };
  }, [catalog, events, posts, query, vendors]);

  const openProduct = (product: CatalogProduct) =>
    router.push({ pathname: "/product/[id]", params: { id: product.id } });
  const openBrand = (key: string) =>
    router.push({ pathname: "/brand/[key]", params: { key } });
  const openEvent = (slug: string) =>
    router.push({ pathname: "/events/[id]", params: { id: slug } });
  const openStory = (id: string) =>
    router.push({ pathname: "/news/[id]", params: { id } });

  const ResultRow = ({ icon, title, detail, image, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; image?: string | ImageSource | number | null; onPress: () => void }) => (
    <Pressable accessibilityRole="button" style={s.row} onPress={onPress}>
      <View style={s.thumbnail}>
        {image ? <Image source={typeof image === "string" ? { uri: image } : image} contentFit="cover" style={s.thumbnailImage} /> : <Ionicons name={icon} size={20} color={C.neon} />}
      </View>
      <View style={s.copy}><Text style={s.name}>{title}</Text><Text style={s.detail} numberOfLines={2}>{detail}</Text></View>
      <Ionicons name="arrow-forward" size={18} color={C.muted} />
    </Pressable>
  );

  const totalResults = results.products.length + results.brands.length + results.directoryBrands.length + results.events.length + results.stories.length;
  const loading = productsLoading || vendorsLoading || eventsLoading || newsLoading;

  return (
    <SafeAreaView style={s.safe}>
      <Header title="SEARCH" />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>WHAT ARE{"\n"}YOU LOOKING FOR?</Text>
        <View style={s.search}>
          <Ionicons name="search" size={21} color={C.muted} />
          <TextInput
            accessibilityLabel="Search products, brands, events and SS TV"
            value={query}
            onChangeText={setQuery}
            placeholder="Products, brands, events, SS TV"
            placeholderTextColor={C.muted}
            style={s.input}
            returnKeyType="search"
          />
          {query.length > 0 && <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")}><Ionicons name="close-circle" size={19} color={C.muted} /></Pressable>}
        </View>

        {!searching ? (
          <>
            <Text style={s.label}>EXPLORE STREET SOUK</Text>
            {explore.map(([title, detail, icon, path]) => (
              <Pressable key={title} style={s.row} onPress={() => router.push(path)}>
                <View style={s.icon}><Ionicons name={icon} size={21} color={C.neon} /></View>
                <View style={s.copy}><Text style={s.name}>{title}</Text><Text style={s.detail}>{detail}</Text></View>
                <Ionicons name="arrow-forward" size={18} color={C.muted} />
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <Text style={s.label}>SEARCH RESULTS · {totalResults}</Text>
            {loading && <View style={s.loading}><ActivityIndicator color={C.neon} /><Text style={s.detail}>Searching Street Souk…</Text></View>}
            {results.products.length > 0 && <><Text style={s.section}>PRODUCTS</Text>{results.products.map((p) => <ResultRow key={`product-${p.id}`} icon="bag-outline" image={p.images[0]} title={p.name} detail={`${p.brand} · ${formatNaira(p.price)}`} onPress={() => openProduct(p)} />)}</>}
            {(results.brands.length + results.directoryBrands.length) > 0 && <><Text style={s.section}>BRANDS</Text>{results.brands.map((brand) => <ResultRow key={`brand-${brand.key}`} icon="storefront-outline" image={brand.vendor ? vendorImage(brand.vendor.slug, "logo", brand.vendor.logo_url) : brand.products[0]?.images[0]} title={brand.name} detail={`${brand.products.length} ${brand.products.length === 1 ? "product" : "products"}`} onPress={() => openBrand(brand.key)} />)}{results.directoryBrands.map((vendor) => <ResultRow key={`vendor-${vendor.id}`} icon="storefront-outline" image={vendorImage(vendor.slug, "logo", vendor.logo_url)} title={vendor.name} detail={vendor.detail ?? vendor.category} onPress={() => openBrand(brandKey(vendor.name))} />)}</>}
            {results.events.length > 0 && <><Text style={s.section}>EVENTS</Text>{results.events.map((event) => <ResultRow key={`event-${event.id}`} icon="ticket-outline" image={event.cover_url ?? require("@/assets/brands/bolacampaign.jpg")} title={event.title} detail={[event.location, event.date_label].filter(Boolean).join(" · ") || event.badge || "Street Souk event"} onPress={() => openEvent(event.slug)} />)}</>}
            {results.stories.length > 0 && <><Text style={s.section}>SS TV</Text>{results.stories.map((post) => <ResultRow key={`story-${post.id}`} icon="play-circle-outline" image={post.cover_url ?? require("@/assets/images/ss-logo.png")} title={post.title} detail={post.excerpt ?? "SS TV story"} onPress={() => openStory(post.id)} />)}</>}
            {!loading && totalResults === 0 && <Text style={s.empty}>NO MATCHES YET. TRY A DIFFERENT SEARCH.</Text>}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 42 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 37, lineHeight: 40, marginTop: 27, marginBottom: 20 },
  search: { height: 53, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 10 },
  input: { flex: 1, color: C.paper, fontFamily: F.mono, fontSize: 11 },
  label: { color: C.neon, fontFamily: F.mono, fontSize: 9, marginTop: 28, marginBottom: 7 },
  section: { color: C.muted, fontFamily: F.mono, fontSize: 9, marginTop: 20, marginBottom: 6 },
  row: { minHeight: 72, borderTopWidth: 1, borderTopColor: C.line, flexDirection: "row", alignItems: "center", gap: 13 },
  icon: { width: 40, height: 40, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  thumbnail: { width: 56, height: 56, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  thumbnailImage: { width: "100%", height: "100%" },
  copy: { flex: 1 },
  name: { color: C.neon, fontFamily: F.display, fontSize: 18 },
  detail: { color: C.muted, fontFamily: F.body, fontSize: 14, marginTop: 2 },
  loading: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 16 },
  empty: { color: C.muted, fontFamily: F.mono, fontSize: 10, marginTop: 20 },
});
