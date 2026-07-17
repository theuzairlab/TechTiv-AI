import {
  businessProblems,
  businessSizes,
  businessTools,
  businessTypes,
} from "@/lib/discovery";
import type { LeadSource, LeadStatus } from "@/lib/leads";
import { leadSourceLabels, leadStatusLabels } from "@/lib/leads";

export function formatLeadDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatLeadDate(iso);
}

export const leadStatusVariants: Record<
  LeadStatus,
  "cyan" | "violet" | "lime" | "rose" | "default"
> = {
  NEW: "cyan",
  CONTACTED: "violet",
  QUALIFIED: "lime",
  PROPOSAL_SENT: "lime",
  WON: "lime",
  LOST: "rose",
};

export function getSourceLabel(source: string) {
  return leadSourceLabels[source as LeadSource] ?? source;
}

export function getStatusLabel(status: LeadStatus) {
  return leadStatusLabels[status];
}

const labelMap = <T extends { id: string; label: string }>(items: readonly T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item.label])) as Record<string, string>;

const businessTypeLabels = labelMap(businessTypes);
const businessSizeLabels = labelMap(businessSizes);
const problemLabels = labelMap(businessProblems);
const toolLabels = labelMap(businessTools);

export function formatDiscoveryAnswers(value: unknown): { label: string; value: string }[] {
  if (!value || typeof value !== "object") return [];

  const answers = value as Record<string, unknown>;
  const rows: { label: string; value: string }[] = [];

  if (typeof answers.businessType === "string") {
    rows.push({
      label: "Industry",
      value: businessTypeLabels[answers.businessType] ?? answers.businessType,
    });
  }

  if (typeof answers.businessSize === "string") {
    rows.push({
      label: "Team size",
      value: businessSizeLabels[answers.businessSize] ?? answers.businessSize,
    });
  }

  if (Array.isArray(answers.problems) && answers.problems.length > 0) {
    rows.push({
      label: "Pain points",
      value: answers.problems
        .map((p) => problemLabels[String(p)] ?? String(p))
        .join(", "),
    });
  }

  if (Array.isArray(answers.tools) && answers.tools.length > 0) {
    rows.push({
      label: "Tools",
      value: answers.tools
        .map((t) => toolLabels[String(t)] ?? String(t))
        .join(", "),
    });
  }

  return rows;
}

export function formatMetadata(value: unknown): { label: string; value: string }[] {
  if (!value || typeof value !== "object") return [];

  const meta = value as Record<string, unknown>;
  const rows: { label: string; value: string }[] = [];

  if (meta.budget) rows.push({ label: "Budget", value: String(meta.budget) });
  if (meta.meetingLink) {
    rows.push({ label: "Meeting link", value: String(meta.meetingLink) });
  }
  if (meta.rescheduleUrl) {
    rows.push({ label: "Reschedule link", value: String(meta.rescheduleUrl) });
  }
  if (meta.cancelUrl) {
    rows.push({ label: "Cancel link", value: String(meta.cancelUrl) });
  }
  if (meta.bookingDate && meta.bookingTime) {
    rows.push({
      label: "Booking",
      value: `${meta.bookingDate} at ${meta.bookingTime}${meta.timezone ? ` ${meta.timezone}` : ""}`,
    });
  }

  if (meta.roi && typeof meta.roi === "object") {
    const roi = meta.roi as Record<string, number>;
    if (roi.monthlySavings) {
      rows.push({
        label: "Projected monthly savings",
        value: `$${roi.monthlySavings.toLocaleString()}`,
      });
    }
    if (roi.hoursSavedPerWeek) {
      rows.push({
        label: "Hours saved / week",
        value: `${roi.hoursSavedPerWeek} hrs`,
      });
    }
  }

  if (Array.isArray(meta.recommendations)) {
    rows.push({
      label: "Recommendations",
      value: meta.recommendations
        .map((r) => (typeof r === "object" && r && "label" in r ? String(r.label) : ""))
        .filter(Boolean)
        .join(", "),
    });
  }

  return rows;
}
