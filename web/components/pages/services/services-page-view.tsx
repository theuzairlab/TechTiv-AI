"use client";

import { motion } from "framer-motion";
import { Layers, Network, Sparkles, Workflow } from "lucide-react";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { ServiceEcosystem } from "@/components/sections/services/service-ecosystem";
import { ServicesCatalog } from "@/components/pages/services/services-catalog";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AnimatedIcon } from "@/components/ui/animated-icon";

const ecosystemFeatures = [
  {
    icon: Network,
    title: "Connected ecosystem",
    desc: "Nine AI systems linked through workflow automation — click any node to explore.",
  },
  {
    icon: Workflow,
    title: "Live workflows",
    desc: "See how services chain together from lead capture to conversion.",
  },
  {
    icon: Layers,
    title: "Deep service specs",
    desc: "Overview, use cases, workflows, pricing, integrations, and ROI per service.",
  },
] as const;

export function ServicesPageView() {
  return (
    <>
      <PageHero
        badge="Services Ecosystem"
        title={
          <>
            Every AI System Your{" "}
            <span className="text-gradient-cyan">Business Needs</span>
          </>
        }
        description="Explore our full AI automation ecosystem — interactive service map, detailed capabilities, workflow examples, pricing ranges, integrations, and projected ROI for each system."
        features={[
          { icon: Network, label: "9 interconnected systems" },
          { icon: Workflow, label: "Workflow examples" },
          { icon: Sparkles, label: "ROI projections" },
        ]}
      />

      <SectionWrapper className="bg-bg-secondary/40 pt-0">
        <div className="mb-8 max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Interactive{" "}
            <span className="text-gradient-cyan">service map</span>
          </h2>
          <p className="text-text-muted">
            Click any node to explore capabilities and see how services connect
            through your automation stack.
          </p>
        </div>
        <ServiceEcosystem />
      </SectionWrapper>

      <SectionWrapper className="bg-grid">
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {ecosystemFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <GlassPanel className="h-full p-5">
                <AnimatedIcon icon={feature.icon} size={20} className="mb-3 text-accent-cyan" />
                <h3 className="font-display text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{feature.desc}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        <div className="mb-10 max-w-2xl space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Service{" "}
            <span className="text-gradient-cyan">deep dives</span>
          </h2>
          <p className="text-text-muted">
            Each service includes overview, use cases, workflows, pricing
            examples, integrations, and expected ROI.
          </p>
        </div>

        <ServicesCatalog />
      </SectionWrapper>

      <SectionWrapper className="pb-28">
        <GlassPanel variant="elevated" className="flex flex-col items-center gap-6 p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Not sure which services fit your business?
          </h2>
          <p className="max-w-xl text-text-muted">
            Run the AI Discovery platform — we&apos;ll interview your business and
            recommend the right systems with projected ROI.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/discovery" size="lg">
              Start AI Discovery
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Talk to an Expert
            </Button>
          </div>
        </GlassPanel>
      </SectionWrapper>
    </>
  );
}
