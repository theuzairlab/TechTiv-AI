import type { PipelineContext } from "../types.js";
import { PIPELINE_USE_STUBS } from "../stub.js";
import { logInsight, logSearch, logStepStart, logThink } from "../context.js";
import { updateAnalysisStatus, writeRawSignal } from "../update-status.js";
import {
  searchCompetitorSignals,
  searchVisibilitySignals,
} from "../../providers/tavily.js";
import {
  fetchAeoSerpSignals,
  fetchGeoSerpSignals,
  fetchSerpSignals,
} from "../../providers/serpapi.js";
import {
  companyLabel,
  formatLocation,
  parseBusinessIntake,
  parseSocialLinks,
} from "../intake.js";
import { softProviderCall } from "../soft-call.js";
import {
  entityMatchConfidence,
  recordEvidence,
  type EvidenceInput,
} from "../evidence.js";

export async function runCompetitorsStep(ctx: PipelineContext): Promise<void> {
  await updateAnalysisStatus(ctx.analysisId, "ANALYZING");

  const intake = parseBusinessIntake(ctx.businessIntake);
  const socials = {
    ...parseSocialLinks(ctx.socialLinks),
    ...(intake?.socialLinks ?? {}),
  };
  const label = companyLabel(intake, ctx.domain);
  const location = formatLocation(intake?.location);
  const industry = intake?.industry ?? "business";

  await logStepStart(
    ctx,
    "competitors",
    `Mapping competitors, SEO/GEO/AEO visibility, and market gaps for ${label}…`,
  );

  const competitorQuery = location
    ? `${label} ${industry} competitors in ${location}`
    : `${label} ${ctx.domain} competitors market positioning`;
  const seoQuery = `${label} OR ${ctx.domain} SEO review site audit`;
  const geoQuery = location
    ? `${label} ${location}`
    : `${label} near me OR ${ctx.domain}`;
  const aeoQuery = `what is ${label} AI automation OR ${label} best company for ${industry}`;

  await logSearch(ctx, competitorQuery, "Tavily");
  await logSearch(ctx, seoQuery, "Tavily");
  await logSearch(ctx, geoQuery, "SerpAPI");
  await logSearch(ctx, aeoQuery, "SerpAPI");

  if (PIPELINE_USE_STUBS) {
    await writeRawSignal(ctx.analysisId, "tavily", {
      stub: true,
      domain: ctx.domain,
      competitors: ["competitor-a.com", "competitor-b.com"],
    });
    await writeRawSignal(ctx.analysisId, "serpapi", {
      stub: true,
      domain: ctx.domain,
      serpFeatures: ["local_pack", "people_also_ask"],
    });
    await writeRawSignal(ctx.analysisId, "visibility", {
      stub: true,
      seo: { query: seoQuery },
      geo: { query: geoQuery, localResults: [] },
      aeo: { query: aeoQuery, peopleAlsoAsk: [] },
      socialsProvided: socials,
    });
    return;
  }

  const [tavily, serp, seoVisibility, geo, aeo] = await Promise.all([
    softProviderCall(ctx, "tavily", () =>
      searchCompetitorSignals(ctx, competitorQuery),
    ),
    softProviderCall(ctx, "serpapi", () =>
      fetchSerpSignals(ctx, `${label} ${ctx.domain} competitors SEO`),
    ),
    softProviderCall(ctx, "visibility-seo", () =>
      searchVisibilitySignals(ctx, seoQuery),
    ),
    softProviderCall(ctx, "visibility-geo", () =>
      fetchGeoSerpSignals(ctx, geoQuery),
    ),
    softProviderCall(ctx, "visibility-aeo", () =>
      fetchAeoSerpSignals(ctx, aeoQuery),
    ),
  ]);

  await logThink(
    ctx,
    "Cross-referencing competitor, local (GEO), and AI-answer (AEO) visibility signals…",
  );

  if (tavily.ok) {
    await writeRawSignal(ctx.analysisId, "tavily", tavily.value);
  }
  if (serp.ok) {
    await writeRawSignal(ctx.analysisId, "serpapi", serp.value);
  }

  const evidence: EvidenceInput[] = [];
  if (tavily.ok) {
    for (const item of tavily.value.results) {
      evidence.push({
        provider: "tavily",
        sourceType: "competitor_candidate",
        title: item.title,
        url: item.url,
        query: tavily.value.query,
        excerpt: item.content,
        entityConfidence: entityMatchConfidence({
          company: label,
          domain: ctx.domain,
          location: location ?? undefined,
          title: item.title,
          content: item.content,
          url: item.url,
        }),
      });
    }
  }
  if (geo.ok) {
    for (const item of geo.value.organicResults.slice(0, 8)) {
      evidence.push({
        provider: "serpapi",
        sourceType: "local_visibility",
        title: item.title,
        url: item.link,
        query: geo.value.query,
        excerpt: item.snippet,
      });
    }
  }
  if (aeo.ok) {
    for (const item of (aeo.value.peopleAlsoAsk ?? []).slice(0, 8)) {
      evidence.push({
        provider: "serpapi",
        sourceType: "answer_readiness_proxy",
        title: item,
        query: aeo.value.query,
        excerpt: item,
      });
    }
  }
  await recordEvidence(ctx, evidence);

  await writeRawSignal(ctx.analysisId, "visibility", {
    company: label,
    location,
    industry,
    socials,
    seo: seoVisibility.ok ? seoVisibility.value : { failed: true },
    geo: geo.ok
      ? {
          query: geo.value.query,
          localResults: geo.value.localResults ?? [],
          organicResults: geo.value.organicResults.slice(0, 5),
        }
      : { failed: true, query: geoQuery },
    aeo: aeo.ok
      ? {
          query: aeo.value.query,
          peopleAlsoAsk: aeo.value.peopleAlsoAsk ?? [],
          organicResults: aeo.value.organicResults.slice(0, 5),
          relatedSearches: aeo.value.relatedSearches.slice(0, 5),
        }
      : { failed: true, query: aeoQuery },
  });

  const okCount = [tavily, serp, seoVisibility, geo, aeo].filter((r) => r.ok)
    .length;
  const localCount = geo.ok ? (geo.value.localResults?.length ?? 0) : 0;
  const paaCount = aeo.ok ? (aeo.value.peopleAlsoAsk?.length ?? 0) : 0;

  await logInsight(
    ctx,
    okCount === 0
      ? "Market visibility providers were unreachable — continuing with crawl, discovery, and audit signals."
      : `Visibility scan complete — ${okCount}/5 sources responded, ${localCount} local-search signals, ${paaCount} answer-readiness questions.`,
  );
}
