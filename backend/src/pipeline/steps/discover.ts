import type { PipelineContext } from "../types.js";
import { PIPELINE_USE_STUBS } from "../stub.js";
import { logInsight, logSearch, logStepStart, logThink } from "../context.js";
import { logAnalysisActivity } from "../activity.js";
import { updateAnalysisStatus, writeRawSignal } from "../update-status.js";
import { searchDiscoverySignals } from "../../providers/tavily.js";
import {
  companyLabel,
  formatLocation,
  mergeSocialLinks,
  missingSocialPlatforms,
  parseBusinessIntake,
  parseSocialLinks,
  type SocialLinks,
} from "../intake.js";
import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { entityMatchConfidence, recordEvidence } from "../evidence.js";

const SOCIAL_HOST_MAP: Array<{ host: string; key: keyof SocialLinks }> = [
  { host: "facebook.com", key: "facebook" },
  { host: "fb.com", key: "facebook" },
  { host: "instagram.com", key: "instagram" },
  { host: "linkedin.com", key: "linkedin" },
  { host: "twitter.com", key: "twitter" },
  { host: "x.com", key: "twitter" },
  { host: "tiktok.com", key: "tiktok" },
  { host: "youtube.com", key: "youtube" },
  { host: "youtu.be", key: "youtube" },
];

function extractSocialsFromUrls(urls: string[]): SocialLinks {
  const found: SocialLinks = {};
  for (const raw of urls) {
    try {
      const hostname = new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
      for (const mapping of SOCIAL_HOST_MAP) {
        if (hostname === mapping.host || hostname.endsWith(`.${mapping.host}`)) {
          if (!found[mapping.key]) {
            found[mapping.key] = raw;
          }
        }
      }
    } catch {
      // ignore invalid URLs
    }
  }
  return found;
}

function extractLeadershipHints(
  results: Array<{ title: string; content: string }>,
): string[] {
  const hints: string[] = [];
  const pattern =
    /\b(CEO|founder|co-founder|managing director|owner)\b[^.]{0,80}/gi;

  for (const result of results) {
    const haystack = `${result.title}. ${result.content}`;
    const matches = haystack.match(pattern);
    if (matches) {
      for (const match of matches.slice(0, 2)) {
        const cleaned = match.replace(/\s+/g, " ").trim();
        if (cleaned.length > 8 && !hints.includes(cleaned)) {
          hints.push(cleaned);
        }
      }
    }
  }

  return hints.slice(0, 5);
}

export async function runDiscoverStep(ctx: PipelineContext): Promise<void> {
  await updateAnalysisStatus(ctx.analysisId, "DISCOVERING");

  const intake = parseBusinessIntake(ctx.businessIntake);
  const providedSocials = {
    ...parseSocialLinks(ctx.socialLinks),
    ...(intake?.socialLinks ?? {}),
  };
  const label = companyLabel(intake, ctx.domain);
  const location = formatLocation(intake?.location);
  const missing = missingSocialPlatforms(providedSocials);

  await logStepStart(
    ctx,
    "discover",
    `Enriching business profile for ${label} — discovering missing socials, leadership, and reputation signals…`,
  );

  if (PIPELINE_USE_STUBS) {
    const stubDiscovered: SocialLinks = {
      linkedin: providedSocials.linkedin ?? `https://linkedin.com/company/${label.toLowerCase().replace(/\s+/g, "-")}`,
      instagram: providedSocials.instagram,
    };
    const merged = mergeSocialLinks(providedSocials, stubDiscovered);

    await writeRawSignal(ctx.analysisId, "discovery", {
      stub: true,
      company: label,
      location,
      providedSocials,
      discoveredSocials: stubDiscovered,
      mergedSocials: merged,
      leadershipHints: [`CEO of ${label}`],
      missingPlatforms: missing,
    });

    await prisma.analysis.update({
      where: { id: ctx.analysisId },
      data: {
        socialLinks: merged as Prisma.InputJsonValue,
        businessIntake: {
          ...(intake ?? {}),
          socialLinks: merged,
        } as Prisma.InputJsonValue,
      },
    });

    ctx.socialLinks = merged;
    ctx.businessIntake = { ...(intake ?? {}), socialLinks: merged };
    await logInsight(ctx, "Stub discovery complete — social profile enriched.");
    return;
  }

  const queries = [
    `${label} official website LinkedIn Instagram Facebook Twitter`,
    location
      ? `${label} ${location} CEO founder owner`
      : `${label} ${ctx.domain} CEO founder owner`,
    intake?.industry
      ? `${label} ${intake.industry} company profile reviews`
      : `${label} company profile reviews reputation`,
  ];

  if (missing.length > 0) {
    queries.push(`${label} ${missing.slice(0, 3).join(" ")} social media`);
  }

  const searchResults = [];
  for (const query of queries) {
    await logSearch(ctx, query, "Tavily");
    try {
      const result = await searchDiscoverySignals(ctx, query);
      searchResults.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await logAnalysisActivity({
        analysisId: ctx.analysisId,
        runId: ctx.runId,
        kind: "warning",
        message: `Discovery search skipped — ${message.slice(0, 120)}`,
        metadata: { query, error: message.slice(0, 200) },
      });
    }
  }

  if (searchResults.length === 0) {
    await writeRawSignal(ctx.analysisId, "discovery", {
      company: label,
      location,
      providedSocials,
      discoveredSocials: {},
      mergedSocials: providedSocials,
      leadershipHints: [],
      missingPlatformsBefore: missing,
      missingPlatformsAfter: missing,
      newlyFound: [],
      degraded: true,
      reason: "all-discovery-searches-failed",
    });
    await logInsight(
      ctx,
      "Discovery searches were unreachable — continuing with the profiles you provided.",
    );
    return;
  }

  await logThink(
    ctx,
    "Parsing discovery results for social profiles and leadership signals…",
  );

  const scoredResults = searchResults.flatMap((result) =>
    result.results.map((item) => ({
      ...item,
      query: result.query,
      confidence: entityMatchConfidence({
        company: label,
        domain: ctx.domain,
        location: location ?? undefined,
        title: item.title,
        content: item.content,
        url: item.url,
      }),
    })),
  );
  const verifiedResults = scoredResults.filter((item) => item.confidence >= 0.55);
  const allUrls = verifiedResults.map((item) => item.url);
  const discoveredSocials = extractSocialsFromUrls(allUrls);
  const mergedSocials = mergeSocialLinks(providedSocials, discoveredSocials);
  const leadershipHints = extractLeadershipHints(
    verifiedResults,
  );
  await recordEvidence(
    ctx,
    scoredResults.map((item) => ({
      provider: "tavily",
      sourceType: "business_discovery",
      title: item.title,
      url: item.url,
      query: item.query,
      excerpt: item.content,
      entityConfidence: item.confidence,
    })),
  );

  const stillMissing = missingSocialPlatforms(mergedSocials);
  const newlyFound = Object.entries(discoveredSocials)
    .filter(([, url]) => Boolean(url))
    .map(([platform]) => platform);

  const payload = {
    company: label,
    location,
    industry: intake?.industry ?? null,
    goals: intake?.goals ?? [],
    providedSocials,
    discoveredSocials,
    mergedSocials,
    leadershipHints,
    missingPlatformsBefore: missing,
    missingPlatformsAfter: stillMissing,
    newlyFound,
    queries: searchResults.map((result) => ({
      query: result.query,
      resultCount: result.results.length,
    })),
    results: searchResults,
    verifiedResultCount: verifiedResults.length,
  };

  await writeRawSignal(ctx.analysisId, "discovery", payload);

  await prisma.analysis.update({
    where: { id: ctx.analysisId },
    data: {
      socialLinks: mergedSocials as Prisma.InputJsonValue,
      businessIntake: {
        ...(intake ?? {}),
        socialLinks: mergedSocials,
      } as Prisma.InputJsonValue,
    },
  });

  ctx.socialLinks = mergedSocials;
  ctx.businessIntake = { ...(intake ?? {}), socialLinks: mergedSocials };

  if (newlyFound.length > 0) {
    await logInsight(
      ctx,
      `Discovered additional presence: ${newlyFound.join(", ")}.`,
    );
  } else {
    await logInsight(
      ctx,
      "Discovery complete — using provided digital footprint for deeper analysis.",
    );
  }

  if (leadershipHints.length > 0) {
    await logInsight(
      ctx,
      `Leadership signals detected: ${leadershipHints[0]}${leadershipHints.length > 1 ? "…" : ""}`,
    );
  }
}
