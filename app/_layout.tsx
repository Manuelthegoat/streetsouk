import { DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Anton_400Regular } from "@expo-google-fonts/anton";
import {
  ArchivoNarrow_400Regular,
  ArchivoNarrow_700Bold,
} from "@expo-google-fonts/archivo-narrow";
import { JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { AuthProvider } from "@/context/auth-context";
import { StreetSoukStore } from "@/context/street-souk-store";
import { CartProvider } from "@/context/cart-context";
import OnboardingGate from "@/components/onboarding-gate";
import { ProfileProvider } from "@/context/profile-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Anton: Anton_400Regular,
    "Archivo Narrow": ArchivoNarrow_400Regular,
    "Archivo Narrow Bold": ArchivoNarrow_700Bold,
    "JetBrains Mono": JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <AuthProvider>
        <ProfileProvider>
          <CartProvider>
            <StreetSoukStore>
              <OnboardingGate />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="map" options={{ headerShown: false }} />
                <Stack.Screen
                  name="schedule"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="vendors" options={{ headerShown: false }} />
                <Stack.Screen name="feed" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
                />
                <Stack.Screen
                  name="sign-in"
                  options={{ headerShown: false, presentation: "modal" }}
                />
                <Stack.Screen
                  name="settings"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="alerts" options={{ headerShown: false }} />
                <Stack.Screen name="my-souk" options={{ headerShown: false }} />
                <Stack.Screen
                  name="feed/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="scan" options={{ headerShown: false }} />
                <Stack.Screen
                  name="vendor/[slug]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="passport"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="passport-scan"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="tickets" options={{ headerShown: false }} />
                <Stack.Screen
                  name="sessions"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="ss-tv" options={{ headerShown: false }} />
                <Stack.Screen name="cart" options={{ headerShown: false }} />
                <Stack.Screen
                  name="events/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="news/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="product/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="event-vendor/[slug]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="onboarding"
                  options={{ headerShown: false, gestureEnabled: false }}
                />
                <Stack.Screen
                  name="edit-profile"
                  options={{ headerShown: false }}
                />
              </Stack>
            </StreetSoukStore>
          </CartProvider>
        </ProfileProvider>
      </AuthProvider>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
