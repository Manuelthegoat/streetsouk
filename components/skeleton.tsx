import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  Animated,
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { C } from "@/components/street-souk-ui";

type BoneProps = {
  width?: DimensionValue;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

// the basic pulsing block everything else is built from
export function Bone({ width = "100%", height = 14, style }: BoneProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, backgroundColor: C.line, opacity }, style]}
    />
  );
}

function Loading({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={style}
    >
      {children}
    </View>
  );
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// vendors directory cards
export function VendorListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Loading style={s.stack}>
      {range(count).map((i) => (
        <View key={i} style={s.card}>
          <View style={s.between}>
            <Bone width={64} height={64} />
            <View style={{ alignItems: "flex-end", gap: 8 }}>
              <Bone width={70} height={10} />
              <Bone width={44} height={10} />
            </View>
          </View>
          <Bone width="60%" height={26} style={{ marginTop: 28 }} />
          <Bone width="90%" height={12} style={{ marginTop: 12 }} />
          <Bone width="40%" height={40} style={{ marginTop: 18 }} />
        </View>
      ))}
    </Loading>
  );
}

// image on the left, text on the right (marketplace, brand lists)
export function ImageRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Loading style={s.stack}>
      {range(count).map((i) => (
        <View key={i} style={[s.card, s.imageRow]}>
          <Bone width={72} height={72} />
          <View style={{ flex: 1, gap: 9 }}>
            <Bone width="65%" height={16} />
            <Bone width="35%" height={10} />
            <Bone width="90%" height={11} />
          </View>
        </View>
      ))}
    </Loading>
  );
}

// small icon + two lines (home preview, my souk lists)
export function ListRowSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Loading style={s.stack}>
      {range(count).map((i) => (
        <View key={i} style={[s.card, s.imageRow]}>
          <Bone width={44} height={44} />
          <View style={{ flex: 1, gap: 9 }}>
            <Bone width="75%" height={14} />
            <Bone width="40%" height={10} />
          </View>
        </View>
      ))}
    </Loading>
  );
}

// schedule: day heading, then time + card rows
export function ScheduleSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Loading style={s.stack}>
      <Bone width={90} height={22} />
      {range(rows).map((i) => (
        <View key={i} style={{ gap: 8 }}>
          <Bone width={110} height={11} />
          <View style={[s.card, s.imageRow]}>
            <Bone width={72} height={72} />
            <View style={{ flex: 1, gap: 9 }}>
              <Bone width="70%" height={16} />
              <Bone width="45%" height={11} />
            </View>
          </View>
        </View>
      ))}
    </Loading>
  );
}

// live feed cards
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Loading style={s.stack}>
      {range(count).map((i) => (
        <View key={i} style={[s.card, { gap: 12 }]}>
          <View style={s.between}>
            <Bone width={90} height={11} />
            <Bone width={70} height={20} />
          </View>
          <Bone width="85%" height={20} />
          <Bone height={12} />
          <Bone width="80%" height={12} />
        </View>
      ))}
    </Loading>
  );
}

// shop product grid (two columns)
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Loading style={[s.stack, s.grid]}>
      {range(count).map((i) => (
        <View key={i} style={{ width: "48%", gap: 9 }}>
          <Bone height={190} />
          <Bone width="50%" height={10} />
          <Bone width="90%" height={14} />
          <Bone width="40%" height={14} />
        </View>
      ))}
    </Loading>
  );
}

// FAQ rows
export function FaqSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Loading style={s.stack}>
      {range(count).map((i) => (
        <View key={i} style={s.faqRow}>
          <Bone width="75%" height={16} />
          <Bone width={18} height={18} />
        </View>
      ))}
    </Loading>
  );
}

// full vendor page
export function VendorDetailSkeleton() {
  return (
    <Loading>
      <Bone height={260} />
      <View style={{ padding: 20, gap: 12 }}>
        <Bone height={56} />
        <Bone width="45%" height={18} style={{ marginTop: 16 }} />
        <Bone height={12} />
        <Bone width="92%" height={12} />
        <Bone width="70%" height={12} />
        <Bone width="45%" height={18} style={{ marginTop: 20 }} />
        <Bone height={220} />
      </View>
    </Loading>
  );
}

// single feed post page
export function FeedDetailSkeleton() {
  return (
    <Loading style={{ padding: 22, gap: 14 }}>
      <View style={s.between}>
        <Bone width={90} height={12} />
        <Bone width={80} height={12} />
      </View>
      <Bone width="92%" height={34} style={{ marginTop: 8 }} />
      <Bone width="65%" height={34} />
      <Bone height={3} style={{ marginVertical: 8 }} />
      <Bone height={14} />
      <Bone width="95%" height={14} />
      <Bone width="80%" height={14} />
      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <Bone width="48%" height={50} />
        <Bone width="48%" height={50} />
      </View>
    </Loading>
  );
}
// lineup cards: big photo, then name and text
export function LineupSkeleton({ count = 2 }: { count?: number }) {
  return (
    <Loading style={s.stack}>
      {range(count).map((i) => (
        <View
          key={i}
          style={{
            borderWidth: 1,
            borderColor: C.line,
            backgroundColor: C.panel,
          }}
        >
          <Bone height={340} />
          <View style={{ padding: 18, gap: 10 }}>
            <Bone width={24} height={10} />
            <Bone width="55%" height={28} />
            <Bone height={12} />
            <Bone width="85%" height={12} />
          </View>
        </View>
      ))}
    </Loading>
  );
}
// horizontal strip of lineup tiles on Home
export function LineupStripSkeleton() {
  return (
    <Loading
      style={{
        flexDirection: "row",
        gap: 12,
        marginHorizontal: -18,
        paddingHorizontal: 18,
        overflow: "hidden",
      }}
    >
      {range(3).map((i) => (
        <Bone key={i} width={150} height={200} />
      ))}
    </Loading>
  );
}

const s = StyleSheet.create({
  stack: { gap: 14, marginTop: 16 },
  card: {
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    padding: 14,
  },
  between: { flexDirection: "row", justifyContent: "space-between" },
  imageRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 22 },
  faqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingVertical: 18,
  },
});
