import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { C, F } from "@/components/street-souk-ui";
import { useAuth } from "@/context/auth-context";

const OTP_LENGTH = 6; // must match "Email OTP Length" in Supabase
const RESEND_SECONDS = 30;

export default function SignInScreen() {
  const router = useRouter();
  const { sendCode, verifyCode } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const cleanEmail = email.trim().toLowerCase();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/(tabs)");

  async function requestCode() {
    if (!validEmail || busy) return;
    setBusy(true);
    setError(null);
    const err = await sendCode(cleanEmail);
    setBusy(false);
    if (err) {
      setError(err.toUpperCase());
      return;
    }
    setStep("code");
    setCode("");
    setCooldown(RESEND_SECONDS);
  }

  async function submitCode() {
    if (code.length < OTP_LENGTH || busy) return;
    setBusy(true);
    setError(null);
    const err = await verifyCode(cleanEmail, code);
    setBusy(false);
    if (err) {
      setError("THAT CODE DIDN'T WORK. CHECK IT OR REQUEST A NEW ONE.");
      return;
    }
    close();
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={close}
          style={s.close}
        >
          <Ionicons name="close" size={22} color={C.paper} />
        </Pressable>
        <Text style={s.headerTitle}>SIGN IN</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {step === "email" ? (
            <>
              <Text style={s.kicker}>YOUR STREET SOUK</Text>
              <Text style={s.title}>SIGN IN OR{"\n"}JOIN THE SOUK.</Text>
              <Text style={s.copy}>
                Enter your email and we'll send you a code. No password needed.
              </Text>
              <Text style={s.label}>EMAIL</Text>
              <TextInput
                accessibilityLabel="Email address"
                value={email}
                onChangeText={setEmail}
                placeholder="YOU@EXAMPLE.COM"
                placeholderTextColor={C.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={requestCode}
                style={s.input}
              />
              {error && <Text style={s.error}>{error}</Text>}
              <Pressable
                accessibilityRole="button"
                onPress={requestCode}
                disabled={!validEmail || busy}
                style={[s.button, (!validEmail || busy) && s.buttonDisabled]}
              >
                {busy ? (
                  <ActivityIndicator color={C.ink} />
                ) : (
                  <>
                    <Text style={s.buttonText}>SEND ME A CODE</Text>
                    <Ionicons name="arrow-forward" size={20} color={C.ink} />
                  </>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={s.kicker}>CHECK YOUR EMAIL</Text>
              <Text style={s.title}>ENTER YOUR{"\n"}CODE.</Text>
              <Text style={s.copy}>
                We sent a {OTP_LENGTH}-digit code to {cleanEmail}.
              </Text>
              <Text style={s.label}>CODE</Text>
              <TextInput
                accessibilityLabel="Sign in code"
                value={code}
                onChangeText={(text) =>
                  setCode(text.replace(/\D/g, "").slice(0, OTP_LENGTH))
                }
                placeholder={"0".repeat(OTP_LENGTH)}
                placeholderTextColor={C.muted}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={OTP_LENGTH}
                autoFocus
                style={[s.input, s.codeInput]}
              />
              {error && <Text style={s.error}>{error}</Text>}
              <Pressable
                accessibilityRole="button"
                onPress={submitCode}
                disabled={code.length < OTP_LENGTH || busy}
                style={[
                  s.button,
                  (code.length < OTP_LENGTH || busy) && s.buttonDisabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={C.ink} />
                ) : (
                  <>
                    <Text style={s.buttonText}>VERIFY & SIGN IN</Text>
                    <Ionicons name="arrow-forward" size={20} color={C.ink} />
                  </>
                )}
              </Pressable>
              <Pressable
                onPress={requestCode}
                disabled={cooldown > 0 || busy}
                style={s.link}
              >
                <Text style={[s.linkText, cooldown > 0 && { color: C.muted }]}>
                  {cooldown > 0 ? `RESEND CODE IN ${cooldown}S` : "RESEND CODE"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setStep("email");
                  setError(null);
                }}
                style={s.link}
              >
                <Text style={s.linkText}>USE A DIFFERENT EMAIL</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    height: 72,
    borderBottomWidth: 2,
    borderBottomColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  close: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: C.neon, fontFamily: F.display, fontSize: 22 },
  content: { padding: 24, paddingBottom: 44 },
  kicker: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
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
    marginTop: 30,
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
  codeInput: {
    fontSize: 26,
    letterSpacing: 8,
    textAlign: "center",
  },
  error: {
    color: "#FF6B6B",
    fontFamily: F.mono,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
  },
  button: {
    height: 58,
    backgroundColor: C.neon,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 22,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: C.ink, fontFamily: F.display, fontSize: 18 },
  link: { alignItems: "center", paddingVertical: 14, marginTop: 4 },
  linkText: { color: C.neon, fontFamily: F.mono, fontSize: 10 },
});