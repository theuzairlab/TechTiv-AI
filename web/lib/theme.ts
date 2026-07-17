export const THEME_STORAGE_KEY = "techtiv-theme";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function applyTheme(theme: Theme) {
  document.body.classList.toggle("light-mode", theme === "light");
  document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
}
