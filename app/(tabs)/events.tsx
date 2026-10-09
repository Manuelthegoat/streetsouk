import { C, F, Header } from "@/components/street-souk-ui";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function EventsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe}>
      <Header title="EVENTS" />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.heading}>UPCOMING EVENTS</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Street Souk Convention"
          onPress={() =>
            router.push({
              pathname: "/events/[id]",
              params: { id: "street-souk-convention" },
            })
          }
        >
          <ImageBackground
            source={require("@/assets/brands/bolacampaign.jpg")}
            imageStyle={s.image}
            style={s.card}
          >
            <View style={s.overlay}>
              <View style={s.badge}>
                <Text style={s.badgeText}>STREET SOUK PRESENTS</Text>
              </View>
              <View>
                <Text style={s.title}>STREET SOUK{"\n"}CONVENTION</Text>
                <View style={s.footer}>
                  <Text style={s.date}>LAGOS, NIGERIA / DATE TBA</Text>
                  <Text style={s.arrow}>↗</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingTop: 20 },
  heading: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 23,
    marginBottom: 14,
  },
  card: {
    height: 420,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.paper,
  },
  image: { opacity: 0.68 },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: C.paper,
  },
  badgeText: { color: C.ink, fontFamily: F.mono, fontSize: 9 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 36, lineHeight: 39 },
  footer: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: C.paper,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: { color: C.paper, fontFamily: F.mono, fontSize: 9 },
  arrow: { color: C.neon, fontSize: 23 },
});
