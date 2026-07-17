"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { accentStyles } from "@/components/sections/services/service-styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { services } from "@/lib/services";
import { servicePageDetails } from "@/lib/services-page-data";
import { cn } from "@/lib/utils";

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-wide text-text-primary uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ServicesCatalog() {
  const [activeId, setActiveId] = useState(services[0]?.id ?? "workflow-automation");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const catalog = servicePageDetails.map((detail) => {
    const service = services.find((item) => item.id === detail.id);
    return { ...detail, label: service?.label ?? detail.id };
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id.replace("service-", ""));
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.3, 0.5] },
    );

    catalog.forEach((service) => {
      const element = sectionRefs.current[service.id];
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [catalog]);

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <nav className="hidden lg:block">
        <div className="sticky top-28 space-y-1">
          <p className="mb-3 px-3 text-[0.68rem] font-bold tracking-[0.2em] text-text-dim uppercase">
            Jump to service
          </p>
          {catalog.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => {
                sectionRefs.current[service.id]?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={cn(
                "w-full rounded-xl px-3 py-2.5 text-left text-sm transition-all",
                activeId === service.id
                  ? "bg-accent-cyan/10 font-medium text-accent-cyan"
                  : "text-text-muted hover:bg-surface-elevated hover:text-text-body",
              )}
            >
              {service.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="space-y-14">
        {catalog.map((service, index) => {
          const accent = accentStyles[service.accent];

          return (
            <motion.section
              key={service.id}
              id={`service-${service.id}`}
              ref={(node) => {
                sectionRefs.current[service.id] = node;
              }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.02 }}
              className="scroll-mt-28"
            >
              <GlassPanel variant="elevated" className="overflow-hidden">
                <div className="border-b border-glass-border p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <Badge variant={service.accent}>{`0${index + 1}`}</Badge>
                      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                        {service.label}
                      </h2>
                    </div>
                    <Button href="/contact" variant="secondary" size="sm" className="shrink-0">
                      Get a quote
                    </Button>
                  </div>
                </div>

                <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
                  <DetailBlock title="Overview">
                    <p className="text-sm leading-relaxed text-text-muted sm:text-base">
                      {service.overview}
                    </p>
                  </DetailBlock>

                  <DetailBlock title="Use cases">
                    <ul className="space-y-2">
                      {service.useCases.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-text-muted"
                        >
                          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", accent.dot)} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </DetailBlock>

                  <DetailBlock title="Workflows">
                    <div className="space-y-3">
                      {service.workflows.map((workflow) => (
                        <div
                          key={workflow.title}
                          className="rounded-xl border border-glass-border bg-bg-secondary/40 p-3"
                        >
                          <p className="mb-2 text-sm font-medium text-text-primary">
                            {workflow.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1">
                            {workflow.steps.map((step, stepIndex) => (
                              <span key={step} className="flex items-center gap-1">
                                <span className="rounded-md border border-glass-border bg-surface-card px-2 py-0.5 text-[0.68rem] text-text-body">
                                  {step}
                                </span>
                                {stepIndex < workflow.steps.length - 1 ? (
                                  <ArrowRight size={10} className="text-text-dim" />
                                ) : null}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DetailBlock>

                  <DetailBlock title="Pricing examples">
                    <div className="space-y-2">
                      {service.pricingExamples.map((price) => (
                        <div
                          key={price.tier}
                          className="rounded-xl border border-glass-border bg-bg-secondary/50 px-4 py-3"
                        >
                          <p className="text-[0.65rem] font-bold tracking-wide text-accent-cyan uppercase">
                            {price.tier}
                          </p>
                          <p className="font-display text-lg font-semibold text-text-primary">
                            {price.range}
                          </p>
                          <p className="text-xs text-text-muted">{price.note}</p>
                        </div>
                      ))}
                    </div>
                  </DetailBlock>

                  <DetailBlock title="Integrations">
                    <div className="flex flex-wrap gap-2">
                      {service.integrations.map((integration) => (
                        <span
                          key={integration}
                          className="rounded-full border border-glass-border bg-surface-elevated px-3 py-1 text-xs text-text-body"
                        >
                          {integration}
                        </span>
                      ))}
                    </div>
                  </DetailBlock>

                  <DetailBlock title="Expected ROI">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {service.expectedRoi.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-xl border border-glass-border bg-bg-secondary/50 p-3 text-center"
                        >
                          <p className="font-display text-xl font-bold text-brand-strong">
                            {metric.value}
                          </p>
                          <p className="mt-1 text-[0.65rem] text-text-muted">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                  </DetailBlock>
                </div>
              </GlassPanel>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
