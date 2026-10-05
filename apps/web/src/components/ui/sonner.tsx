"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/components/theme-provider";

export function Toaster() {
  const { theme } = useTheme();
  const [container, setContainer] = useState<Element | null>(null);
  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("data-toast-host", "");
    setContainer(host);
    // Native modal dialogs occupy the top layer and make the rest of the page inert.
    const update = () => {
      const dialogs = Array.from(document.querySelectorAll("dialog[open]"));
      const target = dialogs.at(-1) ?? document.body;
      if (host.parentElement !== target) target.appendChild(host);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
    return () => { observer.disconnect(); host.remove(); };
  }, []);

  return container ? createPortal(
    <Sonner theme={theme ?? "light"} closeButton richColors position="top-right"
      style={{ zIndex: 2147483647, "--normal-bg": "var(--surface-elevated)", "--normal-text": "var(--foreground)", "--normal-border": "var(--border)", "--success-bg": "var(--success-surface)", "--success-text": "var(--success)", "--success-border": "color-mix(in srgb, var(--success) 25%, var(--surface-elevated))", "--error-bg": "var(--destructive-surface)", "--error-text": "var(--destructive)", "--error-border": "var(--destructive-border)", "--warning-bg": "var(--warning-surface)", "--warning-text": "var(--warning)", "--warning-border": "color-mix(in srgb, var(--warning) 25%, var(--surface-elevated))" } as CSSProperties}
    />, container) : null;
}
