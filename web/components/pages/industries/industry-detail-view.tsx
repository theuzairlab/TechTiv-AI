"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, GitBranch, Target, TrendingUp, Workflow } from "lucide-react";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { IndustryArchitecture } from "@/components/pages/industries/industry-architecture";
import { industryAccentStyles } from "@/components/sections/industries/industry-styles";
import { PageHero } from "@/components/shared/page-hero";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { industries } from "@/lib/industries";
import { getIndustryPageDetail } from "@/lib/industries-page-data";
import { cn } from "@/lib/utils";

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Target;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8 max-w-2xl space-y-3">
      <div className="flex items-center gap-2 text-accent-cyan">
        <Icon size={18} aria-hidden />
        <span className="text-[0.7rem] font-bold tracking-[0.2em] uppercase">{title}</span>
      </div>
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{subtitle}</h2>
    </div>
  );
}

type IndustryDetailViewProps = {
  slug: string;
};

export function IndustryDetailView({ slug }: IndustryDetailViewProps) {
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) {
    return null;
  }
  const detail = getIndustryPageDetail(industry.slug);
  const accent = industryAccentStyles[industry.accent];

  if (!detail) return null;

  const related = industries.filter((item) => item.slug !== industry.slug).slice(0, 3);

  return (
    <>
      <PageHero
        badge={`${industry.name} AI`}
        badgeVariant={industry.accent}
        title={
          <>
            {detail.headline}
            <span className="mt-2 block text-xl font-normal text-text-muted sm:text-2xl">
              {detail.tagline}
            </span>
          </>
        }
        description={industry.description}
        features={industry.features.slice(0, 4).map((feature) => ({
          icon: industry.icon,
          label: feature,
        }))}
      />

      <SectionWrapper className="bg-bg-secondary/40 pt-0">
        <SectionHeader
          icon={Target}
          title="Pain points"
          subtitle="Business challenges we solve"
        />
        <StaggerChildren className="grid gap-4 sm:grid-cols-2">
          {detail.painPoints.map((point) => (
            <StaggerItem key={point.title}>
              <GlassPanel className="h-full p-5 transition-colors hover:border-accent-rose/30">
                <h3 className="font-display text-base font-semibold text-text-primary">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {point.description}
                </p>
              </GlassPanel>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </SectionWrapper>

      <SectionWrapper className="bg-grid">
        <SectionHeader
          icon={BrainCircuit}
          title="AI opportunities"
          subtitle="Where AI creates the most impact"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {detail.aiOpportunities.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
            >
              <GlassPanel variant="elevated" className="h-full p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl ring-1",
                      accent.bg,
                      accent.ring,
                    )}
                  >
                    <AnimatedIcon icon={industry.icon} size={18} className={accent.text} />
                  </span>
                  <h3 className="font-display text-base font-semibold text-text-primary">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{item.description}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <SectionHeader
          icon={Workflow}
          title="Workflow examples"
          subtitle="Real automation flows for your industry"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {detail.workflowExamples.map((workflow, index) => (
            <motion.div
              key={workflow.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <GlassPanel className="p-5">
                <h3 className="mb-4 font-display text-base font-semibold text-text-primary">
                  {workflow.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  {workflow.steps.map((step, stepIndex) => (
                    <span key={step} className="flex items-center gap-1.5">
                      <span className="rounded-lg border border-glass-border bg-surface-elevated px-2.5 py-1 text-xs text-text-body">
                        {step}
                      </span>
                      {stepIndex < workflow.steps.length - 1 ? (
                        <ArrowRight size={12} className="text-text-dim" />
                      ) : null}
                    </span>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-bg-secondary/40">
        <SectionHeader
          icon={GitBranch}
          title="Automation architecture"
          subtitle="How systems connect in your stack"
        />
        <IndustryArchitecture layers={detail.architecture} accent={industry.accent} />
      </SectionWrapper>

      <SectionWrapper className="bg-grid">
        <SectionHeader
          icon={TrendingUp}
          title="ROI metrics"
          subtitle="Projected outcomes from similar deployments"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {detail.roiMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <GlassPanel variant="elevated" className="p-6 text-center">
                <p className={cn("font-display text-3xl font-bold sm:text-4xl", accent.text)}>
                  {metric.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">{metric.label}</p>
                <p className="mt-1 text-xs text-text-muted">{metric.detail}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-text-dim">
          Benchmarks from comparable deployments — run{" "}
          <Link href="/discovery" className="text-accent-cyan hover:underline">
            AI Discovery
          </Link>{" "}
          for projections tailored to your business.
        </p>
      </SectionWrapper>

      <SectionWrapper className="pb-28">
        <div className="grid gap-8 lg:grid-cols-2">
          <GlassPanel variant="elevated" className="p-6 sm:p-8">
            <Badge variant={industry.accent} className="mb-4">
              {industry.metric}
            </Badge>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Ready to automate {industry.name.toLowerCase()}?
            </h2>
            <p className="mt-3 text-text-muted">
              Get a tailored AI blueprint with workflows, architecture, and ROI
              scoped to your team and tools.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/discovery" size="lg">
                Start AI Discovery
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Book Strategy Call
              </Button>
            </div>
          </GlassPanel>

          <div className="space-y-3">
            <p className="text-sm font-medium text-text-muted">Explore other industries</p>
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/industries/${item.slug}`}
                className="flex items-center justify-between rounded-xl border border-glass-border bg-surface-card/60 px-4 py-3 transition-colors hover:border-accent-cyan/30 hover:bg-surface-elevated"
              >
                <span className="flex items-center gap-3">
                  <AnimatedIcon icon={item.icon} size={18} className="text-accent-cyan" />
                  <span className="text-sm font-medium text-text-body">{item.name}</span>
                </span>
                <ArrowRight size={14} className="text-text-dim" />
              </Link>
            ))}
            <Link
              href="/industries"
              className="inline-flex items-center gap-1 text-sm text-accent-cyan hover:underline"
            >
              View all industries
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
