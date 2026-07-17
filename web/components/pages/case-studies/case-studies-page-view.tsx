"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  GitBranch,
  MessageSquareQuote,
  Sparkles,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { CaseStudyCard } from "@/components/sections/case-studies/case-study-card";
import { CaseStudyChart } from "@/components/sections/case-studies/case-study-chart";
import { PageHero } from "@/components/shared/page-hero";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  detailedCaseStudies,
  implementationProcess,
  proofPillars,
  socialProofStats,
  type DetailedCaseStudy,
} from "@/lib/case-studies-page-data";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const statIcons = {
  building: Building2,
  clock: Clock,
  trending: TrendingUp,
  zap: Zap,
} as const;

const accentText = {
  cyan: "text-brand-cyan",
  lime: "text-brand",
  violet: "text-accent-violet",
  rose: "text-accent-rose",
} as const;

const accentBorder = {
  cyan: "border-brand-cyan/25 bg-brand-cyan/5",
  lime: "border-brand/25 bg-brand/5",
  violet: "border-accent-violet/25 bg-accent-violet/5",
  rose: "border-accent-rose/25 bg-accent-rose/5",
} as const;

function SectionHeading({
  label,
  title,
  description,
  className,
}: {
  label: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 max-w-2xl space-y-3", className)}>
      <p className="s-label">{label}</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-text-muted">{description}</p>
      ) : null}
    </div>
  );
}

function WorkflowDiagram({ study }: { study: DetailedCaseStudy }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <AnimatedIcon icon={GitBranch} size={16} className="text-brand-cyan" interactive={false} />
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Automation workflow
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {study.workflow.map((node, index) => (
          <div key={node.step} className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-lg border px-3 py-2 text-center sm:min-w-[120px]",
                accentBorder[study.accent],
              )}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                {node.tool}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-text-primary">{node.step}</p>
            </div>
            {index < study.workflow.length - 1 ? (
              <ChevronRight
                size={14}
                className="hidden shrink-0 text-faint sm:block"
                aria-hidden
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function CaseStudyDetailPanel({ study }: { study: DetailedCaseStudy }) {
  return (
    <GlassPanel variant="elevated" className="overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="space-y-6 border-b border-border-subtle p-6 sm:p-8 lg:border-r lg:border-b-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan">{study.industry}</Badge>
              <span className="text-xs text-text-muted">{study.deploymentDuration}</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {study.headline}
            </h3>
            <p className="mt-2 text-sm text-text-muted sm:text-base">{study.summary}</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-rose">
                Challenge
              </p>
              <p className="text-sm leading-relaxed text-text-muted">{study.challenge}</p>
            </div>
            <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                Solution
              </p>
              <p className="text-sm leading-relaxed text-text-primary">{study.solution}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {study.metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                className="rounded-xl border border-border-subtle bg-surface-card/60 p-3"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  {metric.label}
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-xs text-text-muted line-through">{metric.before}</span>
                  <span
                    className={cn(
                      "font-display text-sm font-semibold sm:text-base",
                      accentText[study.accent],
                    )}
                  >
                    {metric.after}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Key outcomes
            </p>
            <ul className="space-y-2">
              {study.outcomeHighlights.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-2 text-sm text-text-body"
                >
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <CaseStudyChart />

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border-subtle bg-bg-secondary/40 p-3">
            {study.analyticsSnapshot.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={cn("font-display text-sm font-semibold", accentText[study.accent])}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <WorkflowDiagram study={study} />

          <div className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Systems deployed
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {study.systems.map((system) => (
                <Badge key={system} variant="default">
                  {system}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Integrations
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {study.integrations.map((integration) => (
                <span
                  key={integration}
                  className="rounded-md border border-border-subtle bg-surface-card px-2.5 py-1 text-xs text-text-muted"
                >
                  {integration}
                </span>
              ))}
            </div>
          </div>

          <blockquote className="rounded-xl border border-border-subtle bg-bg-primary/50 p-5">
            <MessageSquareQuote
              size={18}
              className="mb-2 text-brand-cyan opacity-60"
              aria-hidden
            />
            <p className="font-accent text-base leading-relaxed text-text-primary italic sm:text-lg">
              &ldquo;{study.testimonial.quote}&rdquo;
            </p>
            <footer className="mt-4">
              <p className="text-sm font-medium text-text-primary">
                {study.testimonial.author}
              </p>
              <p className="text-xs text-text-muted">{study.testimonial.role}</p>
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="border-t border-border-subtle bg-bg-secondary/30 p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <AnimatedIcon icon={Workflow} size={16} className="text-brand-cyan" interactive={false} />
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Implementation timeline — {study.timeline}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {study.implementationPhases.map((phase, index) => (
            <motion.div
              key={phase.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border-subtle bg-surface-card p-4"
            >
              <p className="text-[10px] font-bold tracking-wider text-brand-cyan uppercase">
                {phase.week}
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{phase.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                {phase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

export function CaseStudiesPageView() {
  const [activeId, setActiveId] = useState(detailedCaseStudies[0].id);

  const activeStudy = useMemo(
    () => detailedCaseStudies.find((s) => s.id === activeId) ?? detailedCaseStudies[0],
    [activeId],
  );

  return (
    <>
      <PageHero
        badge="Case Studies"
        badgeVariant="lime"
        title={
          <>
            Real Results.{" "}
            <span className="text-gradient-cyan">Real Proof.</span>
          </>
        }
        description="Detailed client stories with before-and-after metrics, implementation timelines, automation workflows, and measurable business outcomes — the social proof behind every TechTivAI deployment."
        features={[
          { icon: BarChart3, label: "Measurable outcomes" },
          { icon: Workflow, label: "Implementation proof" },
          { icon: MessageSquareQuote, label: "Client testimonials" },
        ]}
      />

      <SectionWrapper className="bg-bg-secondary/40 pt-0 pb-12">
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {socialProofStats.map((stat) => {
            const Icon = statIcons[stat.icon];
            return (
              <motion.div key={stat.label} variants={fadeUp}>
                <GlassPanel className="flex h-full flex-col gap-3 p-5 sm:p-6">
                  <AnimatedIcon icon={Icon} size={20} className="text-brand-cyan" />
                  <p className="font-display text-3xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                </GlassPanel>
              </motion.div>
            );
          })}
        </motion.div>
      </SectionWrapper>

      <SectionWrapper className="bg-grid pt-0">
        <SectionHeading
          label="— Client stories"
          title={
            <>
              Proof of work{" "}
              <span className="text-gradient-cyan">across industries</span>
            </>
          }
          description="Select a client to explore the full story — challenge, solution, metrics, workflow, and implementation timeline."
        />

        <div className="space-y-8">
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {detailedCaseStudies.map((study) => (
              <motion.div key={study.id} variants={fadeUp}>
                <CaseStudyCard
                  study={study}
                  active={activeId === study.id}
                  onSelect={setActiveId}
                />
              </motion.div>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStudy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <CaseStudyDetailPanel study={activeStudy} />
            </motion.div>
          </AnimatePresence>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <SectionHeading
          label="— How we deliver"
          title={
            <>
              Implementation{" "}
              <span className="text-gradient-cyan">process</span>
            </>
          }
          description="Every deployment follows a proven five-phase rollout — from discovery to live automation with tracked outcomes."
        />

        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {implementationProcess.map((step) => (
            <motion.div key={step.phase} variants={fadeUp}>
              <GlassPanel className="relative h-full p-5">
                <span className="font-display text-2xl font-bold text-brand/30">
                  {step.phase}
                </span>
                <p className="mt-2 text-[10px] font-bold tracking-wider text-brand-cyan uppercase">
                  {step.duration}
                </p>
                <h3 className="mt-2 font-display text-base font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {step.description}
                </p>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      <SectionWrapper className="bg-bg-secondary/40">
        <SectionHeading
          label="— What we prove"
          title={
            <>
              Social proof{" "}
              <span className="text-gradient-cyan">pillars</span>
            </>
          }
          description="Blueprint-aligned case study structure — every story backed by data, process, and client voice."
        />

        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {proofPillars.map((pillar) => (
            <motion.div key={pillar.title} variants={fadeUp}>
              <GlassPanel className="h-full p-6">
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {pillar.description}
                </p>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      <SectionWrapper>
        <SectionHeading
          label="— Client voice"
          title={
            <>
              What our clients{" "}
              <span className="text-gradient-cyan">say</span>
            </>
          }
          description="Direct feedback from operators who transformed their business with TechTivAI automation."
        />

        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {detailedCaseStudies.map((study) => (
            <motion.div key={study.id} variants={fadeUp}>
              <GlassPanel className="flex h-full flex-col p-6">
                <Badge variant="cyan" className="self-start">
                  {study.industry}
                </Badge>
                <p className="mt-4 flex-1 font-accent text-base leading-relaxed text-text-primary italic">
                  &ldquo;{study.testimonial.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-border-subtle pt-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {study.testimonial.author}
                    </p>
                    <p className="text-xs text-text-muted">{study.testimonial.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveId(study.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-cyan transition-colors hover:text-brand"
                  >
                    View story
                    <ArrowRight size={12} />
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      <SectionWrapper className="pb-28">
        <GlassPanel
          variant="elevated"
          className="relative overflow-hidden p-8 text-center sm:p-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-0 size-64 rounded-full bg-accent-cyan/10 blur-[80px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 left-0 size-48 rounded-full bg-[var(--hero-glow-accent)] blur-[70px]"
          />
          <div className="relative">
            <AnimatedIcon icon={Sparkles} size={28} className="mx-auto mb-4 text-brand" />
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              Get Your AI Transformation Blueprint
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-text-muted">
              See what automation could look like for your business — run AI Discovery
              for a tailored roadmap or book a strategy call with our team.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/discovery" size="lg">
                Start AI Discovery
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Book Strategy Call
              </Button>
            </div>
          </div>
        </GlassPanel>
      </SectionWrapper>
    </>
  );
}
