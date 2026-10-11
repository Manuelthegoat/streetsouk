import { VendorDetailSkeleton } from "@/components/skeleton";
import { C, F } from "@/components/street-souk-ui";
import { useTopics } from "@/hooks/use-home";
import { useNewsPost } from "@/hooks/use-news";
import { formatDate } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function NewsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { post, loading } = useNewsPost(id);
  const { topics } = useTopics();
  const topic = topics.find((t) => t.id === post?.topic_id)?.label;
  const paragraphs = (post?.body ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={s.back}
        >
          <Ionicons name="arrow-back" size={22} color={C.paper} />
        </Pressable>
        <Text style={s.headerTitle}>SS TV</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <VendorDetailSkeleton />
      ) : !post ? (
        <Pressable onPress={() => router.back()}>
          <Text style={s.notFound}>
            THIS STORY IS NO LONGER AVAILABLE. TAP TO GO BACK.
          </Text>
        </Pressable>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {!!post.cover_url && (
            <Image
              source={{ uri: post.cover_url }}
              contentFit="cover"
              style={s.cover}
            />
          )}
          <View style={s.content}>
            <View style={s.metaRow}>
              <Text style={s.topic}>{topic ?? "SS TV"}</Text>
              <Text style={s.date}>{formatDate(post.published_at)}</Text>
            </View>
            <Text style={s.title}>{post.title}</Text>
            {!!post.excerpt && <Text style={s.excerpt}>{post.excerpt}</Text>}
            <View style={s.rule} />
            {paragraphs.map((p, i) => (
              <Text key={i} style={s.paragraph}>
                {p}
              </Text>
            ))}
            {!!post.video_url && (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Linking.openURL(post.video_url as string).catch(() => undefined)
                }
                style={s.video}
              >
                <Ionicons name="play" size={20} color={C.ink} />
                <Text style={s.videoText}>WATCH VIDEO</Text>
                <Ionicons name="arrow-forward" size={20} color={C.ink} />
              </Pressable>
            )}
          </View>
        </ScrollView>
      )}
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
  back: {
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
  cover: { width: "100%", height: 280, backgroundColor: C.panel },
  content: { padding: 20, paddingBottom: 48 },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  topic: { color: C.neon, fontFamily: F.mono, fontSize: 10 },
  date: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  title: {
    color: C.paper,
    fontFamily: F.display,
    fontSize: 36,
    lineHeight: 40,
    marginTop: 12,
  },
  excerpt: {
    color: C.muted,
    fontFamily: F.body,
    fontSize: 18,
    lineHeight: 25,
    marginTop: 12,
  },
  rule: { height: 2, backgroundColor: C.neon, marginVertical: 20 },
  paragraph: {
    color: C.paper,
    fontFamily: F.body,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 16,
  },
  video: {
    marginTop: 10,
    backgroundColor: C.neon,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoText: { color: C.ink, fontFamily: F.display, fontSize: 18 },
  notFound: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 11,
    textAlign: "center",
    marginTop: 40,
  },
});