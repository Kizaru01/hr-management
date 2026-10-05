import { useColorScheme } from "react-native";

// Native equivalents of apps/web/src/app/globals.css semantic tokens.
const light = {
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  secondary: "#475569",
  border: "#e2e8f0",
  primary: "#2563eb",
  onPrimary: "#ffffff",
  success: "#15803d",
  warning: "#b45309",
  danger: "#dc2626",
  info: "#2563eb",
  subtle: "#f1f5f9",
};
const dark: typeof light = {
  background: "#080808",
  surface: "#0d0d0d",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  secondary: "#a3a3a3",
  border: "#2b2b2b",
  primary: "#f5f5f5",
  onPrimary: "#080808",
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#f87171",
  info: "#60a5fa",
  subtle: "#151515",
};
export function useMobileTheme() {
  return useColorScheme() === "dark" ? dark : light;
}
