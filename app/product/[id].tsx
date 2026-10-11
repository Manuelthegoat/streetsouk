import { ProductDetailSkeleton } from "@/components/skeleton";
import { C, CartBadge, F } from "@/components/street-souk-ui";
import { useCart } from "@/context/cart-context";
import { useProduct } from "@/hooks/use-product";
import { formatNaira } from "@/lib/format";
import { isSoldOut } from "@/lib/stock";
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

  const sizeStock = product?.size_stock ?? [];
  const hasSizes = sizeStock.length > 0;
  const soldOut = product ? isSoldOut(product) : false;
  // how many of the chosen size (or of the whole product) can be bought
  const available = !product
    ? 0
    : hasSizes
      ? (sizeStock.find((s) => s.size === size)?.stock ?? 0)
      : Math.max(0, product.stock);
  const needsChoice = hasSizes && !size;
  const cartKey = product ? `${product.id}:${size ?? ""}` : "";
  const inCartQty = items.find((i) => i.key === cartKey)?.qty ?? 0;
  const sizeSoldOut = hasSizes && !!size && available <= 0;
  const maxed = !needsChoice && available > 0 && inCartQty >= available;
  const canAdd = !soldOut && !sizeSoldOut && !maxed;
  const inCart = !!product && items.some((i) => i.productId === product.id);

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

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  function handleAdd() {
    if (!product || soldOut) return;
    if (needsChoice) {
      setNeedSize(true);
      return;
    }
    if (!canAdd) return;
    add({
      productId: product.id,
      size,
      stock: available,
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

  const buttonLabel = soldOut
    ? "SOLD OUT"
    : sizeSoldOut
      ? "THIS SIZE IS SOLD OUT"
      : maxed
        ? "ALL AVAILABLE ADDED"
        : added
          ? "ADDED TO CART ✓"
          : "ADD TO CART";

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
              {soldOut && (
                <View style={s.soldTag}>
                  <Text style={s.soldTagText}>SOLD OUT</Text>
                </View>
              )}
            </View>

            {hasSizes && (
              <>
                <Text style={s.label}>SIZE</Text>
                <View style={s.sizes}>
                  {sizeStock.map((option) => {
                    const out = option.stock <= 0;
                    const selected = size === option.size;
                    return (
                      <Pressable
                        key={option.size}
                        accessibilityRole="button"
                        accessibilityState={{ selected, disabled: out }}
                        disabled={out}
                        onPress={() => {
                          setSize(option.size);
                          setNeedSize(false);
                        }}
                        style={[
                          s.size,
                          selected && s.sizeActive,
                          out && s.sizeOut,
                        ]}
                      >
                        <Text
                          style={[
                            s.sizeText,
                            selected && s.sizeTextActive,
                            out && s.sizeTextOut,
                          ]}
                        >
                          {option.size}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {needSize && <Text style={s.error}>PLEASE CHOOSE A SIZE.</Text>}
              </>
            )}

            {!soldOut && !needsChoice && available > 0 && available <= 5 && (
              <Text style={s.low}>ONLY {available} LEFT</Text>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={soldOut || (!needsChoice && !canAdd)}
              onPress={handleAdd}
              style={[
                s.add,
                (soldOut || (!needsChoice && !canAdd)) && s.addDisabled,
                added && s.addDone,
              ]}
            >
              <Text style={s.addText}>{buttonLabel}</Text>
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
  sizeOut: { opacity: 0.4 },
  sizeText: { color: C.paper, fontFamily: F.mono, fontSize: 12 },
  sizeTextActive: { color: C.ink },
  sizeTextOut: { textDecorationLine: "line-through", color: C.muted },
  error: { color: "#FF6B6B", fontFamily: F.mono, fontSize: 10, marginTop: 10 },
  low: { color: "#FFB020", fontFamily: F.mono, fontSize: 11, marginTop: 14 },
  add: {
    marginTop: 20,
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