import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { C, F } from "@/components/street-souk-ui";
import { useStreetSoukStore } from "@/context/street-souk-store";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedPoint, setScannedPoint] = useState("MAIN HALL CHECK-IN");
  const { setStartingPoint } = useStreetSoukStore();

  const finishScan = (data: string) => {
    if (scanned) return;
    setScanned(true);
    const point = data.includes("east") ? "EAST ENTRANCE" : "MAIN HALL CHECK-IN";
    setScannedPoint(point);
    setStartingPoint(point);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}><Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={22} color={C.paper} /></Pressable><Text style={s.headerTitle}>SCAN VENUE QR</Text><View style={s.spacer} /></View>
      {!permission ? <View style={s.center}><Text style={s.message}>CHECKING CAMERA ACCESS...</Text></View> : !permission.granted ? <View style={s.center}><Ionicons name="camera-outline" size={46} color={C.neon} /><Text style={s.title}>FIND YOUR START</Text><Text style={s.message}>Allow camera access to scan a venue marker and set your route starting point.</Text><Pressable onPress={requestPermission} style={s.primary}><Text style={s.primaryText}>ALLOW CAMERA</Text></Pressable></View> : scanned ? <View style={s.center}><View style={s.success}><Ionicons name="checkmark" size={30} color={C.ink} /></View><Text style={s.title}>STARTING POINT SET</Text><Text style={s.message}>Your route now begins at {scannedPoint}.</Text><Pressable onPress={() => router.replace("/map")} style={s.primary}><Text style={s.primaryText}>OPEN MAP</Text></Pressable></View> : <View style={s.cameraWrap}><CameraView style={s.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={({ data }) => finishScan(data)}><View style={s.scanFrame}><View style={s.cornerTL} /><View style={s.cornerTR} /><View style={s.cornerBL} /><View style={s.cornerBR} /></View><View style={s.cameraFooter}><Text style={s.cameraText}>ALIGN VENUE QR CODE INSIDE FRAME</Text><Pressable onPress={() => finishScan("demo-main-hall")} style={s.demo}><Text style={s.demoText}>USE DEMO QR</Text></Pressable></View></CameraView></View>}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: C.bg }, header: { height: 64, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: C.line, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 40, height: 40, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" }, headerTitle: { color: C.neon, fontFamily: F.mono, fontSize: 10, letterSpacing: 1 }, spacer: { width: 40 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }, title: { color: C.neon, fontFamily: F.display, fontSize: 32, textAlign: "center", marginTop: 18 }, message: { color: C.muted, fontFamily: F.body, fontSize: 17, lineHeight: 24, textAlign: "center", marginTop: 12 }, primary: { backgroundColor: C.green, paddingHorizontal: 18, paddingVertical: 14, marginTop: 24 }, primaryText: { color: C.ink, fontFamily: F.display, fontSize: 18 }, cameraWrap: { flex: 1, padding: 16 }, camera: { flex: 1, overflow: "hidden", backgroundColor: C.panel, alignItems: "center", justifyContent: "center" }, scanFrame: { width: 245, height: 245, position: "relative", borderColor: C.neon }, cornerTL: { position: "absolute", width: 34, height: 34, top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderColor: C.neon }, cornerTR: { position: "absolute", width: 34, height: 34, top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderColor: C.neon }, cornerBL: { position: "absolute", width: 34, height: 34, bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: C.neon }, cornerBR: { position: "absolute", width: 34, height: 34, bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderColor: C.neon }, cameraFooter: { position: "absolute", bottom: 22, left: 18, right: 18, alignItems: "center", gap: 14 }, cameraText: { color: C.paper, backgroundColor: C.bg, padding: 10, fontFamily: F.mono, fontSize: 10 }, demo: { borderWidth: 1, borderColor: C.neon, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: C.bg }, demoText: { color: C.neon, fontFamily: F.mono, fontSize: 10 }, success: { width: 62, height: 62, borderRadius: 31, backgroundColor: C.neon, alignItems: "center", justifyContent: "center" } });
