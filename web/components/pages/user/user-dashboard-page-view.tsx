"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { AnalysisListItem } from "@/lib/dashboard/analyses";
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
  };
  recent: AnalysisListItem[];
  highlightAnalysisId?: string | null;
};

export function UserDashboardPageView({
  firstName,
  stats,
  recent,
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
          Track AI discovery results, proposals, and downloads for every business
          you’ve analyzed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Blueprints", value: String(stats.blueprints), hint: "Completed analyses" },
          { label: "Proposals", value: String(stats.proposals), hint: "With strategy + pricing" },
          { label: "In progress", value: String(stats.inFlight), hint: "Still processing" },
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
              Recent analyses
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Open a blueprint to view strategy, pricing, and PDF download.
            </p>
          </div>
          <Button href="/analyze" size="sm">
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
                  highlightAnalysisId === item.id ? "rounded-xl bg-brand-cyan/5 px-3" : ""
                }`}
              >
                <div>
                  <p className="font-medium text-text-primary">{item.domain}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {new Date(item.createdAt).toLocaleString()}
                    {item.costEstimateUSD != null
                      ? ` · $${item.costEstimateUSD.toLocaleString()}`
                      : ""}
                  </p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <GlassPanel className="p-6">
          <AnimatedIcon icon={Sparkles} size={22} className="mb-4 text-brand" />
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Analyze a business
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Submit a domain and email. Watch live progress, then open the finished
            blueprint here after magic-link sign-in.
          </p>
          <Button href="/analyze" className="mt-5" size="sm">
            Start analysis
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </GlassPanel>

        <GlassPanel className="p-6">
          <AnimatedIcon icon={MessageSquare} size={22} className="mb-4 text-brand-cyan" />
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Talk to AI Consultant
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Voice or chat consultation for workflow recommendations and next steps.
          </p>
          <Button href="/contact#voice" variant="secondary" className="mt-5" size="sm">
            Start Consultation
          </Button>
        </GlassPanel>

        <GlassPanel className="p-6">
          <AnimatedIcon icon={Calendar} size={22} className="mb-4 text-brand-cyan" />
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Book strategy call
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Schedule a 30-minute session with our AI transformation team.
          </p>
          <Button href="/contact#schedule" variant="secondary" className="mt-5" size="sm">
            View calendar
          </Button>
        </GlassPanel>

        <GlassPanel className="p-6">
          <AnimatedIcon icon={Download} size={22} className="mb-4 text-brand" />
          <h2 className="font-display text-lg font-semibold text-text-primary">
            PDF downloads
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Completed proposals include a downloadable PDF blueprint with strategy,
            stack, automations, and pricing.
          </p>
          <Button href="/dashboard/proposals" variant="outline" className="mt-5" size="sm">
            View proposals
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
