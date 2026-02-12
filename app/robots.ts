import type { MetadataRoute } from "next";
import { getSiteUrl, isProductionIndexingEnabled } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const indexingEnabled = isProductionIndexingEnabled();

  return {
    rules: indexingEnabled
      ? {
          userAgent: "*",
          allow: "/",
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
