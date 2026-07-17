"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { VoiceConsultantUI } from "@/components/sections/voice/voice-consultant-ui";
import { CalendlyEmbed } from "@/components/pages/contact/calendly-embed";
import { ContactForm } from "@/components/pages/contact/contact-form";
import { PageHero } from "@/components/shared/page-hero";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  consultationBenefits,
  contactFaqs,
  contactInfo,
  contactPaths,
} from "@/lib/contact-page-data";
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

export function ContactPageView() {
  return (
    <>
      <PageHero
        badge="Contact & Consultation"
        badgeVariant="cyan"
        title={
          <>
            Start Your{" "}
            <span className="text-gradient-cyan">AI Transformation</span>
          </>
        }
        description="AI onboarding, voice consultation, calendar scheduling, and manual proposal requests — every path leads to a tailored automation roadmap for your business."
        features={[
          { icon: Sparkles, label: "AI-assisted onboarding" },
          { icon: Mic, label: "Voice AI consultation" },
          { icon: MessageSquare, label: "Proposal requests" },
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
          {contactPaths.map((path) => {
            const isExternal = path.anchor.startsWith("/");
            const Wrapper = isExternal ? Link : "a";
            const wrapperProps = isExternal
              ? { href: path.anchor }
              : { href: path.anchor };

            return (
              <motion.div key={path.id} variants={fadeUp}>
                <Wrapper
                  {...wrapperProps}
                  className={cn(
                    "group flex h-full flex-col rounded-surface-xl border p-5 no-underline transition-all duration-300 hover:-translate-y-1 sm:p-6",
                    path.featured
                      ? "border-brand/30 bg-gradient-to-br from-brand/[0.06] to-surface-card shadow-[0_0_40px_var(--shadow-lime)]"
                      : "border-border-subtle bg-surface-card hover:border-border-highlight",
                  )}
                >
                  <AnimatedIcon
                    icon={path.icon}
                    size={22}
                    className={path.featured ? "text-brand" : "text-brand-cyan"}
                  />
                  <h3 className="mt-4 font-display text-base font-semibold text-text-primary">
                    {path.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                    {path.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan transition-colors group-hover:text-brand">
                    {path.cta}
                    <ArrowRight size={12} />
                  </span>
                </Wrapper>
              </motion.div>
            );
          })}
        </motion.div>
      </SectionWrapper>

      <SectionWrapper id="voice" className="bg-grid pt-0 scroll-mt-24">
        <SectionHeading
          label="— Voice AI"
          title={
            <>
              Talk to your{" "}
              <span className="text-gradient-cyan">AI consultant</span>
            </>
          }
          description="Natural voice conversation — business analysis, workflow recommendations, pricing estimation, and meeting scheduling in real time."
        />
        <VoiceConsultantUI />
      </SectionWrapper>

      <SectionWrapper id="schedule" className="scroll-mt-24">
        <SectionHeading
          label="— Calendar"
          title={
            <>
              Book a{" "}
              <span className="text-gradient-cyan">strategy call</span>
            </>
          }
          description="Pick a 30-minute slot with our AI transformation team. We'll review your goals, recommend systems, and outline next steps."
        />
        <GlassPanel variant="elevated" className="overflow-visible p-4 sm:p-6">
          <CalendlyEmbed />
        </GlassPanel>
      </SectionWrapper>

      <SectionWrapper id="form" className="bg-bg-secondary/40 scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
          <div>
            <SectionHeading
              label="— Manual form"
              title={
                <>
                  Request a custom{" "}
                  <span className="text-gradient-cyan">proposal</span>
                </>
              }
              description="Tell us about your business and we'll send a tailored automation proposal with pricing, timeline, and ROI projections."
              className="mb-8"
            />

            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {consultationBenefits.map((benefit) => (
                <motion.div key={benefit.title} variants={fadeUp}>
                  <GlassPanel className="p-5">
                    <h3 className="font-display text-sm font-semibold text-text-primary">
                      {benefit.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                      {benefit.description}
                    </p>
                  </GlassPanel>
                </motion.div>
              ))}
            </motion.div>

            <GlassPanel className="mt-6 p-5">
              <div className="flex items-start gap-3">
                <AnimatedIcon icon={Mail} size={18} className="mt-0.5 text-brand-cyan" interactive={false} />
                <div>
                  <p className="text-sm font-medium text-text-primary">{contactInfo.email}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Response within {contactInfo.responseTime} · {contactInfo.hours}
                  </p>
                </div>
              </div>
            </GlassPanel>
          </div>

          <GlassPanel variant="elevated" className="p-6 sm:p-8">
            <ContactForm />
          </GlassPanel>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <GlassPanel
          variant="elevated"
          className="relative overflow-hidden p-8 sm:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 size-48 rounded-full bg-accent-cyan/10 blur-[60px]"
          />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="s-label">— AI onboarding</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                Prefer a guided{" "}
                <span className="text-gradient-cyan">AI interview?</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">
                Skip the form — our AI Discovery platform runs a multi-step interview,
                scores your automation opportunities, and generates a personalized
                blueprint with ROI projections in minutes.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/discovery" size="lg">
                  Start AI Discovery
                </Button>
                <Button href="/pricing" variant="secondary" size="lg">
                  View Pricing
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Interview steps", value: "6" },
                { label: "Avg completion", value: "4 min" },
                { label: "Systems ranked", value: "9" },
                { label: "Proposal ready", value: "Instant" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border-subtle bg-bg-secondary/50 p-4 text-center"
                >
                  <p className="font-display text-2xl font-bold text-brand-cyan">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </SectionWrapper>

      <SectionWrapper className="bg-grid">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              label="— FAQ"
              title={
                <>
                  Consultation{" "}
                  <span className="text-gradient-cyan">questions</span>
                </>
              }
            />
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Clock size={14} className="text-brand-cyan" />
              {contactInfo.guarantee}
            </div>
          </div>

          <motion.div
            className="space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {contactFaqs.map((faq) => (
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
              Every consultation path is free with no commitment. Choose voice, calendar,
              form, or AI Discovery — we&apos;ll meet you where you are.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/discovery" size="lg">
                Start AI Discovery
              </Button>
              <Button href="#voice" variant="secondary" size="lg">
                Talk to AI Consultant
              </Button>
            </div>
          </div>
        </GlassPanel>
      </SectionWrapper>
    </>
  );
}
