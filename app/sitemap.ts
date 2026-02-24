import type { MetadataRoute } from "next";
import { getPortfolioDocumentPaths } from "@/app/portfolio-content";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const documentPaths = getPortfolioDocumentPaths();

  const pages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    {
      path: "/",
      changeFrequency: "weekly",
      priority: 1,
    },
    ...documentPaths.map((path) => ({
      path,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  return pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
