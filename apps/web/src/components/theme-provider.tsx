"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeStorageKey = "hrms-theme:v1";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // The theme still applies when storage is unavailable or disabled.
  }
  window.dispatchEvent(new Event("hrms-theme-change"));
}

function subscribeToTheme(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === themeStorageKey &&
      (event.newValue === "light" || event.newValue === "dark")
    ) {
      document.documentElement.dataset.theme = event.newValue;
      document.documentElement.style.colorScheme = event.newValue;
      onStoreChange();
    }
  };

  window.addEventListener("hrms-theme-change", onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("hrms-theme-change", onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): null {
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(nextTheme) {
        applyTheme(nextTheme);
      },
      toggleTheme() {
        const currentTheme =
          document.documentElement.dataset.theme === "dark" ? "dark" : "light";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
