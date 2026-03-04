import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useApp, ThemeMode } from "@/context/AppContext";

export interface ThemeColors {
  navy: string;
  navyLight: string;
  navyMid: string;
  teal: string;
  tealLight: string;
  tealMuted: string;
  gold: string;
  goldLight: string;
  goldMuted: string;
  cream: string;
  creamDim: string;
  white: string;
  offWhite: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  success: string;
  successDim: string;
  separator: string;
  cardBg: string;
  overlayDark: string;
  isDark: boolean;
}

const DarkTheme: ThemeColors = {
  navy: "#0D1B2A",
  navyLight: "#162538",
  navyMid: "#1E3248",
  teal: "#1A6B5E",
  tealLight: "#2A8A7A",
  tealMuted: "#144E44",
  gold: "#C9954A",
  goldLight: "#E0B06B",
  goldMuted: "#8A6330",
  cream: "#F4EFE4",
  creamDim: "#DDD7CB",
  white: "#FFFFFF",
  offWhite: "#F8F5F0",
  textPrimary: "#F4EFE4",
  textSecondary: "#9EB3C2",
  textMuted: "#5A7080",
  danger: "#E05C5C",
  success: "#52B788",
  successDim: "#2D7A56",
  separator: "#1E3248",
  cardBg: "#162538",
  overlayDark: "rgba(13, 27, 42, 0.85)",
  isDark: true,
};

const LightTheme: ThemeColors = {
  navy: "#F5F3EE",
  navyLight: "#FFFFFF",
  navyMid: "#EDE9E1",
  teal: "#1A6B5E",
  tealLight: "#2A8A7A",
  tealMuted: "#B8DDD5",
  gold: "#B07D35",
  goldLight: "#C9954A",
  goldMuted: "#D4B88A",
  cream: "#0D1B2A",
  creamDim: "#2A3B4E",
  white: "#FFFFFF",
  offWhite: "#F8F5F0",
  textPrimary: "#1A2A3A",
  textSecondary: "#4A5B6C",
  textMuted: "#8A96A3",
  danger: "#D04040",
  success: "#3A9B6E",
  successDim: "#D0EDDF",
  separator: "#E0DCD4",
  cardBg: "#FFFFFF",
  overlayDark: "rgba(0, 0, 0, 0.4)",
  isDark: false,
};

interface ThemeContextValue {
  colors: ThemeColors;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: DarkTheme,
  resolvedTheme: "dark",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const systemScheme = useColorScheme();

  const resolved = useMemo<"light" | "dark">(() => {
    const mode: ThemeMode = settings.themeMode || "dark";
    if (mode === "system") {
      return systemScheme === "light" ? "light" : "dark";
    }
    return mode;
  }, [settings.themeMode, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: resolved === "dark" ? DarkTheme : LightTheme,
      resolvedTheme: resolved,
    }),
    [resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
