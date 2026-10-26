import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/analysis/report-view";
import { asReportV2 } from "@/lib/report-v2/types";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Public blueprint",
  robots: { index: false, follow: false },
};

export default async function PublicReportPage({ params }: PageProps) {
  const { id } = await params;
  const row = await prisma.analysis.findFirst({
    where: { id, reportPublic: true, status: "DONE" },
    select: {
      id: true,
      domain: true,
      completedAt: true,
      proposal: { select: { reportJson: true } },
    },
  });
  const report = asReportV2(row?.proposal?.reportJson);
  if (!row || !report) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-text-muted">
        Public blueprint
        {row.completedAt
          ? ` · ${row.completedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`
          : ""}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
        {row.domain}
      </h1>
      <div className="mt-8">
        <ReportView
          analysisId={row.id}
          domain={row.domain}
          report={report}
          pdfUnlocked={false}
        />
      </div>
    </div>
  );
}
