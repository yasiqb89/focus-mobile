import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { colors, layout, typography } from "@/design/tokens";

type IconName = keyof typeof MaterialIcons.glyphMap;

const iconForRoute: Record<string, IconName> = {
  tasks: "checklist",
  focus: "timer",
  blocks: "block",
  stats: "bar-chart"
};

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="focus"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.onPrimary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.label,
        tabBarActiveBackgroundColor: colors.primary,
        tabBarInactiveBackgroundColor: colors.surface,
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={iconForRoute[route.name] ?? "circle"} size={size} color={color} />
        )
      })}
    >
      <Tabs.Screen name="tasks" options={{ title: "TASKS" }} />
      <Tabs.Screen name="focus" options={{ title: "FOCUS" }} />
      <Tabs.Screen name="blocks" options={{ title: "BLOCKS" }} />
      <Tabs.Screen name="stats" options={{ title: "STATS" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.primary,
    borderTopWidth: layout.borderThick,
    height: layout.bottomNavHeight,
    ...(Platform.OS === "web" ? { boxShadow: "none" } : { elevation: 0, shadowOpacity: 0 })
  },
  tabItem: {
    borderRightColor: colors.primary,
    borderRightWidth: 1,
    paddingVertical: 8
  },
  label: {
    ...typography.label,
    fontSize: 10,
    marginTop: 2
  }
});
