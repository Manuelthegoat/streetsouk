import { ImageRowSkeleton, ProductGridSkeleton } from "@/components/skeleton";
import { C, F, Header } from "@/components/street-souk-ui";
import { useCatalog, type CatalogProduct } from "@/hooks/use-catalog";
import { useVendors } from "@/hooks/use-vendors";
import { brandKey } from "@/lib/brand";
import { formatNaira } from "@/lib/format";
import { vendorImage } from "@/lib/vendor-assets";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

const FALLBACK = require("@/assets/images/sslogo.png");
const PAGE = 24;

function ProductTile({
  p,
  onPress,
}: {
  p: CatalogProduct;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={s.product}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${p.brand} ${p.name}`}
    >
      <View style={s.imageWrap}>
        <Image
          source={p.images[0] ? { uri: p.images[0] } : FALLBACK}
          contentFit={p.images[0] ? "cover" : "contain"}
          style={s.image}
        />
        {!p.available ? (
          <View style={[s.badge, { backgroundColor: C.muted }]}>
            <Text style={s.badgeText}>SOLD OUT</Text>
          </View>
        ) : p.stockLabel ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>{p.stockLabel.toUpperCase()}</Text>
          </View>
        ) : null}
      </View>
      <Text style={s.brand}>{p.brand}</Text>
      <Text style={s.name} numberOfLines={2}>
        {p.name}
      </Text>
      <Text style={s.price}>{formatNaira(p.price)}</Text>
    </Pressable>
  );
}

export default function ShopScreen() {
  const router = useRouter();
  const { catalog, loading, error, reload } = useCatalog();
  const { vendors } = useVendors();
  const [tab, setTab] = useState("Explore");
  const [shown, setShown] = useState(PAGE);

  // EXPLORE and BRANDS, then one tab for every other menu you create in Zappie
  const tabs = [
    "Explore",
    "Brands",
    ...(catalog?.others.map((m) => m.name) ?? []),
  ];
  const activeTab = tabs.includes(tab) ? tab : "Explore";
  const menu = catalog?.others.find((m) => m.name === activeTab);

  // available products first, in Zappie's order
  const explore = useMemo(() => {
    const all = catalog?.products ?? [];
    return [
      ...all.filter((p) => p.available),
      ...all.filter((p) => !p.available),
    ];
  }, [catalog]);

  const openProduct = (id: string) =>
    router.push({ pathname: "/product/[id]", params: { id } });
  const openBrand = (key: string) =>
    router.push({ pathname: "/brand/[key]", params: { key } });
  const openBrands = () => router.push("/vendors");
  const note = {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 11,
    textAlign: "center" as const,
    marginTop: 30,
  };

  return (
    <SafeAreaView style={s.safe}>
      <Header title="SHOP" />
      <ScrollView
        horizontal
        style={s.topTabs}
        contentContainerStyle={s.topTabsContent}
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === item }}
            onPress={() => setTab(item)}
            style={[s.topTab, activeTab === item && s.topTabActive]}
          >
            <Text
              style={[s.topTabText, activeTab === item && s.topTabTextActive]}
            >
              {item.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.content}>
        {activeTab === "Explore" && (
          <>
            <Text style={s.kicker}>INDEPENDENT BY NATURE</Text>
            <Text style={s.title}>THE STORE</Text>
            <Text style={s.copy}>
              Discover the labels shaping the streets. Shop the latest from the
              StreetSouk community.
            </Text>
            <Pressable style={s.banner} onPress={() => setTab("Brands")}>
              <Text style={s.bannerEyebrow}>MEET THE MAKERS</Text>
              <Text style={s.bannerTitle}>SHOP THE{"\n"}COMMUNITY</Text>
              <Text style={s.bannerLink}>BROWSE BRANDS ↗</Text>
            </Pressable>
          </>
        )}
        {activeTab === "Brands" && (
          <>
            <Text style={s.kicker}>INDEPENDENT LABELS</Text>
            <Text style={s.title}>BRANDS</Text>
            <Text style={s.copy}>
              Meet the brands shaping the StreetSouk community.
            </Text>
          </>
        )}
        {!!menu && (
          <>
            <Text style={s.kicker}>SHOP THE COMMUNITY</Text>
            <Text style={s.title}>{menu.name.toUpperCase()}</Text>
          </>
        )}

        {loading &&
          !catalog &&
          (activeTab === "Brands" ? (
            <ImageRowSkeleton count={5} />
          ) : (
            <ProductGridSkeleton />
          ))}
        {error && !catalog && (
          <Pressable onPress={reload}>
            <Text style={note}>COULD NOT LOAD THE STORE. TAP TO RETRY.</Text>
          </Pressable>
        )}

        {catalog && activeTab === "Explore" && (
          <>
            <View style={s.head}>
              <Text style={s.section}>LATEST DROPS</Text>
              <Text style={s.count}>{explore.length} PIECES</Text>
            </View>
            <View style={s.grid}>
              {explore.slice(0, shown).map((p) => (
                <ProductTile
                  key={p.id}
                  p={p}
                  onPress={() => openProduct(p.id)}
                />
              ))}
            </View>
            {shown < explore.length && (
              <Pressable
                style={s.directory}
                onPress={() => setShown((n) => n + PAGE)}
              >
                <Text style={s.directoryText}>SHOW MORE</Text>
                <Ionicons name="arrow-down" size={19} color={C.ink} />
              </Pressable>
            )}
          </>
        )}

        {catalog && activeTab === "Brands" && (
          <View style={s.brandList}>
            {catalog.brands.map((b) => {
              const vendor = vendors.find(
                (v) => brandKey(v.name) === b.key || brandKey(v.slug) === b.key,
              );
              const first = b.products[0]?.images[0];
              return (
                <Pressable
                  key={b.key}
                  style={s.brandRow}
                  onPress={() => openBrand(b.key)}
                >
                  <View style={[s.brandLogo, { backgroundColor: "#000000" }]}>
                    <Image
                      source={
                        vendor
                          ? vendorImage(vendor.slug, "logo", vendor.logo_url)
                          : first
                            ? { uri: first }
                            : FALLBACK
                      }
                      contentFit={vendor || !first ? "contain" : "cover"}
                      style={s.brandImage}
                    />
                  </View>
                  <View style={s.brandInfo}>
                    <Text style={s.brandName}>{b.name}</Text>
                    <Text style={s.brandType}>
                      {b.products.length}{" "}
                      {b.products.length === 1 ? "PIECE" : "PIECES"}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={17} color={C.muted} />
                </Pressable>
              );
            })}
            <Pressable style={s.directory} onPress={openBrands}>
              <Text style={s.directoryText}>OPEN BRAND DIRECTORY</Text>
              <Ionicons name="arrow-forward" size={19} color={C.ink} />
            </Pressable>
          </View>
        )}

        {catalog &&
          !!menu &&
          menu.groups.map((g) => (
            <View key={g.name}>
              <View style={s.head}>
                <Text style={s.section}>{g.name.toUpperCase()}</Text>
                <Text style={s.count}>{g.products.length} PIECES</Text>
              </View>
              <View style={s.grid}>
                {g.products.map((p) => (
                  <ProductTile
                    key={p.id}
                    p={p}
                    onPress={() => openProduct(p.id)}
                  />
                ))}
              </View>
            </View>
          ))}

        {catalog && explore.length === 0 && activeTab === "Explore" && (
          <Text style={note}>NOTHING HERE YET. CHECK BACK SOON.</Text>
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
  topTabsContent: { paddingHorizontal: 14, alignItems: "stretch", gap: 23 },
  topTab: {
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    paddingHorizontal: 2,
  },
  topTabActive: { borderBottomColor: C.neon },
  topTabText: { color: C.muted, fontFamily: F.display, fontSize: 14 },
  topTabTextActive: { color: C.neon },
  content: { padding: 17, paddingBottom: 40 },
  kicker: { fontFamily: F.mono, color: C.neon, fontSize: 9, marginTop: 19 },
  title: { fontFamily: F.display, color: C.neon, fontSize: 39, marginTop: 4 },
  copy: {
    fontFamily: F.body,
    color: C.muted,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 5,
    marginBottom: 19,
  },
  banner: {
    height: 175,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    padding: 17,
    justifyContent: "space-between",
  },
  bannerEyebrow: { color: C.neon, fontFamily: F.mono, fontSize: 9 },
  bannerTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 32,
    lineHeight: 34,
  },
  bannerLink: { color: C.neon, fontFamily: F.mono, fontSize: 10 },
  head: {
    marginTop: 27,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: { color: C.neon, fontFamily: F.display, fontSize: 21 },
  count: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 9,
    alignSelf: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 20,
  },
  product: { width: "48%" },
  imageWrap: { height: 205, backgroundColor: C.bg, position: "relative" },
  image: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: C.paper,
    padding: 6,
  },
  badgeText: { color: C.ink, fontFamily: F.mono, fontSize: 7 },
  brand: { color: C.neon, fontFamily: F.mono, fontSize: 9, marginTop: 10 },
  name: { color: C.neon, fontFamily: F.display, fontSize: 16, marginTop: 3 },
  price: { color: C.muted, fontFamily: F.body, fontSize: 14, marginTop: 3 },
  brandList: { marginTop: 6 },
  brandRow: {
    minHeight: 72,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  brandLogo: {
    width: 46,
    height: 46,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  brandImage: { width: 38, height: 38 },
  brandInfo: { flex: 1 },
  brandName: { color: C.neon, fontFamily: F.display, fontSize: 17 },
  brandType: { color: C.muted, fontFamily: F.mono, fontSize: 8, marginTop: 3 },
  directory: {
    marginTop: 25,
    backgroundColor: C.green,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  directoryText: { color: C.ink, fontFamily: F.mono, fontSize: 11 },
});
