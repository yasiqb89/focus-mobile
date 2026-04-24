import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FocusProvider, useFocusStore } from "@/state/FocusStore";

if (Platform.OS !== "web") {
  void SplashScreen.preventAutoHideAsync();
}

function NavigationGuard() {
  const { hydrated, onboarded } = useFocusStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!hydrated) return;
    if (Platform.OS !== "web") {
      void SplashScreen.hideAsync();
    }
    const inOnboarding = segments[0] === "onboarding";
    if (!onboarded && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboarded && inOnboarding) {
      router.replace("/(tabs)/focus");
    }
  }, [hydrated, onboarded, router, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FocusProvider>
          <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
          <NavigationGuard />
        </FocusProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
