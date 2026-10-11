import { NewsCard } from "@/components/feed-cards";
import { HomeFeedSkeleton } from "@/components/skeleton";
import { C, F } from "@/components/street-souk-ui";
import { useTopics } from "@/hooks/use-home";
import { useNews } from "@/hooks/use-news";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SsTvScreen() {
  const router = useRouter();
  const { posts, loading, error, reload } = useNews();
  const { topics } = useTopics();

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
        <Text style={s.headerTitle}>STREET SOUK</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>SS TV</Text>

        {loading && <HomeFeedSkeleton />}
        {error && (
          <Pressable onPress={reload}>
            <Text style={s.note}>COULD NOT LOAD STORIES. TAP TO RETRY.</Text>
          </Pressable>
        )}

        <View style={s.list}>
          {posts.map((post) => (
            <NewsCard
              key={post.id}
              post={post}
              topic={topics.find((t) => t.id === post.topic_id)?.label}
              onPress={() =>
                router.push({ pathname: "/news/[id]", params: { id: post.id } })
              }
            />
          ))}
        </View>

        {!loading && !error && posts.length === 0 && (
          <Text style={s.note}>NEW STORIES COMING SOON.</Text>
        )}
      </ScrollView>
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
  content: { padding: 18, paddingBottom: 48 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 40 },
  list: { gap: 16, marginTop: 16 },
  note: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 11,
    textAlign: "center",
    marginTop: 34,
  },
});