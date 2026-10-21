import { C, F, Header } from "@/components/street-souk-ui";
import { useCart } from "@/context/cart-context";
import { useZappieStore } from "@/hooks/use-zappie";
import { formatNaira } from "@/lib/format";
import { zappie } from "@/lib/zappie";
import type { ZQuote } from "@/lib/zappie-types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const naira = (m?: { amount_minor: number } | null) =>
  m ? Math.round(m.amount_minor / 100) : null;

export default function CartScreen() {
  const router = useRouter();
  const { items, setQty, remove, clear } = useCart();
  const { branch } = useZappieStore();
  const [quote, setQuote] = useState<ZQuote | null>(null);
  const [pricing, setPricing] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // ask Zappie for the real price of this exact cart
  useEffect(() => {
    if (!branch || items.length === 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setPricing(true);
    const timer = setTimeout(async () => {
      try {
        const result = await zappie<ZQuote>("/quote", {
          method: "POST",
          body: {
            branch_id: branch.id,
            fulfilment: { type: "pickup" },
            lines: items.map((item, index) => ({
              line_id: String(index),
              item_id: item.productId,
              ...(item.variantId ? { variant_id: item.variantId } : {}),
              quantity: item.qty,
            })),
          },
        });
        if (!cancelled) {
          setQuote(result);
          setQuoteError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setQuoteError(
            e instanceof Error ? e.message : "Could not price your cart.",
          );
        }
      } finally {
        if (!cancelled) setPricing(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [branch, items]);

  const confirmClear = () =>
    Alert.alert("Clear your cart?", "This removes everything in it.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clear },
    ]);

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <Header title="YOUR CART" back />
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <Ionicons name="cart-outline" size={28} color={C.neon} />
          </View>
          <Text style={s.emptyTitle}>YOUR BAG IS EMPTY.</Text>
          <Text style={s.emptyCopy}>
            When you find something you like in the StreetSouk store, it’ll show
            up here.
          </Text>
          <Pressable
            style={s.emptyButton}
            onPress={() => router.replace("/(tabs)/shop")}
          >
            <Text style={s.emptyButtonText}>EXPLORE THE SHOP</Text>
            <Ionicons name="arrow-forward" size={18} color={C.ink} />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const generalIssues = (quote?.issues ?? []).filter(
    (i) => i.line_id === undefined,
  );
  const subtotal =
    naira(quote?.subtotal) ?? items.reduce((n, i) => n + i.qty * i.price, 0);
  const total = naira(quote?.total);

  return (
    <SafeAreaView style={s.safe}>
      <Header title="YOUR CART" back />
      <ScrollView contentContainerStyle={s.list}>
        {generalIssues.map((issue, i) => (
          <Text
            key={i}
            style={[s.issue, issue.severity === "blocking" && s.issueBlocking]}
          >
            {issue.message.toUpperCase()}
          </Text>
        ))}

        {items.map((item, index) => {
          const line = quote?.lines.find((l) => l.line_id === String(index));
          const lineTotal = naira(line?.line_total) ?? item.price * item.qty;
          const lineIssues = (quote?.issues ?? []).filter(
            (i) => i.line_id === String(index),
          );
          return (
            <View key={item.key} style={s.row}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: item.productId },
                  })
                }
              >
                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require("@/assets/images/sslogo.png")
                  }
                  contentFit={item.image ? "cover" : "contain"}
                  style={s.image}
                />
              </Pressable>
              <View style={s.info}>
                <Text style={s.brand}>{item.brand}</Text>
                <Text style={s.name}>{item.name}</Text>
                {!!item.size && <Text style={s.size}>SIZE {item.size}</Text>}
                <Text style={s.price}>{formatNaira(lineTotal)}</Text>
                {lineIssues.map((issue, i) => (
                  <Text
                    key={i}
                    style={[
                      s.issue,
                      issue.severity === "blocking" && s.issueBlocking,
                    ]}
                  >
                    {issue.message.toUpperCase()}
                  </Text>
                ))}
                <View style={s.controls}>
                  <View style={s.stepper}>
                    <Pressable
                      accessibilityLabel="Decrease quantity"
                      onPress={() => setQty(item.key, item.qty - 1)}
                      style={s.stepBtn}
                    >
                      <Ionicons name="remove" size={16} color={C.paper} />
                    </Pressable>
                    <Text style={s.qty}>{item.qty}</Text>
                    <Pressable
                      accessibilityLabel="Increase quantity"
                      disabled={item.qty >= Math.min(10, item.stock ?? 10)}
                      onPress={() => setQty(item.key, item.qty + 1)}
                      style={[
                        s.stepBtn,
                        item.qty >= Math.min(10, item.stock ?? 10) && {
                          opacity: 0.3,
                        },
                      ]}
                    >
                      <Ionicons name="add" size={16} color={C.paper} />
                    </Pressable>
                  </View>
                  <Pressable onPress={() => remove(item.key)}>
                    <Text style={s.remove}>REMOVE</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
        <Pressable onPress={confirmClear} style={s.clear}>
          <Text style={s.clearText}>CLEAR CART</Text>
        </Pressable>
      </ScrollView>

      <View style={s.footer}>
        {quoteError && (
          <Text style={s.issueBlocking}>{quoteError.toUpperCase()}</Text>
        )}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>SUBTOTAL</Text>
          <Text style={s.totalValue}>{formatNaira(subtotal)}</Text>
        </View>
        {(quote?.charges ?? []).map((c) => (
          <View key={c.code + c.label} style={s.totalRow}>
            <Text style={s.totalLabel}>{c.label.toUpperCase()}</Text>
            <Text style={s.totalValue}>
              {formatNaira(naira(c.amount) ?? 0)}
            </Text>
          </View>
        ))}
        {(quote?.discounts ?? []).map((d) => (
          <View key={d.code + d.label} style={s.totalRow}>
            <Text style={s.totalLabel}>{d.label.toUpperCase()}</Text>
            <Text style={s.totalValue}>
              -{formatNaira(Math.abs(naira(d.amount) ?? 0))}
            </Text>
          </View>
        ))}
        <View style={s.totalRow}>
          <Text style={s.grandLabel}>TOTAL</Text>
          <Text style={s.grand}>
            {pricing && total === null
              ? "PRICING..."
              : formatNaira(total ?? subtotal)}
          </Text>
        </View>
        <Text style={s.fine}>
          PRICED BY ZAPPIE FOR PICKUP. DELIVERY IS ADDED AT CHECKOUT.
        </Text>
        <View style={s.checkout}>
          <Text style={s.checkoutText}>CHECKOUT — COMING SOON</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  empty: { flex: 1, justifyContent: "center", padding: 25 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: F.display,
    color: C.neon,
    fontSize: 31,
    marginTop: 18,
  },
  emptyCopy: {
    fontFamily: F.body,
    color: C.muted,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6,
  },
  emptyButton: {
    marginTop: 22,
    padding: 14,
    backgroundColor: C.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyButtonText: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
  list: { padding: 18, gap: 14, paddingBottom: 30 },
  row: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    padding: 12,
  },
  image: { width: 96, height: 120, backgroundColor: C.bg },
  info: { flex: 1, gap: 4 },
  brand: { color: C.muted, fontFamily: F.mono, fontSize: 9 },
  name: { color: C.paper, fontFamily: F.display, fontSize: 20, lineHeight: 23 },
  size: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  price: { color: C.neon, fontFamily: F.mono, fontSize: 13, marginTop: 2 },
  issue: { color: "#FFB020", fontFamily: F.mono, fontSize: 9, lineHeight: 13 },
  issueBlocking: {
    color: "#FF6B6B",
    fontFamily: F.mono,
    fontSize: 9,
    lineHeight: 13,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.line,
  },
  stepBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 13,
    minWidth: 26,
    textAlign: "center",
  },
  remove: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  clear: { alignItems: "center", paddingVertical: 12 },
  clearText: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  footer: {
    borderTopWidth: 2,
    borderTopColor: C.line,
    padding: 18,
    gap: 8,
    backgroundColor: C.bg,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  totalValue: { color: C.paper, fontFamily: F.mono, fontSize: 11 },
  grandLabel: { color: C.paper, fontFamily: F.mono, fontSize: 12 },
  grand: { color: C.neon, fontFamily: F.display, fontSize: 26 },
  fine: { color: C.muted, fontFamily: F.mono, fontSize: 8, marginTop: 2 },
  checkout: {
    height: 54,
    backgroundColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  checkoutText: { color: C.muted, fontFamily: F.mono, fontSize: 11 },
});
