"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format-display";
import { formatRelativeTime } from "@/lib/leads-format";

type RelativeTimeProps = {
  value: string | Date;
};

/** Hydration-safe relative time: absolute date on SSR, relative after mount. */
export function RelativeTime({ value }: RelativeTimeProps) {
  const iso = typeof value === "string" ? value : value.toISOString();
  const [label, setLabel] = useState(() => formatDateTime(iso));

  useEffect(() => {
    setLabel(formatRelativeTime(iso));
  }, [iso]);

  return label;
}
