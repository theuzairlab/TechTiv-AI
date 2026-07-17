export class InvalidDomainError extends Error {
  constructor(message = "Invalid domain") {
    super(message);
    this.name = "InvalidDomainError";
  }
}

/**
 * Normalize a submitted domain for dedup:
 * strip protocol, www, path, query, trailing slash; lowercase host only.
 */
export function normalizeDomain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new InvalidDomainError("Domain is required");
  }

  let candidate = trimmed.toLowerCase();

  if (!/^https?:\/\//.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    let host = url.hostname;

    if (!host || !host.includes(".")) {
      throw new InvalidDomainError("Invalid domain");
    }

    if (host.startsWith("www.")) {
      host = host.slice(4);
    }

    return host;
  } catch (error) {
    if (error instanceof InvalidDomainError) {
      throw error;
    }
    throw new InvalidDomainError("Invalid domain");
  }
}
