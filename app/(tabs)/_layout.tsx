import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { StreetSoukTabBar } from '@/components/street-souk-tab-bar';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <StreetSoukTabBar {...props} />}
      screenOptions={{
        tabBarStyle: {
          display: 'none',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={23} color={color} /> }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={23} color={color} /> }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule', tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={23} color={color} /> }} />
      <Tabs.Screen name="vendors" options={{ title: 'Vendors', tabBarIcon: ({ color }) => <Ionicons name="storefront-outline" size={23} color={color} /> }} />
      <Tabs.Screen name="feed" options={{ title: 'Live Feed', tabBarIcon: ({ color }) => <Ionicons name="radio-outline" size={23} color={color} /> }} />
    </Tabs>
  );
}
