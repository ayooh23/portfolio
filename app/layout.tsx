import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { getSiteUrl, isProductionIndexingEnabled } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = getSiteUrl();
const siteName = "Ayu Koene";
const siteDescription =
  "Strategic designer with a background in mechanical engineering, digital design, and brand strategy.";
const socialImagePath = "/images/ayu-banner.jpg";
const indexingEnabled = isProductionIndexingEnabled();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Strategic Designer`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Ayu Koene",
    "Strategic Designer",
    "Service Design",
    "Product Design",
    "Innovation",
    "Portfolio",
  ],
  openGraph: {
    type: "website",
    url: "/",
    title: `${siteName} | Strategic Designer`,
    description: siteDescription,
    siteName,
    locale: "en_US",
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: `${siteName} portfolio preview image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Strategic Designer`,
    description: siteDescription,
    images: [socialImagePath],
  },
  icons: {
    icon: "/fav_ayooh.png",
    shortcut: "/fav_ayooh.png",
    apple: "/fav_ayooh.png",
  },
  robots: {
    index: indexingEnabled,
    follow: indexingEnabled,
    googleBot: {
      index: indexingEnabled,
      follow: indexingEnabled,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "Ayu Koene",
        url: siteUrl,
        image: `${siteUrl}/images/ayu.jpg`,
        description: siteDescription,
        jobTitle: "Strategic Designer",
        sameAs: [
          "https://nl.linkedin.com/in/ayu-koene-55b63718a",
          "https://www.instagram.com/ayukoene",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        name: `${siteName} | Strategic Designer`,
        url: siteUrl,
        description: siteDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#person` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${siteUrl}${socialImagePath}`,
        },
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen antialiased flex flex-col bg-theme text-gray-900 dark:text-white`}
        data-theme="light"
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
