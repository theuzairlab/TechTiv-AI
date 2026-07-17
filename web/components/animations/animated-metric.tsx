"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedMetricProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
  format?: "number" | "currency" | "percent";
  className?: string;
};

function formatValue(
  value: number,
  format: AnimatedMetricProps["format"],
): string {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (format === "percent") {
    return `${value}%`;
  }

  return `${value}${""}`;
}

export function AnimatedMetric({
  value,
  suffix = "",
  prefix = "",
  label,
  delay = 0,
  format = "number",
  className,
}: AnimatedMetricProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value]);

  const displayText =
    format === "currency" || format === "percent"
      ? formatValue(display, format)
      : `${prefix}${display}${suffix}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl border border-glass-border bg-glass-bg/80 p-4 backdrop-blur-md sm:p-5",
        className,
      )}
    >
      <p className="font-display text-2xl font-semibold tracking-tight text-gradient-cyan sm:text-3xl">
        {displayText}
      </p>
      <p className="mt-1 text-xs text-text-muted sm:text-sm">{label}</p>
    </motion.div>
  );
}
