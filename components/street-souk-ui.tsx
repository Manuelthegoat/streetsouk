import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

export const C = { bg: '#101010', panel: '#1d1d1d', paper: '#eee7e4', muted: '#a99591', ink: '#050505', green: '#00ff19', line: '#806d68' };
export const F = { display: 'Anton', body: 'Archivo Narrow', bodyBold: 'Archivo Narrow Bold', mono: 'JetBrains Mono' } as const;

export function Header({ title = 'STREET SOUK' }: { title?: string }) {
  return <View style={ui.header}><Pressable accessibilityLabel="Search"><Ionicons name="search" size={25} color={C.green} /></Pressable><Image accessibilityLabel={title} source={require('@/assets/images/sslogo.png')} contentFit="contain" style={ui.logoImage} /><Pressable accessibilityLabel="Open profile" style={ui.profile}><Ionicons name="person-outline" size={18} color={C.green} /></Pressable></View>;
}

export function PageTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return <View style={ui.pageTitle}>{eyebrow && <Text style={ui.eyebrow}>{eyebrow}</Text>}<Text style={ui.title}>{title}</Text><View style={ui.rule} /></View>;
}

export const ui = StyleSheet.create({ header: { height: 72, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: C.line }, logoImage: { width: 142, height: 48 }, profile: { width: 35, height: 35, borderWidth: 2, borderColor: C.green, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, pageTitle: { marginTop: 24, marginBottom: 16 }, eyebrow: { color: C.muted, fontFamily: F.mono, fontSize: 11, letterSpacing: 1 }, title: { color: C.green, fontFamily: F.display, fontSize: 38, letterSpacing: 1 }, rule: { height: 2, backgroundColor: C.line } });
