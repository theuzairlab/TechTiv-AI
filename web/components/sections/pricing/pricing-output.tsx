"use client";

import { motion } from "framer-motion";
import { formatCurrency, type PricingResult } from "@/lib/pricing";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

type PricingOutputProps = {
  result: PricingResult;
};

function PriceRow({
  label,
  value,
  suffix = "",
  highlight = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3",
        highlight
          ? "border-accent-cyan/30 bg-accent-cyan/10"
          : "border-glass-border bg-bg-secondary/40",
      )}
    >
      <span className="text-sm text-text-muted">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0.6, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "font-display text-lg font-semibold tabular-nums",
          highlight ? "text-brand-cyan" : "text-text-primary",
        )}
      >
        {formatCurrency(value)}
        {suffix}
      </motion.span>
    </div>
  );
}

export function PricingOutput({ result }: PricingOutputProps) {
  return (
    <GlassPanel variant="elevated" className="p-6 sm:p-8">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Live Estimate
        </p>
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {result.systemLabel}
        </h3>
      </div>

      <div className="space-y-3">
        <PriceRow label="One-Time Setup" value={result.setup} highlight />
        <PriceRow label="Monthly Maintenance" value={result.monthly} suffix="/mo" />
        <PriceRow label="Retainer Partnership" value={result.retainer} suffix="/mo" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 border-t border-glass-border pt-6">
        <div className="rounded-xl border border-glass-border bg-bg-secondary/40 p-4">
          <p className="font-display text-2xl font-semibold text-gradient-cyan">
            {result.timelineWeeks} wks
          </p>
          <p className="mt-1 text-xs text-text-muted">Implementation timeline</p>
        </div>
        <div className="rounded-xl border border-glass-border bg-bg-secondary/40 p-4">
          <p className="font-display text-2xl font-semibold text-gradient-cyan">
            {result.automationCoverage}%
          </p>
          <p className="mt-1 text-xs text-text-muted">Automation coverage</p>
        </div>
        <div className="rounded-xl border border-glass-border bg-bg-secondary/40 p-4">
          <p className="font-display text-2xl font-semibold text-gradient-cyan">
            {result.roi.hoursSavedPerMonth}h
          </p>
          <p className="mt-1 text-xs text-text-muted">Hours saved / month</p>
        </div>
        <div className="rounded-xl border border-glass-border bg-bg-secondary/40 p-4">
          <p className="font-display text-2xl font-semibold text-gradient-cyan">
            {formatCurrency(result.roi.annualSavings)}
          </p>
          <p className="mt-1 text-xs text-text-muted">Projected annual savings</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-text-muted">
        Payback estimated in ~{result.roi.paybackMonths} months · Demo pricing — API in Phase 3
      </p>
    </GlassPanel>
  );
}
