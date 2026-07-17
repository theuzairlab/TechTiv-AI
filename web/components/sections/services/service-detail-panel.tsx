"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Service } from "@/lib/services";
import { accentStyles } from "@/components/sections/services/service-styles";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

type ServiceDetailPanelProps = {
  service: Service;
  layout?: "horizontal" | "stacked";
};

export function ServiceDetailPanel({
  service,
  layout = "horizontal",
}: ServiceDetailPanelProps) {
  const accent = accentStyles[service.accent];
  const isStacked = layout === "stacked";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={service.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <GlassPanel variant="elevated" className="h-full p-6 sm:p-8">
          <div
            className={cn(
              "flex gap-6",
              isStacked
                ? "flex-col"
                : "flex-col lg:flex-row lg:items-start lg:justify-between",
            )}
          >
            <div className={cn("space-y-3", isStacked ? "" : "max-w-xl")}>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ring-1",
                    accent.bg,
                    accent.text,
                    accent.ring,
                  )}
                >
                  {service.isHub ? "◈" : "◇"}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                    {service.label}
                  </h3>
                  {service.isHub ? (
                    <p className="text-xs text-accent-cyan">Core automation hub</p>
                  ) : null}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-text-muted sm:text-base">
                {service.shortDescription}
              </p>
            </div>

            <ul
              className={cn(
                "grid gap-2",
                isStacked ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2 lg:min-w-[280px]",
              )}
            >
              {service.features.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex items-center gap-2 rounded-xl border border-glass-border bg-bg-secondary/50 px-3 py-2 text-sm text-text-primary"
                >
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", accent.dot)} />
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}
