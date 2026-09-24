"use client";

import { motion } from "framer-motion";
import { Lock, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { AnalysisPreviewPayload } from "@/lib/analysis/client";
import { formatUsd } from "@/lib/format-display";

type AnalysisTeaserResultsProps = {
  preview: AnalysisPreviewPayload;
  email?: string | null;
  /** Logged-in portal users already have access — CTA opens the full blueprint. */
  authenticated?: boolean;
  onRequestLogin: () => void;
};

export function AnalysisTeaserResults({
  preview,
  email,
  authenticated = false,
  onRequestLogin,
}: AnalysisTeaserResultsProps) {
  const { teaser } = preview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <GlassPanel variant="elevated" className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Strategy preview
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-text-primary">
          {preview.companyName ?? preview.domain}
        </h2>
        <div className="mt-1 flex flex-wrap gap-2 text-base text-brand-cyan">
          {teaser.industryTag ? (
            <span className="capitalize">
              {teaser.industryTag.replace(/-/g, " ")}
            </span>
          ) : null}
          {teaser.digitalMaturity ? (
            <span className="text-text-muted">
              · Maturity: {teaser.digitalMaturity}
            </span>
          ) : null}
        </div>

        {teaser.businessSummary ? (
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            {teaser.businessSummary}
            {teaser.businessSummary.length >= 400 ? "…" : ""}
          </p>
        ) : null}

        {teaser.scorecard.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {teaser.scorecard.map((item) => (
              <div
                key={item.dimension}
                className="rounded-xl border border-border-subtle bg-bg-secondary/30 p-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-text-primary">
                    {item.dimension}
                  </span>
                  <span className="font-semibold text-brand-cyan">
                    {item.score}/100
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-primary">
                  <div
                    className="h-full rounded-full bg-brand-cyan"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {teaser.findings.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-text-primary">
              Problems we found
            </h3>
            <div className="mt-2 space-y-2">
              {teaser.findings.map((finding) => (
                <div
                  key={finding.title}
                  className="rounded-xl border border-border-subtle bg-bg-secondary/30 p-3"
                >
                  <p className="text-base font-medium text-text-primary">
                    {finding.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">
                    {finding.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : teaser.painPoints.length > 0 ? (
          <PreviewList title="Detected friction points" items={teaser.painPoints} />
        ) : null}

        {teaser.quickWins.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-text-primary">Quick wins</h3>
            <ul className="mt-2 space-y-2">
              {teaser.quickWins.map((win) => (
                <li
                  key={win.title}
                  className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-text-primary">{win.title}</span>
                  <span className="text-text-muted"> — {win.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {teaser.automationHighlights.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-text-primary">
              Top automation opportunities
            </h3>
            <ul className="mt-2 space-y-2">
              {teaser.automationHighlights.map((item) => (
                <li
                  key={`${item.area}-${item.description}`}
                  className="rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-text-primary">{item.area}</span>
                  <span className="text-text-muted"> — {item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <MiniList title="SEO" items={teaser.seoHighlights} />
          <MiniList title="GEO" items={teaser.geoHighlights} />
          <MiniList title="AEO" items={teaser.aeoHighlights} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <LockedCard
            title="Full strategy blueprint"
            description="Complete automation architecture, stack map, and phased rollout."
          />
          <LockedCard
            title="ROI & investment model"
            description={
              teaser.costEstimateUSD != null
                ? `Investment from ${formatUsd(teaser.costEstimateUSD)} — unlock full breakdown.`
                : "Unlock detailed pricing breakdown and timeline phases."
            }
          />
        </div>
      </GlassPanel>

      <GlassPanel className="border-brand-cyan/25 bg-gradient-to-br from-brand-cyan/10 to-brand/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {authenticated
                ? "Open your full blueprint"
                : "Unlock your advanced report"}
            </h3>
            <p className="mt-1 text-base text-text-muted">
              {authenticated ? (
                <>
                  View the complete problems-and-solutions breakdown,
                  implementation timeline, and PDF in your portal.
                </>
              ) : (
                <>
                  Sign in to access the full problems-and-solutions breakdown,
                  implementation timeline, and PDF.
                  {email ? (
                    <>
                      {" "}
                      We&apos;ll send a magic link to{" "}
                      <strong className="text-text-primary">{email}</strong>.
                    </>
                  ) : null}
                </>
              )}
            </p>
          </div>
          <Button onClick={onRequestLogin}>
            {authenticated ? "Open full report" : "Sign in for full report"}
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            <Download size={14} /> PDF download
          </span>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((point) => (
          <li
            key={point}
            className="rounded-lg border border-border-subtle/60 bg-bg-secondary/40 px-3 py-2 text-sm text-text-muted"
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border-subtle/60 bg-bg-secondary/30 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">Unlock full detail</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <li key={item} className="text-sm text-text-muted">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LockedCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border-subtle/60 bg-bg-secondary/30 p-4">
      <div className="flex items-center gap-2 text-base font-semibold text-text-primary">
        <Lock size={14} className="text-brand-cyan" />
        {title}
      </div>
      <p className="mt-2 text-sm text-text-muted">{description}</p>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent"
      />
    </div>
  );
}
