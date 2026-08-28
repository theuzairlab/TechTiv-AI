import type { PipelineContext } from "../types.js";
import { PIPELINE_USE_STUBS } from "../stub.js";
import { logInsight, logSearch, logStepStart, logThink } from "../context.js";
import { writeRawSignal } from "../update-status.js";
import { scrapeUrl } from "../../providers/firecrawl.js";
import { searchDiscoverySignals } from "../../providers/tavily.js";
import {
  companyLabel,
  parseBusinessIntake,
  parseSocialLinks,
} from "../intake.js";
import { recordEvidence, type EvidenceInput } from "../evidence.js";

type PlatformResult = {
  platform: string;
  url: string;
  fetched: boolean;
  excerpt: string | null;
  mentions: Array<{ title: string; url: string; content: string }>;
};

/**
 * Best-effort public read of the business's social profiles. Platforms like
 * Instagram, Facebook, and TikTok block unauthenticated scraping, so this
 * step never claims a full post-by-post audit — it records whatever public
 * profile content is reachable plus external search mentions, and lets
 * synthesis reason over what was actually found (never inventing critique
 * for platforms it could not read).
 */
export async function runSocialStep(ctx: PipelineContext): Promise<void> {
  const intake = parseBusinessIntake(ctx.businessIntake);
  const socials = {
    ...parseSocialLinks(ctx.socialLinks),
    ...(intake?.socialLinks ?? {}),
  };
  const label = companyLabel(intake, ctx.domain);
  const platforms = Object.entries(socials).filter(
    ([key, url]) => key !== "website" && Boolean(url),
  ) as Array<[string, string]>;

  if (platforms.length === 0) {
    await writeRawSignal(ctx.analysisId, "social_audit", {
      company: label,
      platforms: [],
      note: "No social profiles provided or discovered.",
    });
    return;
  }

  await logStepStart(
    ctx,
    "social",
    `Reviewing public social presence for ${label} — ${platforms
      .map(([platform]) => platform)
      .join(", ")}…`,
  );

  if (PIPELINE_USE_STUBS) {
    await writeRawSignal(ctx.analysisId, "social_audit", {
      stub: true,
      company: label,
      platforms: platforms.map(([platform, url]) => ({
        platform,
        url,
        fetched: true,
        excerpt: "Stub profile bio content.",
      })),
    });
    return;
  }

  const results: PlatformResult[] = [];
  for (const [platform, url] of platforms) {
    await logSearch(ctx, `${label} ${platform} profile`, "Firecrawl + Tavily");

    let excerpt: string | null = null;
    let fetched = false;
    try {
      const scraped = await scrapeUrl(ctx, url);
      const text = (scraped.markdown ?? "").trim();
      if (text) {
        excerpt = text.slice(0, 1500);
        fetched = true;
      }
    } catch {
      // Expected for platforms that block unauthenticated scraping —
      // fall through to search-based mentions instead of failing the step.
    }

    let mentions: Array<{ title: string; url: string; content: string }> = [];
    try {
      const search = await searchDiscoverySignals(
        ctx,
        `${label} ${platform} followers reviews posts`,
      );
      mentions = search.results.slice(0, 4).map((item) => ({
        title: item.title,
        url: item.url,
        content: item.content,
      }));
    } catch {
      mentions = [];
    }

    results.push({ platform, url, fetched, excerpt, mentions });
  }

  await logThink(
    ctx,
    "Cross-referencing what's publicly visible on each profile with external mentions…",
  );

  const evidence: EvidenceInput[] = [];
  for (const result of results) {
    if (result.excerpt) {
      evidence.push({
        provider: "firecrawl",
        sourceType: "social_profile",
        title: `${result.platform} profile`,
        url: result.url,
        excerpt: result.excerpt,
        entityConfidence: 0.7,
      });
    }
    for (const mention of result.mentions) {
      evidence.push({
        provider: "tavily",
        sourceType: "social_mention",
        title: mention.title,
        url: mention.url,
        query: `${result.platform} mentions`,
        excerpt: mention.content,
        entityConfidence: 0.5,
      });
    }
  }
  await recordEvidence(ctx, evidence);

  await writeRawSignal(ctx.analysisId, "social_audit", {
    company: label,
    platforms: results.map((result) => ({
      platform: result.platform,
      url: result.url,
      fetched: result.fetched,
      excerpt: result.excerpt,
      mentionCount: result.mentions.length,
      note: result.fetched
        ? undefined
        : "Not publicly readable without login — based on external mentions only.",
    })),
  });

  const readableCount = results.filter((result) => result.fetched).length;
  await logInsight(
    ctx,
    readableCount > 0
      ? `Read ${readableCount}/${results.length} social profiles directly; the rest are summarized from public mentions only.`
      : "Social profiles were not directly readable without login — using public mentions only.",
  );
}
