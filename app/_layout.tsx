import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PixelText } from "@/components/PixelText";
import { colors } from "@/design/tokens";
import { FocusProvider, useFocusStore } from "@/state/FocusStore";

if (Platform.OS !== "web") {
  void SplashScreen.preventAutoHideAsync();
}

function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loading} edges={["top", "left", "right"]}>
      <ActivityIndicator size="small" color={colors.primary} />
      <PixelText variant="label" muted uppercase>
        Loading
      </PixelText>
    </SafeAreaView>
  );
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
      router.replace("/home" as never);
    }
  }, [hydrated, onboarded, router, segments]);

  if (!hydrated) return <LoadingScreen />;

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <FocusProvider>
            <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
            <NavigationGuard />
          </FocusProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 12,
    justifyContent: "center"
  }
});
