"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileText,
  Gauge,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { DiscoveryWizard } from "@/components/sections/discovery/discovery-wizard";
import { DiscoveryAssistant } from "@/components/pages/discovery/discovery-assistant";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AnimatedIcon } from "@/components/ui/animated-icon";

const platformFeatures = [
  {
    icon: MessageSquare,
    title: "Conversational interview",
    desc: "Multi-step AI-guided questions that feel like a strategy call, not a form.",
  },
  {
    icon: BrainCircuit,
    title: "Dynamic recommendations",
    desc: "Systems ranked by industry, team size, bottlenecks, and your existing tools.",
  },
  {
    icon: Gauge,
    title: "AI scoring engine",
    desc: "Automation impact score with hours saved, savings, and revenue potential.",
  },
  {
    icon: FileText,
    title: "Proposal generation",
    desc: "Export a tailored AI blueprint ready for your team or our consultants.",
  },
] as const;

export function DiscoveryPageView() {
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  return (
    <>
      <PageHero
        badge="AI Discovery Platform"
        title={
          <>
            Get Your{" "}
            <span className="text-gradient-cyan">AI Transformation</span> Blueprint
          </>
        }
        description="A full-screen onboarding experience that interviews your business, scores automation opportunities, and generates personalized AI recommendations with projected ROI."
        features={[
          { icon: MessageSquare, label: "Multi-step interview" },
          { icon: Sparkles, label: "AI scoring engine" },
          { icon: BrainCircuit, label: "Dynamic recommendations" },
          { icon: FileText, label: "Proposal ready" },
        ]}
      />

      <SectionWrapper className="bg-bg-secondary/40 pt-0">
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-stretch">
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <DiscoveryAssistant step={step} showResults={showResults} />
            </div>
          </div>

          <DiscoveryWizard
            onStepChange={(nextStep, results) => {
              setStep(nextStep);
              setShowResults(results);
            }}
          />
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-grid">
        <div className="mb-10 max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            How the platform{" "}
            <span className="text-gradient-cyan">works</span>
          </h2>
          <p className="text-text-muted">
            Every step feeds the scoring engine — so recommendations and ROI
            projections reflect your real business context.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platformFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
            >
              <GlassPanel className="h-full p-5 transition-colors hover:border-accent-cyan/30">
                <AnimatedIcon
                  icon={feature.icon}
                  size={22}
                  className="mb-4 text-accent-cyan"
                />
                <h3 className="font-display text-base font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {feature.desc}
                </p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper className="pb-28">
        <GlassPanel variant="elevated" className="flex flex-col items-center gap-6 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready for a human-led strategy session?
          </h2>
          <p className="max-w-xl text-text-muted">
            Take your blueprint to the next level with a free 45-minute call with
            our AI architects.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/contact" size="lg">
              Book Strategy Call
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
