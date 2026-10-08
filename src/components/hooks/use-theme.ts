"use client";

import { useCallback, useEffect, useState } from "react";
import {
  THEME_EVENT,
  ThemeMode,
  applyTheme,
  readStoredTheme,
  storeTheme,
} from "@/lib/theme";

const ORDER: ThemeMode[] = ["auto", "light", "dark"];

export const THEME_LABELS: Record<ThemeMode, string> = {
  auto: "Auto",
  light: "Light",
  dark: "Dark",
};

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const sync = () => setMode(readStoredTheme());
    sync();
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  // In Auto, follow the device when it switches (e.g. macOS at sunset).
  useEffect(() => {
    if (mode !== "auto") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("auto");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  const cycle = useCallback(() => {
    const next = ORDER[(ORDER.indexOf(readStoredTheme()) + 1) % ORDER.length];
    storeTheme(next);
  }, []);

  return { mode, cycle, label: THEME_LABELS[mode] };
}
