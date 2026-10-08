export type ThemeMode = "auto" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_EVENT = "theme-change";

export function readStoredTheme(): ThemeMode {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "auto") return value;
  } catch {}
  return "auto";
}

export function resolveDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", resolveDark(mode));
}

export function storeTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {}
  applyTheme(mode);
  window.dispatchEvent(new Event(THEME_EVENT));
}

// Runs before first paint (inline in <head>) so a dark device never flashes white.
export const themeInitScript = `(function(){try{var m=localStorage.getItem("${THEME_STORAGE_KEY}");var d=m==="dark"||((m!=="light")&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
