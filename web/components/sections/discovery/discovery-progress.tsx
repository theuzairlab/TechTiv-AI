"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type DiscoveryProgressProps = {
  currentStep: number;
  totalSteps: number;
  labels: string[];
};

export function DiscoveryProgress({
  currentStep,
  totalSteps,
  labels,
}: DiscoveryProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-text-muted sm:text-sm">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span>{labels[currentStep]}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-bg-secondary">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-accent-cyan to-accent-lime"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="hidden gap-2 sm:flex">
        {labels.map((label, index) => (
          <div
            key={label}
            className={cn(
              "flex-1 rounded-lg border px-2 py-1.5 text-center text-[10px] uppercase tracking-wide transition-colors",
              index <= currentStep
                ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
                : "border-glass-border text-text-muted",
            )}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
