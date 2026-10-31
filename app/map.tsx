import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { C, F, Header } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";

const points = [
  ["MAIN STAGE", "STAGE", "29%", "18%", "volume-high"],
  ["HYPE BRAND A", "APPAREL", "59%", "30%", "shirt-outline"],
  ["SNEAKER ZONE", "APPAREL", "65%", "43%", "shirt-outline"],
  ["FOOD COURT", "FOOD", "22%", "64%", "restaurant-outline"],
  ["SOUND SYSTEM B", "STAGE", "74%", "59%", "stats-chart-outline"],
  ["TOILETS", "TOILET", "50%", "79%", "male-female-outline"],
];
const categories = ["ALL", "STAGE", "APPAREL", "FOOD", "TOILET"];
export default function MapScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [selected, setSelected] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [zoom, setZoom] = useState(1);
  const { startingPoint, setStartingPoint } = useStreetSoukStore();
  const visible = useMemo(
    () =>
      points.filter(
        (p) =>
          (category === "ALL" || p[1] === category) &&
          (!query || p[0].toLowerCase().includes(query.toLowerCase())),
      ),
    [category, query],
  );
  const locate = async () => {
    setLocating(true);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.granted) {
      await Location.getCurrentPositionAsync({});
      setLocated(true);
      setStartingPoint("YOU ARE HERE");
    }
    setLocating(false);
  };
  return (
    <SafeAreaView style={s.safe}>
      <Header title="MAP" back/>
      <View style={s.content}>
        <View style={s.search}>
          <Ionicons name="search" size={20} color={C.paper} />
          <TextInput
            placeholder="FIND VENDOR OR STAGE"
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            style={s.input}
          />
        </View>
        <View style={s.heading}>
          <View>
            <Text style={s.eyebrow}>STREET SOUK 2026 / MAIN HALL</Text>
            <Text style={s.title}>VENUE MAP</Text>
          </View>
          <Text style={s.live}>MAP PREVIEW</Text>
        </View>
        <View style={s.mapFrame}>
          <View style={[s.map, { transform: [{ scale: zoom }] }]}>
            <View style={s.grid} />
            <View style={[s.road, s.v]} />
            <View style={[s.road, s.h]} />
            <View style={[s.zone, s.z1]}>
              <Text style={s.zoneText}>NORTH LOT</Text>
            </View>
            <View style={[s.zone, s.z2]}>
              <Text style={s.zoneText}>MARKET ROW</Text>
            </View>
            <View style={s.here}>
              <View style={s.ring} />
              <View style={s.dot} />
              <Text style={s.hereLabel}>
                {located ? "YOU ARE HERE" : startingPoint}
              </Text>
            </View>
            {visible.map((p) => {
              const active = p[0] === selected;
              return (
                <Pressable
                  key={p[0]}
                  onPress={() => setSelected(active ? null : p[0])}
                  style={[
                    s.marker,
                    { left: p[2] as `${number}%`, top: p[3] as `${number}%` },
                    active && s.active,
                  ]}
                >
                  <Ionicons
                    name={p[4] as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={p[0] === "MAIN STAGE" ? C.neon : C.paper}
                  />
                  {active && <Text style={s.callout}>{p[0]}</Text>}
                </Pressable>
              );
            })}
          </View>
          <View style={s.tools}>
            <Pressable
              accessibilityLabel="Use my location"
              onPress={locate}
              style={s.tool}
            >
              <Ionicons
                name={locating ? "sync-outline" : "locate-outline"}
                size={19}
                color={located ? C.neon : C.paper}
              />
            </Pressable>
            <Pressable
              accessibilityLabel="Zoom in"
              onPress={() => setZoom((value) => Math.min(2, value + 0.2))}
              style={s.tool}
            >
              <Ionicons name="add" size={19} color={C.paper} />
            </Pressable>
            <Pressable
              accessibilityLabel="Zoom out"
              onPress={() => setZoom((value) => Math.max(1, value - 0.2))}
              style={s.tool}
            >
              <Ionicons name="remove" size={19} color={C.paper} />
            </Pressable>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categories}
        >
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[s.category, category === item && s.categoryActive]}
            >
              <Text
                style={[
                  s.categoryText,
                  category === item && s.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {selected && (
          <View style={s.prompt}>
            <Text style={s.promptText}>{selected}</Text>
            <Pressable
              onPress={() => setStartingPoint(selected)}
              style={s.route}
            >
              <Text style={s.routeText}>SET START</Text>
              <Ionicons name="arrow-forward" size={18} color={C.ink} />
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  search: {
    height: 52,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    backgroundColor: C.panel,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    flex: 1,
    color: C.paper,
    fontFamily: F.mono,
    marginLeft: 10,
    fontSize: 13,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginVertical: 17,
  },
  eyebrow: { color: C.paper, fontFamily: F.mono, fontSize: 10, letterSpacing: 1.2 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 34, letterSpacing: 0.6 },
  live: { color: C.neon, fontFamily: F.mono, fontSize: 10, letterSpacing: 1 },
  mapFrame: {
    height: 405,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    backgroundColor: C.mapBg,
  },
  map: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#0A100C",
    position: "relative",
  },
  grid: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: C.mapGrid,
    opacity: 0.32,
  },
  road: {
    position: "absolute",
    backgroundColor: "#173323",
    borderWidth: 1,
    borderColor: "#28563B",
  },
  v: { width: 42, top: -20, bottom: -20, left: "49%" },
  h: { height: 38, left: -20, right: -20, top: "48%" },
  zone: {
    position: "absolute",
    backgroundColor: "#111D14",
    borderWidth: 1,
    borderColor: "#2D6946",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  z1: { width: "34%", height: "22%", left: "7%", top: "7%" },
  z2: { width: "30%", height: "23%", left: "5%", top: "54%" },
  zoneText: { color: C.paper, fontFamily: F.mono, fontSize: 9, letterSpacing: 0.8 },
  here: { position: "absolute", left: "47%", top: "43%", alignItems: "center" },
  ring: {
    position: "absolute",
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.neon,
    opacity: 0.35,
    top: -9,
    left: -9,
  },
  dot: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: C.neon,
    borderWidth: 2,
    borderColor: C.mapBg,
  },
  hereLabel: {
    marginTop: 7,
    color: C.paper,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 6,
    padding: 5,
    fontFamily: F.mono,
    fontSize: 9,
  },
  marker: {
    position: "absolute",
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    backgroundColor: "#0A100C",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.36,
    shadowRadius: 7,
    elevation: 4,
  },
  active: { backgroundColor: C.neon, borderColor: C.neon },
  callout: {
    position: "absolute",
    top: 47,
    minWidth: 100,
    color: C.paper,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 7,
    padding: 5,
    fontFamily: F.mono,
    fontSize: 9,
    textAlign: "center",
  },
  tools: { position: "absolute", right: 12, bottom: 12, gap: 7 },
  tool: {
    width: 42,
    height: 42,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categories: { gap: 9, paddingVertical: 15 },
  category: {
    height: 36,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
    justifyContent: "center",
  },
  categoryActive: {
    backgroundColor: C.neon,
    borderColor: C.neon,
  },
  categoryText: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  categoryTextActive: { color: C.ink },
  prompt: {
    padding: 12,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promptText: { color: C.paper, fontFamily: F.display, fontSize: 17 },
  route: {
    backgroundColor: C.neon,
    borderRadius: 9,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeText: { color: C.ink, fontFamily: F.mono, fontSize: 11, fontWeight: "700" },
});
