import { Platform, StyleSheet } from "react-native";

export const colors = {
  background: "#fdf8f8",
  surface: "#ffffff",
  surfaceLow: "#f7f3f2",
  surfaceMid: "#f1edec",
  surfaceHigh: "#e5e2e1",
  text: "#1c1b1b",
  textMuted: "#444748",
  outline: "#747878",
  primary: "#4a4a4a",
  onPrimary: "#ffffff",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  warning: "#6b4f00",
  warningContainer: "#fff1bf",
  success: "#0f5f3d",
  successContainer: "#dff7e8"
};

export const spacing = {
  base: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64
};

export const typography = {
  display: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "900" as const,
    letterSpacing: 0
  },
  h1: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900" as const,
    letterSpacing: 0
  },
  h2: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800" as const
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500" as const
  },
  label: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "800" as const,
    letterSpacing: 0
  }
};

export const layout = {
  border: 1,
  borderThick: 2,
  shadowOffset: 3,
  bottomNavHeight: 78
};

export const brutal = StyleSheet.create({
  border: {
    borderWidth: layout.border,
    borderColor: colors.primary,
    borderRadius: 0
  },
  borderThick: {
    borderWidth: layout.borderThick,
    borderColor: colors.primary,
    borderRadius: 0
  },
  shadow: {
    ...(Platform.OS === "web"
      ? { boxShadow: `${layout.shadowOffset}px ${layout.shadowOffset}px 0 ${colors.primary}` }
      : {
          shadowColor: colors.primary,
          shadowOffset: { width: layout.shadowOffset, height: layout.shadowOffset },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6
        })
  },
  shadowSmall: {
    ...(Platform.OS === "web"
      ? { boxShadow: `2px 2px 0 ${colors.primary}` }
      : {
          shadowColor: colors.primary,
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3
        })
  }
});
