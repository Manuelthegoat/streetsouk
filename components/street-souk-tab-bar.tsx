import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "@/components/street-souk-ui";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  map: "map-outline",
  schedule: "calendar-outline",
  vendors: "storefront-outline",
  feed: "radio-outline",
};

export function StreetSoukTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : (options.title ?? route.name);
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              navigation.navigate(route.name);
            }}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            style={[s.item, focused && s.active]}
          >
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={23}
              color={focused ? C.ink : C.paper}
            />
            <Text style={[s.label, focused && s.activeLabel]}>
              {String(label).toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    minHeight: 78,
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: C.bg,
    borderTopWidth: 2,
    borderTopColor: C.line,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    gap: 5,
  },
  item: {
    flex: 1,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    gap: 5,
  },
  active: {
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.paper,
    shadowColor: C.green,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  label: {
    color: C.paper,
    fontFamily: "JetBrains Mono",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0,
  },
  activeLabel: { color: C.ink },
});
