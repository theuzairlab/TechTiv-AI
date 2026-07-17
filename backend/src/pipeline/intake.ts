export type BusinessLocation = {
  city?: string;
  region?: string;
  country?: string;
};

export type SocialLinks = {
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
};

export type BusinessIntake = {
  companyName?: string;
  industry?: string;
  location?: BusinessLocation;
  goals?: string[];
  teamSize?: string;
  revenueRange?: string;
  additionalNotes?: string;
  socialLinks?: SocialLinks;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function parseBusinessIntake(value: unknown): BusinessIntake | null {
  const root = asRecord(value);
  if (!root) return null;

  const location = asRecord(root.location);
  const socialLinks = asRecord(root.socialLinks);

  return {
    companyName: asString(root.companyName),
    industry: asString(root.industry),
    location: location
      ? {
          city: asString(location.city),
          region: asString(location.region),
          country: asString(location.country),
        }
      : undefined,
    goals: asStringArray(root.goals),
    teamSize: asString(root.teamSize),
    revenueRange: asString(root.revenueRange),
    additionalNotes: asString(root.additionalNotes),
    socialLinks: socialLinks
      ? {
          website: asString(socialLinks.website),
          facebook: asString(socialLinks.facebook),
          instagram: asString(socialLinks.instagram),
          linkedin: asString(socialLinks.linkedin),
          twitter: asString(socialLinks.twitter),
          tiktok: asString(socialLinks.tiktok),
          youtube: asString(socialLinks.youtube),
        }
      : undefined,
  };
}

export function parseSocialLinks(value: unknown): SocialLinks {
  const root = asRecord(value);
  if (!root) return {};
  return {
    website: asString(root.website),
    facebook: asString(root.facebook),
    instagram: asString(root.instagram),
    linkedin: asString(root.linkedin),
    twitter: asString(root.twitter),
    tiktok: asString(root.tiktok),
    youtube: asString(root.youtube),
  };
}

export function formatLocation(location?: BusinessLocation): string | null {
  if (!location) return null;
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function companyLabel(intake: BusinessIntake | null, domain: string): string {
  return intake?.companyName?.trim() || domain;
}

export function isSyntheticDomain(domain: string): boolean {
  return domain.endsWith(".local") || domain.startsWith("discovery-");
}

export function missingSocialPlatforms(links: SocialLinks): string[] {
  const platforms = [
    "facebook",
    "instagram",
    "linkedin",
    "twitter",
    "tiktok",
    "youtube",
  ] as const;
  return platforms.filter((key) => !links[key]);
}

export function mergeSocialLinks(
  primary: SocialLinks,
  discovered: SocialLinks,
): SocialLinks {
  return {
    website: primary.website || discovered.website,
    facebook: primary.facebook || discovered.facebook,
    instagram: primary.instagram || discovered.instagram,
    linkedin: primary.linkedin || discovered.linkedin,
    twitter: primary.twitter || discovered.twitter,
    tiktok: primary.tiktok || discovered.tiktok,
    youtube: primary.youtube || discovered.youtube,
  };
}
