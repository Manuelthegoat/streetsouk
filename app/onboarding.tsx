import { C, F } from "@/components/street-souk-ui";
import { SwitchRow } from "@/components/switch-row";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import {
  cleanUsername,
  usernameMessage,
  useUsernameCheck,
} from "@/hooks/use-username-check";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const TITLES = [
  "WHAT SHOULD\nWE CALL YOU?",
  "CLAIM YOUR\nUSERNAME.",
  "STAY IN\nTHE LOOP.",
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, save } = useProfile();
  const [step, setStep] = useState(1);
  const [first, setFirst] = useState(profile?.first_name ?? "");
  const [last, setLast] = useState(profile?.last_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [emailUpdates, setEmailUpdates] = useState(
    profile?.email_updates ?? false,
  );
  const [pushUpdates, setPushUpdates] = useState(
    profile?.push_updates ?? false,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = useUsernameCheck(username, profile?.username);

  const nameOk = first.trim().length > 0 && last.trim().length > 0;
  const canContinue =
    step === 1 ? nameOk : step === 2 ? status === "available" : true;

  async function next() {
    if (!canContinue || saving) return;
    setError(null);
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    const err = await save({
      first_name: first.trim(),
      last_name: last.trim(),
      username,
      email_updates: emailUpdates,
      push_updates: pushUpdates,
      onboarded_at: new Date().toISOString(),
    });
    setSaving(false);
    if (err) {
      setError(err.toUpperCase());
      if (err.toLowerCase().includes("username")) setStep(2);
      return;
    }
    router.replace({ pathname: "/edit-profile", params: { welcome: "1" } });
  }

  const statusColor =
    status === "available"
      ? C.neon
      : status === "empty" || status === "checking"
        ? C.muted
        : "#FF6B6B";

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.progress}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={[s.bar, n <= step && s.barActive]} />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.kicker}>STEP {step} OF 3</Text>
          <Text style={s.title}>{TITLES[step - 1]}</Text>

          {step === 1 && (
            <>
              <Text style={s.copy}>
                Tell us who you are. This is how you'll appear in the app.
              </Text>
              <Text style={s.label}>FIRST NAME</Text>
              <TextInput
                accessibilityLabel="First name"
                value={first}
                onChangeText={setFirst}
                placeholder="FIRST NAME"
                placeholderTextColor={C.muted}
                autoCapitalize="words"
                autoComplete="given-name"
                maxLength={40}
                style={s.input}
              />
              <Text style={s.label}>LAST NAME</Text>
              <TextInput
                accessibilityLabel="Last name"
                value={last}
                onChangeText={setLast}
                placeholder="LAST NAME"
                placeholderTextColor={C.muted}
                autoCapitalize="words"
                autoComplete="family-name"
                maxLength={40}
                style={s.input}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={s.copy}>
                Pick a handle that's yours. You can change it later.
              </Text>
              <Text style={s.label}>USERNAME</Text>
              <View style={s.handleRow}>
                <Text style={s.at}>@</Text>
                <TextInput
                  accessibilityLabel="Username"
                  value={username}
                  onChangeText={(text) => setUsername(cleanUsername(text))}
                  placeholder="yourname"
                  placeholderTextColor={C.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  style={[s.input, s.handleInput]}
                />
              </View>
              <Text style={[s.status, { color: statusColor }]}>
                {usernameMessage[status]}
              </Text>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={s.copy}>
                Choose what you'd like to hear about. You can change this any
                time in your profile.
              </Text>
              <SwitchRow
                title="EMAIL UPDATES"
                detail="Drops, events and news from Street Souk."
                value={emailUpdates}
                onChange={setEmailUpdates}
              />
              <SwitchRow
                title="PUSH NOTIFICATIONS"
                detail="A heads-up when something goes live."
                value={pushUpdates}
                onChange={setPushUpdates}
              />
            </>
          )}

          {error && <Text style={s.error}>{error}</Text>}

          <Pressable
            accessibilityRole="button"
            onPress={next}
            disabled={!canContinue || saving}
            style={[s.button, (!canContinue || saving) && s.buttonDisabled]}
          >
            {saving ? (
              <ActivityIndicator color={C.ink} />
            ) : (
              <>
                <Text style={s.buttonText}>
                  {step === 3 ? "FINISH" : "CONTINUE"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={C.ink} />
              </>
            )}
          </Pressable>

          {step > 1 && (
            <Pressable onPress={() => setStep(step - 1)} style={s.link}>
              <Text style={s.linkText}>BACK</Text>
            </Pressable>
          )}
          {step === 1 && (
            <Pressable onPress={() => signOut()} style={s.link}>
              <Text style={s.linkText}>SIGN OUT</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  progress: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  bar: { flex: 1, height: 4, backgroundColor: C.line },
  barActive: { backgroundColor: C.neon },
  content: { padding: 24, paddingBottom: 44 },
  kicker: { color: C.muted, fontFamily: F.mono, fontSize: 10, marginTop: 10 },
  title: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 42,
    lineHeight: 46,
    marginTop: 6,
  },
  copy: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 14,
  },
  label: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 10,
    marginTop: 26,
    marginBottom: 8,
  },
  input: {
    height: 58,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 15,
    paddingHorizontal: 16,
  },
  handleRow: { flexDirection: "row", alignItems: "center" },
  at: { color: C.neon, fontFamily: F.display, fontSize: 24, marginRight: 8 },
  handleInput: { flex: 1 },
  status: { fontFamily: F.mono, fontSize: 10, marginTop: 10, lineHeight: 15 },
  error: {
    color: "#FF6B6B",
    fontFamily: F.mono,
    fontSize: 10,
    marginTop: 16,
    lineHeight: 15,
  },
  button: {
    height: 58,
    backgroundColor: C.neon,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: C.ink, fontFamily: F.display, fontSize: 18 },
  link: { alignItems: "center", paddingVertical: 16 },
  linkText: { color: C.neon, fontFamily: F.mono, fontSize: 10 },
});
