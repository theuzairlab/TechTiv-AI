"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const barHeights = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];

type CaseStudyChartProps = {
  className?: string;
};

export function CaseStudyChart({ className }: CaseStudyChartProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-glass-border bg-bg-primary/60 p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">Automation Analytics</p>
        <span className="flex items-center gap-1.5 text-[10px] text-brand">
          <span className="ui-dot h-1.5 w-1.5 animate-pulse rounded-full" />
          Live
        </span>
      </div>

      <div className="flex h-28 items-end gap-1.5">
        {barHeights.map((height, index) => (
          <motion.div
            key={index}
            className="flex-1 rounded-t-sm bg-linear-to-t from-accent-cyan/20 to-accent-cyan"
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{
              duration: 0.6,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-glass-border pt-3">
        {[
          { label: "Workflows", value: "24" },
          { label: "Tasks/mo", value: "8.2k" },
          { label: "Uptime", value: "99.9%" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-sm font-semibold text-accent-cyan">
              {stat.value}
            </p>
            <p className="text-[10px] text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
