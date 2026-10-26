"use client";

import { ArrowRight, Gauge } from "lucide-react";
import type {
  AnalysisListItem,
  DashboardHighlight,
  ServiceRequestItem,
} from "@/lib/dashboard/types";
import { formatDate, formatDateTime } from "@/lib/format-display";
import { getStatusLabel, leadStatusVariants } from "@/lib/leads-format";
import {
  implementationStatusLabels,
  implementationStatusVariants,
} from "@/lib/implementation";
import { analysisStatusLabel } from "@/lib/product-labels";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { AnalysisStatusBadge } from "@/components/pages/admin/analysis-status-badge";

type UserDashboardPageViewProps = {
  firstName: string;
  recent: AnalysisListItem[];
  activeRun: AnalysisListItem | null;
  highlight: DashboardHighlight | null;
  serviceRequestPreview: ServiceRequestItem[];
};

export function UserDashboardPageView({
  firstName,
  recent,
  activeRun,
  highlight,
  serviceRequestPreview,
}: UserDashboardPageViewProps) {
  const featuredId = highlight?.analysisId ?? activeRun?.id ?? recent[0]?.id ?? null;
  const others = recent.filter((item) => item.id !== featuredId);
  const failedRun =
    !highlight && !activeRun
      ? recent.find((item) => item.status === "FAILED") ?? null
      : null;

  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <p className="s-label">— Home</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          Welcome, <span className="text-gradient-cyan">{firstName}</span>
        </h1>
        <p className="text-text-muted">
          Analyze a business, read the blueprint, then talk it through or ask
          TechTivAI to build it.
        </p>
      </div>

      {recent.length === 0 ? (
        <GlassPanel variant="elevated" className="p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Analyze your website
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted">
            You haven&apos;t analyzed a business on this account yet. You get a
            score, the problems we found, and a blueprint you can talk through.
          </p>
          <Button href="/dashboard/analyze" className="mt-6" size="sm">
            Start analysis
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </GlassPanel>
      ) : null}

      {highlight ? (
        <GlassPanel variant="elevated" className="p-6">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-brand-cyan" />
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Latest blueprint
            </p>
          </div>
          <p className="mt-4 font-display text-5xl font-bold text-text-primary">
            {highlight.aiScore != null ? highlight.aiScore : "—"}
            {highlight.aiScore != null ? (
              <span className="text-2xl text-text-muted">/100</span>
            ) : null}
          </p>
          <p className="mt-2 text-base text-text-muted">
            Blueprint for{" "}
            <span className="font-medium text-text-primary">{highlight.domain}</span>
          </p>
          {highlight.topOpportunity ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
              Top opportunity:{" "}
              <span className="text-text-primary">{highlight.topOpportunity}</span>
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button href={`/dashboard/analyses/${highlight.analysisId}`} size="sm">
              Open blueprint
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
            <Button
              href={`/dashboard/consultant?analysisId=${highlight.analysisId}`}
              size="sm"
              variant="secondary"
            >
              Talk to the consultant
            </Button>
            <Button
              href={`/dashboard/analyses/${highlight.analysisId}`}
              size="sm"
              variant="outline"
            >
              Ask us to build this
            </Button>
          </div>
        </GlassPanel>
      ) : null}

      {activeRun ? (
        <GlassPanel className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Analysis in progress
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-text-primary">
              {activeRun.domain}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {analysisStatusLabel(activeRun.status)}
            </p>
          </div>
          <Button href={`/dashboard/analyses/${activeRun.id}`} size="sm" variant="secondary">
            View progress
          </Button>
        </GlassPanel>
      ) : null}

      {failedRun ? (
        <GlassPanel className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Latest analysis
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-text-primary">
              {failedRun.domain}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {analysisStatusLabel(failedRun.status)}. Open it to see what happened.
            </p>
          </div>
          <Button href={`/dashboard/analyses/${failedRun.id}`} size="sm" variant="secondary">
            Open analysis
          </Button>
        </GlassPanel>
      ) : null}

      {others.length > 0 ? (
        <GlassPanel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Your analyses
            </h2>
            <Button href="/dashboard/blueprints" size="sm" variant="outline">
              View all
            </Button>
          </div>
          <ul className="mt-4 divide-y divide-border-subtle">
            {others.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-medium text-text-primary">{item.domain}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {formatDateTime(item.createdAt)}
                    {item.aiScore != null ? ` · Score ${item.aiScore}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AnalysisStatusBadge status={item.status} />
                  <Button
                    href={`/dashboard/analyses/${item.id}`}
                    size="sm"
                    variant="secondary"
                  >
                    Open
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>
      ) : null}

      {serviceRequestPreview.length > 0 ? (
        <GlassPanel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Build requests
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Work you asked TechTivAI to build.
              </p>
            </div>
            <Button href="/dashboard/proposals" size="sm" variant="outline">
              View all
            </Button>
          </div>
          <ul className="mt-5 divide-y divide-border-subtle">
            {serviceRequestPreview.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {item.service ?? "Build request"}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {item.analysisDomain ?? item.company ?? "Business"}
                    {" · "}
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={leadStatusVariants[item.status]}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  {item.implementationStatus ? (
                    <Badge variant={implementationStatusVariants[item.implementationStatus]}>
                      {implementationStatusLabels[item.implementationStatus]}
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>
      ) : null}

      {recent.length > 0 ? (
        <div>
          <Button href="/dashboard/analyze" size="sm" variant="outline">
            New analysis
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
