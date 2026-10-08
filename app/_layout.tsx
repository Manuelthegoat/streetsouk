import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import {
  ArchivoNarrow_400Regular,
  ArchivoNarrow_700Bold,
} from '@expo-google-fonts/archivo-narrow';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StreetSoukStore } from '@/context/street-souk-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Anton: Anton_400Regular,
    'Archivo Narrow': ArchivoNarrow_400Regular,
    'Archivo Narrow Bold': ArchivoNarrow_700Bold,
    'JetBrains Mono': JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <StreetSoukStore>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="alerts" options={{ headerShown: false }} />
          <Stack.Screen name="my-souk" options={{ headerShown: false }} />
          <Stack.Screen name="feed/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="scan" options={{ headerShown: false }} />
          <Stack.Screen name="vendor/[name]" options={{ headerShown: false }} />
        </Stack>
      </StreetSoukStore>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}