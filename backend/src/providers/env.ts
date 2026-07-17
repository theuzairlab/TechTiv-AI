export function getProviderApiKey(envVar: string): string | undefined {
  const value = process.env[envVar]?.trim();
  return value || undefined;
}

export function requireProviderApiKey(envVar: string): string {
  const value = getProviderApiKey(envVar);
  if (!value) {
    throw new Error(`${envVar} is not set`);
  }
  return value;
}

export function toWebsiteUrl(domain: string): string {
  if (domain.startsWith("http://") || domain.startsWith("https://")) {
    return domain;
  }
  return `https://${domain}`;
}
