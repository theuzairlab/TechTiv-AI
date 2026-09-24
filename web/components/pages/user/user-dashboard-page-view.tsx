"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Gauge,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type {
  AnalysisListItem,
  DashboardHighlight,
  ServiceRequestItem,
} from "@/lib/dashboard/types";
import { formatDate, formatDateTime, formatUsd } from "@/lib/format-display";
import { getStatusLabel, leadStatusVariants } from "@/lib/leads-format";
import {
  implementationStatusLabels,
  implementationStatusVariants,
} from "@/lib/implementation";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Badge } from "@/components/ui/badge";

type UserDashboardPageViewProps = {
  firstName: string;
  stats: {
    blueprints: number;
    proposals: number;
    inFlight: number;
    serviceRequests: number;
    openServiceRequests: number;
  };
  recent: AnalysisListItem[];
  highlight: DashboardHighlight | null;
  serviceRequestPreview: ServiceRequestItem[];
  highlightAnalysisId?: string | null;
};

export function UserDashboardPageView({
  firstName,
  stats,
  recent,
  highlight,
  serviceRequestPreview,
  highlightAnalysisId,
}: UserDashboardPageViewProps) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <p className="s-label">— Your portal</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          Welcome, <span className="text-gradient-cyan">{firstName}</span>
        </h1>
        <p className="text-text-muted">
          Your latest AI score, reports, and build requests in one place.
        </p>
      </div>

      {highlight ? (
        <GlassPanel variant="elevated" className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
            <div className="border-b border-border-subtle p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2">
                <Gauge size={18} className="text-brand-cyan" />
                <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Business AI Score
                </p>
              </div>
              <p className="mt-4 font-display text-5xl font-bold text-text-primary">
                {highlight.aiScore != null ? highlight.aiScore : "—"}
                {highlight.aiScore != null ? (
                  <span className="text-2xl text-text-muted">/100</span>
                ) : null}
              </p>
              <p className="mt-2 text-base text-text-muted">
                Latest blueprint for{" "}
                <span className="font-medium text-text-primary">
                  {highlight.domain}
                </span>
                {highlight.coverageStatus
                  ? ` · coverage ${highlight.coverageStatus}`
                  : ""}
              </p>
              {highlight.topOpportunity ? (
                <p className="mt-4 text-sm leading-relaxed text-text-muted">
                  Top opportunity:{" "}
                  <span className="text-text-primary">
                    {highlight.topOpportunity}
                  </span>
                </p>
              ) : null}
              <Button
                href={`/dashboard/analyses/${highlight.analysisId}`}
                size="sm"
                className="mt-5"
              >
                Open blueprint
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-3 lg:grid-cols-1 lg:content-center">
              {[
                {
                  label: "AI opportunities",
                  value: highlight.opportunityCount,
                },
                {
                  label: "Automation opportunities",
                  value: highlight.automationCount,
                },
                {
                  label: "Recommended services",
                  value: highlight.serviceCount,
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold text-text-primary">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Blueprints",
            value: String(stats.blueprints),
            hint: "Completed analyses",
          },
          {
            label: "Proposals",
            value: String(stats.proposals),
            hint: "With strategy + pricing",
          },
          {
            label: "In progress",
            value: String(stats.inFlight),
            hint: "Still processing",
          },
          {
            label: "Service requests",
            value: String(stats.serviceRequests),
            hint:
              stats.openServiceRequests > 0
                ? `${stats.openServiceRequests} awaiting review`
                : "Submitted to TechTivAI",
          },
        ].map((stat) => (
          <GlassPanel key={stat.label} className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-text-primary">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-text-muted">{stat.hint}</p>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Recent reports
            </h2>
          </div>
          <Button href="/dashboard/analyze" size="sm">
            New analysis
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>

        {recent.length === 0 ? (
          <p className="mt-6 text-sm text-text-muted">
            No analyses yet. Start a free analysis — no login required to submit.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border-subtle">
            {recent.map((item) => (
              <li
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-3 py-4 ${
                  highlightAnalysisId === item.id
                    ? "rounded-xl bg-brand-cyan/5 px-3"
                    : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{item.domain}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {formatDateTime(item.createdAt)}
                    {item.aiScore != null ? ` · AI score ${item.aiScore}` : ""}
                    {item.opportunityCount > 0
                      ? ` · ${item.opportunityCount} opportunities`
                      : ""}
                    {item.costEstimateUSD != null
                      ? ` · ${formatUsd(item.costEstimateUSD)}`
                      : ""}
                  </p>
                  {item.topFinding ? (
                    <p className="mt-1 line-clamp-1 text-sm text-text-muted">
                      Top problem: {item.topFinding}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.status === "DONE" ? "lime" : "default"}>
                    {item.status}
                  </Badge>
                  <Button
                    href={`/dashboard/analyses/${item.id}`}
                    size="sm"
                    variant="secondary"
                  >
                    <FileText size={14} className="mr-1.5" />
                    Open
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassPanel>

      {serviceRequestPreview.length > 0 ? (
        <GlassPanel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-text-primary">
                Build requests
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Services you asked TechTivAI to implement.
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
                    {item.service ?? "Service request"}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {item.analysisDomain ?? item.company ?? "Business"}
                    {" · "}
                    {formatDate(item.createdAt)}
                    {item.assignedAdminName ? ` · ${item.assignedAdminName}` : ""}
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

      <div className="grid gap-4 md:grid-cols-2">
        <GlassPanel className="p-6">
          <AnimatedIcon icon={Sparkles} size={22} className="mb-4 text-brand" />
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Analyze a business
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Submit a domain. We’ll research it and open the finished blueprint here.
          </p>
          <Button href="/dashboard/analyze" className="mt-5" size="sm">
            Start analysis
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </GlassPanel>

        <GlassPanel className="p-6">
          <AnimatedIcon
            icon={MessageSquare}
            size={22}
            className="mb-4 text-brand-cyan"
          />
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Talk to AI Consultant
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Ask follow-up questions in text or voice. TivAI stays grounded in
            this blueprint and can research live facts when needed.
          </p>
          <Button href="/dashboard/consultant" className="mt-5" size="sm">
            Open consultant
          </Button>
        </GlassPanel>
      </div>

      <p className="text-center text-xs text-text-muted">
        Need the interview-style wizard?{" "}
        <Link href="/discovery" className="text-brand-cyan hover:text-brand">
          Open Discovery
        </Link>
      </p>
    </div>
  );
}
