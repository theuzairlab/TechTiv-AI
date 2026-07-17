function readCssColor(variable: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  return value || fallback;
}

export function useCssColor(variable: string, fallback: string): string {
  return readCssColor(variable, fallback);
}
