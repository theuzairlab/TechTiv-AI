const DISPLAY_LOCALE = "en-US";

function asDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

/** Locale-stable date+time for SSR — never call toLocaleString() without a locale. */
export function formatDateTime(value: string | Date) {
  return asDate(value).toLocaleString(DISPLAY_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(value: string | Date) {
  return asDate(value).toLocaleDateString(DISPLAY_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNumber(value: number) {
  return value.toLocaleString(DISPLAY_LOCALE);
}

export function formatUsd(value: number) {
  return `$${formatNumber(value)}`;
}
