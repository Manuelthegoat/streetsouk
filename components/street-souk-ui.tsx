import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

export const C = { bg: '#101010', panel: '#1d1d1d', paper: '#eee7e4', muted: '#a99591', ink: '#050505', green: '#00ff19', line: '#806d68', mapBg: '#171717', mapGrid: '#343434', mapRoad: '#373737', mapZone: '#202020', mapZoneBorder: '#3c3c3c', mapText: '#555555', scrim: 'rgba(8, 10, 10, 0.40)' };
export const F = { display: 'Anton', body: 'Archivo Narrow', bodyBold: 'Archivo Narrow Bold', mono: 'JetBrains Mono' } as const;

export function Header({ title = 'STREET SOUK' }: { title?: string }) {
  const router = useRouter();
  return <View style={ui.header}><Pressable accessibilityRole="button" accessibilityLabel="Go to home" onPress={() => router.replace('/(tabs)')} style={ui.headerSide}><Image accessibilityLabel="Street Souk" source={require('@/assets/images/sslogo.png')} contentFit="contain" style={ui.logoImage} /></Pressable><Text numberOfLines={1} style={ui.headerTitle}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel="Open cart" onPress={() => router.push('/cart')} style={[ui.headerSide, ui.cart]}><Ionicons name="cart-outline" size={23} color={C.paper} /></Pressable></View>;
}

export function PageTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return <View style={ui.pageTitle}>{eyebrow && <Text style={ui.eyebrow}>{eyebrow}</Text>}<Text style={ui.title}>{title}</Text><View style={ui.rule} /></View>;
}

export const ui = StyleSheet.create({ header: { height: 58, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.line }, headerSide: { width: 62, height: 42, justifyContent: 'center' }, logoImage: { width: 58, height: 32 }, headerTitle: { color: C.paper, fontFamily: F.bodyBold, fontSize: 17, textAlign: 'center', flex: 1, letterSpacing: 0.6 }, cart: { alignItems: 'flex-end' }, pageTitle: { marginTop: 24, marginBottom: 16 }, eyebrow: { color: C.muted, fontFamily: F.mono, fontSize: 11, letterSpacing: 1 }, title: { color: C.green, fontFamily: F.display, fontSize: 38, letterSpacing: 1 }, rule: { height: 2, backgroundColor: C.line } });
