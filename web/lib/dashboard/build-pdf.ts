import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AnalysisDetail } from "@/lib/dashboard/analyses";

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
  const line = (
    text: string,
    options: { size?: number; strong?: boolean; color?: ReturnType<typeof rgb>; indent?: number } = {},
  ) => {
    const size = options.size ?? 10;
    ensure(size + 7);
    page.drawText(pdfSafe(text), {
      x: 48 + (options.indent ?? 0),
      y,
      size,
      font: options.strong ? bold : regular,
      color: options.color ?? navy,
      maxWidth: 516 - (options.indent ?? 0),
    });
    y -= size + 7;
  };
  const paragraph = (text: string, size = 10) => {
    for (const item of wrap(text)) line(item, { size, color: muted });
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
  const refs = (ids: string[]) => {
    if (ids.length) {
      line(`Evidence: ${ids.join(", ")}`, {
        size: 7,
        color: cyan,
        indent: 8,
      });
    }
  };

  line("TechTivAI", { size: 13, strong: true, color: cyan });
  line("AI Business Decision Report", { size: 24, strong: true });
  y -= 8;
  line(detail.domain, { size: 15, strong: true });
  line(`Report V2 · ${new Date().toLocaleDateString()}`, {
    size: 9,
    color: muted,
  });

  const report = detail.proposal?.reportJson;
  if (!report) {
    y -= 20;
    paragraph(
      detail.proposal?.narrativeText ??
        "This analysis was generated before Report V2 and has no structured report.",
    );
  } else {
    heading("Executive summary");
    paragraph(report.executiveSummary);
    line(
      `Coverage ${report.coverage.score}% (${report.coverage.status}) · Confidence ${report.confidence.level}`,
      { size: 9, strong: true },
    );
    paragraph(report.confidence.rationale, 9);
    if (report.coverage.missing.length) {
      line(`Coverage gaps: ${report.coverage.missing.join(", ")}`, {
        size: 9,
        color: rgb(0.72, 0.38, 0.05),
      });
    }

    heading("Business scorecard");
    for (const item of report.scorecard) {
      line(`${item.dimension} — ${item.score}/100`, {
        size: 10,
        strong: true,
      });
      paragraph(item.rationale, 9);
      refs(item.evidenceRefs);
    }

    heading("Evidence-backed findings");
    for (const item of report.findings) {
      line(`${item.title} · ${item.severity} · ${item.category.replace(/_/g, " ")}`, {
        size: 10,
        strong: true,
      });
      paragraph(item.summary, 9);
      refs(item.evidenceRefs);
    }

    if (report.competitors.length) {
      heading("Verified market context");
      for (const item of report.competitors) {
        line(`${item.name}${item.verified ? " · verified" : ""}`, {
          size: 10,
          strong: true,
        });
        paragraph(item.positioning, 9);
        refs(item.evidenceRefs);
      }
    }

    heading("Prioritized opportunities");
    report.opportunities.forEach((item, index) => {
      line(`${index + 1}. ${item.title}`, { size: 11, strong: true });
      paragraph(item.outcome, 9);
      line(
        `Workflow: ${item.workflow} · Impact ${item.impact} · Effort ${item.effort}`,
        { size: 8, color: muted },
      );
      if (item.integrations.length) {
        line(`Integrations: ${item.integrations.join(", ")}`, {
          size: 8,
          color: muted,
        });
      }
      refs(item.evidenceRefs);
    });

    heading("Recommended architecture");
    for (const item of report.stackArchitecture) {
      line(`${item.layer}: ${item.recommendation}`, {
        size: 10,
        strong: true,
      });
      paragraph(item.reason, 9);
      refs(item.evidenceRefs);
    }

    heading("Implementation roadmap");
    for (const phase of report.roadmap) {
      line(phase.phase, { size: 11, strong: true });
      paragraph(phase.objective, 9);
      bullets(phase.deliverables);
      if (phase.dependencies.length) {
        line(`Dependencies: ${phase.dependencies.join(", ")}`, {
          size: 8,
          color: muted,
        });
      }
    }

    if (report.pricing) {
      heading("Deterministic scope and investment");
      line(
        `$${report.pricing.range.lowUSD.toLocaleString()}–$${report.pricing.range.highUSD.toLocaleString()} · ${report.pricing.timelineWeeks} weeks`,
        { size: 14, strong: true },
      );
      for (const item of report.pricing.lineItems) {
        line(`${item.label}: $${item.amountUSD.toLocaleString()}`, {
          size: 9,
        });
      }
      bullets(report.pricing.assumptions);
    }

    heading("ROI");
    if (report.roi?.available && report.roi.scenarios) {
      for (const [name, scenario] of Object.entries(report.roi.scenarios)) {
        line(
          `${name}: $${scenario.annualBenefitUSD.toLocaleString()} annual benefit · ${scenario.paybackMonths} month payback`,
          { size: 9, strong: true },
        );
      }
    } else {
      paragraph(report.roi?.note ?? "ROI was withheld because inputs are incomplete.");
      if (report.roi?.missingInputs?.length) {
        line(`Inputs needed: ${report.roi.missingInputs.join(", ")}`, {
          size: 9,
        });
      }
    }

    heading("Risks, assumptions, and unknowns");
    line("Risks", { size: 10, strong: true });
    bullets(report.risks);
    line("Assumptions", { size: 10, strong: true });
    bullets(report.assumptions);
    line("Unknowns", { size: 10, strong: true });
    bullets(report.unknowns);

    heading("Evidence appendix");
    for (const item of detail.evidence) {
      line(`${item.key} · ${item.provider} · ${item.sourceType}`, {
        size: 8,
        strong: true,
        color: cyan,
      });
      if (item.title) line(item.title, { size: 9, strong: true });
      if (item.url) line(item.url, { size: 7, color: muted });
      if (item.excerpt) paragraph(item.excerpt.slice(0, 700), 8);
    }
  }

  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: 48, y: 40 },
      end: { x: 564, y: 40 },
      thickness: 0.5,
      color: rgb(0.82, 0.88, 0.9),
    });
    pdfPage.drawText(`TechTivAI · Evidence-grounded Report V2`, {
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
