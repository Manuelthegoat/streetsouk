import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { C, F } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";
import { useVendor } from "@/hooks/use-vendor";
import { formatNaira } from "@/lib/format";
import { vendorImage } from "@/lib/vendor-assets";

export default function VendorDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { toggleFavorite, isFavorite } = useStreetSoukStore();
  const { vendor, loading, error, reload } = useVendor(slug);
  const products = vendor?.products ?? [];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={s.back}
        >
          <Ionicons name="arrow-back" size={22} color={C.paper} />
        </Pressable>
        <Text style={s.headerLabel}>VENDOR PROFILE</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View festival map"
          onPress={() => router.push("/map")}
          style={s.mapButton}
        >
          <Ionicons name="map-outline" size={19} color={C.neon} />
        </Pressable>
        {vendor ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${isFavorite(vendor.slug) ? "Remove" : "Save"} ${vendor.name} from favorites`}
            onPress={() => toggleFavorite(vendor.slug)}
            style={s.favorite}
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

      {loading ? (
        <ActivityIndicator color={C.neon} style={{ marginTop: 40 }} />
      ) : !vendor ? (
        <Pressable onPress={error ? reload : () => router.back()}>
          <Text
            style={{
              color: C.muted,
              fontFamily: F.mono,
              textAlign: "center",
              marginTop: 40,
            }}
          >
            {error
              ? "COULD NOT LOAD VENDOR. TAP TO RETRY."
              : "VENDOR NOT FOUND. TAP TO GO BACK."}
          </Text>
        </Pressable>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={vendorImage(vendor.slug, "campaign", vendor.campaign_url)}
            style={s.hero}
            imageStyle={s.heroImage}
          >
            <View style={s.heroShade}>
              <View style={s.heroTopline}>
                <Text style={s.kicker}>{vendor.category}</Text>
                {vendor.booth && (
                  <Text style={s.heroCount}>BOOTH {vendor.booth}</Text>
                )}
              </View>
              <Image
                source={vendorImage(vendor.slug, "logo", vendor.logo_url)}
                style={s.heroLogo}
                resizeMode="contain"
              />
              <Text style={s.heroTitle}>{vendor.name}</Text>
            </View>
          </ImageBackground>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Get directions to booth ${vendor.booth ?? ""}`}
            style={s.directions}
            onPress={() => router.push("/map")}
          >
            <View style={s.directionsIcon}>
              <Ionicons name="navigate" size={17} color={C.neon} />
            </View>
            <View style={s.directionsCopy}>
              <Text style={s.directionsEyebrow}>LOCATE THIS VENDOR</Text>
              <Text style={s.directionsText}>GET DIRECTIONS</Text>
            </View>
            <Ionicons name="arrow-forward" size={22} color={C.ink} />
          </Pressable>

          <View style={s.content}>
            {vendor.about && (
              <>
                <View style={s.sectionHeading}>
                  <Text style={s.sectionNumber}>01</Text>
                  <Text style={s.sectionTitle}>ABOUT THE BRAND</Text>
                </View>
                <Text style={s.about}>{vendor.about}</Text>
              </>
            )}

            {products.length > 0 && (
              <>
                <View style={[s.sectionHeading, s.productHeading]}>
                  <Text style={s.sectionNumber}>02</Text>
                  <Text style={s.sectionTitle}>
                    {products.length > 1 ? "THE DROPS" : "EXCLUSIVE DROP"}
                  </Text>
                </View>
                {products.map((product, index) => (
                  <View
                    key={product.id}
                    style={[s.product, index > 0 && { marginTop: 16 }]}
                  >
                    <View style={s.productImageWrap}>
                      <Image
                        source={vendorImage(
                          vendor.slug,
                          "product",
                          product.image_url,
                        )}
                        style={s.productImage}
                        resizeMode="contain"
                      />
                      <Text style={s.productStamp}>
                        SS26 / {String(index + 1).padStart(3, "0")}
                      </Text>
                    </View>
                    <View style={s.productMeta}>
                      <View>
                        <Text style={s.productEyebrow}>AVAILABLE AT BOOTH</Text>
                        <Text style={s.productName}>{product.name}</Text>
                      </View>
                      <Text style={s.price}>
                        {formatNaira(product.price_ngn)}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>

          <View style={s.location}>
            <View style={s.locationHeader}>
              <View>
                <Text style={s.locationEyebrow}>03 / NAVIGATION</Text>
                <Text style={s.locationTitle}>LOCATION CONTEXT</Text>
              </View>
              <View style={s.boothBadge}>
                <Text style={s.boothLabel}>BOOTH</Text>
                <Text style={s.boothValue}>{vendor.booth ?? "—"}</Text>
              </View>
            </View>
            <View style={s.mapPreview}>
              <View style={s.mapGrid} pointerEvents="none" />
              <View style={s.mapRoadA} />
              <View style={s.mapRoadB} />
              <View style={s.mapZone} />
              <View style={s.mapDot} />
              <Text style={s.mapLabel}>{vendor.booth}</Text>
              <Text style={s.mapNorth}>N</Text>
            </View>
            <View style={s.locationRows}>
              <Text style={s.locationMeta}>
                ZONE{" "}
                <Text style={s.locationValue}>
                  MAIN HALL / {vendor.booth ?? "—"}
                </Text>
              </Text>
              <Text style={s.locationMeta}>
                NEAREST STAGE <Text style={s.locationValue}>SOUND STAGE A</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 64,
    borderBottomWidth: 2,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  back: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 1,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  favorite: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { height: 350, justifyContent: "flex-end", backgroundColor: C.panel },
  heroImage: { opacity: 0.72 },
  heroShade: {
    minHeight: 190,
    justifyContent: "flex-end",
    padding: 18,
    backgroundColor: C.scrim,
  },
  heroTopline: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  kicker: { color: C.neon, fontFamily: F.mono, fontSize: 10, letterSpacing: 1 },
  heroCount: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  heroLogo: { width: 84, height: 60, marginBottom: 12 },
  heroTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 42,
    lineHeight: 47,
  },
  directions: {
    minHeight: 76,
    backgroundColor: C.green,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
  },
  directionsIcon: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  directionsCopy: { flex: 1 },
  directionsEyebrow: {
    color: "rgba(5, 5, 5, 0.62)",
    fontFamily: F.mono,
    fontSize: 9,
    marginBottom: 3,
  },
  directionsText: { color: C.ink, fontFamily: F.display, fontSize: 20 },
  content: { padding: 18, paddingBottom: 34 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  sectionNumber: { color: C.muted, fontFamily: F.mono, fontSize: 11 },
  sectionTitle: { color: C.neon, fontFamily: F.display, fontSize: 20 },
  about: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 17,
    lineHeight: 25,
    paddingLeft: 21,
  },
  productHeading: { marginTop: 32 },
  product: { borderWidth: 2, borderColor: C.line, backgroundColor: C.paper },
  productImageWrap: {
    height: 245,
    position: "relative",
    backgroundColor: C.paper,
  },
  productImage: { width: "100%", height: "100%" },
  productStamp: {
    position: "absolute",
    right: 11,
    top: 11,
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 9,
  },
  productMeta: {
    backgroundColor: C.panel,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  productEyebrow: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 9,
    marginBottom: 5,
  },
  productName: { color: C.neon, fontFamily: F.display, fontSize: 19 },
  price: { color: C.neon, fontFamily: F.mono, fontSize: 12 },
  location: {
    backgroundColor: C.panel,
    padding: 18,
    borderTopWidth: 2,
    borderTopColor: C.line,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  locationEyebrow: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 9,
    marginBottom: 5,
  },
  locationTitle: { color: C.neon, fontFamily: F.display, fontSize: 20 },
  boothBadge: { alignItems: "flex-end" },
  boothLabel: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
  boothValue: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 23,
    marginTop: 2,
  },
  mapPreview: {
    height: 250,
    borderWidth: 2,
    borderColor: C.paper,
    position: "relative",
    backgroundColor: C.mapBg,
    overflow: "hidden",
  },
  mapGrid: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: C.mapGrid,
    opacity: 0.55,
  },
  mapRoadA: {
    position: "absolute",
    width: "150%",
    height: 12,
    backgroundColor: C.mapRoad,
    transform: [{ rotate: "-28deg" }],
    top: "48%",
    left: "-20%",
  },
  mapRoadB: {
    position: "absolute",
    width: "150%",
    height: 8,
    backgroundColor: C.mapRoad,
    transform: [{ rotate: "38deg" }],
    top: "18%",
    left: "-20%",
  },
  mapZone: {
    position: "absolute",
    width: "48%",
    height: "58%",
    left: "26%",
    top: "21%",
    borderWidth: 2,
    borderColor: C.neon,
  },
  mapDot: {
    position: "absolute",
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: C.neon,
    left: "48%",
    top: "46%",
    borderWidth: 3,
    borderColor: C.mapBg,
  },
  mapLabel: {
    position: "absolute",
    left: "45%",
    top: "54%",
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 10,
  },
  mapNorth: {
    position: "absolute",
    right: 12,
    top: 12,
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 11,
  },
  locationRows: { marginTop: 8 },
  locationMeta: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingVertical: 12,
  },
  locationValue: { color: C.paper, fontFamily: F.mono },
});
