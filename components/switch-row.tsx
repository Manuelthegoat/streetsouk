import { C, F } from "@/components/street-souk-ui";
import { StyleSheet, Switch, Text, View } from "react-native";

export function SwitchRow({
  title,
  detail,
  value,
  onChange,
}: {
  title: string;
  detail: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.detail}>{detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.line, true: C.green }}
        thumbColor={value ? C.neon : C.muted}
      />
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    marginTop: 12,
  },
  title: { color: C.paper, fontFamily: F.display, fontSize: 18 },
  detail: { color: C.muted, fontFamily: F.body, fontSize: 14, marginTop: 3, lineHeight: 19 },
});