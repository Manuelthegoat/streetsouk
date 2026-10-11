import { C, F } from "@/components/street-souk-ui";
import type { ShopProduct } from "@/hooks/use-products";
import { formatDate, formatNaira } from "@/lib/format";
import type { NewsPost } from "@/lib/types";
import { vendorImage } from "@/lib/vendor-assets";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function ShopCard({
  product,
  onPress,
}: {
  product: ShopProduct;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.vendors.name} ${product.name}`}
      onPress={onPress}
      style={s.card}
    >
      <View>
        <Image
          source={vendorImage(product.vendors.slug, "product", product.image_url)}
          contentFit="cover"
          style={s.image}
        />
        <View style={s.tag}>
          <Text style={s.tagText}>SHOP</Text>
        </View>
      </View>
      <View style={s.body}>
        <Text style={s.kicker}>{product.vendors.name}</Text>
        <Text style={s.title}>{product.name}</Text>
        <Text style={s.price}>{formatNaira(product.price_ngn)}</Text>
      </View>
    </Pressable>
  );
}

export function NewsCard({
  post,
  topic,
  onPress,
}: {
  post: NewsPost;
  topic?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={post.title}
      onPress={onPress}
      style={s.card}
    >
      <View>
        <Image
          source={
            post.cover_url
              ? { uri: post.cover_url }
              : require("@/assets/images/sslogo.png")
          }
          contentFit={post.cover_url ? "cover" : "contain"}
          style={s.image}
        />
        <View style={s.tag}>
          <Text style={s.tagText}>{post.video_url ? "WATCH" : "READ"}</Text>
        </View>
      </View>
      <View style={s.body}>
        <Text style={s.kicker}>{topic ?? "SS TV"}</Text>
        <Text style={s.title}>{post.title}</Text>
        {!!post.excerpt && (
          <Text numberOfLines={2} style={s.excerpt}>
            {post.excerpt}
          </Text>
        )}
        <Text style={s.meta}>{formatDate(post.published_at)}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  image: { width: "100%", height: 220, backgroundColor: C.bg },
  tag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: C.neon,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  tagText: { color: C.ink, fontFamily: F.mono, fontSize: 9 },
  body: { padding: 16, gap: 6 },
  kicker: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 24, lineHeight: 28 },
  excerpt: { color: C.muted, fontFamily: F.body, fontSize: 15, lineHeight: 21 },
  price: { color: C.neon, fontFamily: F.mono, fontSize: 12 },
  meta: { color: C.muted, fontFamily: F.mono, fontSize: 10, marginTop: 2 },
});
