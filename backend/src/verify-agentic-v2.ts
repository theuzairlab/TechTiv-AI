import { randomUUID } from "node:crypto";
import { prisma } from "./lib/prisma.js";

async function main() {
  process.env.PIPELINE_USE_STUBS = "true";
  process.env.PIPELINE_STUB_DELAY_MS = "0";
  const key = randomUUID().slice(0, 8);
  const domain = `agentic-${key}.example`;
  const lead = await prisma.lead.create({
    data: {
      name: "Agentic V2 Fixture",
      email: `pending+${key}@guest.techtiv.ai`,
      source: "agentic-v2-verification",
    },
  });
  const analysis = await prisma.analysis.create({
    data: {
      leadId: lead.id,
      domain,
      businessIntake: {
        companyName: "Agentic V2 Fixture",
        industry: "saas",
        goals: ["Automate lead response"],
        volumes: "500 leads per month",
      },
      consultation: {
        create: [
          {
            role: "assistant",
            content: "Which workflow matters most?",
          },
          {
            role: "user",
            content: "Lead qualification and follow-up",
            inputJson: {
              field: "workflow",
              value: "Lead qualification and follow-up",
            },
          },
        ],
      },
    },
  });
  await prisma.analyzedDomain.create({
    data: {
      normalizedDomain: domain,
      status: "PROCESSING",
      lastAnalysisId: analysis.id,
    },
  });

  const { runPipeline } = await import("./pipeline/index.js");
  await runPipeline(analysis.id);

  const result = await prisma.analysis.findUniqueOrThrow({
    where: { id: analysis.id },
    include: {
      runs: { include: { evidence: true } },
      proposal: true,
      activities: true,
    },
  });
  if (result.status !== "DONE") throw new Error("Pipeline did not finish");
  if (result.runs.length !== 1) throw new Error("Run isolation missing");
  if (!result.runs[0]?.reportJson) throw new Error("Run report missing");
  if (!result.proposal?.reportJson) throw new Error("Proposal Report V2 missing");
  if (!result.proposal.pricingJson) throw new Error("Pricing V2 missing");
  if (!result.proposal.roiJson) throw new Error("ROI disclosure missing");
  if (result.activities.length < 5) throw new Error("Agent activity stream incomplete");

  const firstRunId = result.runs[0]!.id;
  await prisma.$transaction([
    prisma.analysisRun.update({
      where: { id: firstRunId },
      data: { status: "FAILED" },
    }),
    prisma.analysis.update({
      where: { id: result.id },
      data: { status: "FAILED" },
    }),
  ]);
  const { ensureCurrentRun } = await import("./pipeline/run.js");
  const retryRunId = await ensureCurrentRun(result.id);
  if (retryRunId === firstRunId) throw new Error("Retry reused stale run");
  const retryRun = await prisma.analysisRun.findUniqueOrThrow({
    where: { id: retryRunId },
  });
  if (retryRun.reportJson || retryRun.pricingJson) {
    throw new Error("Retry run inherited stale report data");
  }

  console.log(
    JSON.stringify(
      {
        analysisId: result.id,
        status: result.status,
        runsAfterRetry: 2,
        evidence: result.runs[0].evidence.length,
        activities: result.activities.length,
        reportVersion: result.proposal.reportVersion,
        retryIsolated: true,
      },
      null,
      2,
    ),
  );
  await prisma.analyzedDomain.deleteMany({ where: { normalizedDomain: domain } });
  await prisma.analysis.delete({ where: { id: analysis.id } });
  await prisma.lead.delete({ where: { id: lead.id } });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
