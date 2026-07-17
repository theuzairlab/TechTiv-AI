"use client";

import { motion } from "framer-motion";
import type { CaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

const accentStyles = {
  cyan: "border-accent-cyan/40 bg-accent-cyan/10 ring-accent-cyan/30",
  lime: "border-brand-cyan/40 bg-brand-cyan/10 ring-brand-cyan/30",
  violet: "border-accent-violet/40 bg-accent-violet/10 ring-accent-violet/30",
  rose: "border-accent-rose/40 bg-accent-rose/10 ring-accent-rose/30",
} as const;

type CaseStudyCardProps = {
  study: CaseStudy;
  active: boolean;
  onSelect: (id: string) => void;
};

export function CaseStudyCard({ study, active, onSelect }: CaseStudyCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(study.id)}
      className={cn(
        "w-full rounded-2xl border p-5 text-left transition-all duration-300",
        "bg-glass-bg/90 backdrop-blur-md",
        active
          ? cn("ring-2 shadow-glow-cyan", accentStyles[study.accent])
          : "border-glass-border hover:border-glass-border hover:bg-bg-secondary/70",
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {study.industry}
      </p>
      <h3 className="mt-1 font-display text-base font-semibold text-text-primary sm:text-lg">
        {study.client}
      </h3>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted sm:text-sm">
        {study.headline}
      </p>
    </motion.button>
  );
}
