import { PROJECTS } from "@/app/portfolio-content";

export const SITE_NAME = "Ayu Koene";
export const SITE_ROLE = "Strategic Designer";
export const SITE_DEFAULT_TITLE = `${SITE_NAME} · ${SITE_ROLE}`;
export const SITE_DESCRIPTION =
  "Strategic designer with a background in mechanical engineering, digital design, and brand strategy.";
export const SITE_SOCIAL_IMAGE_PATH = "/images/ayu-banner.jpg";
export const SITE_PERSON_IMAGE_PATH = "/images/ayu.jpg";
export const SITE_KEYWORDS = [
  "Ayu Koene",
  "Strategic Designer",
  "Service Design",
  "Product Design",
  "Innovation",
  "Portfolio",
];

const SITE_SOCIAL_PROFILES = [
  "https://www.linkedin.com/in/ayukoene/",
  "https://www.instagram.com/ayukoene",
];

type StructuredDataGraph = {
  "@context": "https://schema.org";
  "@graph": Array<Record<string, unknown>>;
};

export function getSiteStructuredData(siteUrl: string): StructuredDataGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: SITE_NAME,
        url: siteUrl,
        image: `${siteUrl}${SITE_PERSON_IMAGE_PATH}`,
        description: SITE_DESCRIPTION,
        jobTitle: SITE_ROLE,
        sameAs: SITE_SOCIAL_PROFILES,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
      },
    ],
  };
}

export function getHomeStructuredData(siteUrl: string): StructuredDataGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        name: SITE_DEFAULT_TITLE,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#person` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${siteUrl}${SITE_SOCIAL_IMAGE_PATH}`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#projects`,
        name: "Featured Projects",
        numberOfItems: PROJECTS.length,
        itemListElement: PROJECTS.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            "@id": `${siteUrl}/#project-${project.id}`,
            name: project.title,
            description: project.description,
            url: `${siteUrl}/?tile=${project.id}`,
            image: `${siteUrl}${project.thumb}`,
          },
        })),
      },
    ],
  };
}
