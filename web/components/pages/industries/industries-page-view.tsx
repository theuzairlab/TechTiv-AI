"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Building2,
  GitBranch,
  Target,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { IndustriesGrid } from "@/components/sections/industries/industries-grid";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { industries } from "@/lib/industries";
import { industryAccentStyles } from "@/components/sections/industries/industry-styles";
import { cn } from "@/lib/utils";

const blueprintFeatures = [
  {
    icon: Target,
    title: "Business pain points",
    desc: "Industry-specific bottlenecks mapped to automation opportunities.",
  },
  {
    icon: BrainCircuit,
    title: "AI opportunities",
    desc: "Recommended systems ranked by impact for your vertical.",
  },
  {
    icon: Workflow,
    title: "Workflow examples",
    desc: "Step-by-step automation flows you can deploy in weeks.",
  },
  {
    icon: GitBranch,
    title: "Automation architecture",
    desc: "Layered stack diagram showing how tools connect.",
  },
  {
    icon: TrendingUp,
    title: "ROI metrics",
    desc: "Projected outcomes from comparable deployments.",
  },
] as const;

export function IndustriesPageView() {
  return (
    <>
      <PageHero
        badge="Industry Solutions"
        title={
          <>
            Specialized AI for{" "}
            <span className="text-gradient-cyan">Your Industry</span>
          </>
        }
        description="Dedicated solutions per vertical — explore pain points, AI opportunities, workflow examples, automation architecture, and ROI metrics tailored to how your business operates."
        features={[
          { icon: Building2, label: "8 industry verticals" },
          { icon: Workflow, label: "Workflow playbooks" },
          { icon: TrendingUp, label: "ROI benchmarks" },
        ]}
      />

      <SectionWrapper className="bg-bg-secondary/40 pt-0">
        <div className="mb-8 max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Choose your{" "}
            <span className="text-gradient-cyan">industry</span>
          </h2>
          <p className="text-text-muted">
            Select a vertical to preview capabilities — each industry has a
            dedicated page with full architecture and ROI detail.
          </p>
        </div>
        <IndustriesGrid />
      </SectionWrapper>

      <SectionWrapper className="bg-grid">
        <div className="mb-10 max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            What every industry page{" "}
            <span className="text-gradient-cyan">includes</span>
          </h2>
          <p className="text-text-muted">
            Blueprint-aligned depth so you understand exactly how AI fits your
            vertical before you talk to us.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blueprintFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <GlassPanel className="h-full p-5">
                <AnimatedIcon icon={feature.icon} size={20} className="mb-3 text-accent-cyan" />
                <h3 className="font-display text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{feature.desc}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="mb-8 max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            All{" "}
            <span className="text-gradient-cyan">industries</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry, index) => {
            const accent = industryAccentStyles[industry.accent];
            return (
              <motion.div
                key={industry.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  href={`/industries/${industry.slug}`}
                  className={cn(
                    "group block h-full rounded-2xl border border-glass-border bg-glass-bg/90 p-5 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-accent-cyan/30",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl ring-1",
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
                  <h3 className="font-display text-base font-semibold text-text-primary group-hover:text-accent-cyan">
                    {industry.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-text-muted sm:text-sm">
                    {industry.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent-cyan">
                    View solutions <span aria-hidden>→</span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper className="pb-28">
        <GlassPanel variant="elevated" className="flex flex-col items-center gap-6 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Not sure which industry page fits?
          </h2>
          <p className="max-w-xl text-text-muted">
            Run the AI Discovery platform — we&apos;ll map your business type,
            bottlenecks, and tools to the right automation blueprint.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/discovery" size="lg">
              Start AI Discovery
            </Button>
            <Button href="/services" variant="secondary" size="lg">
              Explore Services
            </Button>
          </div>
        </GlassPanel>
      </SectionWrapper>
    </>
  );
}
