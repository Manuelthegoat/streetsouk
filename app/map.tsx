import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { C, F, Header } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";
import { useVendors } from "@/hooks/use-vendors";
import {
  getDirections,
  MAP_HEIGHT,
  MAP_WIDTH,
  placesWithVendors,
  type MapCategory,
  type MapPlace,
} from "@/lib/festival-map";

const categoryFilters: { label: string; value: MapCategory | "ALL" }[] = [
  { label: "ALL", value: "ALL" },
  { label: "STAGES", value: "STAGE" },
  { label: "VENDORS", value: "VENDOR" },
  { label: "FOOD", value: "FOOD" },
  { label: "ACTIVITIES", value: "ACTIVITY" },
  { label: "SERVICES", value: "SERVICE" },
  { label: "AMENITIES", value: "AMENITY" },
  { label: "ACCESS", value: "ACCESSIBILITY" },
  { label: "ENTRANCES", value: "ENTRANCE" },
  { label: "EXITS", value: "EXIT" },
  { label: "WATER", value: "WATER" },
  { label: "TRANSPORT", value: "TRANSPORT" },
];

const defaultPlace = (places: MapPlace[]) =>
  places.find((place) => place.id === "main-entry") ?? places[0];

export default function MapScreen() {
  const { vendors } = useVendors();
  const places = useMemo(() => placesWithVendors(vendors), [vendors]);
  const { startingPoint, setStartingPoint } = useStreetSoukStore();
  const [startId, setStartId] = useState("main-entry");
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MapCategory | "ALL">("ALL");
  const [zoom, setZoom] = useState(1);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const savedPlace = places.find(
      (place) => place.name.toLowerCase() === startingPoint.toLowerCase(),
    );
    const savedAliases: Record<string, string> = {
      "NORTH ENTRANCE": "main-entry",
      "MAIN HALL CHECK-IN": "main-entry",
      "EAST ENTRANCE": "east-exit",
      "YOU ARE HERE": "main-entry",
    };
    const savedId = savedPlace?.id ?? savedAliases[startingPoint.toUpperCase()];
    if (savedId) setStartId(savedId);
  }, [places, startingPoint]);

  const start = places.find((place) => place.id === startId) ?? defaultPlace(places);
  const destination = places.find((place) => place.id === destinationId);
  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return places.filter((place) => {
      const matchesCategory = category === "ALL" || place.category === category;
      const searchable = `${place.name} ${place.category} ${place.detail ?? ""} ${place.boothCode ?? ""}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, places, query]);
  const route = useMemo(
    () => (start && destination ? getDirections(start, destination) : null),
    [destination, start],
  );

  const onMapLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMapSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  };

  const selectStart = (place: MapPlace) => {
    setStartId(place.id);
    setStartingPoint(place.name);
    setDestinationId(null);
  };

  const zoomBy = (delta: number) =>
    setZoom((value) => Math.max(1, Math.min(2.4, Number((value + delta).toFixed(1)))));

  const displayedPlaces = useMemo(() => {
    const byId = new Map(filteredPlaces.map((place) => [place.id, place]));
    if (start) byId.set(start.id, start);
    if (destination) byId.set(destination.id, destination);
    return [...byId.values()];
  }, [destination, filteredPlaces, start]);

  const mapWidth = mapSize.width * zoom;
  const mapHeight = mapSize.height * zoom;

  return (
    <SafeAreaView style={s.safe}>
      <Header title="MAP" back />
      <ScrollView
        style={s.content}
        contentContainerStyle={s.contentInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.search}>
          <Ionicons name="search" size={20} color={C.paper} />
          <TextInput
            accessibilityLabel="Search map locations"
            placeholder="FIND A PLACE, BRAND OR BOOTH"
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            style={s.input}
            returnKeyType="search"
          />
          {!!query && (
            <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={19} color={C.muted} />
            </Pressable>
          )}
        </View>

        {query.trim().length > 0 && (
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.searchResults}
          >
            {filteredPlaces.slice(0, 12).map((place) => (
              <Pressable
                key={place.id}
                onPress={() => setDestinationId(place.id)}
                style={s.resultChip}
              >
                <Ionicons name={place.icon as keyof typeof Ionicons.glyphMap} size={14} color={C.neon} />
                <Text numberOfLines={1} style={s.resultText}>{place.name}</Text>
              </Pressable>
            ))}
            {filteredPlaces.length === 0 && (
              <Text style={s.noResults}>NO MATCHING PLACES</Text>
            )}
          </ScrollView>
        )}

        <View style={s.heading}>
          <View>
            <Text style={s.eyebrow}>STREET SOUK 2026 / EVENT GROUNDS</Text>
            <Text style={s.title}>VENUE MAP</Text>
          </View>
          <Text style={s.live}>WAYFINDING</Text>
        </View>

        <View style={s.mapFrame} onLayout={onMapLayout}>
          {mapSize.width > 0 && (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              style={StyleSheet.absoluteFill}
              contentContainerStyle={{ width: mapWidth, height: mapSize.height }}
            >
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={{ width: mapWidth, height: mapSize.height }}
                contentContainerStyle={{ width: mapWidth, height: mapHeight }}
              >
                <View style={[s.mapCanvas, { width: mapWidth, height: mapHeight }]}>
                  <Image
                    source={require("@/assets/maps/street-souk-floor-plan.svg")}
                    contentFit="fill"
                    style={StyleSheet.absoluteFill}
                    accessibilityLabel="Street Souk event floor plan"
                  />

                  {route && route.points.length > 1 && mapWidth > 0 && (
                    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                      {route.points.slice(1).map((point, index) => {
                        const previous = route.points[index];
                        const x1 = (previous.x / MAP_WIDTH) * mapWidth;
                        const y1 = (previous.y / MAP_HEIGHT) * mapHeight;
                        const x2 = (point.x / MAP_WIDTH) * mapWidth;
                        const y2 = (point.y / MAP_HEIGHT) * mapHeight;
                        const length = Math.hypot(x2 - x1, y2 - y1);
                        const angle = Math.atan2(y2 - y1, x2 - x1);
                        return (
                          <View
                            key={`route-${index}`}
                            style={[
                              s.routeSegment,
                              {
                                left: (x1 + x2) / 2 - length / 2,
                                top: (y1 + y2) / 2 - 2,
                                width: length,
                                transform: [{ rotate: `${angle}rad` }],
                              },
                            ]}
                          />
                        );
                      })}
                    </View>
                  )}

                  {displayedPlaces.map((place) => {
                    const isStart = place.id === start?.id;
                    const isDestination = place.id === destination?.id;
                    return (
                      <Pressable
                        key={place.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${place.name}${isStart ? ", route start" : ""}${isDestination ? ", selected destination" : ""}`}
                        onPress={() => setDestinationId(place.id)}
                        style={[
                          s.marker,
                          { left: `${(place.x / MAP_WIDTH) * 100}%`, top: `${(place.y / MAP_HEIGHT) * 100}%` },
                          isStart && s.startMarker,
                          isDestination && s.destinationMarker,
                        ]}
                      >
                        <Ionicons
                          name={place.icon as keyof typeof Ionicons.glyphMap}
                          size={isStart || isDestination ? 16 : 11}
                          color={isStart || isDestination ? C.ink : C.paper}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </ScrollView>
          )}

          <View style={s.tools}>
            <Pressable accessibilityLabel="Zoom in" onPress={() => zoomBy(0.2)} style={s.tool}>
              <Ionicons name="add" size={19} color={C.paper} />
            </Pressable>
            <Pressable accessibilityLabel="Zoom out" onPress={() => zoomBy(-0.2)} style={s.tool}>
              <Ionicons name="remove" size={19} color={C.paper} />
            </Pressable>
            <Pressable accessibilityLabel="Reset map zoom" onPress={() => setZoom(1)} style={s.tool}>
              <Ionicons name="scan-outline" size={17} color={C.paper} />
            </Pressable>
          </View>
        </View>

        <Text style={s.mapHint}>
          ZOOM TO PAN · TAP A MARKER FOR DIRECTIONS · BLUE IS YOUR ROUTE
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categories}
        >
          {categoryFilters.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected: category === item.value }}
              onPress={() => setCategory(item.value)}
              style={[s.category, category === item.value && s.categoryActive]}
            >
              <Text style={[s.categoryText, category === item.value && s.categoryTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {destination ? (
          <View style={s.directionsCard}>
            <View style={s.directionsHeader}>
              <View style={s.directionsTitles}>
                <Text style={s.directionEyebrow}>DIRECTIONS</Text>
                <Text style={s.directionTitle} numberOfLines={2}>{destination.name}</Text>
                <Text style={s.directionFrom}>FROM {start?.name ?? "MAIN ENTRY"}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Set ${destination.name} as route start`}
                onPress={() => selectStart(destination)}
                style={s.setStartButton}
              >
                <Text style={s.setStartText}>SET START</Text>
              </Pressable>
            </View>
            {destination.id === start?.id ? (
              <Text style={s.routeNote}>This is already your starting point.</Text>
            ) : route ? (
              <View style={s.steps}>
                {route.steps.map((step, index) => (
                  <View key={`${index}-${step}`} style={s.stepRow}>
                    <View style={s.stepNumber}>
                      <Text style={s.stepNumberText}>{String(index + 1).padStart(2, "0")}</Text>
                    </View>
                    <Text style={s.stepText}>{step}</Text>
                  </View>
                ))}
                <Text style={s.routeNote}>Illustrative route · the floor plan is not to scale.</Text>
              </View>
            ) : (
              <Text style={s.routeNote}>No walkable route was found between these map points.</Text>
            )}
          </View>
        ) : (
          <View style={s.emptyHint}>
            <Ionicons name="navigate-outline" size={20} color={C.neon} />
            <Text style={s.emptyHintText}>
              Starting at {start?.name ?? "Main Entry"}. Tap a place on the map or search above to get directions.
            </Text>
          </View>
        )}

        <Text style={s.disclaimer}>
          Routes follow the generated floor plan. Follow event staff instructions for exits and accessible paths.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 28 },
  search: {
    height: 52,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    backgroundColor: C.panel,
    gap: 9,
  },
  input: { flex: 1, color: C.paper, fontFamily: F.mono, fontSize: 12 },
  searchResults: { gap: 8, paddingTop: 10 },
  resultChip: {
    minHeight: 34,
    maxWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 17,
    backgroundColor: C.panel,
  },
  resultText: { color: C.paper, fontFamily: F.mono, fontSize: 9, flexShrink: 1 },
  noResults: { color: C.muted, fontFamily: F.mono, fontSize: 9, padding: 9 },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginVertical: 15,
  },
  eyebrow: { color: C.paper, fontFamily: F.mono, fontSize: 9, letterSpacing: 0.8 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 32, letterSpacing: 0.6 },
  live: { color: C.neon, fontFamily: F.mono, fontSize: 9, letterSpacing: 0.8 },
  mapFrame: {
    width: "100%",
    aspectRatio: MAP_WIDTH / MAP_HEIGHT,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#F7F9FA",
  },
  mapCanvas: { position: "relative", overflow: "hidden", backgroundColor: "#F7F9FA" },
  marker: {
    position: "absolute",
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(29,44,54,0.88)",
    borderWidth: 1.5,
    borderColor: C.paper,
    borderRadius: 10,
    zIndex: 2,
  },
  startMarker: {
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    backgroundColor: "#54D6A0",
    borderRadius: 15,
    zIndex: 4,
  },
  destinationMarker: {
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    backgroundColor: "#5DB5FF",
    borderRadius: 15,
    zIndex: 5,
  },
  routeSegment: {
    position: "absolute",
    height: 5,
    borderRadius: 3,
    backgroundColor: "#2674C7",
    opacity: 0.88,
    zIndex: 1,
  },
  tools: { position: "absolute", right: 8, bottom: 8, gap: 6, zIndex: 10 },
  tool: {
    width: 36,
    height: 36,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mapHint: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 8,
    letterSpacing: 0.45,
    marginTop: 8,
  },
  categories: { gap: 8, paddingVertical: 13 },
  category: {
    height: 34,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 17,
    justifyContent: "center",
  },
  categoryActive: { backgroundColor: C.neon, borderColor: C.neon },
  categoryText: { color: C.paper, fontFamily: F.mono, fontSize: 9 },
  categoryTextActive: { color: C.ink },
  directionsCard: {
    padding: 14,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
  },
  directionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  directionsTitles: { flex: 1, gap: 4 },
  directionEyebrow: { color: C.neon, fontFamily: F.mono, fontSize: 9, letterSpacing: 1 },
  directionTitle: { color: C.paper, fontFamily: F.display, fontSize: 21, lineHeight: 24 },
  directionFrom: { color: C.muted, fontFamily: F.mono, fontSize: 8 },
  setStartButton: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 11,
    backgroundColor: C.neon,
    borderRadius: 9,
  },
  setStartText: { color: C.ink, fontFamily: F.mono, fontSize: 9, fontWeight: "700" },
  steps: { gap: 10, marginTop: 14 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  stepNumber: {
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2674C7",
    borderRadius: 14,
  },
  stepNumberText: { color: "#FFFFFF", fontFamily: F.mono, fontSize: 8, fontWeight: "700" },
  stepText: { flex: 1, color: C.paper, fontFamily: F.body, fontSize: 13, lineHeight: 18, paddingTop: 3 },
  routeNote: { color: C.muted, fontFamily: F.mono, fontSize: 8, lineHeight: 13, marginTop: 10 },
  emptyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
  },
  emptyHintText: { flex: 1, color: C.paper, fontFamily: F.body, fontSize: 13, lineHeight: 18 },
  disclaimer: { color: C.muted, fontFamily: F.body, fontSize: 11, lineHeight: 15, marginTop: 13 },
});
