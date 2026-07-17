"use client";

import { motion } from "framer-motion";
import {
  Calculator,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { PricingCalculator } from "@/components/sections/pricing/pricing-calculator";
import { PageHero } from "@/components/shared/page-hero";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { formatCurrency } from "@/lib/pricing";
import {
  addOnServices,
  blueprintExample,
  pricingComparisonRows,
  pricingEngineFeatures,
  pricingFactors,
  pricingFaqs,
  pricingModels,
  pricingTiers,
} from "@/lib/pricing-page-data";
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

function PricingTierCard({ tier }: { tier: (typeof pricingTiers)[number] }) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "relative overflow-hidden rounded-surface-xl border bg-surface-card p-8 transition-transform duration-300 hover:-translate-y-1 sm:p-10",
        tier.featured
          ? "border-accent-lime/30 bg-gradient-to-br from-accent-lime/[0.04] to-surface-card shadow-[0_0_60px_var(--shadow-lime)]"
          : "border-border-subtle",
      )}
    >
      {tier.badge ? (
        <div className="absolute top-0 right-6 rounded-b-lg bg-accent-lime px-3.5 py-1.5 text-[0.68rem] font-extrabold tracking-[1px] text-on-accent">
          {tier.badge}
        </div>
      ) : null}

      <p className="mb-5 text-[0.7rem] font-bold tracking-[3px] text-text-muted uppercase">
        {tier.name}
      </p>

      {tier.price ? (
        <div className="mb-2 flex items-start gap-1 font-display">
          <span className="pt-2 text-[1.3rem] font-semibold text-text-muted">$</span>
          <span className="text-[3.2rem] leading-none font-bold price-num sm:text-[4rem]">
            {tier.price}
          </span>
          {tier.priceSuffix ? (
            <span className="pt-6 text-[0.85rem] text-text-muted">{tier.priceSuffix}</span>
          ) : null}
        </div>
      ) : (
        <p className="mb-2 font-display text-[2.5rem] leading-none font-bold text-text-primary">
          Custom
        </p>
      )}

      <p className="mb-8 text-[0.88rem] text-text-muted">{tier.tagline}</p>
      <hr className="mb-7 border-0 border-t border-border-subtle" />

      <ul className="space-y-3">
        {tier.features.map((feature) => (
          <li
            key={feature.text}
            className="flex items-start gap-2.5 text-[0.85rem] leading-normal text-text-muted"
          >
            <span
              className={cn(
                "mt-0.5 shrink-0 text-[0.8rem]",
                feature.included ? "text-brand" : "text-faint",
              )}
            >
              {feature.included ? "✓" : "✗"}
            </span>
            {feature.text}
          </li>
        ))}
      </ul>

      <Link
        href={tier.cta.href}
        className={cn(
          "mt-8 block rounded-[10px] py-3.5 text-center text-[0.9rem] font-bold no-underline transition-all duration-200",
          tier.cta.primary
            ? "btn-lime"
            : "border border-border-subtle text-text-body hover:border-brand-cyan hover:text-brand",
        )}
      >
        {tier.cta.label}
      </Link>
    </motion.div>
  );
}

export function PricingPageView() {
  return (
    <>
      <PageHero
        badge="AI Pricing Engine"
        badgeVariant="lime"
        title={
          <>
            Intelligent Pricing for{" "}
            <span className="text-gradient-hero">AI Transformation</span>
          </>
        }
        description="Transparent subscription tiers, dynamic project estimates, and real-time ROI projections — powered by our AI Pricing Intelligence Engine."
        features={[
          { icon: Calculator, label: "Real-time estimates" },
          { icon: TrendingUp, label: "ROI projections" },
          { icon: Zap, label: "3 pricing models" },
        ]}
      />

      {/* Subscription tiers */}
      <SectionWrapper className="bg-bg-secondary/50 pt-0">
        <SectionHeading
          label="— Subscription Plans"
          title={
            <>
              Monthly Plans That{" "}
              <span className="text-gradient-cyan">Scale With You</span>
            </>
          }
          description="Start with Growth, expand to Scale, or go full Enterprise — every plan includes our core AI automation platform."
        />

        <motion.div
          className="grid gap-5 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {pricingTiers.map((tier) => (
            <PricingTierCard key={tier.id} tier={tier} />
          ))}
        </motion.div>
      </SectionWrapper>

      {/* Pricing models */}
      <SectionWrapper className="bg-grid">
        <SectionHeading
          label="— Pricing Models"
          title="Three Ways to Partner"
          description="Every engagement combines implementation setup, ongoing maintenance, and optional retainer partnership — tailored to your automation scope."
        />

        <motion.div
          className="grid gap-5 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {pricingModels.map((model) => (
            <motion.div key={model.title} variants={fadeUp}>
              <GlassPanel className="h-full p-6 sm:p-8">
                <AnimatedIcon
                  icon={model.icon}
                  size={26}
                  className="mb-5 text-brand-cyan"
                />
                <p className="s-label-sm mb-2">{model.subtitle}</p>
                <h3 className="mb-3 font-display text-xl font-semibold text-text-primary">
                  {model.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-text-muted">
                  {model.description}
                </p>
                <ul className="space-y-2">
                  {model.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-text-muted before:text-brand before:content-['→']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* Dynamic calculator */}
      <SectionWrapper id="calculator" className="bg-bg-secondary/40">
        <SectionHeading
          label="— Dynamic Pricing Engine"
          title={
            <>
              Configure &amp; Get Your{" "}
              <span className="text-gradient-cyan">Live Estimate</span>
            </>
          }
          description="Adjust workflows, integrations, AI models, complexity, and volume — pricing updates in real time with ROI projections and implementation timeline."
        />

        <PricingCalculator />
      </SectionWrapper>

      {/* Pricing factors */}
      <SectionWrapper>
        <SectionHeading
          label="— Pricing Logic"
          title="What Drives Your Price"
          description="Our dynamic pricing engine weighs seven core factors to generate accurate setup, maintenance, and retainer estimates."
        />

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {pricingFactors.map((factor) => (
            <motion.div key={factor.title} variants={fadeUp}>
              <div className="group h-full rounded-surface-lg border border-border-subtle bg-surface-card p-5 transition-colors duration-300 hover:border-border-highlight hover:bg-[var(--card-hover-bg)]">
                <AnimatedIcon
                  icon={factor.icon}
                  size={22}
                  className="mb-3 text-brand-cyan"
                />
                <h3 className="mb-1.5 font-display text-sm font-semibold text-text-primary">
                  {factor.title}
                </h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  {factor.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* Engine features + blueprint example */}
      <SectionWrapper className="bg-bg-secondary/50">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading
              label="— AI Pricing Features"
              title="Built-In Intelligence"
              description="Every estimate includes projections that help you justify investment and plan implementation."
            />
            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {pricingEngineFeatures.map((feature) => (
                <motion.div key={feature.title} variants={fadeUp}>
                  <div className="flex gap-4 rounded-surface-md border border-border-subtle bg-surface-card p-4">
                    <AnimatedIcon
                      icon={feature.icon}
                      size={20}
                      className="mt-0.5 shrink-0 text-brand"
                    />
                    <div>
                      <h3 className="font-display text-sm font-semibold text-text-primary">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-text-muted">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <GlassPanel variant="elevated" className="h-full p-6 sm:p-8">
              <p className="s-label">— Example Output</p>
              <h3 className="mb-6 font-display text-2xl font-semibold text-text-primary">
                {blueprintExample.systemLabel}
              </h3>

              <div className="space-y-3">
                {[
                  ["One-Time Setup", blueprintExample.setup, ""],
                  ["Monthly Maintenance", blueprintExample.monthly, "/mo"],
                  ["Retainer Partnership", blueprintExample.retainer, "/mo"],
                ].map(([label, value, suffix]) => (
                  <div
                    key={String(label)}
                    className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-elevated px-4 py-3"
                  >
                    <span className="text-sm text-text-muted">{label}</span>
                    <span className="font-display text-lg font-semibold tabular-nums text-brand-cyan">
                      {formatCurrency(value as number)}
                      {suffix}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border-subtle pt-6">
                {[
                  [`${blueprintExample.timelineWeeks} wks`, "Timeline"],
                  [`${blueprintExample.automationCoverage}%`, "Coverage"],
                  [`${blueprintExample.hoursSaved}h`, "Hours saved/mo"],
                  [formatCurrency(blueprintExample.annualSavings), "Annual savings"],
                ].map(([val, lbl]) => (
                  <div
                    key={String(lbl)}
                    className="rounded-xl border border-border-subtle bg-surface-elevated p-3 text-center"
                  >
                    <p className="font-display text-lg font-bold text-brand-strong">{val}</p>
                    <p className="mt-0.5 text-[0.68rem] text-text-muted">{lbl}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Comparison table */}
      <SectionWrapper className="bg-grid">
        <SectionHeading
          label="— Plan Comparison"
          title="Feature Breakdown"
          description="Compare capabilities across Growth, Scale, and Enterprise tiers."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-surface-xl border border-border-subtle"
        >
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated">
                <th className="px-5 py-4 font-display font-semibold text-text-primary">
                  Feature
                </th>
                {["Growth", "Scale", "Enterprise"].map((plan) => (
                  <th
                    key={plan}
                    className="px-5 py-4 font-display font-semibold text-brand-cyan"
                  >
                    {plan}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricingComparisonRows.map((row, index) => (
                <tr
                  key={row.feature}
                  className={cn(
                    "border-b border-border-subtle transition-colors hover:bg-[var(--card-hover-bg)]",
                    index % 2 === 0 ? "bg-surface-card" : "bg-surface-elevated/50",
                  )}
                >
                  <td className="px-5 py-3.5 font-medium text-text-primary">
                    {row.feature}
                  </td>
                  <td className="px-5 py-3.5 text-text-muted">{row.growth}</td>
                  <td className="px-5 py-3.5 text-text-muted">{row.scale}</td>
                  <td className="px-5 py-3.5 text-text-muted">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </SectionWrapper>

      {/* Add-ons + FAQ */}
      <SectionWrapper className="bg-bg-secondary/40">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading
              label="— Add-Ons"
              title="Extend Your Stack"
              description="Optional services available on any plan."
            />
            <div className="space-y-3">
              {addOnServices.map((addon) => (
                <div
                  key={addon.label}
                  className="flex items-center gap-3 rounded-surface-md border border-border-subtle bg-surface-card px-4 py-3"
                >
                  <AnimatedIcon icon={addon.icon} size={18} className="text-brand-cyan" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{addon.label}</p>
                    <p className="text-xs text-text-muted">{addon.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading label="— FAQ" title="Pricing Questions" />
            <motion.div
              className="space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {pricingFaqs.map((faq) => (
                <motion.div key={faq.question} variants={fadeUp}>
                  <details className="group rounded-surface-md border border-border-subtle bg-surface-card p-4 open:border-border-highlight open:bg-[var(--card-hover-bg)]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-brand-cyan transition-transform group-open:rotate-90"
                      />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted">
                      {faq.answer}
                    </p>
                  </details>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
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
            <AnimatedIcon
              icon={Sparkles}
              size={28}
              className="mx-auto mb-4 text-brand"
            />
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              Get Your Personalized AI Pricing Blueprint
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-text-muted">
              Run AI Discovery for a tailored automation roadmap, or book a free
              strategy call to review your custom estimate with our team.
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
