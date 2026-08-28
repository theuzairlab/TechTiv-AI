import type { Prisma } from "../generated/prisma/client.js";
import { createClaudeMessage } from "../providers/claude.js";
import { crawlDomainLite, scrapeUrl } from "../providers/firecrawl.js";
import { isSyntheticDomain, type SiteBrief, type SocialLinks } from "../pipeline/intake.js";
import { writeRawSignal } from "../pipeline/update-status.js";
import type { PipelineContext } from "../pipeline/types.js";

const MAX_EXCERPT_CHARS = 6000;

function fakeContext(analysisId: string, domain: string): PipelineContext {
  // buildSiteBrief runs before an AnalysisRun exists (pre-confirm). The
  // scrape/claude helpers only touch ctx.analysisId and ctx.domain, so a
  // placeholder runId is safe here.
  return { analysisId, runId: "pre-consultation", domain };
}

/**
 * Best-effort read of the business's public website and social profiles,
 * run once before the first consultation question so the AI grounds its
 * questions in what the business actually does instead of guessing from
 * the name alone.
 */
export async function buildSiteBrief(input: {
  analysisId: string;
  domain: string;
  socialLinks?: SocialLinks;
  additionalNotes?: string;
}): Promise<SiteBrief | null> {
  const ctx = fakeContext(input.analysisId, input.domain);
  const excerptParts: string[] = [];
  const sourcesUsed: string[] = [];
  const socialFindings: Record<string, string> = {};

  if (!isSyntheticDomain(input.domain)) {
    try {
      const { pages, coverage } = await crawlDomainLite(ctx, 2);
      for (const page of pages) {
        const title =
          typeof page.metadata.title === "string" ? page.metadata.title : "";
        const description =
          typeof page.metadata.description === "string"
            ? page.metadata.description
            : "";
        const body = (page.markdown ?? "").slice(0, 2000);
        excerptParts.push(
          `### ${page.url}\nTitle: ${title}\nDescription: ${description}\n${body}`,
        );
        sourcesUsed.push(page.url);
      }
      await writeRawSignal(input.analysisId, "consultation_site_scan", {
        domain: input.domain,
        pages: coverage,
      } as Prisma.InputJsonValue);
    } catch (error) {
      console.warn("[site-brief] website scan skipped:", error);
    }
  }

  const socialEntries = Object.entries(input.socialLinks ?? {}).filter(
    ([key, url]) => key !== "website" && Boolean(url),
  ) as Array<[string, string]>;

  if (socialEntries.length > 0) {
    const outcomes = await Promise.allSettled(
      socialEntries.map(async ([platform, url]) => ({
        platform,
        url,
        result: await scrapeUrl(ctx, url),
      })),
    );
    outcomes.forEach((outcome, index) => {
      const [platform] = socialEntries[index] ?? [];
      if (!platform) return;
      if (outcome.status === "fulfilled") {
        const text = (outcome.value.result.markdown ?? "").slice(0, 1200).trim();
        if (text) {
          socialFindings[platform] = text;
          excerptParts.push(`### ${platform} profile (${outcome.value.url})\n${text}`);
          sourcesUsed.push(outcome.value.url);
        } else {
          socialFindings[platform] =
            "Profile page loaded but had no publicly readable bio/content.";
        }
      } else {
        socialFindings[platform] =
          "Not publicly accessible without login — will rely on public search signals during research.";
      }
    });
    await writeRawSignal(input.analysisId, "consultation_social_scan", {
      socialFindings,
    } as Prisma.InputJsonValue);
  }

  const combinedExcerpt = excerptParts.join("\n\n").slice(0, MAX_EXCERPT_CHARS);
  const fallbackBrief: SiteBrief = {
    summary: "No public website or social content could be read automatically.",
    industry: "unknown",
    offerings: [],
    targetAudience: "",
    notableTools: [],
    socialFindings,
    sourcesUsed,
    generatedAt: new Date().toISOString(),
  };

  if (!combinedExcerpt.trim()) {
    await writeRawSignal(
      input.analysisId,
      "consultation_site_brief",
      fallbackBrief as unknown as Prisma.InputJsonValue,
    );
    return fallbackBrief;
  }

  try {
    const response = await createClaudeMessage({
      analysisId: input.analysisId,
      endpoint: "messages/site-brief",
      system: `You are a research analyst preparing a short brief before a client discovery call.
Read the crawled website/social content below and produce a compact, strictly factual summary.
Only state what the content directly supports. If something is unclear or not covered, leave it out rather than guessing.
Do not infer the industry from the business name — infer it only from the actual page content.
Return ONLY JSON:
{"summary":"2-3 sentence description of what this business actually does and who it serves, based only on the content","industry":"specific industry/category grounded in the content, e.g. 'drone pilot training and certification' or 'flight booking platform' — never invent this from the name alone","offerings":["main products or services actually mentioned, 2-6 items"],"targetAudience":"who they appear to sell to, based on the content","notableTools":["any tools, platforms, or integrations visibly mentioned"]}`,
      user: JSON.stringify({
        domain: input.domain,
        additionalNotes: input.additionalNotes,
        content: combinedExcerpt,
      }),
    });
    const first = response.text.indexOf("{");
    const last = response.text.lastIndexOf("}");
    const parsed = JSON.parse(response.text.slice(first, last + 1)) as {
      summary?: string;
      industry?: string;
      offerings?: string[];
      targetAudience?: string;
      notableTools?: string[];
    };

    const brief: SiteBrief = {
      summary: parsed.summary?.trim() || fallbackBrief.summary,
      industry: parsed.industry?.trim() || "unknown",
      offerings: Array.isArray(parsed.offerings) ? parsed.offerings.slice(0, 6) : [],
      targetAudience: parsed.targetAudience?.trim() || "",
      notableTools: Array.isArray(parsed.notableTools)
        ? parsed.notableTools.slice(0, 8)
        : [],
      socialFindings,
      sourcesUsed,
      generatedAt: new Date().toISOString(),
    };

    await writeRawSignal(
      input.analysisId,
      "consultation_site_brief",
      brief as unknown as Prisma.InputJsonValue,
    );
    return brief;
  } catch (error) {
    console.warn("[site-brief] classification failed:", error);
    await writeRawSignal(
      input.analysisId,
      "consultation_site_brief",
      fallbackBrief as unknown as Prisma.InputJsonValue,
    );
    return fallbackBrief;
  }
}
