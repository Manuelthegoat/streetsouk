import { VendorDetailSkeleton } from "@/components/skeleton";
import { C, F } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";
import type { VendorWithProducts } from "@/hooks/use-vendor";
import { formatNaira } from "@/lib/format";
import { vendorImage } from "@/lib/vendor-assets";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { useRouter } from "expo-router";
import { isSoldOut } from "@/lib/stock";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  vendor: VendorWithProducts | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  label: string; // header title
  convention?: boolean; // true = opened from an event: show booth + map
  booth?: string | null;
  eventTitle?: string | null;
};

export default function VendorView({
  vendor,
  loading,
  error,
  reload,
  label,
  convention = false,
  booth,
  eventTitle,
}: Props) {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useStreetSoukStore();
  const products = vendor?.products ?? [];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={s.iconBtn}
        >
          <Ionicons name="arrow-back" size={22} color={C.paper} />
        </Pressable>
        <Text style={s.headerTitle}>{label}</Text>
        <View style={s.headerRight}>
          {convention && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View festival map"
              onPress={() => router.push("/map")}
              style={s.iconBtn}
            >
              <Ionicons name="map-outline" size={19} color={C.neon} />
            </Pressable>
          )}
          {vendor ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${isFavorite(vendor.slug) ? "Remove" : "Save"} ${vendor.name} from favorites`}
              onPress={() => toggleFavorite(vendor.slug)}
              style={s.iconBtn}
            >
              <Ionicons
                name={isFavorite(vendor.slug) ? "heart" : "heart-outline"}
                size={19}
                color={C.neon}
              />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      {loading ? (
        <VendorDetailSkeleton />
      ) : !vendor ? (
        <Pressable onPress={error ? reload : () => router.back()}>
          <Text style={s.note}>
            {error
              ? "COULD NOT LOAD THIS BRAND. TAP TO RETRY."
              : "THIS BRAND IS NO LONGER AVAILABLE. TAP TO GO BACK."}
          </Text>
        </Pressable>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={vendorImage(vendor.slug, "campaign", vendor.campaign_url)}
            style={s.hero}
          >
            <View style={s.heroShade}>
              <View style={s.heroTop}>
                <Text style={s.kicker}>{vendor.category}</Text>
                {convention && !!booth && (
                  <Text style={s.boothTag}>BOOTH {booth}</Text>
                )}
              </View>
              <View>
                <Image
                  source={vendorImage(vendor.slug, "logo", vendor.logo_url)}
                  contentFit="contain"
                  style={s.logo}
                />
                <Text style={s.name}>{vendor.name}</Text>
              </View>
            </View>
          </ImageBackground>

          {convention && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Get directions to ${vendor.name}`}
              style={s.directions}
              onPress={() => router.push("/map")}
            >
              <Ionicons name="navigate" size={18} color={C.ink} />
              <View style={{ flex: 1 }}>
                <Text style={s.directionsEyebrow}>LOCATE THIS VENDOR</Text>
                <Text style={s.directionsText}>GET DIRECTIONS</Text>
              </View>
              <Ionicons name="arrow-forward" size={22} color={C.ink} />
            </Pressable>
          )}

          <View style={s.content}>
            {!!vendor.about && (
              <>
                <Text style={s.section}>ABOUT THE BRAND</Text>
                <Text style={s.about}>{vendor.about}</Text>
              </>
            )}

            <View style={s.sectionRow}>
              <Text style={s.section}>THE COLLECTION</Text>
              <Text style={s.count}>
                {products.length} {products.length === 1 ? "PIECE" : "PIECES"}
              </Text>
            </View>
            <View style={s.grid}>
              {products.map((p) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.name}, ${formatNaira(p.price_ngn)}`}
                  style={s.tile}
                  onPress={() =>
                    router.push({
                      pathname: "/product/[id]",
                      params: { id: p.id },
                    })
                  }
                >
                  <View>
                    <Image
                      source={vendorImage(vendor.slug, "product", p.image_url)}
                      contentFit="cover"
                      style={s.tileImage}
                    />
                    {isSoldOut(p) && (
                      <View style={s.soldTag}>
                        <Text style={s.soldTagText}>SOLD OUT</Text>
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={2} style={s.tileName}>
                    {p.name}
                  </Text>
                  <Text style={s.tilePrice}>{formatNaira(p.price_ngn)}</Text>
                </Pressable>
              ))}
            </View>
            {products.length === 0 && (
              <Text style={s.note}>NO PRODUCTS YET. CHECK BACK SOON.</Text>
            )}

            {convention && (
              <View style={s.location}>
                <Text style={s.locationEyebrow}>
                  {eventTitle ? `FIND THEM AT ${eventTitle}` : "FIND THEM HERE"}
                </Text>
                <View style={s.locationRow}>
                  <View>
                    <Text style={s.locationLabel}>BOOTH</Text>
                    <Text style={s.locationValue}>{booth ?? "TBA"}</Text>
                  </View>
                  <Pressable style={s.mapBtn} onPress={() => router.push("/map")}>
                    <Text style={s.mapBtnText}>SHOW ON MAP</Text>
                    <Ionicons name="arrow-forward" size={18} color={C.ink} />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 62,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 20,
    letterSpacing: 1,
  },
  note: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 11,
    textAlign: "center",
    marginTop: 34,
  },
  hero: { height: 270, backgroundColor: C.panel },
  heroShade: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 18,
    justifyContent: "space-between",
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between" },
  kicker: { color: C.neon, fontFamily: F.mono, fontSize: 10 },
  boothTag: {
    color: C.ink,
    backgroundColor: C.neon,
    fontFamily: F.mono,
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
  },
  logo: { width: 64, height: 64, marginBottom: 8 },
  name: { color: C.paper, fontFamily: F.display, fontSize: 40, lineHeight: 44 },
  directions: {
    backgroundColor: C.neon,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  directionsEyebrow: { color: C.ink, fontFamily: F.mono, fontSize: 9 },
  directionsText: { color: C.ink, fontFamily: F.display, fontSize: 20 },
  content: { padding: 20, paddingBottom: 50 },
  section: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 22,
    marginTop: 12,
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
  },
  count: { color: C.muted, fontFamily: F.mono, fontSize: 10, marginBottom: 12 },
  about: { color: C.paper, fontFamily: F.body, fontSize: 16, lineHeight: 24 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 22,
  },
  tile: { width: "48%", gap: 6 },
  tileImage: { width: "100%", height: 200, backgroundColor: C.panel },
  soldTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: C.muted,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  soldTagText: { color: C.ink, fontFamily: F.mono, fontSize: 8 },
  tileName: { color: C.paper, fontFamily: F.display, fontSize: 17, lineHeight: 20 },
  tilePrice: { color: C.neon, fontFamily: F.mono, fontSize: 12 },
  location: {
    marginTop: 34,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    padding: 18,
    gap: 14,
  },
  locationEyebrow: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  locationLabel: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
  locationValue: { color: C.neon, fontFamily: F.display, fontSize: 38 },
  mapBtn: {
    backgroundColor: C.neon,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapBtnText: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
});