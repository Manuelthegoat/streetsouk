import { ImageRowSkeleton, ProductGridSkeleton } from "@/components/skeleton";
import { C, F, Header } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";
import { useCatalog, type CatalogProduct } from "@/hooks/use-catalog";
import { useVendors } from "@/hooks/use-vendors";
import { brandKey } from "@/lib/brand";
import { formatNaira } from "@/lib/format";
import { vendorImage } from "@/lib/vendor-assets";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
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

const FALLBACK = require("@/assets/images/ss-logo.png");
const PAGE = 24;

function ProductTile({
  p,
  onPress,
  compact = false,
}: {
  p: CatalogProduct;
  onPress: () => void;
  compact?: boolean;
}) {
  const { isProductWishlisted, toggleWishlistedProduct } = useStreetSoukStore();
  const wishlisted = isProductWishlisted(p.id);

  return (
    <View style={[s.product, compact && s.sliderProduct]}>
      <Pressable
        style={s.productTap}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${p.brand} ${p.name}`}
      >
        <View style={[s.imageWrap, compact && s.sliderImageWrap]}>
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${wishlisted ? "Remove" : "Add"} ${p.name} ${wishlisted ? "from" : "to"} wishlist`}
        onPress={() => toggleWishlistedProduct(p.id)}
        style={s.wishlistButton}
      >
        <Ionicons
          name={wishlisted ? "heart" : "heart-outline"}
          size={18}
          color={C.neon}
        />
      </Pressable>
    </View>
  );
}

export default function ShopScreen() {
  const router = useRouter();
  const { catalog, loading, error, reload } = useCatalog();
  const { vendors } = useVendors();
  const [tab, setTab] = useState("Explore");
  const [shown, setShown] = useState(PAGE);
  const featuredVendor = vendors.find(
    (vendor) => vendor.is_featured && vendor.is_published,
  );
  const featuredVendorKey = featuredVendor
    ? brandKey(featuredVendor.name)
    : null;
  const featuredProducts = (catalog?.products ?? []).filter(
    (product) => product.brandKey === featuredVendorKey,
  );
  const newArrivalsMenu = catalog?.others.find((item) =>
    /^new arrivals$/i.test(item.name.trim()),
  );

  // EXPLORE and BRANDS, then one tab for every other menu you create in Zappie
  const tabs = [
    "Explore",
    "New Arrivals",
    "Brands",
    ...(catalog?.others
      .filter((item) => item !== newArrivalsMenu)
      .map((item) => item.name) ?? []),
  ];
  const activeTab = tabs.includes(tab) ? tab : "Explore";
  const menu = catalog?.others.find(
    (item) => item.name === activeTab && item !== newArrivalsMenu,
  );

  // available products first, in Zappie's order
  const explore = useMemo(() => {
    const all = catalog?.products ?? [];
    return [
      ...all.filter((p) => p.available),
      ...all.filter((p) => !p.available),
    ];
  }, [catalog]);
  const newArrivals = useMemo(() => {
    if (newArrivalsMenu) {
      return newArrivalsMenu.groups.flatMap((group) => group.products);
    }
    return explore.filter((product) => product.available).slice(0, PAGE);
  }, [explore, newArrivalsMenu]);
  const latestProducts = featuredVendor
    ? featuredProducts.slice(0, 8)
    : explore.filter((product) => product.available).slice(0, 8);

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
            <Text style={s.kicker}>STREET SOUK SELECTS</Text>
            <Text style={s.title}>SHOP THE CULTURE</Text>
            <Text style={s.copy}>
              Discover independent labels, limited drops, and pieces made to be
              worn your way.
            </Text>
            {featuredVendor ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Shop featured vendor ${featuredVendor.name}`}
                style={s.featuredVendor}
                onPress={() => openBrand(brandKey(featuredVendor.name))}
              >
                <ImageBackground
                  source={vendorImage(
                    featuredVendor.slug,
                    "campaign",
                    featuredVendor.campaign_url,
                  )}
                  contentFit="cover"
                  blurRadius={3}
                  style={s.featuredVendorImage}
                />
                <View style={s.featuredVendorShade} />
                <View style={s.featuredVendorCopy}>
                  <Text style={s.featuredVendorEyebrow}>FEATURED VENDOR</Text>
                  <Text numberOfLines={2} style={s.featuredVendorName}>
                    {featuredVendor.name}
                  </Text>
                  <Text style={s.featuredVendorCategory}>
                    {featuredVendor.category.toUpperCase()}  ·  SHOP THE EDIT
                  </Text>
                </View>
                <View style={s.featuredVendorArrow}>
                  <Ionicons name="arrow-forward" size={18} color={C.ink} />
                </View>
              </Pressable>
            ) : (
              <Pressable style={s.featuredEmpty} onPress={openBrands}>
                <View style={s.featuredEmptyIcon}>
                  <Ionicons name="sparkles-outline" size={20} color={C.neon} />
                </View>
                <View style={s.featuredEmptyCopy}>
                  <Text style={s.featuredVendorEyebrow}>FEATURED VENDOR</Text>
                  <Text style={s.featuredEmptyText}>
                    A fresh label is coming into focus.
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={C.neon} />
              </Pressable>
            )}
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
        {activeTab === "New Arrivals" && (
          <>
            <Text style={s.kicker}>JUST DROPPED</Text>
            <Text style={s.title}>NEW ARRIVALS</Text>
            <Text style={s.copy}>
              Fresh pieces from the Street Souk community.
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
            <Text numberOfLines={3} style={[note, s.errorDetail]}>
              {error}
            </Text>
          </Pressable>
        )}

        {catalog && activeTab === "Explore" && (
          <>
            <View style={s.latestHeading}>
              <View>
                <Text style={s.latestEyebrow}>FRESH FINDS</Text>
                <Text style={s.section}>THE LATEST</Text>
              </View>
              <Text style={s.count}>
                {featuredVendor?.name.toUpperCase() ?? "NEW DROPS"}
              </Text>
            </View>
            {latestProducts.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.productSlider}
              >
                {latestProducts.map((p) => (
                  <ProductTile
                    compact
                    key={`latest-${p.id}`}
                    p={p}
                    onPress={() => openProduct(p.id)}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={note}>NO PRODUCTS AVAILABLE YET.</Text>
            )}
            <Pressable
              style={s.seeAll}
              onPress={() =>
                featuredVendor
                  ? openBrand(brandKey(featuredVendor.name))
                  : openBrands()
              }
            >
              <Text style={s.seeAllText}>
                {featuredVendor
                  ? `SEE ALL ${featuredVendor.name.toUpperCase()}`
                  : "SEE ALL BRANDS"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={C.ink} />
            </Pressable>

            <View style={s.head}>
              <Text style={s.section}>SHOP ALL</Text>
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

        {catalog && activeTab === "New Arrivals" && (
          <>
            {newArrivalsMenu ? (
              newArrivalsMenu.groups.map((group) => (
                <View key={group.name}>
                  <View style={s.head}>
                    <Text style={s.section}>{group.name.toUpperCase()}</Text>
                    <Text style={s.count}>{group.products.length} PIECES</Text>
                  </View>
                  <View style={s.grid}>
                    {group.products.map((p) => (
                      <ProductTile
                        key={`arrival-${p.id}`}
                        p={p}
                        onPress={() => openProduct(p.id)}
                      />
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <>
                <View style={s.head}>
                  <Text style={s.section}>LATEST PIECES</Text>
                  <Text style={s.count}>{newArrivals.length} PIECES</Text>
                </View>
                <View style={s.grid}>
                  {newArrivals.map((p) => (
                    <ProductTile
                      key={`arrival-${p.id}`}
                      p={p}
                      onPress={() => openProduct(p.id)}
                    />
                  ))}
                </View>
                <Text style={s.arrivalHint}>
                  For a curated arrivals list, add a “New Arrivals” menu in
                  Zappie.
                </Text>
              </>
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
  content: { paddingHorizontal: 17, paddingTop: 17, paddingBottom: 40 },
  errorDetail: { marginTop: 8, color: C.paper },
  kicker: { fontFamily: F.mono, color: C.paper, fontSize: 9, marginTop: 15, letterSpacing: 1.2 },
  title: { fontFamily: F.display, color: C.neon, fontSize: 36, marginTop: 4, letterSpacing: 0.3 },
  copy: {
    fontFamily: F.body,
    color: C.paper,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 5,
    marginBottom: 19,
  },
  featuredVendor: {
    height: 222,
    marginTop: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 17,
    backgroundColor: C.panel,
  },
  featuredVendorImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  featuredVendorShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4, 8, 5, 0.34)",
  },
  featuredVendorCopy: {
    position: "absolute",
    left: 16,
    right: 60,
    bottom: 18,
  },
  featuredVendorEyebrow: {
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 9,
    letterSpacing: 1.1,
  },
  featuredVendorName: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 31,
    lineHeight: 35,
    marginTop: 4,
  },
  featuredVendorCategory: {
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 8,
    letterSpacing: 0.5,
    marginTop: 7,
  },
  featuredVendorArrow: {
    position: "absolute",
    right: 15,
    bottom: 17,
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredEmpty: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginTop: 15,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 15,
  },
  featuredEmptyIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#111D14",
  },
  featuredEmptyCopy: { flex: 1 },
  featuredEmptyText: {
    color: C.paper,
    fontFamily: F.body,
    fontSize: 14,
    marginTop: 5,
  },
  latestHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 11,
  },
  latestEyebrow: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 8,
    letterSpacing: 1,
    marginBottom: 3,
  },
  productSlider: { gap: 12, paddingRight: 17 },
  sliderProduct: { width: 172 },
  sliderImageWrap: { height: 190, borderRadius: 12, overflow: "hidden" },
  seeAll: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginTop: 14,
    borderRadius: 11,
    backgroundColor: C.neon,
  },
  seeAllText: {
    flex: 1,
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 10,
    fontWeight: "700",
  },
  arrivalHint: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 15,
  },
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
  productTap: { width: "100%" },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    borderWidth: 1,
    borderColor: C.line,
  },
  imageWrap: { height: 205, backgroundColor: C.bg, position: "relative", borderRadius: 12, overflow: "hidden" },
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
