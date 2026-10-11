import { C, F, Header } from "@/components/street-souk-ui";
import { useCart } from "@/context/cart-context";
import { formatNaira } from "@/lib/format";
import { vendorImage } from "@/lib/vendor-assets";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const { items, subtotal, setQty, remove, clear } = useCart();

  const confirmClear = () =>
    Alert.alert("Clear your cart?", "This removes everything in it.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clear },
    ]);

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <Header title="YOUR CART" />
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

  return (
    <SafeAreaView style={s.safe}>
      <Header title="YOUR CART" />
      <ScrollView contentContainerStyle={s.list}>
        {items.map((item) => (
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
                source={vendorImage(item.vendorSlug, "product", item.image)}
                contentFit="cover"
                style={s.image}
              />
            </Pressable>
            <View style={s.info}>
              <Text style={s.brand}>{item.brand}</Text>
              <Text style={s.name}>{item.name}</Text>
              {!!item.size && <Text style={s.size}>SIZE {item.size}</Text>}
              <Text style={s.price}>{formatNaira(item.price * item.qty)}</Text>
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
                    onPress={() => setQty(item.key, item.qty + 1)}
                    style={s.stepBtn}
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
        ))}
        <Pressable onPress={confirmClear} style={s.clear}>
          <Text style={s.clearText}>CLEAR CART</Text>
        </Pressable>
      </ScrollView>

      <View style={s.footer}>
        <View style={s.subtotalRow}>
          <Text style={s.subtotalLabel}>SUBTOTAL</Text>
          <Text style={s.subtotal}>{formatNaira(subtotal)}</Text>
        </View>
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
  emptyTitle: { fontFamily: F.display, color: C.neon, fontSize: 31, marginTop: 18 },
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
  stepBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  qty: { color: C.paper, fontFamily: F.mono, fontSize: 13, minWidth: 26, textAlign: "center" },
  remove: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  clear: { alignItems: "center", paddingVertical: 12 },
  clearText: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  footer: {
    borderTopWidth: 2,
    borderTopColor: C.line,
    padding: 18,
    gap: 14,
    backgroundColor: C.bg,
  },
  subtotalRow: { flexDirection: "row", justifyContent: "space-between" },
  subtotalLabel: { color: C.muted, fontFamily: F.mono, fontSize: 11 },
  subtotal: { color: C.neon, fontFamily: F.display, fontSize: 24 },
  checkout: {
    height: 54,
    backgroundColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutText: { color: C.muted, fontFamily: F.mono, fontSize: 11 },
});