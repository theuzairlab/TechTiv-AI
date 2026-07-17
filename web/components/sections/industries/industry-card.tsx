"use client";

import { motion } from "framer-motion";
import type { Industry } from "@/lib/industries";
import {
  getIndustryCardClasses,
  industryAccentStyles,
} from "@/components/sections/industries/industry-styles";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "@/lib/utils";

type IndustryCardProps = {
  industry: Industry;
  active: boolean;
  onSelect: (slug: string) => void;
};

export function IndustryCard({ industry, active, onSelect }: IndustryCardProps) {
  const accent = industryAccentStyles[industry.accent];

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(industry.slug)}
      className={getIndustryCardClasses(industry.accent, active)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
            accent.bg,
            accent.ring,
          )}
        >
          <AnimatedIcon icon={industry.icon} size={20} className={accent.text} />
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            accent.bg,
            accent.text,
            accent.border,
          )}
        >
          {industry.metric}
        </span>
      </div>

      <h3 className="font-display text-base font-semibold text-text-primary sm:text-lg">
        {industry.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-muted sm:text-sm">
        {industry.description}
      </p>
    </motion.button>
  );
}
