import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AnalysisDetail } from "@/lib/dashboard/analyses";
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

export async function buildProposalPdf(
  detail: AnalysisDetail,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const cyan = rgb(0.05, 0.55, 0.68);
  const navy = rgb(0.06, 0.08, 0.13);
  const muted = rgb(0.35, 0.4, 0.48);
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
  const bullets = (items: string[]) => {
    for (const item of items) {
      const lines = wrap(item, 84);
      lines.forEach((text, index) =>
        line(`${index === 0 ? "• " : "  "}${text}`, {
          size: 9,
          color: muted,
          indent: 8,
        }),
      );
    }
  };

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

    heading("What's happening in your business");
    paragraph(report.executiveSummary);
    line(
      `Modeled timeline: ${modeledWeeks} week${modeledWeeks === 1 ? "" : "s"} across ${report.roadmap.length} phase${report.roadmap.length === 1 ? "" : "s"}`,
      { size: 9, strong: true },
    );

    heading("Business scorecard");
    for (const item of report.scorecard) {
      line(`${item.dimension} — ${item.score}/100`, {
        size: 10,
        strong: true,
      });
      paragraph(item.rationale, 9);
    }

    heading("Problems we found");
    for (const item of report.findings) {
      line(`${item.title} · ${item.severity} priority · ${item.category.replace(/_/g, " ")}`, {
        size: 10,
        strong: true,
      });
      paragraph(item.summary, 9);
    }

    if (report.competitors.length) {
      heading("How you compare");
      for (const item of report.competitors) {
        line(`${item.name}${item.verified ? " · verified" : ""}`, {
          size: 10,
          strong: true,
        });
        paragraph(item.positioning, 9);
      }
    }

    heading("Solutions we recommend");
    report.opportunities.forEach((item, index) => {
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
    });

    heading("Recommended architecture");
    for (const item of report.stackArchitecture) {
      line(`${item.layer}: ${item.recommendation}`, {
        size: 10,
        strong: true,
      });
      paragraph(item.reason, 9);
    }

    heading("Timeline");
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

    if (report.pricing) {
      heading("Investment breakdown");
      line(
        `$${report.pricing.range.lowUSD.toLocaleString()}-$${report.pricing.range.highUSD.toLocaleString()} · ${report.pricing.timelineWeeks} weeks`,
        { size: 14, strong: true },
      );
      for (const item of report.pricing.lineItems) {
        line(`${item.label}: $${item.amountUSD.toLocaleString()}`, {
          size: 9,
        });
      }
      bullets(report.pricing.assumptions);
    }

    heading("Return on investment");
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
