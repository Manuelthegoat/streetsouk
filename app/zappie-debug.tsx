import { C, F } from "@/components/street-souk-ui";
import { useZappieMenus } from "@/hooks/use-zappie";
import { formatNaira } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ZappieDebugScreen() {
  const router = useRouter();
  const { store, menus, loading, error, reload } = useZappieMenus();

  const lines: string[] = [];
  if (store) {
    lines.push(`STORE: ${store.name} (${store.currency})`);
    lines.push(`PAYMENT: ${store.payment_methods.join(", ")}`);
    for (const b of store.branches) {
      const modes = Object.entries(b.fulfilment)
        .filter(([, on]) => on)
        .map(([name]) => name)
        .join("/");
      lines.push(
        `BRANCH: ${b.name} | ${b.id}${b.is_default ? " | default" : ""} | ${b.is_open ? "open" : "closed"} | ${modes}`,
      );
    }
  }
  if (menus) {
    lines.push("");
    lines.push(`MENUS (${menus.completeness}):`);
    for (const m of menus.menus) {
      lines.push(`MENU: ${m.name}${m.is_active ? "" : " (inactive)"}`);
      for (const c of m.categories) {
        lines.push(`   - ${c.name} (${c.item_ids.length} items)`);
      }
    }
    const items = Object.values(menus.items);
    lines.push("");
    lines.push(`ITEMS: ${items.length} total. First 6:`);
    for (const it of items.slice(0, 6)) {
      const groups = it.option_groups
        .map(
          (g) =>
            `${g.name}[${g.kind}${g.required ? ",required" : ""}: ${g.choices.map((c) => c.name).join("/")}]`,
        )
        .join("; ");
      lines.push(
        `- ${it.name} | ${formatNaira(it.price.amount_minor / 100)} | ${it.available ? "available" : "sold out"}${it.stock_label ? ` (${it.stock_label})` : ""} | ${it.images.length} img | variants: ${it.variants.length} | ${groups || "no options"}`,
      );
    }
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
        <Text style={s.headerTitle}>ZAPPIE CHECK</Text>
        <Pressable onPress={reload} style={s.iconBtn}>
          <Ionicons name="refresh" size={20} color={C.neon} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {loading && <ActivityIndicator color={C.neon} />}
        {error && <Text style={s.error}>ERROR: {error}</Text>}
        {lines.length > 0 && (
          <Text selectable style={s.text}>
            {lines.join("\n")}
          </Text>
        )}
        <Text style={s.hint}>
          Long-press the text to copy it, or take a screenshot.
        </Text>
      </ScrollView>
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
  headerTitle: { color: C.neon, fontFamily: F.display, fontSize: 20, letterSpacing: 1 },
  content: { padding: 18, paddingBottom: 50, gap: 14 },
  text: { color: C.paper, fontFamily: F.mono, fontSize: 11, lineHeight: 18 },
  error: { color: "#FF6B6B", fontFamily: F.mono, fontSize: 11, lineHeight: 16 },
  hint: { color: C.muted, fontFamily: F.mono, fontSize: 9, marginTop: 10 },
});