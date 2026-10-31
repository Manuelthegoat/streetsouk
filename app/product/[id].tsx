import { ProductDetailSkeleton } from "@/components/skeleton";
import { C, CartBadge, F } from "@/components/street-souk-ui";
import { useCart } from "@/context/cart-context";
import { useStreetSoukStore } from "@/context/street-souk-store";
import { useCatalog } from "@/hooks/use-catalog";
import { brandKey } from "@/lib/brand";
import { formatNaira } from "@/lib/format";
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

const FALLBACK = require("@/assets/images/sslogo.png");

export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catalog, loading } = useCatalog();
  const product = catalog?.byId.get(id) ?? null;
  const { add, items } = useCart();
  const { isProductWishlisted, toggleWishlistedProduct } = useStreetSoukStore();
  const { width } = useWindowDimensions();
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [needChoice, setNeedChoice] = useState(false);
  const [added, setAdded] = useState(false);
  const [page, setPage] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const item = product?.item;
  // "attribute" groups pick a variant, like Size
  const groups = (item?.option_groups ?? []).filter((g) => g.kind === "attribute");
  const unsupported = (item?.option_groups ?? []).some(
    (g) => g.kind !== "attribute" && g.required,
  );
  const hasChoices = groups.length > 0;
  const allPicked = groups.every((g) => !!picked[g.id]);

  const variant = !item
    ? undefined
    : !hasChoices
      ? item.variants[0]
      : allPicked
        ? item.variants.find((v) =>
            groups.every((g) => v.choice_ids.includes(picked[g.id])),
          )
        : undefined;

  const soldOut = !!item && !item.available;
  const variantSoldOut = !!variant && !variant.available;
  const unitPrice = variant ? variant.price.amount_minor / 100 : (product?.price ?? 0);
  const sizeLabel = hasChoices
    ? groups
        .map((g) => g.choices.find((c) => c.id === picked[g.id])?.name)
        .filter(Boolean)
        .join(" / ")
    : null;
  const lowStock = hasChoices
    ? !!variant?.low_stock
    : product?.stockLabel?.toLowerCase().includes("low") === true;

  const choiceOut = (choice: { id: string; available: boolean }) =>
    !choice.available ||
    (groups.length === 1 &&
      !!item &&
      !item.variants.some((v) => v.choice_ids.includes(choice.id) && v.available));

  const cartKey = item ? `${item.id}:${variant?.id ?? ""}` : "";
  const inCartQty = items.find((i) => i.key === cartKey)?.qty ?? 0;
  const maxQty = Math.min(10, item?.max_quantity ?? 10);
  const maxed = inCartQty >= maxQty;
  const inCart = !!item && items.some((i) => i.productId === item.id);
  const blocked = soldOut || variantSoldOut || unsupported || maxed;

  const slides = product
    ? product.images.length > 0
      ? product.images.map((uri) => ({ uri }))
      : [FALLBACK]
    : [];
  const paragraphs = (product?.description ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  function handleAdd() {
    if (!product || !item || soldOut || unsupported) return;
    if (hasChoices && !allPicked) {
      setNeedChoice(true);
      return;
    }
    if (variantSoldOut || maxed) return;
    add({
      productId: item.id,
      variantId: variant?.id ?? null,
      size: sizeLabel,
      stock: maxQty,
      name: product.name,
      brand: product.brand,
      price: unitPrice,
      image: product.images[0] ?? null,
    });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }

  const buttonLabel = soldOut
    ? "SOLD OUT"
    : unsupported
      ? "NOT AVAILABLE IN THE APP YET"
      : variantSoldOut
        ? "THIS SIZE IS SOLD OUT"
        : maxed
          ? "MAXIMUM ADDED"
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
        <View style={s.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${isProductWishlisted(id) ? "Remove from" : "Add to"} wishlist`}
            onPress={() => toggleWishlistedProduct(id)}
            style={s.iconBtn}
          >
            <Ionicons
              name={isProductWishlisted(id) ? "heart" : "heart-outline"}
              size={21}
              color={C.neon}
            />
          </Pressable>
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
      </View>

      {loading && !catalog ? (
        <ProductDetailSkeleton />
      ) : !product || !item ? (
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
                contentFit={product.images.length > 0 ? "cover" : "contain"}
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
              accessibilityLabel={`View ${product.brand}`}
              style={s.brandRow}
              onPress={() =>
                router.push({
                  pathname: "/brand/[key]",
                  params: { key: brandKey(product.brand) },
                })
              }
            >
              <Text style={s.brand}>{product.brand}</Text>
              <Text style={s.brandLink}>VIEW BRAND ↗</Text>
            </Pressable>

            <Text style={s.name}>{product.name}</Text>
            <View style={s.priceRow}>
              <Text style={s.price}>{formatNaira(unitPrice)}</Text>
              {!!product.previousPrice && product.previousPrice > unitPrice && (
                <Text style={s.was}>{formatNaira(product.previousPrice)}</Text>
              )}
              {soldOut && (
                <View style={s.soldTag}>
                  <Text style={s.soldTagText}>SOLD OUT</Text>
                </View>
              )}
            </View>

            {groups.map((group) => (
              <View key={group.id}>
                <Text style={s.label}>{group.name.toUpperCase()}</Text>
                <View style={s.sizes}>
                  {group.choices.map((choice) => {
                    const out = choiceOut(choice);
                    const selected = picked[group.id] === choice.id;
                    return (
                      <Pressable
                        key={choice.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected, disabled: out }}
                        disabled={out}
                        onPress={() => {
                          setPicked((cur) => ({ ...cur, [group.id]: choice.id }));
                          setNeedChoice(false);
                        }}
                        style={[s.size, selected && s.sizeActive, out && s.sizeOut]}
                      >
                        <Text
                          style={[
                            s.sizeText,
                            selected && s.sizeTextActive,
                            out && s.sizeTextOut,
                          ]}
                        >
                          {choice.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            {needChoice && <Text style={s.error}>PLEASE CHOOSE AN OPTION.</Text>}
            {lowStock && !soldOut && !variantSoldOut && (
              <Text style={s.low}>LOW STOCK</Text>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={blocked}
              onPress={handleAdd}
              style={[s.add, blocked && s.addDisabled, added && s.addDone]}
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  was: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 13,
    textDecorationLine: "line-through",
  },
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
