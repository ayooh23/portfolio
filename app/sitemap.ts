import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

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
    {
      path: "/documents/Evaluating_High-tech_Decision-making_Strategies_AyuKoene.pdf",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      path: "/documents/MDD-RR-S2-AyuKoene.pdf",
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
