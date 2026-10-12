import { C, F } from "@/components/street-souk-ui";
import { SwitchRow } from "@/components/switch-row";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import {
  cleanUsername,
  usernameMessage,
  useUsernameCheck,
} from "@/hooks/use-username-check";
import { pickAndUploadAvatar } from "@/lib/avatar";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const isWelcome = welcome === "1";
  const { user } = useAuth();
  const { profile, save } = useProfile();

  const [first, setFirst] = useState(profile?.first_name ?? "");
  const [last, setLast] = useState(profile?.last_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatar, setAvatar] = useState<string | null>(
    profile?.avatar_url ?? null,
  );
  const [emailUpdates, setEmailUpdates] = useState(
    profile?.email_updates ?? false,
  );
  const [pushUpdates, setPushUpdates] = useState(
    profile?.push_updates ?? false,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = useUsernameCheck(username, profile?.username);

  const nameOk = first.trim().length > 0 && last.trim().length > 0;
  const canSave = nameOk && status === "available" && !uploading && !saving;

  async function changePicture() {
    if (!user || uploading) return;
    setUploading(true);
    setError(null);
    const result = await pickAndUploadAvatar(user.id);
    setUploading(false);
    if (result.error) setError(result.error.toUpperCase());
    else if (result.url) setAvatar(result.url);
  }

  async function submit() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const err = await save({
      first_name: first.trim(),
      last_name: last.trim(),
      username,
      bio: bio.trim() || null,
      avatar_url: avatar,
      email_updates: emailUpdates,
      push_updates: pushUpdates,
    });
    setSaving(false);
    if (err) {
      setError(err.toUpperCase());
      return;
    }
    if (isWelcome) router.replace("/(tabs)");
    else router.back();
  }

  const statusColor =
    status === "available"
      ? C.neon
      : status === "empty" || status === "checking"
        ? C.muted
        : "#FF6B6B";

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        {isWelcome ? (
          <View style={{ width: 40 }} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={s.iconBtn}
          >
            <Ionicons name="arrow-back" size={22} color={C.paper} />
          </Pressable>
        )}
        <Text style={s.headerTitle}>
          {isWelcome ? "MAKE IT YOURS" : "EDIT PROFILE"}
        </Text>
        {isWelcome ? (
          <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={10}>
            <Text style={s.skip}>SKIP</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.avatarWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
              onPress={changePicture}
              style={s.avatar}
            >
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  contentFit="cover"
                  style={s.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={46} color={C.muted} />
              )}
              {uploading && (
                <View style={s.avatarBusy}>
                  <ActivityIndicator color={C.neon} />
                </View>
              )}
            </Pressable>
            <Pressable onPress={changePicture} disabled={uploading}>
              <Text style={s.linkText}>
                {avatar ? "CHANGE PICTURE" : "ADD A PICTURE"}
              </Text>
            </Pressable>
            {!!avatar && (
              <Pressable onPress={() => setAvatar(null)}>
                <Text style={[s.linkText, { color: C.muted }]}>REMOVE</Text>
              </Pressable>
            )}
          </View>

          <View style={s.row2}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>FIRST NAME</Text>
              <TextInput
                value={first}
                onChangeText={setFirst}
                autoCapitalize="words"
                maxLength={40}
                placeholderTextColor={C.muted}
                style={s.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>LAST NAME</Text>
              <TextInput
                value={last}
                onChangeText={setLast}
                autoCapitalize="words"
                maxLength={40}
                placeholderTextColor={C.muted}
                style={s.input}
              />
            </View>
          </View>

          <Text style={s.label}>USERNAME</Text>
          <View style={s.handleRow}>
            <Text style={s.at}>@</Text>
            <TextInput
              value={username}
              onChangeText={(t) => setUsername(cleanUsername(t))}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              placeholderTextColor={C.muted}
              style={[s.input, { flex: 1 }]}
            />
          </View>
          <Text style={[s.status, { color: statusColor }]}>
            {usernameMessage[status]}
          </Text>

          <Text style={s.label}>BIO</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={160}
            placeholder="A line about you"
            placeholderTextColor={C.muted}
            style={[s.input, s.bio]}
          />
          <Text style={s.counter}>{bio.length}/160</Text>

          <Text style={[s.label, { marginTop: 22 }]}>UPDATES</Text>
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

          {error && <Text style={s.error}>{error}</Text>}

          <Pressable
            accessibilityRole="button"
            onPress={submit}
            disabled={!canSave}
            style={[s.button, !canSave && s.buttonDisabled]}
          >
            {saving ? (
              <ActivityIndicator color={C.ink} />
            ) : (
              <Text style={s.buttonText}>
                {isWelcome ? "SAVE & CONTINUE" : "SAVE CHANGES"}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: {
    color: C.neon,
    fontFamily: F.display,
    fontSize: 20,
    letterSpacing: 1,
  },
  skip: { color: C.neon, fontFamily: F.mono, fontSize: 11 },
  content: { padding: 24, paddingBottom: 50 },
  avatarWrap: { alignItems: "center", gap: 10, marginBottom: 6 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: C.neon,
    backgroundColor: C.panel,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarBusy: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: { color: C.neon, fontFamily: F.mono, fontSize: 10 },
  row2: { flexDirection: "row", gap: 12 },
  label: {
    color: C.neon,
    fontFamily: F.mono,
    fontSize: 10,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    color: C.paper,
    fontFamily: F.mono,
    fontSize: 14,
    paddingHorizontal: 14,
  },
  handleRow: { flexDirection: "row", alignItems: "center" },
  at: { color: C.neon, fontFamily: F.display, fontSize: 22, marginRight: 8 },
  status: { fontFamily: F.mono, fontSize: 10, marginTop: 8 },
  bio: { height: 96, paddingTop: 14, textAlignVertical: "top" },
  counter: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 9,
    textAlign: "right",
    marginTop: 6,
  },
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
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: C.ink, fontFamily: F.display, fontSize: 18 },
});
