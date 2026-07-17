import {
  InvalidDomainError,
  normalizeDomain,
} from "@/lib/analysis/normalize-domain";
import type { BusinessIntake, CreateAnalysisInput } from "@/lib/analysis/schema";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function extractHostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function mergeSocialLinks(
  input: CreateAnalysisInput,
): BusinessIntake["socialLinks"] {
  const fromIntake = input.businessIntake?.socialLinks ?? {};
  const legacy = input.socialLinks ?? {};
  return {
    website: fromIntake.website || legacy.website,
    facebook: fromIntake.facebook || legacy.facebook,
    instagram: fromIntake.instagram || legacy.instagram,
    linkedin: fromIntake.linkedin || legacy.linkedin,
    twitter: fromIntake.twitter || legacy.twitter,
    tiktok: fromIntake.tiktok || legacy.tiktok,
    youtube: fromIntake.youtube || legacy.youtube,
  };
}

export function buildBusinessIntake(input: CreateAnalysisInput): BusinessIntake {
  const socialLinks = mergeSocialLinks(input);
  const companyName =
    input.businessIntake?.companyName?.trim() ||
    input.company?.trim() ||
    undefined;

  return {
    companyName,
    industry: input.businessIntake?.industry?.trim() || undefined,
    location: input.businessIntake?.location,
    goals: input.businessIntake?.goals,
    teamSize: input.businessIntake?.teamSize?.trim() || undefined,
    revenueRange: input.businessIntake?.revenueRange?.trim() || undefined,
    additionalNotes: input.businessIntake?.additionalNotes?.trim() || undefined,
    socialLinks,
  };
}

/**
 * Resolve the canonical domain key used for dedup + worker crawl.
 * Prefers explicit domain, then website URL, then a discovery slug from company name.
 */
export function resolveAnalysisDomain(input: CreateAnalysisInput): string {
  const domainField = input.domain?.trim();
  if (domainField) {
    return normalizeDomain(domainField);
  }

  const socialLinks = mergeSocialLinks(input);
  const website = socialLinks?.website?.trim();
  if (website) {
    const host = extractHostname(website);
    if (host) return normalizeDomain(host);
  }

  const company =
    input.businessIntake?.companyName?.trim() ||
    input.company?.trim() ||
    "business";

  const slug = slugify(company) || "business";
  return `discovery-${slug}.local`;
}

export function formatLocation(location?: BusinessIntake["location"]): string | null {
  if (!location) return null;
  const parts = [location.city, location.region, location.country]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function rethrowDomainError(error: unknown): never {
  if (error instanceof InvalidDomainError) throw error;
  throw error;
}
