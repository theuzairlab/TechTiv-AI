export type ParsedSocialLinks = {
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
};

export type ParsedBusinessLinks = {
  website?: string;
  socialLinks: ParsedSocialLinks;
  raw: string[];
};

const SOCIAL_HOST_MAP: Array<{ host: string; key: keyof ParsedSocialLinks }> = [
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

function normalizeToken(rawToken: string): string | null {
  const trimmed = rawToken.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Accept bare domains/handles like "instagram.com/acme" or "acme.com"
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

/**
 * Parses a single free-text field where a user may enter a website domain
 * and/or several social profile links together, separated by commas — e.g.
 * "acme.com, instagram.com/acme, tiktok.com/@acme".
 */
export function parseBusinessLinks(input: string): ParsedBusinessLinks {
  const tokens = input
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  const socialLinks: ParsedSocialLinks = {};
  let website: string | undefined;
  const raw: string[] = [];

  for (const token of tokens) {
    const normalized = normalizeToken(token);
    if (!normalized) continue;

    let url: URL;
    try {
      url = new URL(normalized);
    } catch {
      continue;
    }

    raw.push(normalized);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    const match = SOCIAL_HOST_MAP.find(
      (mapping) =>
        hostname === mapping.host || hostname.endsWith(`.${mapping.host}`),
    );

    if (match) {
      if (!socialLinks[match.key]) socialLinks[match.key] = normalized;
    } else if (!website) {
      website = normalized;
    }
  }

  return { website, socialLinks, raw };
}
