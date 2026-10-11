import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useCart } from "@/context/cart-context";

export const C = {
  bg: "#050505",
  panel: "#101810",
  paper: "#FFFFFF",
  muted: "#A6B8AD",
  ink: "#050505",
  green: "#008751",
  neon: "#39FF14",
  line: "#23543D",
  mapBg: "#080D09",
  mapGrid: "#173323",
  mapRoad: "#183A29",
  mapZone: "#101810",
  mapZoneBorder: "#23543D",
  mapText: "#537561",
  scrim: "rgba(5, 5, 5, 0.62)",
};
export const F = {
  display: "Anton",
  body: "Archivo Narrow",
  bodyBold: "Archivo Narrow Bold",
  mono: "JetBrains Mono",
} as const;
export function CartBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <View style={ui.cartBadge}>
      <Text style={ui.cartBadgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}
export function Header({
  title = "STREET SOUK",
  back = false,
}: {
  title?: string;
  back?: boolean;
}) {
  const router = useRouter();
  return (
    <View style={ui.header}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(tabs)")
          }
          style={ui.headerSide}
        >
          <Ionicons name="arrow-back" size={23} color={C.paper} />
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to home"
          onPress={() => router.replace("/(tabs)")}
          style={ui.headerSide}
        >
          <Image
            accessibilityLabel="Street Souk"
            source={require("@/assets/images/sslogo.png")}
            contentFit="contain"
            style={ui.logoImage}
          />
        </Pressable>
      )}
      <Text numberOfLines={1} style={ui.headerTitle}>
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open cart"
        onPress={() => router.push("/cart")}
        style={[ui.headerSide, ui.cart]}
      >
        <View>
          <Ionicons name="cart-outline" size={23} color={C.paper} />
          <CartBadge />
        </View>
      </Pressable>
    </View>
  );
}

export function PageTitle({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <View style={ui.pageTitle}>
      {eyebrow && <Text style={ui.eyebrow}>{eyebrow}</Text>}
      <Text style={ui.title}>{title}</Text>
      <View style={ui.rule} />
    </View>
  );
}

export const ui = StyleSheet.create({
  header: {
    height: 58,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  headerSide: { width: 62, height: 42, justifyContent: "center" },
  logoImage: { width: 58, height: 32 },
  headerTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 24,
    textAlign: "center",
    flex: 1,
    letterSpacing: 1,
  },
  cart: { alignItems: "flex-end" },
  pageTitle: { marginTop: 24, marginBottom: 16 },
  eyebrow: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  title: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 38,
    letterSpacing: 1,
  },
  rule: { height: 2, backgroundColor: C.line },
  cartBadge: {
    position: "absolute",
    top: -7,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: C.ink, fontFamily: F.mono, fontSize: 9 },
});
