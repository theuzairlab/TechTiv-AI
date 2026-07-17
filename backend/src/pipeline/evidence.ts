import { createHash } from "node:crypto";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { PipelineContext } from "./types.js";

export type EvidenceInput = {
  provider: string;
  sourceType: string;
  title?: string;
  url?: string;
  query?: string;
  excerpt?: string;
  metricPath?: string;
  value?: Prisma.InputJsonValue;
  entityConfidence?: number;
};

function evidenceKey(input: EvidenceInput): string {
  return createHash("sha256")
    .update(
      [
        input.provider,
        input.sourceType,
        input.url,
        input.query,
        input.metricPath,
        input.excerpt?.slice(0, 200),
      ]
        .filter(Boolean)
        .join("|"),
    )
    .digest("hex")
    .slice(0, 20);
}

export async function recordEvidence(
  ctx: PipelineContext,
  inputs: EvidenceInput[],
): Promise<string[]> {
  if (inputs.length === 0) return [];
  const records = inputs.map((input) => ({
    runId: ctx.runId,
    evidenceKey: evidenceKey(input),
    provider: input.provider,
    sourceType: input.sourceType,
    title: input.title,
    url: input.url,
    query: input.query,
    excerpt: input.excerpt?.slice(0, 1600),
    metricPath: input.metricPath,
    valueJson: input.value,
    entityConfidence: input.entityConfidence,
  }));
  await prisma.analysisEvidence.createMany({
    data: records,
    skipDuplicates: true,
  });
  return records.map((record) => record.evidenceKey);
}

export function entityMatchConfidence(input: {
  company: string;
  domain: string;
  title?: string;
  content?: string;
  url?: string;
  location?: string;
}): number {
  const haystack = `${input.title ?? ""} ${input.content ?? ""} ${input.url ?? ""}`.toLowerCase();
  const companyTokens = input.company
    .toLowerCase()
    .split(/\W+/)
    .filter((token) => token.length > 2);
  let score = companyTokens.some((token) => haystack.includes(token)) ? 0.55 : 0.15;
  const host = input.domain.replace(/^www\./, "").toLowerCase();
  if (host && haystack.includes(host)) score += 0.35;
  if (input.location && haystack.includes(input.location.toLowerCase())) score += 0.1;
  return Math.min(1, Number(score.toFixed(2)));
}
