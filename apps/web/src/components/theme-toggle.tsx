"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-control border border-border bg-surface text-secondary-foreground transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {isDark ? (
        <Sun aria-hidden="true" size={17} />
      ) : (
        <Moon aria-hidden="true" size={17} />
      )}
      <span className="sr-only">Toggle color theme</span>
    </button>
  );
}
