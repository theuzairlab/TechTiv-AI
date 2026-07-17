"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { industries } from "@/lib/industries";
import { IndustryCard } from "@/components/sections/industries/industry-card";
import { industryAccentStyles } from "@/components/sections/industries/industry-styles";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "@/lib/utils";

export function IndustriesGrid() {
  const [activeSlug, setActiveSlug] = useState(industries[0].slug);

  const activeIndustry = useMemo(
    () => industries.find((i) => i.slug === activeSlug) ?? industries[0],
    [activeSlug],
  );

  const accent = industryAccentStyles[activeIndustry.accent];

  return (
    <div className="space-y-8">
      <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {industries.map((industry) => (
          <StaggerItem key={industry.slug}>
            <IndustryCard
              industry={industry}
              active={activeSlug === industry.slug}
              onSelect={setActiveSlug}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndustry.slug}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassPanel variant="elevated" className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-lg space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl ring-1",
                      accent.bg,
                      accent.ring,
                    )}
                  >
                    <AnimatedIcon icon={activeIndustry.icon} size={22} className={accent.text} />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">
                      {activeIndustry.name} AI
                    </h3>
                    <p className={cn("text-sm font-medium", accent.text)}>
                      {activeIndustry.metric}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text-muted sm:text-base">
                  {activeIndustry.description}
                </p>
                <Button
                  href={`/industries/${activeIndustry.slug}`}
                  variant="secondary"
                  size="sm"
                >
                  View {activeIndustry.name} Solutions
                </Button>
              </div>

              <ul className="grid gap-2 sm:grid-cols-2 lg:min-w-[320px]">
                {activeIndustry.features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="flex items-center gap-2 rounded-xl border border-glass-border bg-bg-secondary/50 px-3 py-2.5 text-sm text-text-primary"
                  >
                    <span
                      className={cn("h-1.5 w-1.5 shrink-0 rounded-full", accent.dot)}
                    />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-sm text-text-muted">
        Explore all{" "}
        <Link href="/industries" className="text-accent-cyan hover:underline">
          industry solutions
        </Link>{" "}
        for workflows, architecture, and ROI metrics.
      </p>
    </div>
  );
}
