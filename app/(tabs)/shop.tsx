import { C, F, Header } from "@/components/street-souk-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useVendors } from "@/hooks/use-vendors";
import { formatNaira } from "@/lib/format";
import { vendorImage } from "@/lib/vendor-assets";
import { ImageRowSkeleton, ProductGridSkeleton } from "@/components/skeleton";

const categories = [
  "Explore",
  "Brands",
  "New Arrivals",
  "Mens",
  "Womens",
  "Footwear",
  "Accessories",
] as const;
type ShopCategory = (typeof categories)[number];
const productTabs: ShopCategory[] = [
  "Explore",
  "New Arrivals",
  "Mens",
  "Womens",
];

export default function ShopScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<ShopCategory>("Explore");
  const {
    products,
    loading: loadingProducts,
    error: productsError,
    reload,
  } = useProducts();
  const { vendors, loading: loadingVendors } = useVendors();

  const showProducts = productTabs.includes(category);

  let visibleProducts = products;
  if (category === "Explore") {
    const featured = products.filter((p) => p.is_featured);
    visibleProducts = featured.length ? featured : products.slice(0, 6);
  } else if (category === "Mens") {
    visibleProducts = products.filter((p) => p.department !== "WOMENS");
  } else if (category === "Womens") {
    visibleProducts = products.filter((p) => p.department !== "MENS");
  }

  const visibleBrands =
    category === "Footwear"
      ? vendors.filter((v) => v.category === "FOOTWEAR")
      : category === "Accessories"
        ? vendors.filter((v) => v.category === "ACCESSORIES")
        : vendors;

  const loading = showProducts ? loadingProducts : loadingVendors;
  const openBrands = () => router.push("/vendors");
  const openVendor = (slug: string) =>
    router.push({ pathname: "/vendor/[slug]", params: { slug } });
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
              {item.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={s.content}>
        {category === "Explore" && (
          <>
            <Text style={s.kicker}>INDEPENDENT BY NATURE</Text>
            <Text style={s.title}>THE STORE</Text>
            <Text style={s.copy}>
              Discover the labels shaping the streets. Shop the latest from the
              StreetSouk community.
            </Text>
            <Pressable style={s.banner} onPress={openBrands}>
              <Text style={s.bannerEyebrow}>MEET THE MAKERS</Text>
              <Text style={s.bannerTitle}>SHOP THE{"\n"}COMMUNITY</Text>
              <Text style={s.bannerLink}>BROWSE BRANDS ↗</Text>
            </Pressable>
          </>
        )}
        {category === "New Arrivals" && (
          <>
            <Text style={s.kicker}>JUST LANDED</Text>
            <Text style={s.title}>NEW ARRIVALS</Text>
            <Text style={s.copy}>
              Fresh pieces from StreetSouk community brands.
            </Text>
          </>
        )}
        {(category === "Mens" || category === "Womens") && (
          <>
            <Text style={s.kicker}>SHOP THE COMMUNITY</Text>
            <Text style={s.title}>{category.toUpperCase()}</Text>
            <Text style={s.copy}>
              Explore independent labels and discover their latest pieces.
            </Text>
          </>
        )}
        {(category === "Brands" ||
          category === "Footwear" ||
          category === "Accessories") && (
          <>
            <Text style={s.kicker}>INDEPENDENT LABELS</Text>
            <Text style={s.title}>{category.toUpperCase()}</Text>
            <Text style={s.copy}>
              {category === "Footwear"
                ? "Discover footwear labels from the StreetSouk community."
                : category === "Accessories"
                  ? "Explore accessories and details from independent makers."
                  : "Meet the brands shaping the StreetSouk community."}
            </Text>
          </>
        )}

        {loading &&
          (showProducts ? (
            <ProductGridSkeleton />
          ) : (
            <ImageRowSkeleton count={4} />
          ))}
        {showProducts && productsError && (
          <Pressable onPress={reload}>
            <Text style={note}>COULD NOT LOAD THE STORE. TAP TO RETRY.</Text>
          </Pressable>
        )}

        {showProducts ? (
          <>
            {!loading && visibleProducts.length > 0 && (
              <View style={s.head}>
                <Text style={s.section}>
                  {category === "Explore" ? "FEATURED DROPS" : "LATEST DROPS"}
                </Text>
                <Text style={s.count}>
                  {String(visibleProducts.length).padStart(2, "0")}{" "}
                  {visibleProducts.length === 1 ? "PIECE" : "PIECES"}
                </Text>
              </View>
            )}
            <View style={s.grid}>
              {visibleProducts.map((p) => (
                <Pressable
                  key={p.id}
                  style={s.product}
                  onPress={() => openVendor(p.vendors.slug)}
                >
                  <View style={s.imageWrap}>
                    <Image
                      source={vendorImage(
                        p.vendors.slug,
                        "product",
                        p.image_url,
                      )}
                      contentFit="cover"
                      style={s.image}
                    />
                    {p.is_featured && (
                      <View style={s.badge}>
                        <Text style={s.badgeText}>STREET SOUK SELECT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.brand}>{p.vendors.name}</Text>
                  <Text style={s.name}>
                    {p.vendors.name} / {p.name}
                  </Text>
                  <Text style={s.price}>{formatNaira(p.price_ngn)}</Text>
                </Pressable>
              ))}
            </View>
            {!loading && !productsError && visibleProducts.length === 0 && (
              <Text style={note}>NOTHING HERE YET. CHECK BACK SOON.</Text>
            )}
          </>
        ) : (
          <View style={s.brandList}>
            {visibleBrands.map((brand) => (
              <Pressable
                key={brand.id}
                style={s.brandRow}
                onPress={() => openVendor(brand.slug)}
              >
                <View style={s.brandLogo}>
                  <Image
                    source={vendorImage(brand.slug, "logo", brand.logo_url)}
                    contentFit="contain"
                    style={s.brandImage}
                  />
                </View>
                <View style={s.brandInfo}>
                  <Text style={s.brandName}>{brand.name}</Text>
                  <Text style={s.brandType}>{brand.category}</Text>
                </View>
                <Ionicons name="arrow-forward" size={17} color={C.muted} />
              </Pressable>
            ))}
            {!loading && visibleBrands.length === 0 && (
              <Text style={note}>NO BRANDS IN THIS CATEGORY YET.</Text>
            )}
          </View>
        )}

        {(category === "Mens" || category === "Womens") && (
          <Pressable style={s.directory} onPress={openBrands}>
            <Text style={s.directoryText}>BROWSE ALL BRANDS</Text>
            <Ionicons name="arrow-forward" size={19} color={C.ink} />
          </Pressable>
        )}
        {category === "Explore" && (
          <Pressable style={s.directory} onPress={openBrands}>
            <Text style={s.directoryText}>EXPLORE ALL BRANDS</Text>
            <Ionicons name="arrow-forward" size={19} color={C.ink} />
          </Pressable>
        )}
        {(category === "Brands" ||
          category === "Footwear" ||
          category === "Accessories") && (
          <Pressable style={s.directory} onPress={openBrands}>
            <Text style={s.directoryText}>OPEN BRAND DIRECTORY</Text>
            <Ionicons name="arrow-forward" size={19} color={C.ink} />
          </Pressable>
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
  grid: { flexDirection: "row", gap: 11 },
  product: { flex: 1 },
  imageWrap: { height: 205, backgroundColor: C.panel, position: "relative" },
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
    backgroundColor: C.paper,
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
