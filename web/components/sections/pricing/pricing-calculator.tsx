"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PricingOutput } from "@/components/sections/pricing/pricing-output";
import { PricingSlider } from "@/components/sections/pricing/pricing-slider";
import {
  calculatePricing,
  defaultPricingInputs,
  pricingSliders,
  type PricingInputs,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function PricingCalculator() {
  const [inputs, setInputs] = useState<PricingInputs>(defaultPricingInputs);

  const result = useMemo(() => calculatePricing(inputs), [inputs]);

  const updateInput = <K extends keyof PricingInputs>(
    key: K,
    value: PricingInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
      <GlassPanel className="p-6 sm:p-8">
        <h3 className="mb-6 font-display text-xl font-semibold tracking-tight">
          Configure Your System
        </h3>

        <div className="space-y-6">
          {pricingSliders.map((slider) => (
            <PricingSlider
              key={slider.id}
              label={slider.label}
              value={inputs[slider.id]}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              unit={slider.unit}
              onChange={(value) => updateInput(slider.id, value)}
            />
          ))}

          <div className="flex items-center justify-between gap-4 rounded-xl border border-glass-border bg-bg-secondary/40 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">
                CRM Requirements
              </p>
              <p className="text-xs text-text-muted">
                HubSpot, Salesforce, or GoHighLevel sync
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={inputs.crmRequired}
              aria-label="Toggle CRM requirements"
              onClick={() => updateInput("crmRequired", !inputs.crmRequired)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200",
                inputs.crmRequired
                  ? "bg-accent-cyan"
                  : "border border-glass-border bg-bg-primary",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block h-6 w-6 rounded-full bg-text-primary shadow-sm transition-transform duration-200",
                  inputs.crmRequired ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>
        </div>
      </GlassPanel>

      <PricingOutput result={result} />
    </div>
  );
}
