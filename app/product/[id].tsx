import { ProductDetailSkeleton } from "@/components/skeleton";
import { C, CartBadge, F } from "@/components/street-souk-ui";
import { useCart } from "@/context/cart-context";
import { useProduct } from "@/hooks/use-product";
import { formatNaira } from "@/lib/format";
import { vendorImage } from "@/lib/vendor-assets";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { product, loading } = useProduct(id);
  const { add, items } = useCart();
  const { width } = useWindowDimensions();
  const [size, setSize] = useState<string | null>(null);
  const [needSize, setNeedSize] = useState(false);
  const [added, setAdded] = useState(false);
  const [page, setPage] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const remote = product
    ? [product.image_url, ...(product.gallery ?? [])].filter(
        (u): u is string => !!u,
      )
    : [];
  const slides = product
    ? remote.length > 0
      ? remote.map((uri) => ({ uri }))
      : [vendorImage(product.vendors.slug, "product", null)]
    : [];
  const paragraphs = (product?.description ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const inCart = !!product && items.some((i) => i.productId === product.id);

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  function handleAdd() {
    if (!product || !product.in_stock) return;
    if ((product.sizes ?? []).length > 0 && !size) {
      setNeedSize(true);
      return;
    }
    add({
      productId: product.id,
      size,
      name: product.name,
      brand: product.vendors.name,
      vendorSlug: product.vendors.slug,
      price: product.price_ngn,
      image: product.image_url,
    });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }

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
        <Text style={s.headerTitle}>THE STORE</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open cart"
          onPress={() => router.push("/cart")}
          style={s.iconBtn}
        >
          <View>
            <Ionicons name="cart-outline" size={22} color={C.paper} />
            <CartBadge />
          </View>
        </Pressable>
      </View>

      {loading ? (
        <ProductDetailSkeleton />
      ) : !product ? (
        <Pressable onPress={() => router.back()}>
          <Text style={s.notFound}>
            THIS PRODUCT IS NO LONGER AVAILABLE. TAP TO GO BACK.
          </Text>
        </Pressable>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
          >
            {slides.map((source, i) => (
              <Image
                key={i}
                source={source}
                contentFit="cover"
                style={{ width, height: width * 1.1, backgroundColor: C.panel }}
              />
            ))}
          </ScrollView>
          {slides.length > 1 && (
            <View style={s.dots}>
              {slides.map((_, i) => (
                <View key={i} style={[s.dot, i === page && s.dotActive]} />
              ))}
            </View>
          )}

          <View style={s.content}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${product.vendors.name}`}
              style={s.brandRow}
              onPress={() =>
                router.push({
                  pathname: "/vendor/[slug]",
                  params: { slug: product.vendors.slug },
                })
              }
            >
              <Text style={s.brand}>{product.vendors.name}</Text>
              <Text style={s.brandLink}>VIEW BRAND ↗</Text>
            </Pressable>

            <Text style={s.name}>{product.name}</Text>
            <View style={s.priceRow}>
              <Text style={s.price}>{formatNaira(product.price_ngn)}</Text>
              {!product.in_stock && (
                <View style={s.soldTag}>
                  <Text style={s.soldTagText}>SOLD OUT</Text>
                </View>
              )}
            </View>

            {(product.sizes ?? []).length > 0 && (
              <>
                <Text style={s.label}>SIZE</Text>
                <View style={s.sizes}>
                  {product.sizes.map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected: size === option }}
                      onPress={() => {
                        setSize(option);
                        setNeedSize(false);
                      }}
                      style={[s.size, size === option && s.sizeActive]}
                    >
                      <Text
                        style={[s.sizeText, size === option && s.sizeTextActive]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {needSize && <Text style={s.error}>PLEASE CHOOSE A SIZE.</Text>}
              </>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={!product.in_stock}
              onPress={handleAdd}
              style={[
                s.add,
                !product.in_stock && s.addDisabled,
                added && s.addDone,
              ]}
            >
              <Text style={s.addText}>
                {!product.in_stock
                  ? "SOLD OUT"
                  : added
                    ? "ADDED TO CART ✓"
                    : "ADD TO CART"}
              </Text>
            </Pressable>
            {inCart && (
              <Pressable style={s.viewCart} onPress={() => router.push("/cart")}>
                <Text style={s.viewCartText}>VIEW CART →</Text>
              </Pressable>
            )}

            {paragraphs.length > 0 && (
              <>
                <View style={s.rule} />
                <Text style={s.label}>DETAILS</Text>
                {paragraphs.map((p, i) => (
                  <Text key={i} style={s.paragraph}>
                    {p}
                  </Text>
                ))}
              </>
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
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  dot: { width: 8, height: 8, backgroundColor: C.line },
  dotActive: { backgroundColor: C.neon },
  content: { padding: 20, paddingBottom: 50 },
  brandRow: { flexDirection: "row", justifyContent: "space-between" },
  brand: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  brandLink: { color: C.neon, fontFamily: F.mono, fontSize: 10 },
  name: {
    color: C.paper,
    fontFamily: F.display,
    fontSize: 36,
    lineHeight: 40,
    marginTop: 10,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  price: { color: C.neon, fontFamily: F.mono, fontSize: 18 },
  soldTag: { backgroundColor: C.muted, paddingHorizontal: 8, paddingVertical: 4 },
  soldTagText: { color: C.ink, fontFamily: F.mono, fontSize: 9 },
  label: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 10,
    marginTop: 24,
    marginBottom: 10,
  },
  sizes: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  size: {
    minWidth: 52,
    height: 44,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  sizeActive: { backgroundColor: C.neon, borderColor: C.neon },
  sizeText: { color: C.paper, fontFamily: F.mono, fontSize: 12 },
  sizeTextActive: { color: C.ink },
  error: { color: "#FF6B6B", fontFamily: F.mono, fontSize: 10, marginTop: 10 },
  add: {
    marginTop: 24,
    height: 56,
    backgroundColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  addDisabled: { backgroundColor: C.line },
  addDone: { backgroundColor: C.green },
  addText: { color: C.ink, fontFamily: F.display, fontSize: 20, letterSpacing: 1 },
  viewCart: { alignItems: "center", paddingVertical: 14 },
  viewCartText: { color: C.neon, fontFamily: F.mono, fontSize: 11 },
  rule: { height: 2, backgroundColor: C.line, marginTop: 14 },
  paragraph: {
    color: C.paper,
    fontFamily: F.body,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },
  notFound: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 11,
    textAlign: "center",
    marginTop: 40,
  },
});