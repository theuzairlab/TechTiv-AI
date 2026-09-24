import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AnalysisDetail } from "@/lib/dashboard/types";
import type { ReportV2 } from "@/lib/report-v2/types";

function pdfSafe(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "-")
    .replace(/\u2192/g, "->")
    .replace(/\u00A0/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

function wrap(text: string, width = 88): string[] {
  const words = pdfSafe(text)
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > width) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function totalWeeks(roadmap: ReportV2["roadmap"]): number {
  return roadmap.reduce((sum, phase) => sum + (phase.estimatedWeeks || 1), 0);
}

const OPPORTUNITY_TYPE_LABEL: Record<ReportV2["opportunities"][number]["type"], string> = {
  ai_opportunity: "AI Opportunities",
  automation_opportunity: "Automation Opportunities",
  ai_agent: "AI Agent Recommendations",
  chatbot_voice_ai: "Chatbot / Voice AI Recommendations",
  web_app_development: "Web/App Development Recommendations",
};

const OPPORTUNITY_TYPE_ORDER: Array<ReportV2["opportunities"][number]["type"]> = [
  "ai_opportunity",
  "automation_opportunity",
  "ai_agent",
  "chatbot_voice_ai",
  "web_app_development",
];

export async function buildProposalPdf(
  detail: AnalysisDetail,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const cyan = rgb(0.05, 0.55, 0.68);
  const navy = rgb(0.06, 0.08, 0.13);
  const muted = rgb(0.35, 0.4, 0.48);
  const track = rgb(0.9, 0.93, 0.95);
  const lime = rgb(0.35, 0.68, 0.32);
  const amber = rgb(0.78, 0.55, 0.1);
  const rose = rgb(0.75, 0.24, 0.24);
  let page = pdf.addPage([612, 792]);
  let y = 724;

  const newPage = () => {
    page = pdf.addPage([612, 792]);
    y = 724;
  };
  const ensure = (height: number) => {
    if (y - height < 56) newPage();
  };
  // Character-width budget scaled from the base 88-char-at-size-10 heuristic.
  // pdf-lib's own `maxWidth` auto-wrap is intentionally never used here: if a
  // caller passes text longer than one visual line, relying on drawText's
  // internal wrapping would silently render extra lines that our y-cursor
  // never accounts for, causing the next section to overlap on top of it.
  // Wrapping ourselves and decrementing y per rendered line avoids that.
  const charWidthFor = (size: number, indent: number) =>
    Math.max(20, Math.round((88 * 10) / size) - Math.round(indent / 5));
  const line = (
    text: string,
    options: { size?: number; strong?: boolean; color?: ReturnType<typeof rgb>; indent?: number } = {},
  ) => {
    const size = options.size ?? 10;
    const indent = options.indent ?? 0;
    const segments = wrap(text, charWidthFor(size, indent));
    for (const segment of segments) {
      ensure(size + 7);
      page.drawText(pdfSafe(segment), {
        x: 48 + indent,
        y,
        size,
        font: options.strong ? bold : regular,
        color: options.color ?? navy,
      });
      y -= size + 7;
    }
  };
  const paragraph = (text: string, size = 10) => {
    line(text, { size, color: muted });
    y -= 5;
  };
  const heading = (title: string) => {
    ensure(34);
    y -= 6;
    line(title, { size: 15, strong: true, color: cyan });
    page.drawLine({
      start: { x: 48, y: y + 4 },
      end: { x: 564, y: y + 4 },
      thickness: 0.6,
      color: rgb(0.82, 0.88, 0.9),
    });
    y -= 7;
  };
  const subheading = (title: string) => {
    ensure(20);
    line(title, { size: 11.5, strong: true, color: navy });
  };
  const bullets = (items: string[]) => {
    for (const item of items) {
      const lines = wrap(item, 84);
      lines.forEach((text, index) =>
        line(`${index === 0 ? "- " : "  "}${text}`, {
          size: 9,
          color: muted,
          indent: 8,
        }),
      );
    }
  };
  const emptyNote = (text: string) => {
    line(text, { size: 9, color: muted, indent: 0 });
    y -= 3;
  };
  /** Draws a horizontal 0-100 progress bar (visual score meter) at the current cursor. */
  const scoreBar = (score: number) => {
    ensure(14);
    const barX = 48;
    const barWidth = 220;
    const barHeight = 7;
    page.drawRectangle({
      x: barX,
      y: y - barHeight,
      width: barWidth,
      height: barHeight,
      color: track,
    });
    const fillColor = score >= 70 ? lime : score >= 45 ? amber : rose;
    page.drawRectangle({
      x: barX,
      y: y - barHeight,
      width: (Math.max(0, Math.min(100, score)) / 100) * barWidth,
      height: barHeight,
      color: fillColor,
    });
    page.drawText(`${score}/100`, {
      x: barX + barWidth + 10,
      y: y - barHeight + 1,
      size: 9,
      font: bold,
      color: navy,
    });
    y -= barHeight + 10;
  };
  const severityColor = (severity: "high" | "medium" | "low") =>
    severity === "high" ? rose : severity === "medium" ? amber : lime;

  line("TechTivAI", { size: 13, strong: true, color: cyan });
  line("AI Business Strategy Report", { size: 24, strong: true });
  y -= 8;
  line(detail.domain, { size: 15, strong: true });
  line(`Generated ${new Date().toLocaleDateString()}`, {
    size: 9,
    color: muted,
  });

  const report = detail.proposal?.reportJson;
  if (!report) {
    y -= 20;
    paragraph(
      detail.proposal?.narrativeText ??
        "This analysis has no structured report yet.",
    );
  } else {
    const modeledWeeks = report.pricing?.timelineWeeks ?? totalWeeks(report.roadmap);
    const currentTechStack = report.currentTechStack ?? [];
    const socialGrowth = report.socialGrowth ?? [];
    const recommendedServices = report.recommendedServices ?? [];

    // 1. Business Analysis
    heading("1. Business Analysis");
    line(
      `${report.businessProfile.industry} · ${report.businessProfile.teamSize} team · ${report.businessProfile.operatingModel}`,
      { size: 9, color: muted },
    );
    y -= 3;
    paragraph(report.executiveSummary);
    line(
      `Modeled timeline: ${modeledWeeks} week${modeledWeeks === 1 ? "" : "s"} across ${report.roadmap.length} phase${report.roadmap.length === 1 ? "" : "s"}`,
      { size: 9, strong: true },
    );
    y -= 6;
    subheading("Business scorecard");
    for (const item of report.scorecard) {
      ensure(30);
      line(item.dimension, { size: 10, strong: true });
      scoreBar(item.score);
      paragraph(item.rationale, 9);
    }
    if (report.competitors.length) {
      subheading("How you compare");
      for (const item of report.competitors) {
        line(`${item.name}${item.verified ? " (verified)" : ""}`, {
          size: 10,
          strong: true,
        });
        paragraph(item.positioning, 9);
      }
    }

    // 2. Current Technology Stack
    heading("2. Current Technology Stack");
    if (currentTechStack.length) {
      for (const item of currentTechStack) {
        line(`${item.category}: ${item.tool}`, { size: 10, strong: true });
        paragraph(item.notes, 9);
      }
    } else {
      emptyNote("No current technology stack could be detected for this domain this run.");
    }

    // 3. Business Problems
    heading("3. Business Problems");
    for (const item of report.findings) {
      ensure(16);
      const badgeWidth = 62;
      page.drawRectangle({
        x: 48,
        y: y - 11,
        width: badgeWidth,
        height: 12,
        color: severityColor(item.severity),
      });
      page.drawText(`${item.severity.toUpperCase()}`, {
        x: 53,
        y: y - 8,
        size: 7.5,
        font: bold,
        color: rgb(1, 1, 1),
      });
      page.drawText(pdfSafe(item.category.replace(/_/g, " ")), {
        x: 48 + badgeWidth + 8,
        y: y - 8,
        size: 8,
        font: regular,
        color: muted,
      });
      y -= 18;
      line(item.title, { size: 10.5, strong: true });
      paragraph(item.summary, 9);
    }

    // 4-8. Categorized opportunity sections
    const sectionNumber: Record<string, number> = {
      ai_opportunity: 4,
      automation_opportunity: 5,
      ai_agent: 6,
      chatbot_voice_ai: 7,
      web_app_development: 8,
    };
    for (const type of OPPORTUNITY_TYPE_ORDER) {
      const items = report.opportunities.filter((item) => item.type === type);
      heading(`${sectionNumber[type]}. ${OPPORTUNITY_TYPE_LABEL[type]}`);
      if (!items.length) {
        emptyNote("No specific recommendation identified in this category from this analysis.");
        continue;
      }
      items.forEach((item, index) => {
        line(`${index + 1}. ${item.title}`, { size: 11, strong: true });
        paragraph(item.outcome, 9);
        line(
          `Fixes: ${item.workflow} · Impact ${item.impact} · Effort ${item.effort}`,
          { size: 8, color: muted },
        );
        if (item.integrations.length) {
          line(`Tools involved: ${item.integrations.join(", ")}`, {
            size: 8,
            color: muted,
          });
        }
        y -= 2;
      });
    }

    // 9. Recommended Technology Stack
    heading("9. Recommended Technology Stack");
    if (report.stackArchitecture.length) {
      for (const item of report.stackArchitecture) {
        line(`${item.layer}: ${item.recommendation}`, {
          size: 10,
          strong: true,
        });
        paragraph(item.reason, 9);
      }
    } else {
      emptyNote("No stack changes recommended beyond the current setup.");
    }

    // 10. Social Media / Digital Growth Recommendations
    heading("10. Social Media/Digital Growth Recommendations");
    if (socialGrowth.length) {
      for (const item of socialGrowth) {
        line(item.platform, { size: 10, strong: true });
        paragraph(item.finding, 9);
        line(`Recommendation: ${item.recommendation}`, { size: 9, color: muted, indent: 8 });
        y -= 3;
      }
    } else {
      emptyNote("No social profiles were provided or discovered for this analysis.");
    }

    // 11. ROI / Impact Analysis
    heading("11. ROI/Impact Analysis");
    if (report.roi?.available && report.roi.scenarios) {
      for (const [name, scenario] of Object.entries(report.roi.scenarios)) {
        line(
          `${name}: $${scenario.annualBenefitUSD.toLocaleString()} annual benefit · ${scenario.paybackMonths} month payback`,
          { size: 9, strong: true },
        );
      }
    } else {
      paragraph(report.roi?.note ?? "ROI needs a few more confirmed business inputs.");
      if (report.roi?.missingInputs?.length) {
        line(`Inputs needed: ${report.roi.missingInputs.join(", ")}`, {
          size: 9,
        });
      }
    }
    if (report.pricing) {
      y -= 4;
      line(
        `Investment: $${report.pricing.range.lowUSD.toLocaleString()}-$${report.pricing.range.highUSD.toLocaleString()} · ${report.pricing.timelineWeeks} weeks`,
        { size: 12, strong: true },
      );
      for (const item of report.pricing.lineItems) {
        line(`${item.label}: $${item.amountUSD.toLocaleString()}`, {
          size: 9,
        });
      }
      bullets(report.pricing.assumptions);
    }

    // 12. Implementation Roadmap
    heading("12. Implementation Roadmap");
    let weekCursor = 1;
    for (const phase of report.roadmap) {
      const weeks = phase.estimatedWeeks || 1;
      const endWeek = weekCursor + weeks - 1;
      const weekLabel =
        weekCursor === endWeek ? `Week ${weekCursor}` : `Weeks ${weekCursor}-${endWeek}`;
      line(`${phase.phase} — ${weekLabel}`, { size: 11, strong: true });
      paragraph(phase.objective, 9);
      bullets(phase.deliverables);
      if (phase.dependencies.length) {
        line(`Depends on: ${phase.dependencies.join(", ")}`, {
          size: 8,
          color: muted,
        });
      }
      weekCursor = endWeek + 1;
    }

    // 13. Recommended TechTivAI Services
    heading("13. Recommended TechTivAI Services");
    if (recommendedServices.length) {
      recommendedServices.forEach((item, index) => {
        ensure(20);
        page.drawRectangle({
          x: 48,
          y: y - 4,
          width: 4,
          height: 4,
          color: cyan,
        });
        line(`${index + 1}. ${item.service}`, { size: 11.5, strong: true, indent: 10 });
        line(`Problem: ${item.problem}`, { size: 9, color: muted, indent: 10 });
        line(`Scope: ${item.estimatedScope}`, { size: 9, color: muted, indent: 10 });
        line(
          `Stack: ${item.techStack.join(", ")} · Estimated timeline: ${item.estimatedTimelineWeeks} week${item.estimatedTimelineWeeks === 1 ? "" : "s"}`,
          { size: 9, color: muted, indent: 10 },
        );
        line(`-> ${item.ctaLabel}`, { size: 9.5, strong: true, color: cyan, indent: 10 });
        y -= 6;
      });
    } else {
      emptyNote("No specific TechTivAI service recommendations were generated for this analysis.");
    }

    heading("Worth knowing before you start");
    line("Risks", { size: 10, strong: true });
    bullets(report.risks);
    line("Assumptions", { size: 10, strong: true });
    bullets(report.assumptions);
    line("Open questions", { size: 10, strong: true });
    bullets(report.unknowns);
  }

  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: 48, y: 40 },
      end: { x: 564, y: 40 },
      thickness: 0.5,
      color: rgb(0.82, 0.88, 0.9),
    });
    pdfPage.drawText(`TechTivAI · AI Business Strategy Report`, {
      x: 48,
      y: 25,
      size: 7,
      font: regular,
      color: muted,
    });
    pdfPage.drawText(`${index + 1} / ${pages.length}`, {
      x: 530,
      y: 25,
      size: 7,
      font: regular,
      color: muted,
    });
  });

  return pdf.save();
}
