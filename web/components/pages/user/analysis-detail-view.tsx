"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download } from "lucide-react";
import type { AnalysisDetail } from "@/lib/dashboard/analyses";
import type { ReportV2 } from "@/lib/report-v2/types";
import { AnalysisProgressPanel } from "@/components/analysis/analysis-progress-panel";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { isTerminalStatus } from "@/lib/analysis/progress";

export function AnalysisDetailView({ detail }: { detail: AnalysisDetail }) {
  const proposal = detail.proposal;
  const report = proposal?.reportJson;
  const inFlight = !isTerminalStatus(detail.status);

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted no-underline hover:text-brand-cyan"
        >
          <ArrowLeft size={14} /> Back to overview
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="s-label">— Strategy report</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
              {detail.domain}
            </h1>
          </div>
          <Badge variant={detail.status === "DONE" ? "lime" : "default"}>
            {detail.status}
          </Badge>
        </div>
      </div>

      {inFlight ? (
        <AnalysisProgressPanel
          analysisId={detail.id}
          email={detail.leadEmail}
          initialStatus={{
            analysisId: detail.id,
            domain: detail.domain,
            status: detail.status,
            errorMsg: detail.errorMsg,
            createdAt: detail.createdAt,
            completedAt: detail.completedAt,
            proposalId: proposal?.id ?? null,
            proposalStatus: proposal?.status ?? null,
            pdfUrl: proposal?.pdfUrl ?? null,
            emailCaptured: true,
          }}
        />
      ) : null}

      {detail.status === "FAILED" ? (
        <GlassPanel className="border-accent-rose/30 bg-accent-rose/10 p-6">
          <p className="text-lg font-semibold text-text-primary">Analysis paused</p>
          <p className="mt-2 text-base text-text-muted">{detail.errorMsg}</p>
        </GlassPanel>
      ) : null}

      {detail.status === "DONE" && report ? (
        <ReportView analysisId={detail.id} report={report} />
      ) : null}

      {detail.status === "DONE" && proposal && !report ? (
        <GlassPanel className="p-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Legacy report
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-text-muted">
            {proposal.narrativeText ??
              proposal.strategyJson?.businessSummary ??
              "This report predates the current report format."}
          </p>
        </GlassPanel>
      ) : null}
    </div>
  );
}

function totalWeeks(roadmap: ReportV2["roadmap"]): number {
  return roadmap.reduce((sum, phase) => sum + (phase.estimatedWeeks || 1), 0);
}

function ReportView({
  analysisId,
  report,
}: {
  analysisId: string;
  report: ReportV2;
}) {
  const modeledWeeks = report.pricing?.timelineWeeks ?? totalWeeks(report.roadmap);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {report.pricing ? (
          <Metric
            label="Investment range"
            value={`$${report.pricing.range.lowUSD.toLocaleString()}–$${report.pricing.range.highUSD.toLocaleString()}`}
            detail="Based on your confirmed scope"
          />
        ) : (
          <Metric
            label="Business fit"
            value={report.businessProfile.teamSize}
            detail={report.businessProfile.operatingModel}
          />
        )}
        <Metric
          label="Modeled timeline"
          value={`${modeledWeeks} week${modeledWeeks === 1 ? "" : "s"}`}
          detail={`${report.roadmap.length} implementation phase${report.roadmap.length === 1 ? "" : "s"}`}
        />
        <GlassPanel className="flex flex-col justify-between p-5">
          <div>
            <Download className="size-4 text-brand-cyan" />
            <p className="mt-3 text-sm uppercase tracking-wide text-text-muted">
              Full report
            </p>
          </div>
          <Button href={`/api/analysis/${analysisId}/pdf`} size="sm" className="mt-4">
            <Download size={14} className="mr-1.5" /> Download PDF
          </Button>
        </GlassPanel>
      </div>

      <Section title="What's happening in your business">
        <p className="text-base leading-7 text-text-muted">
          {report.executiveSummary}
        </p>
      </Section>

      <Section title="Business scorecard">
        <div className="grid gap-3 sm:grid-cols-2">
          {report.scorecard.map((item) => (
            <div key={item.dimension} className="rounded-xl border border-border-subtle p-4">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-text-primary">
                  {item.dimension}
                </p>
                <span className="font-display text-lg font-semibold text-brand-cyan">
                  {item.score}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-bg-primary">
                <div
                  className="h-full rounded-full bg-brand-cyan"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {item.rationale}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Problems we found">
        <div className="space-y-3">
          {report.findings.map((finding) => (
            <div key={finding.title} className="rounded-xl border border-border-subtle p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-medium text-text-primary">{finding.title}</p>
                <Badge variant={finding.severity === "high" ? "rose" : "default"}>
                  {finding.severity} priority
                </Badge>
                <span className="text-sm capitalize text-text-muted">
                  {finding.category.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-2 text-base leading-relaxed text-text-muted">
                {finding.summary}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {report.competitors.length ? (
        <Section title="How you compare">
          <div className="grid gap-3 sm:grid-cols-2">
            {report.competitors.map((competitor) => (
              <div key={competitor.name} className="rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-text-primary">{competitor.name}</p>
                  {competitor.verified ? (
                    <CheckCircle2 size={14} className="text-brand" />
                  ) : null}
                </div>
                <p className="mt-2 text-base text-text-muted">
                  {competitor.positioning}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Solutions we recommend">
        <div className="space-y-3">
          {report.opportunities.map((item, index) => (
            <div key={item.title} className="rounded-xl border border-brand/20 bg-brand/5 p-4">
              <div className="flex items-start gap-3">
                <span className="font-display text-lg font-semibold text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-base font-medium text-text-primary">{item.title}</p>
                  <p className="mt-1 text-base text-text-muted">{item.outcome}</p>
                  <p className="mt-2 text-sm text-text-muted">
                    Fixes: {item.workflow} · Impact {item.impact} · Effort{" "}
                    {item.effort}
                  </p>
                  {item.integrations.length ? (
                    <p className="mt-1 text-sm text-text-muted">
                      Tools involved: {item.integrations.join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Timeline">
        <ol className="space-y-4">
          {report.roadmap.map((phase, index) => {
            const startWeek =
              report.roadmap
                .slice(0, index)
                .reduce((sum, p) => sum + (p.estimatedWeeks || 1), 0) + 1;
            const endWeek = startWeek + (phase.estimatedWeeks || 1) - 1;
            return (
              <li key={phase.phase} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-cyan/12 text-sm font-semibold text-brand-cyan">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium text-text-primary">{phase.phase}</p>
                    <Badge variant="default">
                      Week{startWeek === endWeek ? ` ${startWeek}` : `s ${startWeek}–${endWeek}`}
                    </Badge>
                  </div>
                  <p className="mt-1 text-base text-text-muted">{phase.objective}</p>
                  <ul className="mt-2 list-disc pl-4 text-sm text-text-muted">
                    {phase.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      {report.pricing ? (
        <Section title="Investment breakdown">
          <div className="grid gap-4 sm:grid-cols-2">
            <Metric
              label="Investment range"
              value={`$${report.pricing.range.lowUSD.toLocaleString()}–$${report.pricing.range.highUSD.toLocaleString()}`}
              detail={`${report.pricing.timelineWeeks} week modeled rollout`}
            />
            <div className="space-y-2">
              {report.pricing.lineItems.map((item) => (
                <div key={item.label} className="flex justify-between text-base">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-text-primary">
                    ${item.amountUSD.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <Section title="Return on investment">
        {report.roi?.available && report.roi.scenarios ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(report.roi.scenarios).map(([name, scenario]) => (
              <Metric
                key={name}
                label={name}
                value={`$${scenario.annualBenefitUSD.toLocaleString()}`}
                detail={`${scenario.paybackMonths} month payback`}
              />
            ))}
          </div>
        ) : (
          <div>
            <p className="text-base text-text-muted">
              {report.roi?.note ?? "We need a bit more information from you to model ROI precisely."}
            </p>
            {report.roi?.missingInputs?.length ? (
              <p className="mt-2 text-sm text-text-muted">
                Needed: {report.roi.missingInputs.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </Section>

      <Section title="Worth knowing before you start">
        <div className="grid gap-5 md:grid-cols-3">
          <List title="Risks" items={report.risks} />
          <List title="Assumptions" items={report.assumptions} />
          <List title="Open questions" items={report.unknowns} />
        </div>
      </Section>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlassPanel className="p-6">
      <h2 className="font-display text-xl font-semibold text-text-primary">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </GlassPanel>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <GlassPanel className="p-5">
      <p className="text-sm uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold capitalize text-text-primary">
        {value}
      </p>
      <p className="mt-2 line-clamp-2 text-sm text-text-muted">{detail}</p>
    </GlassPanel>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-base font-medium text-text-primary">{title}</p>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-text-muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-text-muted">None identified.</p>
      )}
    </div>
  );
}
