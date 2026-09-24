"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PricingPlan = {
  id: string;
  badge?: string;
  name: string;
  priceLabel: React.ReactNode;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

const pricingPlans: PricingPlan[] = [
  {
    id: "blueprint",
    badge: "START HERE",
    name: "AI Blueprint",
    priceLabel: (
      <>
        <span className="pt-2 text-[1.3rem] font-semibold text-text-muted">$</span>
        <span className="text-[4rem] leading-none font-bold price-num">5</span>
        <span className="pt-7 text-[0.85rem] text-text-muted">one-time</span>
      </>
    ),
    description: "Full personalized blueprint + PDF download",
    features: [
      "Business & tech analysis",
      "Problems & opportunities",
      "Recommended TechTivAI services",
      "Implementation roadmap",
      "ROI / impact view",
    ],
    ctaLabel: "Get My AI Blueprint →",
    ctaHref: "/analyze",
    featured: true,
  },
  {
    id: "implementation",
    name: "Implementation",
    priceLabel: (
      <span className="text-[2.5rem] leading-none font-bold text-text-primary">
        Custom
      </span>
    ),
    description: "Build the recommended agents, automation, web, or app",
    features: [
      "Scoped from your blueprint",
      "Clear timeline & stack",
      "“Build This With TechTivAI” CTA",
      "Dedicated delivery team",
    ],
    ctaLabel: "Request implementation →",
    ctaHref: "/contact",
  },
  {
    id: "advisory",
    name: "Advisory",
    priceLabel: (
      <span className="text-[2.5rem] leading-none font-bold text-text-primary">
        Monthly
      </span>
    ),
    description: "Ongoing consultant access and blueprint updates",
    features: [
      "AI Consultant access",
      "New recommendations",
      "Blueprint updates",
      "Voice consultation (upcoming)",
    ],
    ctaLabel: "Start with blueprint →",
    ctaHref: "/analyze",
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-surface-xl p-8 sm:p-11",
        plan.featured
          ? "border border-accent-lime/30 bg-gradient-to-br from-accent-lime/[0.04] to-surface-card shadow-[0_0_60px_rgba(198,255,0,0.06)]"
          : "border border-border-subtle bg-surface-card",
      )}
    >
      {plan.badge ? (
        <div className="absolute top-0 right-7 rounded-b-lg bg-accent-lime px-3.5 py-1.5 text-[0.68rem] font-extrabold tracking-[1px] text-on-accent">
          {plan.badge}
        </div>
      ) : null}
      <div className="mb-5 text-[0.7rem] font-bold tracking-[3px] text-text-muted uppercase">
        {plan.name}
      </div>
      <div
        className={cn(
          "mb-2 flex font-display",
          plan.featured ? "items-start gap-1" : "min-h-[4rem] items-center",
        )}
      >
        {plan.priceLabel}
      </div>
      <div className="mb-8 min-h-[2.6rem] text-[0.88rem] text-text-muted">
        {plan.description}
      </div>
      <hr className="my-7 border-0 border-t border-border-subtle" />
      <div className="flex-1">
        {plan.features.map((text) => (
          <div
            key={text}
            className="mb-3 flex items-start gap-2.5 text-[0.85rem] leading-normal text-text-muted"
          >
            <span className="mt-0.5 shrink-0 text-[0.8rem] text-brand">✓</span>
            {text}
          </div>
        ))}
      </div>
      <a
        href={plan.ctaHref}
        className={cn(
          "mt-8 block rounded-[10px] py-3.5 text-center text-[0.9rem] no-underline",
          plan.featured
            ? "btn-lime"
            : "border border-border-subtle font-bold text-text-body transition-all duration-200 hover:border-accent-lime hover:text-brand",
        )}
        data-cursor-target
      >
        {plan.ctaLabel}
      </a>
    </div>
  );
}

export function LandingPricingCards() {
  const [index, setIndex] = useState(0);
  const total = pricingPlans.length;

  const goPrev = () => setIndex((current) => (current - 1 + total) % total);
  const goNext = () => setIndex((current) => (current + 1) % total);

  return (
    <>
      {/* Desktop / tablet: equal-height grid */}
      <div className="mt-[60px] hidden grid-cols-3 items-stretch gap-5 md:grid">
        {pricingPlans.map((plan) => (
          <div key={plan.id} className="scroll-reveal h-full">
            <PricingCard plan={plan} />
          </div>
        ))}
      </div>

      {/* Mobile: carousel with arrows */}
      <div className="mt-10 md:hidden">
        <div className="relative">
          <PricingCard plan={pricingPlans[index]!} />

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous pricing plan"
              className="flex size-11 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-border-highlight"
              data-cursor-target
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              {pricingPlans.map((plan, i) => (
                <button
                  key={plan.id}
                  type="button"
                  aria-label={`Go to ${plan.name}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    i === index ? "bg-accent-lime" : "bg-border-subtle",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next pricing plan"
              className="flex size-11 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-border-highlight"
              data-cursor-target
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-text-muted">
            {index + 1} / {total} · {pricingPlans[index]?.name}
          </p>
        </div>
      </div>
    </>
  );
}
