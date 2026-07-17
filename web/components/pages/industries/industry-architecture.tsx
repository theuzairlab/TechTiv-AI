"use client";

import { motion } from "framer-motion";
import type { ArchitectureLayer } from "@/lib/industries-page-data";
import { industryAccentStyles } from "@/components/sections/industries/industry-styles";
import type { IndustryAccent } from "@/lib/industries";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

type IndustryArchitectureProps = {
  layers: ArchitectureLayer[];
  accent: IndustryAccent;
};

export function IndustryArchitecture({ layers, accent }: IndustryArchitectureProps) {
  const styles = industryAccentStyles[accent];

  return (
    <div className="relative space-y-3">
      {layers.map((layer, index) => (
        <motion.div
          key={layer.name}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.45 }}
          className="relative"
        >
          {index < layers.length - 1 ? (
            <div
              aria-hidden
              className="absolute top-full left-8 z-0 h-3 w-px bg-gradient-to-b from-accent-cyan/40 to-transparent"
            />
          ) : null}

          <GlassPanel className="relative z-[1] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-md space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-[0.65rem] font-bold",
                      styles.bg,
                      styles.text,
                    )}
                  >
                    {index + 1}
                  </span>
                  <h4 className="font-display text-sm font-semibold text-text-primary sm:text-base">
                    {layer.name}
                  </h4>
                </div>
                <p className="text-xs leading-relaxed text-text-muted sm:text-sm">
                  {layer.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:max-w-md sm:justify-end">
                {layer.components.map((component) => (
                  <span
                    key={component}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[0.68rem] font-medium",
                      styles.border,
                      styles.bg,
                      styles.text,
                    )}
                  >
                    {component}
                  </span>
                ))}
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      ))}
    </div>
  );
}
