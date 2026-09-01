import { C, F, Header, PageTitle } from "@/components/street-souk-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const VENDORS = [
  {
    name: "BOLAPSD.",
    type: "FOOTWEAR",
    booth: "B-12",
    detail: "Exclusive drops, rare deadstock, and custom streetwear polo.",
    image: require("@/assets/brands/bolapsd.png"),
  },
  {
    name: "IYOO CARTEL",
    type: "APPAREL",
    booth: "A-04",
    detail: "MEMBERS ONLY. Streetwear and accessories from the IYOO CARTEL collective.",
    image: require("@/assets/brands/iyoocartel.png"),
  },
  {
    name: "BONFO",
    type: "ACCESSORIES",
    booth: "C-22",
    detail: "NEO-AFRICAN FASHION",
    image: require("@/assets/brands/bonfo.png"),
  },
  {
    name: "THE CHROME PILGRIM",
    type: "ACCESSORIES",
    booth: "C-22",
    detail: "Chains, pendants, and grills. Heavy metals only.",
    image: require("@/assets/brands/TCP.png"),
  },
  {
    name: "GREATERTHAN00",
    type: "ACCESSORIES",
    booth: "C-22",
    detail: "Chains, pendants, and grills. Heavy metals only.",
    image: require("@/assets/brands/ssx_logo.png"),
  },
];

export default function VendorsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () =>
      VENDORS.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(query.toLowerCase()) ||
          vendor.type.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <SafeAreaView style={s.safe}>
      <Header />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <PageTitle title="VENDORS" />
        <View style={s.search}>
          <Ionicons name="search" size={23} color={C.paper} />
          <TextInput
            accessibilityLabel="Search vendor directory"
            placeholder="SEARCH DIRECTORY..."
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            style={s.input}
          />
        </View>
        {visible.map((vendor) => (
          <View key={vendor.name} style={s.vendor}>
            <View style={s.vendorTop}>
              <View style={s.vendorIcon}>
                <Image
                  source={vendor.image}
                  style={s.vendorImage}
                  resizeMode="contain"
                />
              </View>
              <View style={s.vendorMeta}>
                <Text style={s.type}>{vendor.type}</Text>
                <Text style={s.booth}>{vendor.booth}</Text>
              </View>
            </View>
            <Text style={s.name}>{vendor.name}</Text>
            <Text style={s.detail}>{vendor.detail}</Text>
            <Pressable onPress={() => router.push("/map")} style={s.show}>
              <Text style={s.showText}>VIEW LOCATION</Text>
              <Ionicons name="arrow-forward" size={20} color={C.ink} />
            </Pressable>
          </View>
        ))}
        {visible.length === 0 && <Text style={s.empty}>NO VENDORS FOUND</Text>}
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
  vendorTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  vendorIcon: {
    width: 100,
    height: 100,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  vendorImage: { width: 88, height: 88 },
  vendorMeta: { alignItems: "flex-end", gap: 9 },
  type: {
    backgroundColor: C.green,
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  booth: {
    borderWidth: 1,
    borderColor: C.green,
    color: C.green,
    fontFamily: F.mono,
    fontSize: 11,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  name: { color: C.paper, fontFamily: F.display, fontSize: 28, marginTop: 22 },
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
