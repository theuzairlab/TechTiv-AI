"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
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
            <p className="s-label">— Decision report</p>
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
          <p className="font-semibold text-text-primary">Analysis paused</p>
          <p className="mt-2 text-sm text-text-muted">{detail.errorMsg}</p>
        </GlassPanel>
      ) : null}

      {detail.status === "DONE" && report ? (
        <ReportView
          analysisId={detail.id}
          report={report}
          evidence={detail.evidence}
        />
      ) : null}

      {detail.status === "DONE" && proposal && !report ? (
        <GlassPanel className="p-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Legacy report
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
            {proposal.narrativeText ??
              proposal.strategyJson?.businessSummary ??
              "This report predates Report V2."}
          </p>
        </GlassPanel>
      ) : null}
    </div>
  );
}

function ReportView({
  analysisId,
  report,
  evidence,
}: {
  analysisId: string;
  report: ReportV2;
  evidence: AnalysisDetail["evidence"];
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Evidence coverage"
          value={`${report.coverage.score}%`}
          detail={`${report.coverage.evidenceCount} sources · ${report.coverage.status}`}
        />
        <Metric
          label="Confidence"
          value={report.confidence.level}
          detail={report.confidence.rationale}
        />
        <GlassPanel className="flex flex-col justify-between p-5">
          <div>
            <Download className="size-4 text-brand-cyan" />
            <p className="mt-3 text-xs uppercase tracking-wide text-text-muted">
              Full report
            </p>
          </div>
          <Button href={`/api/analysis/${analysisId}/pdf`} size="sm" className="mt-4">
            <Download size={14} className="mr-1.5" /> Download PDF
          </Button>
        </GlassPanel>
      </div>

      {report.coverage.missing.length ? (
        <GlassPanel className="border-amber-400/25 bg-amber-400/5 p-5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-5 text-amber-300" />
            <div>
              <p className="font-medium text-text-primary">
                Coverage limitations
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Missing: {report.coverage.missing.join(", ")}. Conclusions in
                those areas should be validated before implementation.
              </p>
            </div>
          </div>
        </GlassPanel>
      ) : null}

      <Section title="Executive summary">
        <p className="text-sm leading-7 text-text-muted">
          {report.executiveSummary}
        </p>
      </Section>

      <Section title="Business scorecard">
        <div className="grid gap-3 sm:grid-cols-2">
          {report.scorecard.map((item) => (
            <div key={item.dimension} className="rounded-xl border border-border-subtle p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">
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
              <p className="mt-3 text-xs leading-relaxed text-text-muted">
                {item.rationale}
              </p>
              <Refs refs={item.evidenceRefs} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Evidence-backed findings">
        <div className="space-y-3">
          {report.findings.map((finding) => (
            <div key={finding.title} className="rounded-xl border border-border-subtle p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-text-primary">{finding.title}</p>
                <Badge variant={finding.severity === "high" ? "rose" : "default"}>
                  {finding.severity}
                </Badge>
                <span className="text-xs capitalize text-text-muted">
                  {finding.category.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {finding.summary}
              </p>
              <Refs refs={finding.evidenceRefs} />
            </div>
          ))}
        </div>
      </Section>

      {report.competitors.length ? (
        <Section title="Verified market context">
          <div className="grid gap-3 sm:grid-cols-2">
            {report.competitors.map((competitor) => (
              <div key={competitor.name} className="rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary">{competitor.name}</p>
                  {competitor.verified ? (
                    <CheckCircle2 size={14} className="text-brand" />
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-text-muted">
                  {competitor.positioning}
                </p>
                <Refs refs={competitor.evidenceRefs} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Prioritized opportunities">
        <div className="space-y-3">
          {report.opportunities.map((item, index) => (
            <div key={item.title} className="rounded-xl border border-brand/20 bg-brand/5 p-4">
              <div className="flex items-start gap-3">
                <span className="font-display text-lg font-semibold text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-medium text-text-primary">{item.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{item.outcome}</p>
                  <p className="mt-2 text-xs text-text-muted">
                    Workflow: {item.workflow} · Impact {item.impact} · Effort{" "}
                    {item.effort}
                  </p>
                  {item.integrations.length ? (
                    <p className="mt-1 text-xs text-text-muted">
                      Integrations: {item.integrations.join(", ")}
                    </p>
                  ) : null}
                  <Refs refs={item.evidenceRefs} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Implementation roadmap">
        <ol className="space-y-4">
          {report.roadmap.map((phase, index) => (
            <li key={phase.phase} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-cyan/12 text-xs font-semibold text-brand-cyan">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-text-primary">{phase.phase}</p>
                <p className="mt-1 text-sm text-text-muted">{phase.objective}</p>
                <ul className="mt-2 list-disc pl-4 text-xs text-text-muted">
                  {phase.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {report.pricing ? (
        <Section title="Deterministic scope and investment">
          <div className="grid gap-4 sm:grid-cols-2">
            <Metric
              label="Investment range"
              value={`$${report.pricing.range.lowUSD.toLocaleString()}–$${report.pricing.range.highUSD.toLocaleString()}`}
              detail={`${report.pricing.timelineWeeks} week modeled rollout`}
            />
            <div className="space-y-2">
              {report.pricing.lineItems.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
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

      <Section title="ROI">
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
            <p className="text-sm text-text-muted">
              {report.roi?.note ?? "ROI inputs have not been confirmed."}
            </p>
            {report.roi?.missingInputs?.length ? (
              <p className="mt-2 text-xs text-text-muted">
                Needed: {report.roi.missingInputs.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </Section>

      <Section title="Risks, assumptions, and unknowns">
        <div className="grid gap-5 md:grid-cols-3">
          <List title="Risks" items={report.risks} />
          <List title="Assumptions" items={report.assumptions} />
          <List title="Unknowns" items={report.unknowns} />
        </div>
      </Section>

      <Section title="Evidence appendix">
        <div className="space-y-3">
          {evidence.map((item) => (
            <div key={item.key} id={`evidence-${item.key}`} className="rounded-xl border border-border-subtle p-4">
              <div className="flex flex-wrap items-center gap-2">
                <code className="text-xs text-brand-cyan">{item.key}</code>
                <span className="text-xs text-text-muted">
                  {item.provider} · {item.sourceType.replace(/_/g, " ")}
                </span>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-brand-cyan"
                  >
                    <ExternalLink size={13} />
                  </a>
                ) : null}
              </div>
              {item.title ? (
                <p className="mt-2 text-sm font-medium text-text-primary">
                  {item.title}
                </p>
              ) : null}
              {item.excerpt ? (
                <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-text-muted">
                  {item.excerpt}
                </p>
              ) : null}
            </div>
          ))}
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
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold capitalize text-text-primary">
        {value}
      </p>
      <p className="mt-2 line-clamp-2 text-xs text-text-muted">{detail}</p>
    </GlassPanel>
  );
}

function Refs({ refs }: { refs: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {refs.map((ref) => (
        <a
          key={ref}
          href={`#evidence-${ref}`}
          className="rounded bg-brand-cyan/10 px-1.5 py-0.5 font-mono text-[10px] text-brand-cyan no-underline"
        >
          {ref}
        </a>
      ))}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-text-muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-text-muted">None identified.</p>
      )}
    </div>
  );
}
