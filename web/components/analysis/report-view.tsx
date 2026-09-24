"use client";

import { Bot, CheckCircle2, Download, Lock } from "lucide-react";
import type { ConsultationHistoryMessage } from "@/lib/dashboard/types";
import type { ReportV2 } from "@/lib/report-v2/types";
import { ServiceRequestDialog } from "@/components/analysis/service-request-dialog";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatUsd } from "@/lib/format-display";
import { cn } from "@/lib/utils";

export type ReportAudience = "client" | "admin";

function totalWeeks(roadmap: ReportV2["roadmap"]): number {
  return roadmap.reduce((sum, phase) => sum + (phase.estimatedWeeks || 1), 0);
}

const OPPORTUNITY_TYPE_LABEL: Record<
  ReportV2["opportunities"][number]["type"],
  string
> = {
  ai_opportunity: "AI Opportunities",
  automation_opportunity: "Automation Opportunities",
  ai_agent: "AI Agent Recommendations",
  chatbot_voice_ai: "Chatbot / Voice AI Recommendations",
  web_app_development: "Web/App Development Recommendations",
};

const OPPORTUNITY_TYPE_ORDER: Array<
  ReportV2["opportunities"][number]["type"]
> = [
  "ai_opportunity",
  "automation_opportunity",
  "ai_agent",
  "chatbot_voice_ai",
  "web_app_development",
];

export function ReportView({
  analysisId,
  domain,
  leadEmail,
  report,
  pdfUnlocked,
  audience = "client",
}: {
  analysisId: string;
  domain: string;
  leadEmail?: string | null;
  report: ReportV2;
  pdfUnlocked: boolean;
  audience?: ReportAudience;
}) {
  const modeledWeeks = report.pricing?.timelineWeeks ?? totalWeeks(report.roadmap);
  const currentTechStack = report.currentTechStack ?? [];
  const socialGrowth = report.socialGrowth ?? [];
  const recommendedServices = report.recommendedServices ?? [];
  const admin = audience === "admin";

  return (
    <>
      {admin ? (
        <p className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-3 text-sm text-text-muted">
          This is the same blueprint the client sees. Use it to prep a call or
          reply with context.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {report.pricing ? (
          <Metric
            label="Investment range"
            value={`${formatUsd(report.pricing.range.lowUSD)}–${formatUsd(report.pricing.range.highUSD)}`}
            detail="Based on confirmed scope"
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
            {pdfUnlocked ? (
              <Download className="size-4 text-brand-cyan" />
            ) : (
              <Lock className="size-4 text-text-muted" />
            )}
            <p className="mt-3 text-sm uppercase tracking-wide text-text-muted">
              Full report
            </p>
          </div>
          {pdfUnlocked ? (
            <Button href={`/api/analysis/${analysisId}/pdf`} size="sm" className="mt-4">
              <Download size={14} className="mr-1.5" /> Download PDF
            </Button>
          ) : (
            <Button size="sm" className="mt-4" disabled>
              <Lock size={14} className="mr-1.5" /> PDF locked
            </Button>
          )}
        </GlassPanel>
      </div>

      <Section title={admin ? "What's happening in this business" : "What's happening in your business"}>
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
        <Section title={admin ? "How they compare" : "How you compare"}>
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

      {OPPORTUNITY_TYPE_ORDER.map((type) => {
        const items = report.opportunities.filter((item) => item.type === type);
        if (!items.length) return null;
        return (
          <Section key={type} title={OPPORTUNITY_TYPE_LABEL[type]}>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.title} className="rounded-xl border border-border-subtle p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium text-text-primary">{item.title}</p>
                    <Badge variant={item.impact === "high" ? "lime" : "default"}>
                      {item.impact} impact
                    </Badge>
                    <Badge variant="default">{item.effort} effort</Badge>
                  </div>
                  <p className="mt-2 text-base text-text-muted">{item.outcome}</p>
                  <p className="mt-2 text-sm text-text-muted">{item.workflow}</p>
                  {item.integrations.length ? (
                    <p className="mt-2 text-sm text-text-muted">
                      Integrations: {item.integrations.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        );
      })}

      <Section title="Current technology stack">
        {currentTechStack.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentTechStack.map((item) => (
              <div
                key={`${item.category}-${item.tool}`}
                className="rounded-xl border border-border-subtle p-4"
              >
                <p className="text-sm uppercase tracking-wide text-text-muted">
                  {item.category}
                </p>
                <p className="mt-1 text-base font-medium text-text-primary">{item.tool}</p>
                <p className="mt-2 text-sm text-text-muted">{item.notes}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base text-text-muted">
            No current technology stack could be detected for this domain this run.
          </p>
        )}
      </Section>

      <Section title="Recommended technology stack">
        {report.stackArchitecture.length ? (
          <div className="space-y-3">
            {report.stackArchitecture.map((item) => (
              <div key={item.layer} className="rounded-xl border border-border-subtle p-4">
                <p className="text-base font-medium text-text-primary">{item.layer}</p>
                <p className="mt-1 text-base text-text-muted">{item.recommendation}</p>
                <p className="mt-2 text-sm text-text-muted">{item.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base text-text-muted">
            No recommended stack architecture was generated for this analysis.
          </p>
        )}
      </Section>

      {socialGrowth.length ? (
        <Section title="Social media / digital growth">
          <div className="space-y-3">
            {socialGrowth.map((item) => (
              <div key={item.platform} className="rounded-xl border border-border-subtle p-4">
                <p className="text-base font-medium text-text-primary">{item.platform}</p>
                <p className="mt-2 text-base text-text-muted">{item.finding}</p>
                <p className="mt-2 text-sm text-text-muted">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Implementation roadmap">
        <div className="space-y-3">
          {report.roadmap.map((phase) => (
            <div key={phase.phase} className="rounded-xl border border-border-subtle p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-medium text-text-primary">{phase.phase}</p>
                <Badge variant="cyan">
                  {phase.estimatedWeeks} week{phase.estimatedWeeks === 1 ? "" : "s"}
                </Badge>
              </div>
              <p className="mt-2 text-base text-text-muted">{phase.objective}</p>
              {phase.deliverables.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-text-muted">
                  {phase.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section title="ROI / impact">
        {report.roi?.available && report.roi.scenarios ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(report.roi.scenarios).map(([key, scenario]) => (
              <div key={key} className="rounded-xl border border-border-subtle p-4">
                <p className="text-sm uppercase tracking-wide text-text-muted">{key}</p>
                <p className="mt-2 font-display text-xl font-semibold text-text-primary">
                  {formatUsd(scenario.annualBenefitUSD)}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Payback in {scenario.paybackMonths} months
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-base text-text-muted">
              {report.roi?.note ??
                "ROI modeling needs a few more business inputs before we can project payback."}
            </p>
            {report.roi?.missingInputs?.length ? (
              <p className="mt-2 text-sm text-text-muted">
                Needed: {report.roi.missingInputs.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </Section>

      <Section title="Recommended TechTivAI services">
        {recommendedServices.length ? (
          <div className="space-y-4">
            {recommendedServices.map((item, index) => (
              <div
                key={item.service}
                className="rounded-xl border border-brand-cyan/25 bg-brand-cyan/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="font-display text-lg font-semibold text-brand-cyan">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-text-primary">
                      {item.service}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      <span className="font-medium text-text-primary">Problem: </span>
                      {item.problem}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      <span className="font-medium text-text-primary">Scope: </span>
                      {item.estimatedScope}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      <span className="font-medium text-text-primary">Stack: </span>
                      {item.techStack.join(", ")} ·{" "}
                      <span className="font-medium text-text-primary">Timeline: </span>
                      {item.estimatedTimelineWeeks} week
                      {item.estimatedTimelineWeeks === 1 ? "" : "s"}
                    </p>
                    {admin ? (
                      <p className="mt-3 text-xs text-text-muted">
                        If the client taps “{item.ctaLabel}”, the request appears
                        under Implementation.
                      </p>
                    ) : (
                      <ServiceRequestDialog
                        analysisId={analysisId}
                        domain={domain}
                        defaultEmail={leadEmail}
                        item={item}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base text-text-muted">
            No specific TechTivAI service recommendations were generated for this
            analysis.
          </p>
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

export function ConsultationTranscript({
  messages,
  audience = "client",
  title = "Conversation history",
  plain = false,
}: {
  messages: ConsultationHistoryMessage[];
  audience?: ReportAudience;
  title?: string;
  plain?: boolean;
}) {
  const userLabel = audience === "admin" ? "Client" : "You";

  const body =
    messages.length === 0 ? (
      <p className="text-base text-text-muted">
        No consultation messages were saved for this analysis yet.
      </p>
    ) : (
      <div className="space-y-3">
        {messages.map((message) => {
          const isUser = message.role === "user" || message.role === "human";
          return (
            <div
              key={message.id}
              className={cn(
                "rounded-xl border p-4",
                isUser
                  ? "border-brand-cyan/25 bg-brand-cyan/5"
                  : "border-border-subtle bg-bg-secondary/40",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  {!isUser ? <Bot size={14} /> : null}
                  {isUser ? userLabel : "TivAI Consultant"}
                </p>
                <p className="text-xs text-text-muted">
                  {formatDateTime(message.createdAt)}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-text-muted">
                {message.content}
              </p>
            </div>
          );
        })}
      </div>
    );

  if (plain) {
    return (
      <div>
        <h2 className="font-display text-lg font-semibold text-text-primary">
          {title}
        </h2>
        <div className="mt-4">{body}</div>
      </div>
    );
  }

  return <Section title={title}>{body}</Section>;
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
