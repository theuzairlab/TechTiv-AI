import type { PipelineContext } from "../types.js";
import { PIPELINE_USE_STUBS } from "../stub.js";
import { logInsight, logSearch, logStepStart } from "../context.js";
import { updateAnalysisStatus, writeRawSignal } from "../update-status.js";
import { crawlDomain } from "../../providers/firecrawl.js";
import { isSyntheticDomain } from "../intake.js";
import { recordEvidence } from "../evidence.js";
import type { Prisma } from "../../generated/prisma/client.js";

export async function runCrawlStep(ctx: PipelineContext): Promise<void> {
  await updateAnalysisStatus(ctx.analysisId, "CRAWLING");

  if (isSyntheticDomain(ctx.domain)) {
    await logStepStart(
      ctx,
      "crawl",
      "No crawlable website domain — skipping Firecrawl and relying on discovery/social signals.",
    );
    await writeRawSignal(ctx.analysisId, "firecrawl", {
      skipped: true,
      reason: "synthetic-or-social-only-domain",
      domain: ctx.domain,
    });
    await logInsight(
      ctx,
      "Social-first analysis mode — website crawl skipped.",
    );
    return;
  }

  await logStepStart(
    ctx,
    "crawl",
    `Reading website structure and content for ${ctx.domain}…`,
  );
  await logSearch(ctx, `${ctx.domain} homepage content`, "Firecrawl");

  if (PIPELINE_USE_STUBS) {
    await writeRawSignal(ctx.analysisId, "firecrawl", {
      stub: true,
      domain: ctx.domain,
      pages: [{ url: `https://${ctx.domain}`, markdown: "# Stub crawl content" }],
    });
    return;
  }

  const result = await crawlDomain(ctx);
  await writeRawSignal(
    ctx.analysisId,
    "firecrawl",
    result as unknown as Prisma.InputJsonValue,
    ctx.runId,
  );
  await recordEvidence(
    ctx,
    result.pages.map((page) => ({
      provider: "firecrawl",
      sourceType: "website_page",
      title:
        typeof page.metadata.title === "string"
          ? page.metadata.title
          : new URL(page.url).pathname,
      url: page.url,
      excerpt: page.markdown?.slice(0, 1500) ?? undefined,
      entityConfidence: 1,
    })),
  );
  await logInsight(
    ctx,
    `Reviewed ${result.pages.length} key website pages: ${result.coverage.join(", ")}.`,
  );
}
