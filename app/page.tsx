import type { Metadata } from "next";
import PortfolioClient from "@/components/portfolio/PortfolioClient";
import { getSiteUrl } from "@/lib/site";
import { getHomeStructuredData } from "@/lib/seo";

type SearchParams = Record<string, string | string[] | undefined>;

type HomePageProps = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

function getInitialTileId(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return null;
}

export default async function Page({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const initialTileId = getInitialTileId(resolvedSearchParams.tile);
  const siteUrl = getSiteUrl();
  const structuredData = getHomeStructuredData(siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PortfolioClient initialTileId={initialTileId} />
    </>
  );
}
