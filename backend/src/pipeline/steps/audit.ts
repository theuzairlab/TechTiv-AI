import type { PipelineContext } from "../types.js";
import { PIPELINE_USE_STUBS } from "../stub.js";
import { logInsight, logSearch, logStepStart } from "../context.js";
import { updateAnalysisStatus, writeRawSignal } from "../update-status.js";
import { detectTechStack } from "../../providers/detectzestack.js";
import { auditPageSpeed } from "../../providers/pagespeed.js";
import {
  companyLabel,
  isSyntheticDomain,
  parseBusinessIntake,
} from "../intake.js";
import { softProviderCall } from "../soft-call.js";
import { recordEvidence, type EvidenceInput } from "../evidence.js";
import type { Prisma } from "../../generated/prisma/client.js";

export async function runAuditStep(ctx: PipelineContext): Promise<void> {
  await updateAnalysisStatus(ctx.analysisId, "AUDITING");

  const intake = parseBusinessIntake(ctx.businessIntake);
  const label = companyLabel(intake, ctx.domain);

  if (isSyntheticDomain(ctx.domain)) {
    await logStepStart(
      ctx,
      "audit",
      `Skipping technical website audit for ${label} — no crawlable domain.`,
    );
    await writeRawSignal(ctx.analysisId, "pagespeed", {
      skipped: true,
      reason: "synthetic-or-social-only-domain",
      domain: ctx.domain,
    });
    await writeRawSignal(ctx.analysisId, "detectzestack", {
      skipped: true,
      reason: "synthetic-or-social-only-domain",
      domain: ctx.domain,
    });
    await logInsight(
      ctx,
      "Technical audit deferred — continuing with discovery and market signals.",
    );
    return;
  }

  await logStepStart(
    ctx,
    "audit",
    `Running technical audit for ${label} — performance, SEO foundations, and stack detection…`,
  );
  await logSearch(ctx, `${ctx.domain} PageSpeed and Core Web Vitals`, "PageSpeed");
  await logSearch(ctx, `${ctx.domain} technology stack`, "DetectZeStack");

  if (PIPELINE_USE_STUBS) {
    await writeRawSignal(ctx.analysisId, "pagespeed", {
      stub: true,
      domain: ctx.domain,
      scores: { performance: 72, seo: 88, accessibility: 91 },
    });
    await writeRawSignal(ctx.analysisId, "detectzestack", {
      stub: true,
      domain: ctx.domain,
      technologies: ["Next.js", "Vercel", "PostgreSQL"],
    });
    return;
  }

  const [pageSpeed, stack] = await Promise.all([
    softProviderCall(ctx, "pagespeed", () => auditPageSpeed(ctx)),
    softProviderCall(ctx, "detectzestack", () => detectTechStack(ctx)),
  ]);

  if (pageSpeed.ok) {
    await writeRawSignal(ctx.analysisId, "pagespeed", pageSpeed.value);
  }
  if (stack.ok) {
    await writeRawSignal(ctx.analysisId, "detectzestack", stack.value);
  }
  const evidence: EvidenceInput[] = [];
  if (pageSpeed.ok) {
    evidence.push({
      provider: "pagespeed",
      sourceType: "technical_measurement",
      url: `https://${ctx.domain}`,
      metricPath: "lighthouse",
      value: pageSpeed.value as unknown as Prisma.InputJsonValue,
      entityConfidence: 1,
    });
  }
  if (stack.ok) {
    evidence.push({
      provider: "detectzestack",
      sourceType: "technology_detection",
      url: `https://${ctx.domain}`,
      value: stack.value as unknown as Prisma.InputJsonValue,
      entityConfidence: 1,
    });
  }
  await recordEvidence(ctx, evidence);

  await logInsight(
    ctx,
    "Technical audit complete — evaluating automation readiness gaps.",
  );
}
