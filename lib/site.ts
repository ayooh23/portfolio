const protocolPrefixed = /^https?:\/\//i;

function withProtocol(url: string) {
  return protocolPrefixed.test(url) ? url : `https://${url}`;
}

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) {
    return normalizeUrl(withProtocol(configuredUrl));
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) {
    return normalizeUrl(withProtocol(vercelProductionUrl));
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return normalizeUrl(withProtocol(vercelUrl));
  }

  return "http://localhost:3000";
}

export function isProductionIndexingEnabled() {
  const siteUrl = getSiteUrl();
  const isLocalhost = siteUrl.includes("localhost");
  const isVercelProduction = process.env.VERCEL_ENV === "production";
  const hasExplicitPublicUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL) && !isLocalhost;

  return hasExplicitPublicUrl || isVercelProduction;
}
