import { C, F } from "@/components/street-souk-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
export default function TicketsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.paper} />
        </Pressable>
        <Text style={s.headerTitle}>STREET SOUK CONVENTION</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={s.content}>
        <View style={s.icon}>
          <Ionicons name="ticket-outline" size={28} color={C.neon} />
        </View>
        <Text style={s.title}>YOUR WAY IN.</Text>
        <Text style={s.copy}>
          Ticket details for the next Street Souk Convention will be announced
          here.
        </Text>
        <View style={s.info}>
          <Text style={s.label}>TICKETS</Text>
          <Text style={s.value}>COMING SOON</Text>
          <View style={s.rule} />
          <Text style={s.note}>
            Follow StreetSouk for the official release date and ticket link.
          </Text>
        </View>
        <Pressable
          style={s.button}
          onPress={() => router.replace("/(tabs)/events")}
        >
          <Text style={s.buttonText}>BACK TO EVENTS</Text>
          <Ionicons name="arrow-forward" size={18} color={C.ink} />
        </Pressable>
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: C.neon, fontFamily: F.mono, fontSize: 9 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  icon: {
    width: 54,
    height: 54,
    borderWidth: 1,
    borderColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: C.neon, fontFamily: F.display, fontSize: 38, marginTop: 18 },
  copy: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 17,
    lineHeight: 23,
    marginTop: 5,
  },
  info: {
    marginTop: 22,
    padding: 17,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  label: { color: C.neon, fontFamily: F.mono, fontSize: 9 },
  value: { color: C.neon, fontFamily: F.display, fontSize: 24, marginTop: 5 },
  rule: { height: 1, backgroundColor: C.line, marginVertical: 13 },
  note: { color: C.muted, fontFamily: F.body, fontSize: 14, lineHeight: 19 },
  button: {
    marginTop: 18,
    backgroundColor: C.green,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonText: { color: C.ink, fontFamily: F.mono, fontSize: 10 },
});
