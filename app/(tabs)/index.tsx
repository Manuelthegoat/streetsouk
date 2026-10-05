import { C, F, Header } from "@/components/street-souk-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const getFestivalTarget = () => {
    const now = new Date();
    const year = now.getFullYear();
    const target = new Date(year, 11, 22, 0, 0, 0); // Dec 22 at midnight

    if (now > target) {
      return new Date(year + 1, 11, 22, 0, 0, 0);
    }

    return target;
  };

  const [targetDate] = useState(() => getFestivalTarget());
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return Math.floor(diff / 1000);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setSecondsLeft(Math.floor(diff / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const days = String(Math.floor(secondsLeft / 86400)).padStart(2, "0");
  const hours = String(Math.floor((secondsLeft % 86400) / 3600)).padStart(
    2,
    "0",
  );
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const time = `${days} : ${hours} : ${minutes} : ${seconds}`;
  return (
    <SafeAreaView style={s.safe}>
      <Header />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.hero}>
          <View style={s.bracketTL} />
          <View style={s.bracketBR} />
          <Text style={s.heroLabel}>FESTIVAL DATES</Text>
          <Text style={s.date}>DEC 22</Text>
          <View style={s.dropTag}>
            <Text style={s.dropTagText}>NEXT MAJOR DROP</Text>
          </View>
          <Text style={s.countdown}>{time}</Text>
          <View style={s.clockLabels}>
            <Text style={s.clockText}>DAYS</Text>
            <Text style={s.clockText}>HRS</Text>
            <Text style={s.clockText}>MIN</Text>
            <Text style={s.clockText}>SEC</Text>
          </View>
        </View>
        <View style={s.ticker}>
          <Ionicons name="notifications-outline" size={18} color={C.ink} />
          <Text style={s.tickerText}>
            STAGE 1: PERFORMANCE STARTING IN 10 MINS
          </Text>
        </View>
        <View style={s.sectionHeading}>
          <Text style={s.sectionTitle}>FEATURED DROPS</Text>
          <View style={s.rule} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.cards}
        >
          <View style={s.dropCard}>
            <View style={[s.fakeImage, { backgroundColor: C.mapRoad }]}> 
              <Image
                source={require("@/assets/brands/bolapsdpolo.png")}
                style={s.productImage}
                resizeMode="cover"
              />
              <Text style={s.imageStamp}>LIVE DROP</Text>
            </View>
            <View style={s.cardFooter}>
              <Text style={s.cardTitle}>BOLAPSD X STREETSOUK</Text>
              <Text style={s.cardMeta}>Booth 12 / Main Hall</Text>
            </View>
          </View>
          <View style={s.dropCard}>
            <View style={[s.fakeImage, { backgroundColor: C.mapZone }]}> 
              <Image
                source={require("@/assets/brands/bonfotrouser.png")}
                style={s.productImage}
                resizeMode="cover"
              />
              <Text style={s.imageStamp}>LIVE DROP</Text>
            </View>
            <View style={s.cardFooter}>
              <Text style={s.cardTitle}>BONFO</Text>
              <Text style={s.cardMeta}>GREEN Zone</Text>
            </View>
          </View>
        </ScrollView>
        <Pressable onPress={() => router.push("/map")} style={s.mapAction}>
          <Ionicons name="map-outline" size={29} color={C.ink} />
          <Text style={s.mapActionText}>EXPLORE THE MAP</Text>
          <Ionicons name="arrow-forward" size={24} color={C.ink} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 72,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: C.line,
  },
  logo: {
    color: C.paper,
    fontFamily: F.display,
    fontSize: 23,
    letterSpacing: 1,
  },
  profile: {
    width: 35,
    height: 35,
    borderWidth: 2,
    borderColor: C.green,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, paddingBottom: 28 },
  hero: {
    height: 300,
    backgroundColor: C.panel,
    borderWidth: 2,
    borderColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 16,
    marginHorizontal: 4,
    shadowColor: C.green,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  bracketTL: {
    position: "absolute",
    width: 25,
    height: 25,
    left: -2,
    top: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: C.paper,
  },
  bracketBR: {
    position: "absolute",
    width: 25,
    height: 25,
    right: -2,
    bottom: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: C.paper,
  },
  heroLabel: { color: C.green, fontFamily: F.display, fontSize: 36 },
  date: { color: C.paper, fontFamily: F.display, fontSize: 34 },
  dropTag: {
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 20,
  },
  dropTagText: { color: C.ink, fontFamily: F.mono, fontSize: 12 },
  countdown: {
    color: C.green,
    fontFamily: F.display,
    fontSize: 38,
    marginTop: 10,
  },
  clockLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 280,
  },
  clockText: { color: C.muted, fontFamily: F.mono, fontSize: 12 },
  ticker: {
    backgroundColor: C.green,
    padding: 17,
    marginTop: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tickerText: { color: C.ink, fontFamily: F.mono, fontSize: 11, flex: 1 },
  sectionHeading: { marginTop: 31 },
  sectionTitle: { color: C.paper, fontFamily: F.display, fontSize: 27 },
  rule: { height: 2, backgroundColor: C.line, marginTop: 9 },
  cards: { gap: 16, paddingTop: 16, paddingBottom: 26 },
  dropCard: {
    width: 275,
    borderWidth: 2,
    borderColor: C.paper,
    backgroundColor: C.bg,
  },
  fakeImage: {
    height: 235,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageStamp: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: C.paper,
    color: C.ink,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontFamily: F.mono,
    fontSize: 10,
  },
  cardFooter: { padding: 11, borderTopWidth: 2, borderTopColor: C.paper },
  cardTitle: { color: C.green, fontFamily: F.display, fontSize: 22 },
  cardMeta: { color: C.paper, fontFamily: F.body, fontSize: 14, marginTop: 3 },
  mapAction: {
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.ink,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: C.green,
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  mapActionText: { color: C.ink, fontFamily: F.display, fontSize: 19 },
});
