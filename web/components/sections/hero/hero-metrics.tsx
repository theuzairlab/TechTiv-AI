"use client";

import { AnimatedMetric } from "@/components/animations/animated-metric";
import { heroMetrics } from "@/lib/hero";
import { cn } from "@/lib/utils";

type HeroMetricsProps = {
  className?: string;
};

export function HeroMetrics({ className }: HeroMetricsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4",
        className,
      )}
    >
      {heroMetrics.map((metric, index) => (
        <AnimatedMetric
          key={metric.label}
          value={metric.value}
          suffix={metric.suffix}
          label={metric.label}
          delay={0.15 + index * 0.08}
        />
      ))}
    </div>
  );
}
