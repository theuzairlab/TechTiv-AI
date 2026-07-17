"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { caseStudies } from "@/lib/case-studies";
import { CaseStudyCard } from "@/components/sections/case-studies/case-study-card";
import { CaseStudyChart } from "@/components/sections/case-studies/case-study-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { cn } from "@/lib/utils";

const accentText = {
  cyan: "text-accent-cyan",
  lime: "text-brand",
  violet: "text-accent-violet",
  rose: "text-accent-rose",
} as const;

export function CaseStudiesShowcase() {
  const [activeId, setActiveId] = useState(caseStudies[0].id);

  const activeStudy = useMemo(
    () => caseStudies.find((s) => s.id === activeId) ?? caseStudies[0],
    [activeId],
  );

  return (
    <div className="space-y-8">
      <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {caseStudies.map((study) => (
          <StaggerItem key={study.id}>
            <CaseStudyCard
              study={study}
              active={activeId === study.id}
              onSelect={setActiveId}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStudy.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassPanel variant="elevated" className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="space-y-6 border-b border-glass-border p-6 sm:p-8 lg:border-r lg:border-b-0">
                <div>
                  <Badge variant="cyan">{activeStudy.industry}</Badge>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {activeStudy.headline}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted sm:text-base">
                    {activeStudy.summary}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-rose">
                      Before
                    </p>
                    <p className="text-sm leading-relaxed text-text-muted">
                      {activeStudy.beforeSummary}
                    </p>
                  </div>
                  <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                      After
                    </p>
                    <p className="text-sm leading-relaxed text-text-primary">
                      {activeStudy.afterSummary}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {activeStudy.metrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3 }}
                      className="rounded-xl border border-glass-border bg-bg-secondary/50 p-3"
                    >
                      <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                        {metric.label}
                      </p>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-xs text-text-muted line-through">
                          {metric.before}
                        </span>
                        <span
                          className={cn(
                            "font-display text-sm font-semibold sm:text-base",
                            accentText[activeStudy.accent],
                          )}
                        >
                          {metric.after}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-5 p-6 sm:p-8">
                <CaseStudyChart />

                <div className="rounded-xl border border-glass-border bg-bg-secondary/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Systems Deployed
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeStudy.systems.map((system) => (
                      <Badge key={system} variant="default">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>

                <blockquote className="rounded-xl border border-glass-border bg-bg-primary/50 p-5">
                  <p className="font-accent text-base leading-relaxed text-text-primary italic sm:text-lg">
                    &ldquo;{activeStudy.testimonial.quote}&rdquo;
                  </p>
                  <footer className="mt-4">
                    <p className="text-sm font-medium text-text-primary">
                      {activeStudy.testimonial.author}
                    </p>
                    <p className="text-xs text-text-muted">
                      {activeStudy.testimonial.role}
                    </p>
                  </footer>
                </blockquote>

                <Button href="/case-studies" variant="secondary" className="mt-auto self-start">
                  Read Full Case Study
                </Button>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
