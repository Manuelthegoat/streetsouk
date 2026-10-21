import { VendorListSkeleton } from "@/components/skeleton";
import { C, F, Header, PageTitle } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";
import { useCatalog } from "@/hooks/use-catalog";
import { useVendors } from "@/hooks/use-vendors";
import { brandKey } from "@/lib/brand";
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
  TextInput,
  View,
} from "react-native";

const FALLBACK = require("@/assets/images/sslogo.png");

export default function VendorsScreen() {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useStreetSoukStore();
  const { catalog, loading, error, reload } = useCatalog();
  const { vendors } = useVendors();
  const [query, setQuery] = useState("");

  const brands = useMemo(() => {
    const q = query.toLowerCase();
    return (catalog?.brands ?? [])
      .filter((b) => b.name.toLowerCase().includes(q))
      .map((b) => ({
        ...b,
        vendor: vendors.find(
          (v) => brandKey(v.name) === b.key || brandKey(v.slug) === b.key,
        ),
      }));
  }, [catalog, vendors, query]);

  return (
    <SafeAreaView style={s.safe}>
      <Header title="BRANDS" back />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <PageTitle title="BRANDS" />
        <View style={s.search}>
          <Ionicons name="search" size={23} color={C.paper} />
          <TextInput
            accessibilityLabel="Search brands"
            placeholder="SEARCH BRANDS..."
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            style={s.input}
          />
        </View>

        {loading && !catalog && <VendorListSkeleton />}
        {error && !catalog && (
          <Pressable onPress={reload}>
            <Text style={s.empty}>COULD NOT LOAD BRANDS. TAP TO RETRY.</Text>
          </Pressable>
        )}

        {brands.map((brand) => {
          const vendor = brand.vendor;
          const photo = brand.products[0]?.images[0]
            ? { uri: brand.products[0].images[0] }
            : FALLBACK;
          return (
            <Pressable
              key={brand.key}
              accessibilityRole="button"
              accessibilityLabel={`Open ${brand.name}`}
              onPress={() =>
                router.push({
                  pathname: "/brand/[key]",
                  params: { key: brand.key },
                })
              }
            >
              <ImageBackground
                source={
                  vendor
                    ? vendorImage(vendor.slug, "campaign", vendor.campaign_url)
                    : photo
                }
                imageStyle={s.vendorImageBackground}
                style={s.vendor}
              >
                <View style={s.vendorOverlay}>
                  <View style={s.vendorTop}>
                    <View style={s.vendorIcon}>
                      <Image
                        source={
                          vendor
                            ? vendorImage(vendor.slug, "logo", vendor.logo_url)
                            : photo
                        }
                        style={s.vendorImage}
                        contentFit={vendor ? "contain" : "cover"}
                      />
                    </View>
                    <View style={s.vendorMeta}>
                      {vendor && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${isFavorite(vendor.slug) ? "Remove" : "Save"} ${vendor.name} from favorites`}
                          onPress={() => toggleFavorite(vendor.slug)}
                          hitSlop={8}
                          style={s.favorite}
                        >
                          <Ionicons
                            name={
                              isFavorite(vendor.slug) ? "heart" : "heart-outline"
                            }
                            size={18}
                            color={C.neon}
                          />
                        </Pressable>
                      )}
                      <Text style={s.type}>{vendor?.category ?? "BRAND"}</Text>
                    </View>
                  </View>
                  <Text style={s.name}>{brand.name}</Text>
                  <Text style={s.detail}>
                    {vendor?.detail ??
                      `${brand.products.length} ${brand.products.length === 1 ? "PIECE" : "PIECES"}`}
                  </Text>
                  <View style={s.show}>
                    <Text style={s.showText}>VIEW BRAND</Text>
                    <Ionicons name="arrow-forward" size={20} color={C.ink} />
                  </View>
                </View>
              </ImageBackground>
            </Pressable>
          );
        })}

        {!loading && !error && brands.length === 0 && (
          <Text style={s.empty}>NO BRANDS FOUND</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingBottom: 44 },
  search: {
    height: 56,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.panel,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 24,
  },
  input: {
    color: C.paper,
    fontFamily: F.mono,
    flex: 1,
    fontSize: 13,
    marginLeft: 11,
  },
  vendor: {
    borderWidth: 2,
    borderColor: C.line,
    padding: 20,
    marginBottom: 22,
    backgroundColor: C.bg,
  },
  vendorImageBackground: { opacity: 0.72 },
  vendorOverlay: {
    backgroundColor: C.scrim,
    margin: -20,
    padding: 20,
  },
  vendorTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  vendorIcon: {
    width: 100,
    height: 100,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  vendorImage: { width: 88, height: 88 },
  vendorMeta: { alignItems: "flex-end", gap: 9 },
  favorite: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  type: {
    backgroundColor: C.neon,
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  name: { color: C.neon, fontFamily: F.display, fontSize: 28, marginTop: 22 },
  detail: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
  },
  show: {
    backgroundColor: C.green,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  showText: { color: C.ink, fontFamily: F.display, fontSize: 18 },
  empty: {
    color: C.muted,
    fontFamily: F.mono,
    textAlign: "center",
    marginTop: 30,
  },
});